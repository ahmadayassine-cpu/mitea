import Link from "next/link";
import { getCatalog } from "@/lib/catalog/airtable";
import { SITE, formattedAddress } from "@/lib/site-config";
import { Accordion } from "@/components/ui/accordion";
import { MediaSlot } from "@/components/ui/media-slot";
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";

/**
 * The home page's stacked sections, in the order they appear.
 *
 * All copy here is draft — TODO(owner): review. The structure follows the
 * reference site (hero → featured → welcome → categories → gallery → catering →
 * why-us → visit → reviews → FAQ → rewards), with the content and imagery
 * replaced by Mitea's own.
 */

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface-container">
      <Container className="relative grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <Eyebrow>Fresh brewed daily</Eyebrow>
          <h1 className="font-display text-4xl leading-[1.05] font-bold text-balance sm:text-5xl lg:text-6xl">
            MiTea worth the walk.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-content-muted text-pretty">
            {SITE.tagline} Every cup shaken to order — pick your sugar, your ice and
            your toppings, then skip the line.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/menu" size="lg">
              Order online
            </ButtonLink>
            <ButtonLink href="/catering" variant="outline" size="lg">
              Catering
            </ButtonLink>
          </div>

          <p className="mt-6 text-sm font-semibold text-content-accent">
            {SITE.hoursSummary}
          </p>
        </div>

        <div className="relative">
          <MediaSlot
            src="/images/mochi-donuts.jpg"
            alt="A tray of freshly glazed mochi donuts cooling on a rack"
            seed="hero-primary"
            className="aspect-[4/3] w-full rounded-image shadow-card-hover"
            priority
          />
          <div className="absolute -bottom-6 -left-4 hidden w-40 sm:block">
            <MediaSlot
              src="/images/shop-interior.jpg"
              alt="The MiTea dining room, with cherry blossom walls and hanging lanterns"
              seed="hero-secondary"
              className="aspect-square w-full rounded-image border-4 border-surface-raised shadow-card-hover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Welcome() {
  return (
    <Section tone="sunken">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <MediaSlot
          src="/images/shop-interior.jpg"
          alt="Seating under the painted cherry blossom mural at MiTea"
          seed="welcome"
          className="aspect-[4/3] w-full rounded-image"
        />
        <div>
          <Eyebrow>Our shop</Eyebrow>
          <h2 className="font-display text-3xl font-bold text-balance sm:text-4xl">
            A small shop that takes tea seriously
          </h2>
          <p className="mt-4 text-lg text-content-muted text-pretty">
            We brew in small batches through the day and cook our pearls fresh, because
            tea that has sat around tastes like tea that has sat around. The mochi donuts
            are fried to order in the back.
          </p>
          <p className="mt-4 text-content-muted text-pretty">
            Come sit with a Chizu and a box of donuts, or order ahead and take it with you.
          </p>
          <Link
            href="/our-story"
            className="mt-6 inline-block font-semibold text-content-accent underline underline-offset-4"
          >
            Read our story →
          </Link>
        </div>
      </div>
    </Section>
  );
}

/**
 * The heading used to say "Eight ways to start" because there were eight
 * sections. Sections are the owner's to add now, so it counts them — spelled
 * out up to twelve, which is well past any menu this shop will print.
 */
const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six",
  "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
];

function countWord(count: number): string {
  return NUMBER_WORDS[count] ?? String(count);
}

export async function CategoryGrid() {
  const { categories } = await getCatalog();

  return (
    <Section>
      <SectionHeading
        eyebrow="The menu"
        title={`${countWord(categories.length)} ways to start`}
        description="From the classics to the cheese-foam-capped Chizu series."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/menu#${category.slug}`}
            className="group overflow-hidden rounded-card border border-border-soft bg-surface-raised shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-highlight hover:shadow-card-hover"
          >
            <MediaSlot
              src={category.image}
              alt={category.name}
              seed={category.slug}
              className="aspect-[3/2] w-full"
              sizes="(max-width: 640px) 100vw, 25vw"
            />
            <div className="p-4">
              <h3 className="font-display text-lg font-bold">{category.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-content-muted text-pretty">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

const GALLERY = [
  { seed: "gallery-1", glyph: "🧋", alt: "Brown sugar milk tea" },
  { seed: "gallery-2", glyph: "🍩", alt: "A box of mochi donuts" },
  { seed: "gallery-3", glyph: "🍓", alt: "Strawberry green tea" },
  { seed: "gallery-4", glyph: "🍵", alt: "Matcha being whisked" },
  { seed: "gallery-5", glyph: "🧁", alt: "Cheese foam poured over tea" },
  { seed: "gallery-6", glyph: "🍑", alt: "Peach fruit tea" },
];

export function Gallery() {
  return (
    <Section tone="sunken">
      <SectionHeading eyebrow="In the cup" title="A taste of MiTea" />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GALLERY.map((tile) => (
          <MediaSlot
            key={tile.seed}
            src={null}
            alt={tile.alt}
            seed={tile.seed}
            glyph={tile.glyph}
            className="aspect-square w-full rounded-image"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ))}
      </div>
    </Section>
  );
}

export function CateringCta() {
  return (
    <Section tone="inverse">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-on-inverse-muted uppercase">
            Catering
          </p>
          <h2 className="font-display text-3xl font-bold text-balance sm:text-4xl">
            Bring the MiTea bar to them
          </h2>
          <p className="mt-4 text-lg text-on-inverse-muted text-pretty">
            Office parties, birthdays, graduations. We&apos;ll set up with a spread of
            drinks and towers of mochi donuts, and handle the cups.
          </p>
          <ButtonLink href="/catering" variant="accent" size="lg" className="mt-8">
            Plan an event
          </ButtonLink>
        </div>
        <MediaSlot
          src={null}
          alt="A catering spread of drinks and donuts"
          seed="catering"
          glyph="🎉"
          className="aspect-[4/3] w-full rounded-image"
        />
      </div>
    </Section>
  );
}

const FEATURES = [
  { glyph: "🥡", title: "Pickup", body: "Order ahead, walk past the line." },
  { glyph: "🪑", title: "Dine in", body: "Room to sit, and outlets that work." },
  { glyph: "🎉", title: "Catering", body: "Drinks and donuts for any size room." },
  { glyph: "🌱", title: "Vegan options", body: "Oat and almond milk, fruit teas." },
  { glyph: "⏱️", title: "Made to order", body: "Nothing pre-poured, nothing sitting." },
  { glyph: "🅿️", title: "Easy parking", body: "Street parking right out front." },
];

export function WhyMitea() {
  return (
    <Section>
      <SectionHeading eyebrow="Why MiTea" title="What you can count on" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="p-6">
            <p className="text-3xl" aria-hidden>
              {feature.glyph}
            </p>
            <h3 className="mt-3 font-display text-lg font-bold">{feature.title}</h3>
            <p className="mt-1 text-content-muted text-pretty">{feature.body}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function VisitUs() {
  return (
    <Section tone="container">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>📍 Visit MiTea</Eyebrow>
          <h2 className="font-display text-3xl font-bold text-balance sm:text-4xl">
            Come find us
          </h2>
          <address className="mt-4 text-lg text-content-muted not-italic">
            {formattedAddress()}
          </address>

          <dl className="mt-6 space-y-2">
            {SITE.hours.map((entry) => (
              <div key={entry.days} className="flex justify-between gap-6 border-b border-border-soft py-2 text-sm">
                <dt className="font-semibold">{entry.days}</dt>
                <dd className="text-content-muted">{entry.hours}</dd>
              </div>
            ))}
          </dl>

          <ButtonLink href="/locations" variant="outline" size="lg" className="mt-8">
            Directions & hours
          </ButtonLink>
        </div>

        <MediaSlot
          src={null}
          alt="Map of the MiTea location"
          seed="map"
          glyph="🗺️"
          className="aspect-[4/3] w-full rounded-image"
        />
      </div>
    </Section>
  );
}

/** TODO(owner): replace with real reviews once there are some to quote. */
const TESTIMONIALS = [
  {
    quote:
      "The brown sugar milk tea is the best I've had outside of a trip to Taiwan. The pearls are actually warm.",
    name: "Dana R.",
  },
  {
    quote:
      "Ordered a dozen mochi donuts for the office and they were gone in ten minutes. The ube ones especially.",
    name: "Marcus T.",
  },
  {
    quote:
      "Ordering ahead works exactly like it should — walked in, code on the cup, out in thirty seconds.",
    name: "Priya S.",
  },
];

export function Testimonials() {
  return (
    <Section tone="sunken">
      <SectionHeading eyebrow="Reviews" title="What people say" />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.name} className="flex flex-col p-6">
            <p aria-label="5 out of 5 stars" className="text-accent">
              ★★★★★
            </p>
            <blockquote className="mt-3 flex-1 text-content-muted text-pretty">
              “{testimonial.quote}”
            </blockquote>
            <p className="mt-4 font-semibold">{testimonial.name}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const FAQ = [
  {
    question: "Can I choose my sugar and ice level?",
    answer:
      "Every drink is made to order. Sugar goes from 0% to 100% in quarters, and ice from none to extra. Pick both when you add a drink to your cart.",
  },
  {
    question: "Do you have dairy-free options?",
    answer:
      "Yes. Oat and almond milk are available on any milk drink, and the whole fruit tea and tea series are dairy-free as they come.",
  },
  {
    question: "How far ahead can I order?",
    answer:
      "You can schedule pickup up to ninety minutes out. Anything sooner than that we start right away — usually about fifteen minutes.",
  },
  {
    question: "Can I order mochi donuts by the box?",
    answer:
      "Boxes of three, six and twelve, and you pick the flavours for each. Large orders for an event are better placed through catering.",
  },
  {
    question: "Do you deliver?",
    answer:
      "Not yet — online orders are pickup only for now. Catering is delivered and set up for you.",
  },
];

export function Faq() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[20rem_1fr] lg:items-start">
        <SectionHeading eyebrow="FAQ" title="Questions we get" align="left" />
        <Accordion items={FAQ} />
      </div>
    </Section>
  );
}

export function RewardsTeaser() {
  return (
    <Section tone="container">
      <Card className="p-8 text-center sm:p-12">
        <p className="text-4xl" aria-hidden>
          🎁
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold text-balance">
          Rewards are coming
        </h2>
        <p className="mx-auto mt-3 max-w-md text-content-muted text-pretty">
          {/* Honest placeholder: the loyalty programme is not built. */}
          We&apos;re putting together a rewards programme — every cup counting toward
          the next one. Ask at the counter to hear when it lands.
        </p>
        <ButtonLink href="/menu" size="lg" className="mt-6">
          Order online
        </ButtonLink>
      </Card>
    </Section>
  );
}
