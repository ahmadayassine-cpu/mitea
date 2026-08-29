import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { Logo } from "./logo";
import { SITE, formattedAddress } from "@/lib/site-config";
import { NAV_LINKS } from "./nav-links";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-surface-inverse text-on-inverse">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-on-inverse-muted text-pretty">
              {SITE.tagline}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Explore</h2>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-on-inverse-muted hover:text-on-inverse">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Visit</h2>
            <address className="space-y-2 text-sm text-on-inverse-muted not-italic">
              <p>{formattedAddress()}</p>
              <p>
                <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="hover:text-on-inverse">
                  {SITE.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${SITE.email}`} className="hover:text-on-inverse">
                  {SITE.email}
                </a>
              </p>
            </address>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Hours</h2>
            <ul className="space-y-2 text-sm text-on-inverse-muted">
              {SITE.hours.map((entry) => (
                <li key={entry.days}>
                  <span className="block text-on-inverse">{entry.days}</span>
                  {entry.hours}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-on-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href={SITE.social.instagram} className="hover:text-on-inverse">
              Instagram
            </a>
            <a href={SITE.social.tiktok} className="hover:text-on-inverse">
              TikTok
            </a>
            <a href={SITE.social.facebook} className="hover:text-on-inverse">
              Facebook
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
