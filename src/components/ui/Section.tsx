import { Container } from "./Container";
import { Reveal } from "./Reveal";

type SectionTone = "bg" | "surface";
type SectionAlign = "left" | "center";

export function Section({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  tone = "bg",
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: SectionAlign;
  tone?: SectionTone;
  children?: React.ReactNode;
}) {
  const toneClass = tone === "surface" ? "bg-surface" : "bg-bg";
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section id={id} className={`${toneClass} py-24 md:py-32`}>
      <Container>
        {(eyebrow || title || description) && (
          <Reveal className={`mb-14 flex flex-col gap-4 ${alignClass}`}>
            {eyebrow && (
              <span className="inline-block w-fit rounded-full bg-mint/15 px-4 py-1 text-sm font-semibold text-mint-strong">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-navy md:text-5xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="max-w-2xl text-base leading-relaxed text-muted md:text-lg">
                {description}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  );
}
