import Link from "next/link";

/**
 * Small shared building blocks. Every colour here comes from a Layer 2 token —
 * see the rule at the top of `styles/tokens.css`.
 */

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  className = "",
  tone = "default",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  /** `sunken` and `container` give a stacked page its rhythm without borders. */
  tone?: "default" | "sunken" | "container" | "inverse";
  id?: string;
}) {
  const tones = {
    default: "bg-surface",
    sunken: "bg-surface-sunken",
    container: "bg-surface-container",
    inverse: "bg-surface-inverse text-on-inverse",
  } as const;

  return (
    <section id={id} className={`py-16 sm:py-24 ${tones[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-content-accent uppercase">
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="font-display text-3xl leading-tight font-bold text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg text-content-muted text-pretty">{description}</p>
      ) : null}
    </div>
  );
}

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-control",
  accent: "bg-accent text-on-accent hover:bg-accent-hover shadow-control",
  outline:
    "border border-border-strong bg-surface-raised text-content hover:border-border-highlight hover:bg-surface-sunken",
  ghost: "text-content hover:bg-surface-sunken",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className: string) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold",
    "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

const BADGE_TONES = {
  accent: "bg-accent-soft text-on-accent-soft",
  primary: "bg-primary-soft text-on-primary-soft",
  success: "bg-success-bg text-success-fg",
  neutral: "bg-surface-sunken text-content-muted",
} as const;

export function Badge({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: keyof typeof BADGE_TONES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-control px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide uppercase ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-border-soft bg-surface-raised shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
