/**
 * Imagen de una promoción: subir una foto propia (se convierte a WebP en el servidor) o usar una de
 * las fotos del sitio. La vista previa usa blob: antes de subirla; nada sale a otros dominios.
 */
import { useEffect, useId, useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { promotionImage } from "#shared/limits.ts";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Photo } from "@/components/ui/photo";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";
import { api, errorMessage } from "../lib/api";

export type ImageValue = { image: { uploadId: string } | { path: string } | null; url: string | null };

const help = `JPG, PNG o WebP de hasta ${promotionImage.maxBytes / 1024 / 1024} MB, horizontal 3:2, de al menos ${promotionImage.minWidth} × ${promotionImage.minHeight} px y de hasta ${promotionImage.maxPixels / 1_000_000} megapíxeles.`;

export function ImageField({ value, onChange, error, sitePhotos }: {
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  error?: string;
  sitePhotos: { path: string; label: string }[];
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const upload = async (file: File) => {
    setUploadError(null);
    if (!(promotionImage.types as readonly string[]).includes(file.type)) return setUploadError(`El archivo no es una imagen admitida. Usa ${help}`);
    if (file.size > promotionImage.maxBytes) return setUploadError(`El archivo supera los ${promotionImage.maxBytes / 1024 / 1024} MB.`);
    const blob = URL.createObjectURL(file);
    setPreview(blob);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const result = await api<{ id: string; src: string }>("POST", "/api/admin/uploads", { form });
      onChange({ image: { uploadId: result.id }, url: result.src });
      setPreview(null);
    } catch (e) {
      setUploadError(errorMessage(e));
      setPreview(null);
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const shown = preview ?? value.url;
  const sitePath = value.image && "path" in value.image ? value.image.path : "";
  const message = uploadError ?? error;
  return (
    <Field invalid={Boolean(message)}>
      <FieldLabel htmlFor={id}>Imagen</FieldLabel>
      <FieldDescription id={`${id}-ayuda`}>{help} Si la proporción no coincide, se recorta al centro.</FieldDescription>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Surface variant="media" className="aspect-3/2 w-full max-w-xs">
          {shown ? <Photo framing="fill" src={shown} alt="Vista previa de la imagen" /> : (
            <Text variant="small-muted" className="flex size-full items-center justify-center p-4 text-center">Sin imagen</Text>
          )}
        </Surface>
        <div className="flex flex-col gap-3">
          <input ref={input} id={id} type="file" accept={promotionImage.types.join(",")} className="sr-only"
            aria-describedby={`${id}-ayuda ${id}-error`} aria-invalid={message ? true : undefined}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} />
          <Button type="button" variant="outline" disabled={uploading} onClick={() => input.current?.click()}>
            {uploading ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <ImageUp aria-hidden="true" />}
            {uploading ? "Subiendo la imagen…" : "Subir una imagen"}
          </Button>
          <div className="flex flex-col gap-2">
            <Text asChild variant="small-muted"><label htmlFor={`${id}-sitio`}>o usa una foto del sitio</label></Text>
            <NativeSelect id={`${id}-sitio`} value={sitePath} disabled={uploading}
              onChange={(e) => e.target.value && onChange({ image: { path: e.target.value }, url: e.target.value })}>
              <NativeSelectOption value="">Elige una foto…</NativeSelectOption>
              {sitePhotos.map((photo) => <NativeSelectOption key={photo.path} value={photo.path}>{photo.label}</NativeSelectOption>)}
            </NativeSelect>
          </div>
        </div>
      </div>
      <p role="status" className="sr-only">{uploading ? "Subiendo la imagen" : ""}</p>
      <FieldError id={`${id}-error`}>{message ?? undefined}</FieldError>
    </Field>
  );
}
