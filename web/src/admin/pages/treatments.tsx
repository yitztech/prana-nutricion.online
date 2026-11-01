/**
 * Tratamientos: las categorías del catálogo (textos, icono y beneficios) y los tratamientos de cada
 * una (alta, edición, orden y baja). Cada cambio se publica solo en el sitio.
 */
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import type { IconName } from "#shared/icons.ts";
import { limits, listLimits } from "#shared/limits.ts";
import { categoryInputSchema, slugify, treatmentCreateSchema, treatmentInputSchema } from "#shared/schemas.ts";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { Heading, Text } from "@/components/ui/typography";
import { api, errorMessage } from "../lib/api";
import { check, useSubmit } from "../lib/form";
import { Link } from "../lib/router";
import { useResource } from "../lib/resource";
import { siteUrl } from "../lib/site";
import type { AdminCategory, AdminTreatment } from "../lib/types";
import { IconField, IconImage, TextField } from "../components/fields";
import { ConfirmButton, Loading, Notice, PageTitle, Panel, SubmitButton } from "../components/layout";

export function CategoriesPage() {
  const categories = useResource<{ items: AdminCategory[] }>("/api/admin/categories");
  return (
    <>
      <PageTitle description="Elige una categoría para editar sus textos y sus tratamientos.">Tratamientos</PageTitle>
      {categories.status === "loading" ? <Loading /> : null}
      {categories.status === "error" ? <ErrorRetry message={categories.message} retry={categories.reload} /> : null}
      {categories.status === "ready" ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {categories.data.items.map((category) => (
            <li key={category.id}>
              <Surface asChild variant="tile" className="flex h-full items-center gap-4 p-5">
                <Link to={`/tratamientos/${category.id}`}>
                  <IconImage name={category.icon} size={48} />
                  <span className="flex flex-col gap-1">
                    <Text asChild variant="item-title"><span>{category.title}</span></Text>
                    <Text asChild variant="small-muted">
                      <span>{category.treatments.length} {category.treatments.length === 1 ? "tratamiento" : "tratamientos"}</span>
                    </Text>
                  </span>
                </Link>
              </Surface>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function ErrorRetry({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <Notice tone="error">{message}</Notice>
      <Button type="button" variant="outline" onClick={retry}>Reintentar</Button>
    </div>
  );
}

export function CategoryPage({ id }: { id: string }) {
  const categories = useResource<{ items: AdminCategory[] }>("/api/admin/categories");
  if (categories.status === "loading") return <Loading />;
  if (categories.status === "error") return <ErrorRetry message={categories.message} retry={categories.reload} />;
  const category = categories.data.items.find((c) => c.id === id);
  if (!category) return <NotFoundContent />;
  const replace = (updated: AdminCategory) =>
    categories.set({ items: categories.data.items.map((c) => (c.id === updated.id ? updated : c)) });
  return (
    <>
      <PageTitle
        description={<TextLink asChild variant="inline"><Link to="/tratamientos">← Todas las categorías</Link></TextLink>}
        actions={
          <Button asChild variant="ghost">
            <a href={siteUrl(`/tratamientos/${category.id}/`)} target="_blank" rel="noopener"><ExternalLink aria-hidden="true" />Ver en el sitio</a>
          </Button>
        }
      >
        {category.title}
      </PageTitle>
      <div className="flex flex-col gap-8">
        <CategoryForm key={category.id} category={category} onSaved={replace} />
        <TreatmentList category={category} onChanged={replace} reload={categories.reload} />
      </div>
    </>
  );
}

export function NotFoundContent() {
  return (
    <>
      <PageTitle description="La página que buscas no existe o ya no está disponible.">No encontrado</PageTitle>
      <Button asChild><Link to="/">Ir al inicio</Link></Button>
    </>
  );
}

function CategoryForm({ category, onSaved }: { category: AdminCategory; onSaved: (c: AdminCategory) => void }) {
  const [draft, setDraft] = useState({
    title: category.title,
    description: category.description,
    photoAlt: category.photoAlt,
    cta: category.cta,
    icon: category.icon,
    benefits: category.benefits,
  });
  const [saved, setSaved] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();
  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const setBenefit = (index: number, value: string) => set("benefits", draft.benefits.map((b, i) => (i === index ? value : b)));

  return (
    <Panel title="Textos de la categoría">
      <form
        ref={form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(false);
          void run(async () => {
            const input = check(categoryInputSchema, draft);
            onSaved(await api<AdminCategory>("PUT", `/api/admin/categories/${category.id}`, { body: input }));
            setSaved(true);
          }, form.current);
        }}
      >
        <FieldGroup>
          <TextField label="Título" required max={limits.category.title} value={draft.title} onChange={(v) => set("title", v)} error={errors.title} />
          <TextField label="Descripción" multiline required max={limits.category.description} value={draft.description} onChange={(v) => set("description", v)} error={errors.description} />
          <FieldGroup columns="two">
            <TextField label="Texto del botón" required max={limits.category.cta} value={draft.cta} onChange={(v) => set("cta", v)} error={errors.cta} />
            <IconField value={draft.icon} onChange={(v) => set("icon", v)} error={errors.icon} />
          </FieldGroup>
          <TextField label="Descripción de la foto" required max={limits.category.photoAlt}
            description="Para quien no ve la imagen: describe lo que aparece en ella." value={draft.photoAlt} onChange={(v) => set("photoAlt", v)} error={errors.photoAlt} />
          <FieldSet>
            <FieldLegend>Beneficios ({draft.benefits.length} de {listLimits.categoryBenefits})</FieldLegend>
            {draft.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <TextField className="flex-1" label={`Beneficio ${index + 1}`} required max={limits.category.benefit}
                  value={benefit} onChange={(v) => setBenefit(index, v)} error={errors[`benefits.${index}`]} />
                <Button type="button" variant="ghost" size="icon" className="mt-7" aria-label={`Quitar el beneficio ${index + 1}`}
                  onClick={() => set("benefits", draft.benefits.filter((_, i) => i !== index))}>
                  <X aria-hidden="true" />
                </Button>
              </div>
            ))}
            {errors.benefits ? <Notice tone="error">{errors.benefits}</Notice> : null}
            <Button type="button" variant="outline" className="w-fit" disabled={draft.benefits.length >= listLimits.categoryBenefits}
              onClick={() => set("benefits", [...draft.benefits, ""])}>
              <Plus aria-hidden="true" />Añadir un beneficio
            </Button>
          </FieldSet>
          <Notice tone="error">{message}</Notice>
          {saved ? <Notice tone="success">Cambios guardados. El sitio se actualiza en unos segundos.</Notice> : null}
          <SubmitButton busy={busy} className="w-fit">Guardar la categoría</SubmitButton>
        </FieldGroup>
      </form>
    </Panel>
  );
}

type TreatmentDraft = { name: string; icon: IconName; description: string; slug: string };
const emptyTreatment = (icon: IconName): TreatmentDraft => ({ name: "", icon, description: "", slug: "" });

function TreatmentList({ category, onChanged, reload }: { category: AdminCategory; onChanged: (c: AdminCategory) => void; reload: () => void }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [moving, setMoving] = useState(false);
  const full = category.treatments.length >= listLimits.treatmentsPerCategory;

  const move = async (index: number, delta: -1 | 1) => {
    const ids = category.treatments.map((t) => t.id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + delta, 0, id);
    setMoving(true);
    setStatus(null);
    try {
      onChanged(await api<AdminCategory>("PUT", `/api/admin/categories/${category.id}/treatments/order`, { body: { ids } }));
      setStatus({ tone: "success", text: `«${category.treatments[index].name}» se movió ${delta < 0 ? "arriba" : "abajo"}.` });
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
      reload();
    } finally {
      setMoving(false);
    }
  };

  return (
    <Panel title={`Tratamientos (${category.treatments.length})`}>
      <div className="flex flex-col gap-4">
        {status ? <Notice tone={status.tone}>{status.text}</Notice> : null}
        <ol className="flex flex-col gap-3">
          {category.treatments.map((treatment, index) => (
            <Surface asChild variant={editing === treatment.id ? "row-active" : "row"} className="p-4" key={treatment.id}><li>
              {editing === treatment.id ? (
                <TreatmentForm
                  category={category}
                  treatment={treatment}
                  onCancel={() => setEditing(null)}
                  onSaved={(text) => {
                    setEditing(null);
                    setStatus({ tone: "success", text });
                    reload();
                  }}
                />
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <IconImage name={treatment.icon} size={40} />
                  <div className="min-w-0 flex-1">
                    <Text variant="item-title">{treatment.name}</Text>
                    <Text variant="small-muted" className="line-clamp-2">{treatment.description}</Text>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" aria-label={`Subir «${treatment.name}»`} disabled={index === 0 || moving} onClick={() => move(index, -1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Bajar «${treatment.name}»`} disabled={index === category.treatments.length - 1 || moving} onClick={() => move(index, 1)}>
                      <ArrowDown aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => { setStatus(null); setEditing(treatment.id); }}>
                      <Pencil aria-hidden="true" />Editar<span className="sr-only"> «{treatment.name}»</span>
                    </Button>
                    <ConfirmButton
                      size="sm"
                      label={<><Trash2 aria-hidden="true" />Borrar<span className="sr-only"> «{treatment.name}»</span></>}
                      title={`¿Borrar «${treatment.name}»?`}
                      description="Desaparece del sitio y de las promociones que lo mencionan. No se puede deshacer."
                      confirmLabel="Borrar el tratamiento"
                      onConfirm={async () => {
                        try {
                          await api("DELETE", `/api/admin/treatments/${treatment.id}`);
                        } catch (error) {
                          throw new Error(errorMessage(error));
                        }
                        setStatus({ tone: "success", text: `«${treatment.name}» se borró.` });
                        reload();
                      }}
                    />
                  </div>
                </div>
              )}
            </li></Surface>
          ))}
        </ol>
        {editing === "new" ? (
          <Surface variant="row-active" className="p-4">
            <TreatmentForm
              category={category}
              onCancel={() => setEditing(null)}
              onSaved={(text) => {
                setEditing(null);
                setStatus({ tone: "success", text });
                reload();
              }}
            />
          </Surface>
        ) : (
          <Button type="button" variant="outline" className="w-fit" disabled={full} onClick={() => { setStatus(null); setEditing("new"); }}>
            <Plus aria-hidden="true" />Añadir un tratamiento
          </Button>
        )}
        {full ? <Text variant="small-muted">Esta categoría ya tiene el máximo de {listLimits.treatmentsPerCategory} tratamientos.</Text> : null}
      </div>
    </Panel>
  );
}

function TreatmentForm({ category, treatment, onCancel, onSaved }: {
  category: AdminCategory;
  treatment?: AdminTreatment;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const [draft, setDraft] = useState<TreatmentDraft>(treatment ? { ...treatment } : emptyTreatment(category.icon));
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();
  const set = <K extends keyof TreatmentDraft>(key: K, value: TreatmentDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const title = treatment ? `Editar «${treatment.name}»` : "Nuevo tratamiento";

  return (
    <form
      ref={form}
      noValidate
      aria-label={title}
      onSubmit={(event) => {
        event.preventDefault();
        void run(async () => {
          if (treatment) {
            const input = check(treatmentInputSchema, { name: draft.name, icon: draft.icon, description: draft.description });
            await api("PUT", `/api/admin/treatments/${treatment.id}`, { body: input });
            onSaved(`«${input.name}» se guardó.`);
          } else {
            const input = check(treatmentCreateSchema, { name: draft.name, icon: draft.icon, description: draft.description, slug: draft.slug || undefined });
            await api("POST", `/api/admin/categories/${category.id}/treatments`, { body: input });
            onSaved(`«${input.name}» se añadió a ${category.title}.`);
          }
        }, form.current);
      }}
    >
      <FieldGroup>
        <Heading as="h3" variant="block">{title}</Heading>
        <TextField label="Nombre" required max={limits.treatment.name} value={draft.name} onChange={(v) => set("name", v)} error={errors.name} />
        <IconField value={draft.icon} onChange={(v) => set("icon", v)} error={errors.icon} />
        <TextField label="Descripción" multiline required max={limits.treatment.description} value={draft.description} onChange={(v) => set("description", v)} error={errors.description} />
        {treatment ? null : (
          <TextField label="Dirección en el sitio" max={limits.treatment.slug} reject={/[^a-z0-9-]/g}
            rejectMessage="Solo minúsculas sin acentos, números y guiones."
            description={`Si la dejas vacía: ${slugify(draft.name) || "se genera con el nombre"}.`}
            value={draft.slug} onChange={(v) => set("slug", v)} error={errors.slug} />
        )}
        <Notice tone="error">{message}</Notice>
        <div className="flex flex-wrap gap-2">
          <SubmitButton busy={busy}>{treatment ? "Guardar el tratamiento" : "Añadir el tratamiento"}</SubmitButton>
          <Button type="button" variant="ghost" size="lg" disabled={busy} onClick={onCancel}>Cancelar</Button>
        </div>
      </FieldGroup>
    </form>
  );
}
