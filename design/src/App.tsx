import { TreatmentDialogProvider } from "@/components/patterns/TreatmentDialog";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { Benefits } from "@/components/sections/Benefits";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Promotions } from "@/components/sections/Promotions";
import { TreatmentCatalog } from "@/components/sections/TreatmentCatalog";
import { TextLink } from "@/components/ui/text-link";

export default function App() {
  return (
    <TreatmentDialogProvider>
      <TextLink variant="skip" href="#contenido">
        Saltar al contenido
      </TextLink>
      <Header />
      <main id="contenido">
        <Hero />
        <TreatmentCatalog />
        <Benefits />
        <Philosophy />
        <Promotions />
        <Contact />
      </main>
      <Footer />
      <MobileActionBar />
    </TreatmentDialogProvider>
  );
}
