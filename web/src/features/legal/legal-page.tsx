import { formatDay } from "@/lib/clinic-date";
import { useContent } from "@/hooks/use-content";
import type { LegalSlug } from "@/types";
import { LegalDocumentPage } from "./components/LegalDocumentPage";

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const document = useContent().legal[slug];
  return <LegalDocumentPage document={document} updatedLabel={formatDay(document.updatedOn)} />;
}
