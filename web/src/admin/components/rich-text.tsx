/**
 * Editor de los documentos legales con Tiptap, limitado a lo que admite el sitio (shared/schemas.ts):
 * títulos de nivel 2 y 3, párrafos, listas, negrita, cursiva y enlaces seguros. Guarda JSON, nunca HTML.
 */
import { useEffect, useId, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Pilcrow, Redo2, Undo2, Unlink } from "lucide-react";
import type { RichDoc } from "#shared/content.ts";
import { limits } from "#shared/limits.ts";
import { isSafeHref, richText } from "#shared/schemas.ts";
import { Button } from "@/components/ui/button";
import { Field, FieldCounter, FieldError, FieldFooter, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Prose } from "@/components/ui/prose";
import { Surface, surfaceVariants } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    trailingNode: false,
    link: { openOnClick: false, autolink: false, linkOnPaste: false, isAllowedUri: (url) => isSafeHref(url) },
  }),
];

export function RichTextField({ label, value, onChange, error }: { label: string; value: RichDoc; onChange: (doc: RichDoc) => void; error?: string }) {
  const id = useId();
  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: true,
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": `${id}-etiqueta`,
        "aria-describedby": `${id}-error ${id}-contador`,
        class: cn(surfaceVariants({ variant: "editor" }), "min-h-80 p-4"),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichDoc),
  });
  const length = useEditorState({ editor, selector: ({ editor }) => (editor ? [...richText(editor.getJSON() as RichDoc)].length : 0) });

  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: { ...editor.options.editorProps.attributes, "aria-invalid": error ? "true" : "false" } } });
  }, [editor, error]);

  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel id={`${id}-etiqueta`} htmlFor={id}>{label}</FieldLabel>
      <div>
        {editor ? <Toolbar editor={editor} /> : null}
        <Prose>
          <EditorContent editor={editor} />
        </Prose>
      </div>
      <FieldFooter>
        <FieldError id={`${id}-error`}>{error}</FieldError>
        <FieldCounter id={`${id}-contador`}>{length} / {limits.legal.text}</FieldCounter>
      </FieldFooter>
    </Field>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      paragraph: e.isActive("paragraph"),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      link: e.isActive("link"),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const chain = () => editor.chain().focus();
  const tools = [
    { label: "Título de sección", icon: Heading2, active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: "Subtítulo de sección", icon: Heading3, active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: "Párrafo", icon: Pilcrow, active: state.paragraph, run: () => chain().setParagraph().run() },
    { label: "Negrita", icon: Bold, active: state.bold, run: () => chain().toggleBold().run() },
    { label: "Cursiva", icon: Italic, active: state.italic, run: () => chain().toggleItalic().run() },
    { label: "Lista", icon: List, active: state.bullet, run: () => chain().toggleBulletList().run() },
    { label: "Lista numerada", icon: ListOrdered, active: state.ordered, run: () => chain().toggleOrderedList().run() },
  ];
  return (
    <Surface variant="toolbar" className="p-1">
      {/* Con el ratón, los botones no se quedan el foco: el texto conserva la selección y el cursor. */}
      <div role="toolbar" aria-label="Formato del texto" className="flex flex-wrap gap-1"
        onMouseDown={(event) => { if ((event.target as HTMLElement).closest("button")) event.preventDefault(); }}>
        {tools.map(({ label, icon: Icon, active, run }) => (
          <Button key={label} type="button" variant="toggle" size="icon-sm" aria-label={label} title={label} aria-pressed={active} onClick={run}>
            <Icon aria-hidden="true" />
          </Button>
        ))}
        <Button type="button" variant="toggle" size="icon-sm" aria-label="Enlace" title="Enlace" aria-pressed={state.link} aria-expanded={linkOpen}
          onClick={() => setLinkOpen((open) => !open)}>
          <Link2 aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Quitar el enlace" title="Quitar el enlace" disabled={!state.link}
          onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
          <Unlink aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Deshacer" title="Deshacer" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Rehacer" title="Rehacer" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 aria-hidden="true" />
        </Button>
      </div>
      {linkOpen ? (
        <LinkForm
          initial={state.href}
          onCancel={() => setLinkOpen(false)}
          onApply={(href) => {
            chain().extendMarkRange("link").setLink({ href }).run();
            setLinkOpen(false);
          }}
        />
      ) : null}
    </Surface>
  );
}

function LinkForm({ initial, onApply, onCancel }: { initial: string; onApply: (href: string) => void; onCancel: () => void }) {
  const id = useId();
  const [href, setHref] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const apply = () => {
    const value = href.trim();
    if (!isSafeHref(value)) return setError("Usa una dirección que empiece por https://, mailto:, tel: o una ruta del sitio (/privacidad).");
    onApply(value);
  };
  return (
    <div className="flex flex-col gap-2 p-2" onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}>
      <FieldLabel htmlFor={id}>Dirección del enlace</FieldLabel>
      <div className="flex flex-wrap gap-2">
        <Input id={id} type="url" autoFocus maxLength={limits.legal.href} value={href} placeholder="https://"
          aria-invalid={error ? true : undefined} aria-describedby={`${id}-error`}
          onChange={(e) => { setHref(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
          className="min-w-60 flex-1" />
        <Button type="button" onClick={apply}>Aplicar</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
      <FieldError id={`${id}-error`}>{error ?? undefined}</FieldError>
      <Text variant="note">Selecciona primero el texto que llevará el enlace.</Text>
    </div>
  );
}
