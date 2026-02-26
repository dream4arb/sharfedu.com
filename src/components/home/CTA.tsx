import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import { Link } from "wouter";
import ctaBgImgWebp from "@/assets/images/cta-bg.webp";
import ctaBgImgJpg from "@/assets/images/cta-bg.jpg";

export function CTA() {
  return (
    <section className="py-24 lg:py-32" aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] overflow-hidden"
        >
          <picture>
            <source srcSet={ctaBgImgWebp} type="image/webp" />
            <img 
              src={ctaBgImgJpg}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-cyan-600/85 to-primary/90" />
          
          <div className="relative p-12 lg:p-20 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8"
            >
              <Rocket className="w-10 h-10" aria-hidden="true" />
            </motion.div>
            
            <h2 id="cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 max-w-3xl mx-auto">
              مستعد لبدء رحلة التفوق؟
            </h2>
            
            <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              انضم لآلاف الطلاب الذين يتعلمون مع شارف كل يوم.
              سجّل الآن مجاناً وابدأ رحلتك نحو النجاح!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/stage/middle">
                <Button 
                  size="lg" 
                  className="bg-white text-primary rounded-full font-bold shadow-xl"
                  data-testid="button-cta-start"
                >
                  ابدأ رحلة التعلم
                  <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
