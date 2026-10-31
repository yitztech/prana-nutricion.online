import { PranaIcon } from "@/components/brand/ui/prana-icon";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";
import type { Highlight } from "@/types";

/** Pilar de la filosofía: tarjeta translúcida con icono y texto. */
export function Pillar({ item }: { item: Highlight }) {
  return (
    <Surface asChild variant="glass">
      <li className="flex items-center gap-3 p-3">
        <PranaIcon name={item.icon} size={48} className="size-11" />
        <Text asChild variant="emphasis">
          <span>{item.label}</span>
        </Text>
      </li>
    </Surface>
  );
}
