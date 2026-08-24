export function Contact() {
  return (
    <section id="contact" className="border-t border-white/5 bg-ink-900/40 py-24">
      <div className="mx-auto max-w-xl px-6 text-center">
        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Get in touch</h2>
        <p className="mt-4 text-slate-400">
          Questions about Team plans, a bug to report, or feedback on a signal that looked wrong —
          reach out and a person will respond.
        </p>
        <a
          href="mailto:hello@tradelens.example"
          className="mt-8 inline-block rounded-lg bg-signal-500 px-6 py-3 text-sm font-medium text-ink-950 transition hover:bg-signal-400"
        >
          hello@tradelens.example
        </a>
      </div>
    </section>
  );
}
