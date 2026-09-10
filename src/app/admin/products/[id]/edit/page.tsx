"use client";

import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ProductForm } from "@/components/admin/product-form";

export default function EditProductPage() {
  const params = useParams();
  const id = String(params.id);
  return (
    <AdminGuard>
      <ProductForm id={id} />
    </AdminGuard>
  );
}