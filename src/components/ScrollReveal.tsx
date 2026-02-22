import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function ScrollReveal({ children, delay = 0, className = "" }: Props) {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
