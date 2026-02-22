import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Shield, BarChart3, Link2, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const features = [
  { icon: Link2, title: "Shareable Links", desc: "Generate unique hiring links for each position. Share on LinkedIn, Instagram, or anywhere." },
  { icon: Shield, title: "Knockout Logic", desc: "5 MCQs per job. Wrong answer = instantly disqualified. Only the best get through." },
  { icon: BarChart3, title: "Dashboard Analytics", desc: "Track applicants, see who passed or failed, and download resumes — all in one place." },
];

const steps = [
  { num: "01", title: "Create a Job", desc: "Set up the role, description and 5 screening questions." },
  { num: "02", title: "Share the Link", desc: "Send the unique hiring link to candidates anywhere." },
  { num: "03", title: "Review Results", desc: "Only qualified candidates appear. Download their resumes instantly." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center glow-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-foreground">Dmless</span>
          </div>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-bg border-0 glow-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center relative">
        {/* Decorative blob */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "var(--gradient-warm)" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Smart recruitment screening
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-foreground tracking-tight mb-6 leading-[1.1]"
        >
          Screen candidates
          <br />
          <span className="gradient-text">before reading resumes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
        >
          Create smart hiring links with knockout questions. Only qualified candidates make it through. No more wasted time on unqualified applicants.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Link to="/auth">
            <Button size="lg" className="text-base px-8 gradient-bg border-0 glow-primary hover:scale-105 transition-transform">
              Start Screening
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1}>
              <div className="stat-card text-center group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold font-display text-foreground mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <ScrollReveal>
          <h2 className="text-3xl font-bold font-display text-foreground text-center mb-12">
            How it <span className="gradient-text">works</span>
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <ScrollReveal key={s.num} delay={i * 0.12}>
              <div className="relative">
                <span className="text-5xl font-extrabold font-display text-primary/10">{s.num}</span>
                <h3 className="text-lg font-semibold font-display text-foreground mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <ScrollReveal>
          <div className="rounded-2xl p-10 text-center relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "var(--gradient-warm)" }} />
            <h2 className="text-3xl font-bold font-display text-white mb-4 relative z-10">Ready to streamline your hiring?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto relative z-10">Join recruiters who save hours by filtering candidates before reviewing a single resume.</p>
            <Link to="/auth" className="relative z-10">
              <Button size="lg" variant="secondary" className="font-semibold hover:scale-105 transition-transform">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dmless. Built for recruiters who value their time.
        </div>
      </footer>
    </div>
  );
}
