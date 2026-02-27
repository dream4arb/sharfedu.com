import { useEffect } from "react";
import { setPageMeta, DEFAULT_SEO } from "@/lib/seo";
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
  useEffect(() => {
    fetch("/api/seo?path=/")
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.title || data.description)) {
          setPageMeta({
            title: data.title || DEFAULT_SEO.title,
            description: data.description || DEFAULT_SEO.description,
            keywords: data.keywords || DEFAULT_SEO.keywords,
            ogTitle: data.ogTitle,
            ogDescription: data.ogDescription,
            ogImage: data.ogImage,
          });
        } else {
          setPageMeta(DEFAULT_SEO.title, DEFAULT_SEO.description, DEFAULT_SEO.keywords);
        }
      })
      .catch(() => setPageMeta(DEFAULT_SEO.title, DEFAULT_SEO.description, DEFAULT_SEO.keywords));
  }, []);

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
