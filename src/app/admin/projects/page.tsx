import { Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteProject, saveProject, toggleProjectPublished } from "../actions";
import { PageHeader, noticeFrom, Empty } from "@/components/admin/PageHeader";
import { AdminForm } from "@/components/admin/AdminForm";
import { Area, Check, Section, Select, Text } from "@/components/admin/Fields";
import { MediaField } from "@/components/admin/MediaField";
import { RowActions, EditorPanel } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/ui/Badge";
import { asStringArray, projectStatusLabel } from "@/lib/format";

export const metadata = { title: "Projects" };

export default async function Projects({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string; saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const projects = await prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  const e = sp.edit ? projects.find((p) => p.id === sp.edit) : undefined;
  return (
    <div className="max-w-5xl">
      <PageHeader title="Projects" description="Portfolio entries shown on the Projects page. Unpublished projects are hidden from the site." newHref="/admin/projects?new=1" newLabel="Add project" notice={noticeFrom(sp)} />
      {(e || sp.new === "1") && (
        <EditorPanel title={e ? `Edit ${e.title}` : "New project"} closeHref="/admin/projects">
          <AdminForm key={e?.id ?? "new"} action={saveProject}>
            {e && <input type="hidden" name="id" value={e.id} />}
            <Section title="Project">
              <Text label="Title" name="title" defaultValue={e?.title} required />
              <Text label="Slug" name="slug" defaultValue={e?.slug} hint="Leave empty to generate." />
              <Select label="Status" name="status" defaultValue={e?.status ?? "DEMO"} options={Object.entries(projectStatusLabel).map(([value, label]) => ({ value, label }))} />
              <Text label="Category" name="category" defaultValue={e?.category} hint="Free text, e.g. Retail" />
              <Area label="Summary" name="summary" defaultValue={e?.summary} rows={2} className="sm:col-span-2" />
              <Area label="Description" name="description" defaultValue={e?.description} rows={6} className="sm:col-span-2" />
              <Text label="Tags" name="tags" defaultValue={asStringArray(e?.tags).join(", ")} hint="Comma separated" />
              <Text label="Accent colour" name="accentColor" defaultValue={e?.accentColor ?? "#00D4FF"} />
              <MediaField label="Preview image" name="imageUrl" defaultValue={e?.imageUrl} />
              <Text label="Sort order" name="sortOrder" type="number" defaultValue={e?.sortOrder ?? 0} />
              <Check label="Published" name="published" defaultChecked={e?.published ?? true} />
            </Section>
          </AdminForm>
        </EditorPanel>
      )}
      {projects.length === 0 ? <Empty>No projects yet.</Empty> : (
        <ul className="glass divide-y divide-white/5 rounded-2xl">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{p.title}</p><StatusBadge status={p.status} kind="project" />{!p.published && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">Unpublished</span>}</div>
                <p className="truncate text-sm text-text-2">{p.summary}</p>
              </div>
              <form action={toggleProjectPublished}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-text-2 hover:text-text">
                  {p.published ? <><EyeOff className="size-3.5" aria-hidden="true" />Unpublish</> : <><Eye className="size-3.5" aria-hidden="true" />Publish</>}
                </button>
              </form>
              <RowActions editHref={`/admin/projects?edit=${p.id}`} id={p.id} label={p.title} del={deleteProject} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
