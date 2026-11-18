import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([prisma.product.findUnique({ where: { id } }), prisma.category.findMany({ orderBy: { sortOrder: "asc" } })]);
  if (!product) notFound();
  return (
    <div className="max-w-4xl">
      <PageHeader title={product.name} description="Edit product details." />
      <Link href={`/software/${product.slug}`} target="_blank" className="-mt-4 mb-6 inline-block text-sm text-cyan">View on site ↗</Link>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
