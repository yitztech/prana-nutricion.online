import type { ComponentProps } from "react";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  id: string;
  title: string;
  intro: string;
  variant?: ComponentProps<typeof Heading>["variant"];
  introVariant?: ComponentProps<typeof Text>["variant"];
  className?: string;
};

/** Título centrado de sección con su subtítulo. */
export function SectionHeader({
  id,
  title,
  intro,
  variant = "section",
  introVariant = "intro",
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("mx-auto max-w-3xl text-center", className)}>
      <Heading id={id} variant={variant}>
        {title}
      </Heading>
      <Text variant={introVariant} className="mt-2">
        {intro}
      </Text>
    </header>
  );
}
