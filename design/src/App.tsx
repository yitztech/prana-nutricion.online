import { Catalog } from "@/components/catalog";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { Philosophy } from "@/components/philosophy";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WellnessBand } from "@/components/wellness-band";

export default function App() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <Catalog />
        <WellnessBand />
        <Philosophy />
        <Contact />
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
