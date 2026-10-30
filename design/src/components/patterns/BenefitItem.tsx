import { ChevronDown } from "lucide-react";
import { useTreatmentDialog } from "@/components/patterns/TreatmentDialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PranaIcon } from "@/components/ui/prana-icon";
import { Text } from "@/components/ui/typography";
import { treatmentRefLabel } from "@/data/treatments";
import type { Benefit } from "@/types";

/** La flecha va pegada a la última palabra para que nunca quede sola en otra línea. */
function TitleWithChevron({ title }: { title: string }) {
  const split = title.lastIndexOf(" ") + 1;
  return (
    <span className="min-w-0">
      {title.slice(0, split)}
      <span className="whitespace-nowrap">
        {title.slice(split)}
        <ChevronDown
          aria-hidden="true"
          className="ml-1 hidden size-3.5 xl:inline"
        />
      </span>
    </span>
  );
}

/** Objetivo de la franja de beneficios: despliega los tratamientos relacionados. */
export function BenefitItem({ benefit }: { benefit: Benefit }) {
  const { openTreatment } = useTreatmentDialog();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="benefit" size="benefit">
          <PranaIcon name={benefit.icon} size={64} frame="disc" className="size-11 md:size-12 lg:size-16" />
          <TitleWithChevron title={benefit.title} />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label={`Tratamientos relacionados con ${benefit.title}`}>
        <Text variant="overline" className="px-1">
          Tratamientos relacionados
        </Text>
        <ul className="mt-2 space-y-1">
          {benefit.treatments.map((ref) => (
            <li key={`${ref.categoryId}-${ref.slug ?? "categoria"}`}>
              <Button type="button" variant="list" size="list-sm" onClick={() => openTreatment(ref)}>
                {treatmentRefLabel(ref)}
              </Button>
            </li>
          ))}
        </ul>
        <Text variant="note" className="mt-2 px-1">
          Lo definimos contigo en tu valoración.
        </Text>
      </PopoverContent>
    </Popover>
  );
}
