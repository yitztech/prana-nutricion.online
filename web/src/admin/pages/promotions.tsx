/**
 * Promociones: lista paginada y formulario de alta y edición. Las vigentes se muestran en la portada
 * hasta su último día; las pausadas no; las del archivo aparecen en «Promociones pasadas».
 */
import { useMemo, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { IconName } from "#shared/icons.ts";
import { limits, listLimits } from "#shared/limits.ts";
import { promotionInputSchema, promotionStatuses } from "#shared/schemas.ts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Photo } from "@/components/ui/photo";
import { Surface } from "@/components/ui/surface";
import { TextLink } from "@/components/ui/text-link";
import { Text } from "@/components/ui/typography";
import { api, errorMessage } from "../lib/api";
import { ClientErrors, formatDay, formatMoney, formatPesos, integerCharacters, parsePesos, pesosCharacters, useSubmit, validate, type Errors } from "../lib/form";
import { Link, useRouter } from "../lib/router";
import { useResource } from "../lib/resource";
import type { AdminCategory, AdminPromotion, PromotionStatus } from "../lib/types";
import { CheckboxField, IconField, SelectField, TextField } from "../components/fields";
import { ImageField, type ImageValue } from "../components/image-field";
import { ConfirmButton, Loading, Notice, PageTitle, Panel, SubmitButton } from "../components/layout";
import { ErrorRetry, NotFoundContent } from "./treatments";

const statusLabels: Record<PromotionStatus, string> = {
  active: "Visible en el sitio",
  inactive: "Pausada",
  archived: "Archivo",
};
const statusOptions = promotionStatuses.map((value) => ({ value, label: {
  active: "Visible en el sitio (hasta su último día)",
  inactive: "Pausada: no se muestra",
  archived: "Archivo: en «Promociones pasadas»",
}[value] }));

/** Fecha de hoy en Cuautla (AAAA-MM-DD), para saber si una promoción ya terminó. */
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());

function StatusBadge({ promotion }: { promotion: AdminPromotion }) {
  if (promotion.status === "active" && promotion.endsOn && promotion.endsOn < today()) return <Badge variant="outline">Terminada</Badge>;
  if (promotion.status === "active" && promotion.startsOn && promotion.startsOn > today()) return <Badge variant="secondary">Próximamente</Badge>;
  return <Badge variant={promotion.status === "active" ? "default" : promotion.status === "inactive" ? "outline" : "secondary"}>{statusLabels[promotion.status]}</Badge>;
}

export function PromotionsPage() {
  const first = useResource<{ items: AdminPromotion[]; nextCursor: string | null }>("/api/admin/promotions?limit=20");
  const [more, setMore] = useState<{ items: AdminPromotion[]; nextCursor: string | null } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = first.status === "ready" ? [...first.data.items, ...(more?.items ?? [])] : [];
  const cursor = more ? more.nextCursor : first.status === "ready" ? first.data.nextCursor : null;
  const full = first.status === "ready" && !cursor && items.length >= listLimits.promotions;

  return (
    <>
      <PageTitle
        description="Las promociones visibles aparecen en la portada hasta su último día, en la hora de Cuautla."
        actions={full ? null : <Button asChild size="lg"><Link to="/promociones/nueva"><Plus aria-hidden="true" />Nueva promoción</Link></Button>}
      >
        Promociones
      </PageTitle>
      {first.status === "loading" ? <Loading /> : null}
      {first.status === "error" ? <ErrorRetry message={first.message} retry={first.reload} /> : null}
      {first.status === "ready" && !items.length ? <Notice tone="info">Aún no hay promociones. Crea la primera con «Nueva promoción».</Notice> : null}
      {full ? <Notice tone="info">Llegaste al máximo de {listLimits.promotions} promociones: borra alguna antigua para crear otra.</Notice> : null}
      {items.length ? (
        <ul className="flex flex-col gap-3">
          {items.map((promotion) => (
            <li key={promotion.id}>
              <Surface asChild variant="tile" className="flex items-center gap-4 p-3">
                <Link to={`/promociones/${promotion.id}`}>
                  <Photo framing="list" src={promotion.imageUrl} alt="" width={128} height={85} loading="lazy" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <Text asChild variant="item-title"><span>{promotion.name}</span></Text>
                    <Text asChild variant="small-muted">
                      <span>
                        {promotion.endsOn ? `Hasta el ${formatDay(promotion.endsOn)}` : promotion.periodLabel ?? "Sin fecha"}
                        {promotion.priceCents != null ? ` · ${formatMoney(promotion.priceCents)}` : ""}
                      </span>
                    </Text>
                  </span>
                  <StatusBadge promotion={promotion} />
                </Link>
              </Surface>
            </li>
          ))}
        </ul>
      ) : null}
      <Notice tone="error" className="mt-4">{error}</Notice>
      {cursor ? (
        <Button type="button" variant="outline" className="mt-4" disabled={loadingMore}
          onClick={async () => {
            setLoadingMore(true);
            setError(null);
            try {
              const page = await api<{ items: AdminPromotion[]; nextCursor: string | null }>("GET", `/api/admin/promotions?limit=20&cursor=${encodeURIComponent(cursor)}`);
              setMore({ items: [...(more?.items ?? []), ...page.items], nextCursor: page.nextCursor });
            } catch (e) {
              setError(errorMessage(e));
            } finally {
              setLoadingMore(false);
            }
          }}>
          {loadingMore ? "Cargando…" : "Cargar más"}
        </Button>
      ) : null}
    </>
  );
}

// ── Formulario ────────────────────────────────────────────────────────────────

type Include = { quantity: string; label: string; icon: IconName; free: boolean };
type Draft = {
  status: PromotionStatus;
  name: string; campaign: string; tagline: string; description: string;
  price: string; deposit: string; discountPercent: string; reservationNote: string;
  startsOn: string; endsOn: string;
  image: ImageValue; imageAlt: string;
  ctaLabel: string; ctaTreatment: string;
  periodLabel: string; offerLabel: string;
  includes: Include[];
  discounts: { label: string; percent: string }[];
  treatmentIds: string[];
};

function toDraft(p?: AdminPromotion): Draft {
  return {
    status: p?.status ?? "active",
    name: p?.name ?? "", campaign: p?.campaign ?? "", tagline: p?.tagline ?? "", description: p?.description ?? "",
    price: formatPesos(p?.priceCents), deposit: formatPesos(p?.depositCents),
    discountPercent: p?.discountPercent != null ? String(p.discountPercent) : "", reservationNote: p?.reservationNote ?? "",
    startsOn: p?.startsOn ?? "", endsOn: p?.endsOn ?? "",
    image: p ? { image: p.image, url: p.imageUrl } : { image: null, url: null }, imageAlt: p?.imageAlt ?? "",
    ctaLabel: p?.ctaLabel ?? "", ctaTreatment: p?.ctaTreatment ?? "",
    periodLabel: p?.periodLabel ?? "", offerLabel: p?.offerLabel ?? "",
    includes: (p?.includes ?? []).map((i) => ({ quantity: i.quantity != null ? String(i.quantity) : "", label: i.label, icon: i.icon, free: i.free })),
    discounts: (p?.discounts ?? []).map((d) => ({ label: d.label, percent: String(d.percent) })),
    treatmentIds: p?.treatmentIds ?? [],
  };
}

const int = (value: string) => (value.trim() === "" ? null : Number(value));

/** Del formulario a la entrada de la API; los importes van en centavos (§21). */
function toInput(d: Draft): { input: unknown; errors: Errors } {
  const errors: Errors = {};
  const price = parsePesos(d.price);
  const deposit = parsePesos(d.deposit);
  if (Number.isNaN(price)) errors.priceCents = "Escribe el precio en pesos, p. ej. 1499 o 1499.50.";
  if (Number.isNaN(deposit)) errors.depositCents = "Escribe el apartado en pesos, p. ej. 500.";
  if (!d.image.image) errors.image = "Sube una imagen o elige una foto del sitio.";
  const archived = d.status === "archived";
  return {
    errors,
    input: {
      status: d.status,
      name: d.name, campaign: d.campaign, tagline: d.tagline, description: d.description,
      priceCents: price, depositCents: deposit, discountPercent: int(d.discountPercent), reservationNote: d.reservationNote,
      startsOn: d.startsOn || null, endsOn: d.endsOn || null,
      image: d.image.image ?? { path: "" }, imageAlt: d.imageAlt,
      ctaLabel: d.ctaLabel, ctaTreatment: d.ctaTreatment,
      periodLabel: archived ? d.periodLabel : null, offerLabel: archived ? d.offerLabel : null,
      includes: d.includes.map((i) => ({ quantity: int(i.quantity), label: i.label, icon: i.icon, free: i.free })),
      discounts: archived ? d.discounts.map((x) => ({ label: x.label, percent: Number(x.percent) })) : [],
      treatmentIds: d.treatmentIds,
    },
  };
}

export function PromotionPage({ id }: { id: string }) {
  const isNew = id === "nueva";
  const promotion = useResource<AdminPromotion>(isNew ? null : `/api/admin/promotions/${encodeURIComponent(id)}`);
  const categories = useResource<{ items: AdminCategory[] }>("/api/admin/categories");
  if (categories.status === "error") return <ErrorRetry message={categories.message} retry={categories.reload} />;
  if (!isNew && promotion.status === "error") {
    return promotion.code === "not_found" ? <NotFoundContent /> : <ErrorRetry message={promotion.message} retry={promotion.reload} />;
  }
  if (categories.status !== "ready" || (!isNew && promotion.status !== "ready")) return <Loading />;
  return <PromotionForm key={id} promotion={isNew ? undefined : promotion.data} categories={categories.data.items} />;
}

function PromotionForm({ promotion, categories }: { promotion?: AdminPromotion; categories: AdminCategory[] }) {
  const { navigate } = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(promotion));
  const [current, setCurrent] = useState(promotion);
  // Tras crearla se abre su página con ?creada: se confirma y se limpia la dirección.
  const [saved, setSaved] = useState<string | null>(() => {
    if (!new URLSearchParams(window.location.search).has("creada")) return null;
    window.history.replaceState(null, "", window.location.pathname);
    return "Promoción creada. El sitio se actualiza en unos segundos.";
  });
  const form = useRef<HTMLFormElement>(null);
  const { busy, errors, message, run } = useSubmit();
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setSaved(null);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const archived = draft.status === "archived";
  const sitePhotos = useMemo(() => categories.map((c) => ({ path: `/img/${c.photo}-1024.webp`, label: c.title })), [categories]);
  const setInclude = (index: number, patch: Partial<Include>) => set("includes", draft.includes.map((x, i) => (i === index ? { ...x, ...patch } : x)));
  const setDiscount = (index: number, patch: Partial<Draft["discounts"][number]>) => set("discounts", draft.discounts.map((x, i) => (i === index ? { ...x, ...patch } : x)));

  return (
    <>
      <PageTitle description={<TextLink asChild variant="inline"><Link to="/promociones">← Todas las promociones</Link></TextLink>}>
        {current ? current.name : "Nueva promoción"}
      </PageTitle>
      <form
        ref={form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(null);
          void run(async () => {
            const { input, errors: own } = toInput(draft);
            const result = validate(promotionInputSchema, input);
            const all = { ...(result.errors ?? {}), ...own };
            if (Object.keys(all).length) throw new ClientErrors(all);
            if (current) {
              const updated = await api<AdminPromotion>("PUT", `/api/admin/promotions/${current.id}`, { body: result.data });
              setCurrent(updated);
              setSaved("Promoción guardada. El sitio se actualiza en unos segundos.");
            } else {
              const created = await api<AdminPromotion>("POST", "/api/admin/promotions", { body: result.data });
              navigate(`/promociones/${created.id}?creada`, { replace: true });
            }
          }, form.current);
        }}
      >
        <div className="flex flex-col gap-6">
          <Panel title="Publicación">
            <FieldGroup columns="two">
              <SelectField label="Estado" value={draft.status} onChange={(v) => set("status", v)} options={statusOptions} error={errors.status} />
              <div />
              <TextField label="Primer día" type="date" value={draft.startsOn} onChange={(v) => set("startsOn", v)} error={errors.startsOn}
                description="Antes de esta fecha se muestra como «Próximamente»." />
              <TextField label="Último día" type="date" required={!archived} value={draft.endsOn} onChange={(v) => set("endsOn", v)} error={errors.endsOn}
                description="Se deja de mostrar al terminar este día." />
            </FieldGroup>
          </Panel>

          <Panel title="Textos">
            <FieldGroup>
              <TextField label="Nombre" required max={limits.promotion.name} value={draft.name} onChange={(v) => set("name", v)} error={errors.name} />
              <FieldGroup columns="two">
                <TextField label="Campaña" max={limits.promotion.campaign} value={draft.campaign} onChange={(v) => set("campaign", v)} error={errors.campaign}
                  description="P. ej. «Buen Fin 2026»." />
                <TextField label="Frase destacada" max={limits.promotion.tagline} value={draft.tagline} onChange={(v) => set("tagline", v)} error={errors.tagline}
                  description="Se muestra en letra manuscrita." />
              </FieldGroup>
              <TextField label="Descripción" multiline required max={limits.promotion.description} value={draft.description} onChange={(v) => set("description", v)} error={errors.description} />
              {archived ? (
                <FieldGroup columns="two">
                  <TextField label="Periodo" max={limits.promotion.periodLabel} value={draft.periodLabel} onChange={(v) => set("periodLabel", v)} error={errors.periodLabel}
                    description="Para el archivo, p. ej. «Agosto»." />
                  <TextField label="Oferta" max={limits.promotion.offerLabel} value={draft.offerLabel} onChange={(v) => set("offerLabel", v)} error={errors.offerLabel}
                    description="P. ej. «2 × 1»." />
                </FieldGroup>
              ) : null}
            </FieldGroup>
          </Panel>

          <Panel title="Precio">
            <FieldGroup columns="two">
              <TextField label="Precio" prefix="$" inputMode="decimal" max={14} reject={pesosCharacters} rejectMessage="Solo números y punto decimal."
                value={draft.price} onChange={(v) => set("price", v)} error={errors.priceCents} description="En pesos mexicanos. Vacío: no se muestra precio." />
              <TextField label="Apartado" prefix="$" inputMode="decimal" max={14} reject={pesosCharacters} rejectMessage="Solo números y punto decimal."
                value={draft.deposit} onChange={(v) => set("deposit", v)} error={errors.depositCents} description="Lo que se paga para reservar la promoción." />
              <TextField label="Descuento (%)" inputMode="numeric" max={3} reject={integerCharacters} rejectMessage="Solo números enteros."
                value={draft.discountPercent} onChange={(v) => set("discountPercent", v)} error={errors.discountPercent} />
              <TextField label="Nota sobre la reserva" max={limits.promotion.reservationNote} value={draft.reservationNote} onChange={(v) => set("reservationNote", v)}
                error={errors.reservationNote} description="P. ej. «Aparta con $500 y congela tu promoción»." />
            </FieldGroup>
          </Panel>

          <Panel title="Imagen">
            <FieldGroup>
              <ImageField value={draft.image} onChange={(v) => set("image", v)} error={errors.image ?? errors["image.uploadId"] ?? errors["image.path"]} sitePhotos={sitePhotos} />
              <TextField label="Descripción de la imagen" required max={limits.promotion.imageAlt} value={draft.imageAlt} onChange={(v) => set("imageAlt", v)}
                error={errors.imageAlt} description="Para quien no ve la imagen: describe lo que aparece en ella." />
            </FieldGroup>
          </Panel>

          {archived ? null : (
            <Panel title="Botón de WhatsApp">
              <FieldGroup columns="two">
                <TextField label="Texto del botón" required max={limits.promotion.ctaLabel} value={draft.ctaLabel} onChange={(v) => set("ctaLabel", v)} error={errors.ctaLabel}
                  description="P. ej. «Consultar promoción»." />
                <TextField label="Qué se consulta en el mensaje" max={limits.promotion.ctaTreatment} value={draft.ctaTreatment} onChange={(v) => set("ctaTreatment", v)}
                  error={errors.ctaTreatment} description={`Si lo dejas vacío: «la promoción ${draft.name || "…"}».`} />
              </FieldGroup>
            </Panel>
          )}

          <Panel title="Qué incluye">
            <FieldSet>
              <FieldLegend className="sr-only">Qué incluye</FieldLegend>
              {draft.includes.map((item, index) => (
                <Surface key={index} variant="row" className="flex flex-col gap-4 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Text variant="item-title">Elemento {index + 1}</Text>
                    <Button type="button" variant="ghost" size="sm" onClick={() => set("includes", draft.includes.filter((_, i) => i !== index))}>
                      <X aria-hidden="true" />Quitar<span className="sr-only"> el elemento {index + 1}</span>
                    </Button>
                  </div>
                  <FieldGroup columns="two">
                    <TextField label="Cantidad" inputMode="numeric" max={2} reject={integerCharacters} rejectMessage="Solo números enteros."
                      value={item.quantity} onChange={(v) => setInclude(index, { quantity: v })} error={errors[`includes.${index}.quantity`]} />
                    <TextField label="Descripción" required max={limits.promotion.includeLabel} value={item.label} onChange={(v) => setInclude(index, { label: v })}
                      error={errors[`includes.${index}.label`]} description="P. ej. «sesiones de carboxiterapia»." />
                    <IconField value={item.icon} onChange={(v) => setInclude(index, { icon: v })} error={errors[`includes.${index}.icon`]} />
                    <CheckboxField label="Gratis" checked={item.free} onChange={(v) => setInclude(index, { free: v })} />
                  </FieldGroup>
                </Surface>
              ))}
              <Button type="button" variant="outline" className="w-fit" disabled={draft.includes.length >= listLimits.promotionIncludes}
                onClick={() => set("includes", [...draft.includes, { quantity: "", label: "", icon: "valoracion-personalizada", free: false }])}>
                <Plus aria-hidden="true" />Añadir un elemento
              </Button>
            </FieldSet>
          </Panel>

          {archived ? (
            <Panel title="Descuentos del archivo">
              <FieldSet>
                <FieldLegend className="sr-only">Descuentos</FieldLegend>
                {draft.discounts.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-start gap-3">
                    <TextField className="min-w-48 flex-1" label={`Descuento ${index + 1}`} required max={limits.promotion.discountLabel}
                      value={item.label} onChange={(v) => setDiscount(index, { label: v })} error={errors[`discounts.${index}.label`]} />
                    <TextField className="w-28" label="%" required inputMode="numeric" max={3} reject={integerCharacters}
                      value={item.percent} onChange={(v) => setDiscount(index, { percent: v })} error={errors[`discounts.${index}.percent`]} />
                    <Button type="button" variant="ghost" size="icon" className="mt-7" aria-label={`Quitar el descuento ${index + 1}`}
                      onClick={() => set("discounts", draft.discounts.filter((_, i) => i !== index))}>
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" className="w-fit" disabled={draft.discounts.length >= listLimits.promotionDiscounts}
                  onClick={() => set("discounts", [...draft.discounts, { label: "", percent: "" }])}>
                  <Plus aria-hidden="true" />Añadir un descuento
                </Button>
              </FieldSet>
            </Panel>
          ) : null}

          <Panel title="Tratamientos relacionados">
            <FieldSet>
              <FieldLegend className="sr-only">Tratamientos relacionados</FieldLegend>
              <FieldDescription>Hasta {listLimits.promotionTreatments}. Enlazan la promoción con sus páginas de tratamientos.</FieldDescription>
              {categories.map((category) => (
                <fieldset key={category.id} className="flex flex-col gap-2">
                  <FieldLegend>{category.title}</FieldLegend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {category.treatments.map((treatment) => {
                      const checked = draft.treatmentIds.includes(treatment.id);
                      return (
                        <CheckboxField key={treatment.id} label={treatment.name} checked={checked}
                          onChange={(on) => {
                            if (on && draft.treatmentIds.length >= listLimits.promotionTreatments) return;
                            set("treatmentIds", on ? [...draft.treatmentIds, treatment.id] : draft.treatmentIds.filter((x) => x !== treatment.id));
                          }} />
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              {errors.treatmentIds ? <Notice tone="error">{errors.treatmentIds}</Notice> : null}
            </FieldSet>
          </Panel>

          <Notice tone="error">{message}</Notice>
          <Notice tone="success">{saved}</Notice>
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton busy={busy}>{current ? "Guardar la promoción" : "Crear la promoción"}</SubmitButton>
            {current ? (
              <ConfirmButton
                label={<><Trash2 aria-hidden="true" />Borrar</>}
                title={`¿Borrar «${current.name}»?`}
                description="Desaparece del sitio. Si solo quieres dejar de mostrarla, cambia su estado a «Pausada» o «Archivo». No se puede deshacer."
                confirmLabel="Borrar la promoción"
                onConfirm={async () => {
                  try {
                    await api("DELETE", `/api/admin/promotions/${current.id}`);
                  } catch (error) {
                    throw new Error(errorMessage(error));
                  }
                  navigate("/promociones");
                }}
              />
            ) : null}
          </div>
        </div>
      </form>
    </>
  );
}

