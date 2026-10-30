import { PranaIcon } from "@/components/ui/prana-icon";
import { Text } from "@/components/ui/typography";
import type { Highlight as HighlightData } from "@/types";

/** Icono con su texto, bajo el botón de la portada. */
export function Highlight({ item }: { item: HighlightData }) {
  return (
    <li className="flex items-center gap-1.5 sm:gap-3">
      <PranaIcon name={item.icon} size={64} frame="disc" className="size-9 sm:size-14 lg:size-16" />
      <Text asChild variant="highlight">
        <span>{item.label}</span>
      </Text>
    </li>
  );
}
