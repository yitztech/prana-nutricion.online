import { Benefits } from "@/components/home/Benefits";
import { Contact } from "@/components/home/Contact";
import { Hero } from "@/components/home/Hero";
import { Philosophy } from "@/components/home/Philosophy";
import { Promotions } from "@/components/home/Promotions";
import { TreatmentCatalog } from "@/components/home/TreatmentCatalog";
import { TreatmentDialogProvider } from "@/components/home/TreatmentDialog";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileActionBar } from "@/components/layout/MobileActionBar";

export default function App() {
  return (
    <TreatmentDialogProvider>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
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
