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
    <section id={id} className={`${toneClass} py-28 md:py-40`}>
      <Container>
        {(eyebrow || title || description) && (
          <Reveal className={`mb-16 flex flex-col gap-5 ${alignClass}`}>
            {eyebrow && (
              <span className="inline-block w-fit text-xs font-extrabold tracking-[.18em] text-mint-strong">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-.045em] text-[#191f28] md:text-6xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="max-w-2xl text-base font-medium leading-relaxed text-muted md:text-lg">
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
