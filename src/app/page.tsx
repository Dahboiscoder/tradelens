import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { SupportedExchanges } from "@/components/landing/SupportedExchanges";
import { About } from "@/components/landing/About";
import { Features } from "@/components/landing/Features";
import { Plans } from "@/components/landing/Plans";
import { Security } from "@/components/landing/Security";
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      <NavBar />
      <Hero />
      <SupportedExchanges />
      <About />
      <Features />
      <Plans />
      <Security />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
