/**
 * FAQ accordion, built on native `<details>`.
 *
 * No state, no JS, no focus management to get wrong — the browser already ships
 * a correct disclosure widget, and it works before hydration.
 */
export function Accordion({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div className="divide-y divide-border rounded-card border border-border-soft bg-surface-raised">
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            <span className="text-pretty">{item.question}</span>
            <span
              aria-hidden
              className="shrink-0 text-xl leading-none text-content-accent transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-content-muted text-pretty">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
