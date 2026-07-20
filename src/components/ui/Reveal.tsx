"use client";

import { motion } from "motion/react";
import { fadeUp, fadeUpTransition, viewportOnce } from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={{ ...fadeUpTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
