import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (<div className="max-w-4xl"><PageHeader title="New product" /><ProductForm categories={categories} /></div>);
}
