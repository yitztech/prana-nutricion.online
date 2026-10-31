import { useEffect } from "react";
import { BenefitPage } from "@/features/benefits";
import { ContactForm } from "@/features/contact-form";
import { LegalPage } from "@/features/legal";
import { TreatmentPage } from "@/features/treatments";
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
import { useContent } from "@/hooks/use-content";
import { resolveRoute } from "@/site/routes";

export default function App() {
  const content = useContent();
  const route = resolveRoute(content.pathname, content);
  const home = route.kind === "home";

  useEffect(() => {
    // Un enlace profundo (#tratamiento) recibe el foco al cargar, como si se hubiera pulsado.
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
    <>
      <TextLink variant="skip" href="#contenido">
        Saltar al contenido
      </TextLink>
      <Header home={home} />
      <main id="contenido">
        {route.kind === "category" ? (
          <TreatmentPage category={route.category} hero={route.category.id !== "promociones"}>
            {route.category.id === "promociones" && <>
              <Promotions showCatalogLink={false} />
              <PastPromotions />
            </>}
          </TreatmentPage>
        ) : route.kind === "benefit" ? (
          <BenefitPage benefit={route.benefit} />
        ) : route.kind === "legal" ? (
          <LegalPage slug={route.slug} />
        ) : home ? (
          <>
            <Hero />
            <TreatmentCatalog />
            <Benefits />
            <Philosophy />
            <Promotions />
            <Contact form={<ContactForm />} />
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
    </>
  );
}
