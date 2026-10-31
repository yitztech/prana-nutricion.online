import { useEffect, useState } from "react";

/** Id de la sección visible bajo la cabecera, para marcar la navegación. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[visible.length - 1].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
