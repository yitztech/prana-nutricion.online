import { SocialIcon } from "@/components/BrandIcons";
import { socialLinks } from "@/data/site";
import { cn } from "@/lib/utils";

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex gap-2", className)}>
      {socialLinks.map((s) => (
        <li key={s.network}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} de Praná (abre en otra pestaña)`}
            className="grid size-11 place-items-center rounded-full bg-white text-primary shadow-soft transition-colors hover:bg-primary hover:text-white focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <SocialIcon network={s.network} className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
