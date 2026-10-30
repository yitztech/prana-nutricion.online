import { SocialIcon } from "@/components/brand/BrandIcons";
import { Button } from "@/components/ui/button";
import { socialLinks } from "@/data/site";
import { cn } from "@/lib/utils";

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex gap-2", className)}>
      {socialLinks.map((s) => (
        <li key={s.network}>
          <Button asChild variant="social" size="icon" className="size-11">
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} de Praná (abre en otra pestaña)`}
            >
              <SocialIcon network={s.network} className="size-5" />
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}
