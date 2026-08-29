import type { Metadata } from "next";
import { MediaSlot } from "@/components/ui/media-slot";
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Catering",
  description: `Boba and mochi donut catering from ${SITE.name} for offices, parties and events.`,
};

/**
 * TODO(owner): package names, headcounts and pricing below are placeholders.
 * Catering enquiries currently go to the shop by phone or email — there is no
 * catering order form in this build.
 */
const PACKAGES = [
  {
    title: "The Drop-Off",
    people: "10 – 25 people",
    body: "A tray of pre-made drinks in your pick of four flavours, plus two dozen mochi donuts. Delivered cold and ready.",
  },
  {
    title: "The Boba Bar",
    people: "25 – 75 people",
    body: "We set up on site and make drinks to order — sugar, ice and toppings chosen by each guest, same as in the shop.",
  },
  {
    title: "The Whole Thing",
    people: "75+ people",
    body: "Full bar service, a donut tower, and staff for the length of your event. Tell us the room and we'll plan it.",
  },
];

export default function CateringPage() {
  return (
    <>
      <div className="bg-surface-container py-14 sm:py-20">
        <Container>
          <Eyebrow>Catering</Eyebrow>
          <h1 className="font-display text-4xl font-bold text-balance sm:text-5xl">
            Bring the boba bar to them
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-content-muted text-pretty">
            Office parties, birthdays, graduations, weddings. We bring the tea, the
            pearls, the donuts and the cups.
          </p>
        </Container>
      </div>

      <Section>
        <SectionHeading eyebrow="Packages" title="Pick a size" />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <Card key={pkg.title} className="flex flex-col p-6">
              <MediaSlot
                src={null}
                alt={pkg.title}
                seed={pkg.title}
                glyph="🎉"
                className="aspect-[3/2] w-full rounded-image"
              />
              <h3 className="mt-5 font-display text-xl font-bold">{pkg.title}</h3>
              <p className="mt-1 text-sm font-semibold text-content-accent">{pkg.people}</p>
              <p className="mt-3 flex-1 text-content-muted text-pretty">{pkg.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="inverse">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-balance sm:text-4xl">
            Tell us about your event
          </h2>
          <p className="mt-4 text-lg text-on-inverse-muted text-pretty">
            Give us a date, a headcount and a room, and we&apos;ll come back with a plan
            and a price. Two weeks&apos; notice is ideal, but ask anyway.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact" variant="accent" size="lg">
              Get in touch
            </ButtonLink>
            <a
              href={`tel:${SITE.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center justify-center rounded-control border border-white/30 px-7 py-3.5 text-base font-semibold transition-colors hover:bg-white/10"
            >
              {SITE.phone}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
