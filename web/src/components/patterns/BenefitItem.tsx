import { ChevronRight } from "lucide-react";
import { BrandButton } from "@/components/brand/ui/brand-button";
import { PranaIcon } from "@/components/brand/ui/prana-icon";
import { benefitHref } from "@/features/benefits";
import type { Benefit } from "@/types";

/** Objetivo de la franja de beneficios: enlace nativo a su página. */
export function BenefitItem({ benefit }: { benefit: Benefit }) {
  return (
    <BrandButton asChild variant="benefit" size="benefit">
      <a href={benefitHref(benefit.id)}>
        <PranaIcon name={benefit.icon} size={64} frame="disc" className="size-11 md:size-12 lg:size-16" />
        <span className="min-w-0">{benefit.title}</span>
        <ChevronRight aria-hidden="true" className="hidden shrink-0 xl:inline" />
      </a>
    </BrandButton>
  );
}
