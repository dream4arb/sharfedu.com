import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { SearchBar } from "@/components/home/SearchBar";
import { StageSelector } from "@/components/home/StageSelector";
import { Features } from "@/components/home/Features";
import { Stats } from "@/components/home/Stats";
import { CTA } from "@/components/home/CTA";
import { Footer } from "@/components/layout/Footer";
import { WelcomePopup } from "@/components/home/WelcomePopup";
import { usePageSeo } from "@/hooks/use-page-seo";

export default function Home() {
  usePageSeo({
    title: "منصة شارف التعليمية - Sharaf | تعليم شامل لجميع المراحل الدراسية",
    description: "منصة شارف التعليمية - منصة تعليمية سعودية شاملة لجميع المراحل الدراسية من الابتدائية للثانوية والقدرات والتحصيلي. دروس تفاعلية واختبارات ذكية.",
    keywords: "شارف, منصة تعليمية, دروس تفاعلية, تعليم, السعودية, ابتدائي, متوسط, ثانوي, قدرات, تحصيلي",
  });
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
