"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { createAdminProduct } from "@/lib/api";
import { ImageUp } from "lucide-react";

const categories = ["Makeup", "Skincare", "Nail Care", "Fragrances"];
const emojis = ["💄", "💋", "🧴", "✨", "🌸", "💅", "👁️", "🧼", "💆"];

const money = (n: number) => "₹" + (n || 0).toLocaleString("en-IN");

function RichTextEditor({ html, onChange }: { html: string; onChange: (html: string, text: string) => void }) {
  const [focused, setFocused] = useState(false);

  const run = (cmd: string, value?: string) => {
    const el = document.getElementById("rte-area") as HTMLElement;
    el?.focus();
    document.execCommand(cmd, false, value);
    synced();
  };

  const synced = () => {
    const el = document.getElementById("rte-area") as HTMLElement;
    onChange(el?.innerHTML || "", el?.innerText || "");
  };

  const handleLink = () => {
    const url = window.prompt("Enter the URL (e.g. https://example.com):", "https://");
    if (url) run("createLink", url);
  };

  return (
    <div
      className="rte-wrap"
      style={{
        border: `1.5px solid ${focused ? "var(--rose)" : "var(--line-soft)"}`,
        boxShadow: focused ? "0 0 0 3px rgba(214,51,108,.08)" : undefined,
        borderRadius: 12,
        overflow: "hidden",
        transition: ".2s",
      }}
    >
      <div
        className="flex flex-wrap items-center gap-1 border-b border-line bg-[#faf3f7] px-2 py-1.5"
        style={{ borderColor: "var(--line)" }}
      >
        <select
          className="rounded-lg bg-transparent px-1.5 py-1 text-sm outline-none cursor-pointer"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) run("formatBlock", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">Format</option>
          <option value="p">Paragraph</option>
          <option value="h3">Heading</option>
          <option value="blockquote">Quote</option>
        </select>
        <span className="mx-1 h-5 w-px bg-[var(--line)]" />
        {[
          { cmd: "bold", label: "B", cls: "font-bold" },
          { cmd: "italic", label: "I", cls: "italic" },
          { cmd: "underline", label: "U", cls: "underline" },
          { cmd: "strikeThrough", label: "S", cls: "line-through" },
        ].map((b) => (
          <button
            key={b.cmd}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(b.cmd)}
            className={`h-8 w-8 grid place-items-center rounded-lg hover:bg-[#f0dde7] text-charcoal ${b.cls}`}
          >
            {b.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-[var(--line)]" />
        <button
          type="button"
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[#f0dde7]"
          onClick={() => run("insertUnorderedList")}
          title="Bullet list"
        >
          •☰
        </button>
        <button
          type="button"
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[#f0dde7]"
          onClick={() => run("insertOrderedList")}
          title="Numbered list"
        >
          1.
        </button>
        <span className="mx-1 h-5 w-px bg-[var(--line)]" />
        <button
          type="button"
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[#f0dde7]"
          onClick={handleLink}
          title="Insert link"
        >
          🔗
        </button>
        <button
          type="button"
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[#f0dde7]"
          onClick={() => run("removeFormat")}
          title="Clear formatting"
        >
          🧹
        </button>
      </div>
      <div
        id="rte-area"
        contentEditable
        suppressContentEditableWarning
        onInput={synced}
        onKeyUp={synced}
        onMouseUp={synced}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-placeholder="Describe the product, its benefits and key ingredients..."
        style={{
          minHeight: 150,
          maxHeight: 340,
          overflowY: "auto",
          padding: "14px 16px",
          fontSize: ".92rem",
          lineHeight: 1.7,
          outline: "none",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="flex items-center justify-between bg-[#faf3f7] px-3 py-1.5 text-xs text-muted border-t" style={{ borderColor: "var(--line)" }}>
        <span>Rich text</span>
        <span>✨</span>
      </div>
      <style>{`#rte-area:empty::before{content:attr(data-placeholder);color:#b8a9b4;}`}</style>
    </div>
  );
}

function ProductForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [emoji, setEmoji] = useState("💄");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Makeup");
  const [descHtml, setDescHtml] = useState("");
  const [descText, setDescText] = useState("");

  const [shade, setShade] = useState("");
  const [size, setSize] = useState("");
  const [finish, setFinish] = useState("");
  const [shelf, setShelf] = useState("");
  const [origin, setOrigin] = useState("India");
  const [ingredients, setIngredients] = useState("");
  const [featuresText, setFeaturesText] = useState("");

  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const status = (() => {
    const s = parseInt(stock) || 0;
    return s <= 0 ? "Out of Stock" : s < 10 ? "Low Stock" : "Active";
  })();

  const addTag = () => {
    const v = tagInput.trim().replace(/,/g, "");
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput("");
  };

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.warning("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`${file.name} exceeds 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setFiles((prev) => [...prev, String(e.target?.result)]);
      reader.readAsDataURL(file);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, boolean> = {
      name: !name.trim(),
      brand: !brand.trim(),
      price: parseInt(price) <= 0,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const res = await createAdminProduct({
      emoji,
      brand: brand.trim(),
      name: name.trim(),
      category,
      price: parseInt(price),
      oldPrice: parseInt(mrp) || 0,
      stock: parseInt(stock) || 0,
      description: descText,
      descriptionHtml: descHtml,
      features,
      tags,
      imageData: files[0] || null,
      shade,
      size,
      finish,
      ingredients,
      isNew: false,
    });
    setSaving(false);

    if (res.ok) {
      toast.success(res.data?.persisted
        ? "Product saved successfully ✓"
        : "Product saved (database not configured — demo only)");
      router.push("/admin/products");
    } else {
      toast.error("Could not save product");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-muted mb-1">
          Dashboard / Products / <span className="text-rose font-semibold">Add Product</span>
        </div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="mt-1 text-muted">Create a new cosmetic product for your store.</p>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          {/* Basic info */}
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🖋️ Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="field-label">
                  Product Name <span className="text-rose">*</span>
                </label>
                <input
                  className={`field-input ${errors.name ? "!border-red" : ""}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Luxe Liquid Lipstick"
                />
                {errors.name && <p className="mt-1 text-sm text-red">Please enter a product name.</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">
                    Brand <span className="text-rose">*</span>
                  </label>
                  <input
                    className={`field-input ${errors.brand ? "!border-red" : ""}`}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Velvet Matte"
                  />
                  {errors.brand && <p className="mt-1 text-sm text-red">Please enter a brand.</p>}
                </div>
                <div>
                  <label className="field-label">SKU / Code</label>
                  <input
                    className="field-input"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. GG-LIP-001"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">
                  Category <span className="text-rose">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        category === c
                          ? "border-transparent bg-gradient-to-br from-rose to-rose-dark text-white"
                          : "border-line text-muted hover:border-rose-soft"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product details */}
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🧾 Product Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="field-label">Shade / Colour</label>
                <input className="field-input" value={shade} onChange={(e) => setShade(e.target.value)} placeholder="Rose Noir" />
              </div>
              <div>
                <label className="field-label">Size / Net Weight</label>
                <input className="field-input" value={size} onChange={(e) => setSize(e.target.value)} placeholder="5ml" />
              </div>
              <div>
                <label className="field-label">Finish / Type</label>
                <input className="field-input" value={finish} onChange={(e) => setFinish(e.target.value)} placeholder="Matte" />
              </div>
              <div>
                <label className="field-label">Shelf Life</label>
                <input className="field-input" value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder="24 months" />
              </div>
              <div>
                <label className="field-label">Country of Origin</label>
                <input className="field-input" value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Key Ingredients</label>
                <input className="field-input" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Vitamin E, Jojoba Oil..." />
              </div>
            </div>
            <div className="mt-4">
              <label className="field-label">Key Features / Highlights</label>
              <textarea
                className="field-textarea min-h-[90px]"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder={"One per line — e.g.\nLong-lasting 12-hour wear\nCruelty-free & paraben-free"}
              />
              <p className="mt-1 text-xs text-muted">One feature per line — these appear as bullets on the storefront.</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">💰 Pricing &amp; Inventory</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="field-label">
                  Selling Price (₹) <span className="text-rose">*</span>
                </label>
                <input
                  type="number"
                  className={`field-input ${errors.price ? "!border-red" : ""}`}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="599"
                />
                {errors.price && <p className="mt-1 text-sm text-red">Enter a price.</p>}
              </div>
              <div>
                <label className="field-label">MRP (₹)</label>
                <input type="number" className="field-input" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="799" />
              </div>
              <div>
                <label className="field-label">Stock Qty</label>
                <input type="number" className="field-input" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="120" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🖼️ Product Images</h3>
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-rose-soft bg-blush p-8 text-center text-muted transition hover:border-rose hover:bg-[#fdeaf0]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
            >
              <ImageUp className="h-8 w-8 text-rose" />
              <span>
                Click to <b className="text-rose">upload</b> or drag &amp; drop
              </span>
              <small>PNG, JPG, WEBP up to 5MB each · first image = main</small>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>

            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {files.map((src, i) => (
                  <div key={i} className="relative h-[88px] w-[88px] overflow-hidden rounded-[12px] border border-line bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-rose text-[0.6rem] font-bold text-center text-white py-0.5">
                        MAIN
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="absolute right-0.5 top-0.5 grid h-[22px] w-[22px] place-items-center rounded-full bg-charcoal/70 text-[0.8rem] text-white hover:bg-red"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="field-label">
                Or Choose an Icon <span className="font-normal text-muted text-[0.76rem]">(used if no image uploaded)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`grid h-11 w-11 place-items-center rounded-[11px] border-[1.5px] text-xl transition ${
                      emoji === em
                        ? "border-rose bg-blush shadow-md shadow-rose/20"
                        : "border-line hover:border-rose-soft"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side preview */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <div className="rounded-[14px] bg-gradient-to-br from-blush to-[#fbe0ea] p-6 text-center">
              {files[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={files[0]} alt="" className="mx-auto h-24 w-24 rounded-[14px] object-cover shadow-lg" />
              ) : (
                <div className="text-[3.4rem]">{emoji}</div>
              )}
              <div className="mt-2 text-[0.7rem] tracking-widest text-gold font-bold uppercase">
                {(brand || "Brand").toUpperCase()}
              </div>
              <div className="font-heading text-lg font-semibold">{name || "Product Name"}</div>
              <div className="text-xl font-bold text-rose">{money(parseInt(price) || 0)}</div>
            </div>
            <div className="mt-4 rounded-[12px] border border-line bg-white p-4 text-sm text-charcoal min-h-[100px] max-h-[180px] overflow-y-auto">
              {descHtml ? (
                <span dangerouslySetInnerHTML={{ __html: descHtml }} />
              ) : (
                <span className="italic text-[#b8a9b4]">Formatted description will appear here…</span>
              )}
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Category</span><b>{category}</b></div>
              <div className="flex justify-between"><span className="text-muted">Stock</span><b>{parseInt(stock) || 0} units</b></div>
              <div className="flex justify-between"><span className="text-muted">Status</span><b>{status}</b></div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => router.push("/admin")} className="btn-outline flex-1 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 text-sm"
              >
                {saving ? "Saving…" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <AdminGuard>
      <ProductForm />
    </AdminGuard>
  );
}
