import { Navbar } from '@/components/sections/navbar';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Pricing } from '@/components/sections/pricing';
import { FAQ } from '@/components/sections/faq';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/sections/footer';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <Hero />

        <section id="features">
          <Features />
        </section>

        <section id="how-it-works">
          <HowItWorks />
        </section>

        <section id="pricing">
          <Pricing />
        </section>

        <section id="faq">
          <FAQ />
        </section>

        <CTA />
      </main>

      <Footer />
    </div>
  );
}

export default App;
