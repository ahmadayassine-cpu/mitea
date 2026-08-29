import type { Metadata } from "next";
import { MediaSlot } from "@/components/ui/media-slot";
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Section,
} from "@/components/ui/primitives";
import { SITE, formattedAddress } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Locations",
  description: `Find ${SITE.name} — address, hours and directions.`,
};

export default function LocationsPage() {
  const mapQuery = encodeURIComponent(formattedAddress());

  return (
    <>
      <div className="bg-surface-container py-14 sm:py-20">
        <Container>
          <Eyebrow>Locations</Eyebrow>
          <h1 className="font-display text-4xl font-bold text-balance sm:text-5xl">
            Where to find us
          </h1>
        </Container>
      </div>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Card className="p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">{SITE.name}</h2>
            <address className="mt-2 text-lg text-content-muted not-italic">
              {formattedAddress()}
            </address>

            <dl className="mt-6 space-y-1">
              {SITE.hours.map((entry) => (
                <div
                  key={entry.days}
                  className="flex justify-between gap-6 border-b border-border py-2.5 text-sm"
                >
                  <dt className="font-semibold">{entry.days}</dt>
                  <dd className="text-content-muted">{entry.hours}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 space-y-2 text-sm">
              <p>
                <span className="font-semibold">Phone: </span>
                <a
                  href={`tel:${SITE.phone.replace(/\D/g, "")}`}
                  className="text-content-accent underline underline-offset-4"
                >
                  {SITE.phone}
                </a>
              </p>
              <p>
                <span className="font-semibold">Email: </span>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-content-accent underline underline-offset-4"
                >
                  {SITE.email}
                </a>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/menu" size="lg">
                Order for pickup
              </ButtonLink>
              {/* A plain search link rather than an embedded map: no API key to
                  manage, and it opens in whichever maps app the visitor uses. */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-control border border-border-strong bg-surface-raised px-7 py-3.5 text-base font-semibold transition-colors hover:border-border-highlight hover:bg-surface-sunken"
              >
                Get directions
              </a>
            </div>
          </Card>

          <MediaSlot
            src={null}
            alt={`Map showing ${SITE.name} at ${formattedAddress()}`}
            seed="locations-map"
            glyph="🗺️"
            className="aspect-square w-full rounded-image"
          />
        </div>
      </Section>
    </>
  );
}
