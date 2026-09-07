import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/db";
import { adminProductSchema } from "@/lib/schemas";

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

/** GET /api/admin/products — list admin-created products. */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false, items: [] });
  }
  const rows = await query(
    `SELECT id, slug, emoji, brand, name, category, price, old_price, stock,
       status, description, description_html, features, tags, image_data,
       shade, size, finish, ingredients, is_new, created_at
     FROM gg_admin_products ORDER BY created_at DESC`
  );
  const items = (rows ?? []).map((r) => ({
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
    createdAt: r.created_at,
  }));
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
