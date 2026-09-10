import { NextRequest, NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminProductSchema, adminProductPatchSchema } from "@/lib/schemas";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function statusFor(stock: number): string {
  if (stock <= 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "Active";
}

function toItem(r: Record<string, unknown>) {
  return {
    id: String(r.id),
    slug: r.slug,
    emoji: r.emoji,
    brand: r.brand,
    name: r.name,
    category: r.category,
    price: r.price,
    oldPrice: r.old_price,
    stock: r.stock,
    status: r.status,
    description: r.description,
    descriptionHtml: r.description_html,
    features: r.features,
    tags: r.tags,
    imageData: r.image_data,
    shade: r.shade,
    size: r.size,
    finish: r.finish,
    ingredients: r.ingredients,
    isNew: Boolean(r.is_new),
    hidden: Boolean(r.hidden),
    createdAt: r.created_at,
  };
}

/** GET /api/admin/products — list admin-created products, or a single product when ?id=... */
export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const rows = await query(
      `SELECT id, slug, emoji, brand, name, category, price, old_price, stock,
         status, description, description_html, features, tags, image_data,
         shade, size, finish, ingredients, is_new, hidden, created_at
       FROM gg_admin_products WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    const item = rows?.length ? toItem(rows[0]) : null;
    return NextResponse.json({ persisted: true, item });
  }

  const rows = await query(
    `SELECT id, slug, emoji, brand, name, category, price, old_price, stock,
       status, description, description_html, features, tags, image_data,
       shade, size, finish, ingredients, is_new, hidden, created_at
     FROM gg_admin_products ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map(toItem);
  return NextResponse.json({ persisted: true, items });
}

/** POST /api/admin/products — create a product. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        persisted: false,
        message: "Database not configured — product acknowledged without persistence.",
      });
    }

    const d = parsed.data;
    const slug = slugify(d.name) + "-" + Date.now().toString(36);
    const status = statusFor(d.stock);

    const rows = await query(
      `INSERT INTO gg_admin_products
        (slug, emoji, brand, name, category, price, old_price, stock, status,
         description, description_html, features, tags, image_data,
         shade, size, finish, ingredients, is_new)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14,$15,$16,$17,$18,$19)
       RETURNING id`,
      [
        slug,
        d.emoji,
        d.brand,
        d.name,
        d.category,
        d.price,
        d.oldPrice,
        d.stock,
        status,
        d.description,
        d.descriptionHtml,
        JSON.stringify(d.features),
        JSON.stringify(d.tags),
        d.imageData || null,
        d.shade,
        d.size,
        d.finish,
        d.ingredients,
        d.isNew,
      ]
    );

    const id = rows?.[0]?.id;
    return NextResponse.json({ persisted: true, id });
  } catch (error) {
    console.error("POST /api/admin/products failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not persist product" },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/products?id=... — edit a product, or toggle visibility with { hidden }. */
export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { persisted: false, error: "ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const parsed = adminProductPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const keys = Object.keys(body);
    if (keys.length === 0) {
      return NextResponse.json(
        { persisted: false, error: "No fields to update" },
        { status: 400 }
      );
    }
    const onlyHidden = keys.length === 1 && keys[0] === "hidden";

    if (!isDbConfigured()) {
      return NextResponse.json({ persisted: false });
    }

    const sql = onlyHidden
      ? `UPDATE gg_admin_products SET hidden=$1 WHERE id=$2`
      : `UPDATE gg_admin_products
           SET emoji=$1, brand=$2, name=$3, category=$4, price=$5, old_price=$6,
               stock=$7, status=$8, description=$9, description_html=$10,
               features=$11::jsonb, tags=$12::jsonb, image_data=$13, shade=$14,
               size=$15, finish=$16, ingredients=$17, is_new=$18
         WHERE id=$19`;
    const params = onlyHidden
      ? [d.hidden, Number(id)]
      : [
          d.emoji,
          d.brand,
          d.name,
          d.category,
          d.price,
          d.oldPrice,
d.stock,
            statusFor(d.stock ?? 0),
          d.description,
          d.descriptionHtml,
          JSON.stringify(d.features),
          JSON.stringify(d.tags),
          d.imageData || null,
          d.shade,
          d.size,
          d.finish,
          d.ingredients,
          d.isNew,
          Number(id),
        ];

    await query(sql, params);

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("PATCH /api/admin/products failed", error);
    return NextResponse.json(
      { persisted: false, error: "Could not update product" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/products?id=... — delete an admin-created product. */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { deleted: false, error: "ID is required" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ deleted: false });
  }

  await query(`DELETE FROM gg_admin_products WHERE id = $1`, [Number(id)]);
  return NextResponse.json({ deleted: true });
}