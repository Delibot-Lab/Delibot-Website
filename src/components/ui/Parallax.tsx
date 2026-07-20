"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function Parallax({
  children,
  className,
  y: yRange = [40, -40],
  scale: scaleRange = [1, 1],
}: {
  children?: React.ReactNode;
  className?: string;
  y?: [number, number];
  scale?: [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);

  return (
    <motion.div ref={ref} style={{ y, scale }} className={className}>
      {children}
    </motion.div>
  );
}
