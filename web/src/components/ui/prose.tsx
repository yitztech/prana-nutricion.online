import * as React from "react";
import { cn } from "@/lib/utils";

/** Texto largo (documentos legales): estilos de títulos, párrafos, listas y enlaces que contiene. */
function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prose"
      className={cn(
        "flex flex-col gap-5 leading-relaxed text-foreground/85",
        "[&_h2]:pt-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-heading",
        "[&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-heading",
        "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-6",
        "[&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-6",
        "[&_li>ul]:mt-2 [&_li>ol]:mt-2 [&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

export { Prose };
