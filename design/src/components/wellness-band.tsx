import { PranaIcon } from "@/components/prana-icon";
import { wellnessBand } from "@/data/content";

export function WellnessBand() {
  return (
    <section aria-label="Lo que buscamos contigo" className="bg-prana-banda">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-8 sm:grid-cols-3 sm:px-6 md:grid-cols-5 lg:px-8">
        {wellnessBand.map((item) => (
          <li key={item.icon} className="flex items-center gap-3 last:col-span-2 last:justify-center sm:last:col-span-1 sm:last:justify-start">
            <PranaIcon name={item.icon} size={56} className="size-12 lg:size-14" />
            <span className="text-sm leading-snug font-medium text-foreground/85">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
