import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ContentContext } from "@/hooks/use-content";
import { todayInClinic } from "@/lib/clinic-date";
import type { SiteContent } from "@/types";

/**
 * El HTML se genera con la fecha de Cuautla del momento de generarlo, y el navegador hidrata con esa
 * misma fecha. Después la comprueba: si la página se abrió otro día, las promociones se vuelven a
 * evaluar sin esperar a la siguiente generación.
 */
export function ContentProvider({ content, pathname, children }: { content: SiteContent; pathname: string; children: ReactNode }) {
  const [today, setToday] = useState(content.generatedOn);
  useEffect(() => {
    const now = todayInClinic();
    if (now !== content.generatedOn) setToday(now);
  }, [content.generatedOn]);

  const value = useMemo(() => {
    const { generatedOn: _generatedOn, ...rest } = content;
    return { ...rest, today, pathname };
  }, [content, today, pathname]);
  return <ContentContext value={value}>{children}</ContentContext>;
}
