import type { Metadata } from "next";
import { MediaSlot } from "@/components/ui/media-slot";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Our Story",
  description: `How ${SITE.name} came to be, and how we make what we make.`,
};

/** TODO(owner): all copy on this page is draft. Replace with the real story. */
export default function OurStoryPage() {
  return (
    <>
      <div className="bg-surface-container py-14 sm:py-20">
        <Container>
          <Eyebrow>Our story</Eyebrow>
          <h1 className="font-display text-4xl font-bold text-balance sm:text-5xl">
            We opened because nowhere nearby got it right
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-content-muted text-pretty">
            Tea brewed hours ago. Pearls out of a bag. Sugar you couldn&apos;t adjust.
            We thought a neighbourhood boba shop could do better than that.
          </p>
        </Container>
      </div>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <MediaSlot
            src={null}
            alt="Tea being brewed"
            seed="story-brew"
            glyph="🍵"
            className="aspect-[4/3] w-full rounded-image"
          />
          <div>
            <h2 className="font-display text-3xl font-bold text-balance">
              Brewed in small batches, all day
            </h2>
            <p className="mt-4 text-content-muted text-pretty">
              Our jasmine, oolong and KungFu black are steeped to a timer and pulled
              before they turn bitter. Whatever is left at the end of a batch window gets
              tipped, not stretched.
            </p>
            <p className="mt-4 text-content-muted text-pretty">
              The pearls cook in cycles through the day so what goes in your cup is still
              warm and still has a chew to it.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="lg:order-2">
            <MediaSlot
              src="/images/mochi-donuts.jpg"
              alt="Mochi donuts in strawberry, cookies and cream, and cinnamon sugar"
              seed="story-donuts"
              className="aspect-[4/3] w-full rounded-image"
            />
          </div>
          <div className="lg:order-1">
            <h2 className="font-display text-3xl font-bold text-balance">
              The donuts came later, and stayed
            </h2>
            <p className="mt-4 text-content-muted text-pretty">
              Mochi donuts started as a weekend experiment. They sold out by noon, twice,
              and then they were on the menu for good. Eight flavours, fried to order,
              glazed while they&apos;re still hot.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="container">
        <SectionHeading
          title="Come try it"
          description="Order ahead and it'll be waiting, or take a seat and watch it get made."
        />
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/menu" size="lg">
            See the menu
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
