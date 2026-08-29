import type { Metadata } from "next";
import {
  Card,
  Container,
  Eyebrow,
  Section,
} from "@/components/ui/primitives";
import { SITE, formattedAddress } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name} — phone, email and address.`,
};

/**
 * Contact details rather than a contact form.
 *
 * A form would need somewhere to send mail, and no mail provider is wired up in
 * this build. Listing the real channels is honest; a form that silently drops
 * messages is not. TODO(owner): if you want a form here, say where it should
 * deliver and it can be added.
 */
export default function ContactPage() {
  return (
    <>
      <div className="bg-surface-container py-14 sm:py-20">
        <Container>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="font-display text-4xl font-bold text-balance sm:text-5xl">
            Say hello
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-content-muted text-pretty">
            Questions about an order, a large catering job, or anything else — here&apos;s
            how to reach us.
          </p>
        </Container>
      </div>

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <p className="text-3xl" aria-hidden>
              📞
            </p>
            <h2 className="mt-3 font-display text-lg font-bold">Call the shop</h2>
            <a
              href={`tel:${SITE.phone.replace(/\D/g, "")}`}
              className="mt-1 block text-content-accent underline underline-offset-4"
            >
              {SITE.phone}
            </a>
            <p className="mt-2 text-sm text-content-muted">
              Fastest during opening hours.
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-3xl" aria-hidden>
              ✉️
            </p>
            <h2 className="mt-3 font-display text-lg font-bold">Email us</h2>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-1 block break-words text-content-accent underline underline-offset-4"
            >
              {SITE.email}
            </a>
            <p className="mt-2 text-sm text-content-muted">
              Best for catering and larger orders.
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-3xl" aria-hidden>
              📍
            </p>
            <h2 className="mt-3 font-display text-lg font-bold">Come by</h2>
            <address className="mt-1 text-content-muted not-italic">
              {formattedAddress()}
            </address>
            <p className="mt-2 text-sm text-content-muted">{SITE.hoursSummary}</p>
          </Card>
        </div>
      </Section>
    </>
  );
}
