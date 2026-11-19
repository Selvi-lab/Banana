export default function SustainabilityPage() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Thoughtful materials</p>
        <h1 className="section-title">Explore the fibre journey.</h1>
        <p className="muted max-w-2xl">
          Explain your actual sourcing, processing, production and packaging
          practices here. Banana fibre is obtained from banana plant material,
          but environmental benefits depend on the full supply chain and
          manufacturing process.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              "01",
              "Source",
              "Describe where and how the raw material is sourced.",
            ],
            [
              "02",
              "Process",
              "Show the real steps used to extract and prepare fibre.",
            ],
            [
              "03",
              "Craft",
              "Explain who makes the products and how quality is checked.",
            ],
          ].map(([n, t, d]) => (
            <div className="card p-6" key={n}>
              <span className="text-3xl font-serif text-[#c89b5b]">{n}</span>
              <h2 className="mt-4 font-serif text-2xl text-[#183d2b]">{t}</h2>
              <p className="muted mt-2">{d}</p>
            </div>
          ))}
        </div>
        <img
          src="/hero/fibre-process.png"
          alt="Banana fibre process"
          className="mt-10 max-h-[440px] w-full rounded-3xl object-cover"
        />
      </div>
    </section>
  );
}
