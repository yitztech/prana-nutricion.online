import { useEffect } from "react";
import { BenefitPage, benefitIdFromPath, findBenefit, benefitPageDescription } from "@/features/benefits";
import { categoryIdFromPath, findCategory, TreatmentDialogProvider, TreatmentPage } from "@/features/treatments";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { Benefits } from "@/components/sections/Benefits";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Promotions } from "@/components/sections/Promotions";
import { PastPromotions } from "@/components/sections/PastPromotions";
import { TreatmentCatalog } from "@/components/sections/TreatmentCatalog";
import { TextLink } from "@/components/ui/text-link";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";

export default function App() {
  const home = window.location.pathname === "/";
  const categoryId = categoryIdFromPath(window.location.pathname);
  const category = categoryId ? findCategory(categoryId) : undefined;
  const benefitId = benefitIdFromPath(window.location.pathname);
  const benefit = benefitId ? findBenefit(benefitId) : undefined;
  useEffect(() => {
    document.title = category
      ? `${category.title} · Praná en Cuautla`
      : benefit ? `${benefit.title} · Praná en Cuautla`
      : home ? "Praná · Nutrición y Bienestar en Cuautla" : "Página no encontrada · Praná";
    if (category) document.querySelector('meta[name="description"]')?.setAttribute("content", category.description);
    if (benefit) document.querySelector('meta[name="description"]')?.setAttribute("content", benefitPageDescription);
  }, [category, benefit, home]);
  useEffect(() => {
    // El destino de un enlace profundo se monta con React después de cargar el documento.
    let id: string;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const target = id ? document.getElementById(id) : null;
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView();
    }
  }, []);

  return (
    <TreatmentDialogProvider>
      <TextLink variant="skip" href="#contenido">
        Saltar al contenido
      </TextLink>
      <Header home={home} />
      <main id="contenido">
        {category ? (
          <TreatmentPage category={category} hero={category.id !== "promociones"}>
            {category.id === "promociones" && <>
              <Promotions showCatalogLink={false} />
              <PastPromotions />
            </>}
          </TreatmentPage>
        ) : benefit ? (
          <BenefitPage benefit={benefit} />
        ) : home ? (
          <>
            <Hero />
            <TreatmentCatalog />
            <Benefits />
            <Philosophy />
            <Promotions />
            <Contact />
          </>
        ) : (
          <Container className="py-16">
            <Heading as="h1">Página no encontrada</Heading>
            <Text className="mt-4">La página que buscas no está disponible.</Text>
            <TextLink href="/#tratamientos" className="mt-6">Ver todos los tratamientos</TextLink>
          </Container>
        )}
      </main>
      <Footer home={home} />
      <MobileActionBar />
    </TreatmentDialogProvider>
  );
}
