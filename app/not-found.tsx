import { ButtonLink, Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-5xl" aria-hidden>
        🧋
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold">We couldn&apos;t find that</h1>
      <p className="mt-2 text-content-muted">
        The page may have moved, or the link may be out of date.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/menu" size="lg">
          See the menu
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Go home
        </ButtonLink>
      </div>
    </Container>
  );
}
