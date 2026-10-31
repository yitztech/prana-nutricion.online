import { Fragment, type ReactNode } from "react";
import type { RichBlock, RichDoc, RichInline, RichListItem } from "@/types";

/** Dibuja el documento guardado como datos: solo los nodos y marcas permitidos, nunca HTML. */
export function RichText({ doc }: { doc: RichDoc }) {
  return <>{doc.content.map((block, i) => <Block key={i} block={block} />)}</>;
}

function Block({ block }: { block: RichBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p><Inlines content={block.content} /></p>;
    case "heading":
      return block.attrs.level === 2 ? <h2><Inlines content={block.content} /></h2> : <h3><Inlines content={block.content} /></h3>;
    case "bulletList":
      return <ul>{block.content.map((item, i) => <Item key={i} item={item} />)}</ul>;
    case "orderedList":
      return <ol>{block.content.map((item, i) => <Item key={i} item={item} />)}</ol>;
  }
}

function Item({ item }: { item: RichListItem }) {
  // Un único párrafo se muestra sin <p>, como en una lista escrita a mano.
  if (item.content.length === 1 && item.content[0].type === "paragraph") {
    return <li><Inlines content={item.content[0].content} /></li>;
  }
  return <li>{item.content.map((block, i) => <Block key={i} block={block} />)}</li>;
}

function Inlines({ content = [] }: { content?: RichInline[] }) {
  return <>{content.map((node, i) => <Fragment key={i}>{inline(node)}</Fragment>)}</>;
}

function inline(node: RichInline): ReactNode {
  if (node.type === "hardBreak") return <br />;
  let out: ReactNode = node.text;
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") out = <strong>{out}</strong>;
    else if (mark.type === "italic") out = <em>{out}</em>;
    else if (mark.type === "link") {
      const external = /^https?:/i.test(mark.attrs.href);
      out = <a href={mark.attrs.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{out}</a>;
    }
  }
  return out;
}
