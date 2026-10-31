import { SocialIcon, type SocialNetwork } from "@/components/brand/BrandIcons";
import { BrandButton } from "@/components/brand/ui/brand-button";
import { cn } from "@/lib/utils";

type SocialLink = { network: SocialNetwork; label: string; href: string };

export function SocialLinks({ links, className }: { links: readonly SocialLink[]; className?: string }) {
  return (
    <ul className={cn("flex gap-2", className)}>
      {links.map((s) => (
        <li key={s.network}>
          <BrandButton asChild variant="social" size="social" className="size-11">
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} de Praná (abre en otra pestaña)`}
            >
              <SocialIcon network={s.network} className="size-5" />
            </a>
          </BrandButton>
        </li>
      ))}
    </ul>
  );
}
