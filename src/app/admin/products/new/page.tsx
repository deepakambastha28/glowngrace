"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { ProductForm } from "@/components/admin/product-form";

export default function AddProductPage() {
  return (
    <AdminGuard>
      <ProductForm />
    </AdminGuard>
  );
}