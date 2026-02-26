import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { SearchBar } from "@/components/home/SearchBar";
import { StageSelector } from "@/components/home/StageSelector";
import { Features } from "@/components/home/Features";
import { Stats } from "@/components/home/Stats";
import { CTA } from "@/components/home/CTA";
import { Footer } from "@/components/layout/Footer";
import { WelcomePopup } from "@/components/home/WelcomePopup";

export default function Home() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main>
        <Hero />
        <SearchBar />
        <StageSelector />
        <Features />
        <Stats />
        <CTA />
      </main>
      <Footer />
      <WelcomePopup />
    </div>
  );
}
