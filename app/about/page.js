import Link from "next/link";
export default function AboutPage() {
  return <section className="section"><div className="container grid items-center gap-10 md:grid-cols-2"><div><p className="eyebrow">The story behind the weave</p><h1 className="section-title">Rooted in nature. Made for everyday.</h1><p className="muted">Banafibre is a brand concept built around the creative possibilities of banana fibre. Use this page to tell your real story: who you are, where you work, how your products are made and the people behind them.</p><Link className="btn btn-primary mt-6" href="/shop">Explore products</Link></div><img src="/hero/fibre-process.png" alt="Artisan working with natural fibre" className="w-full rounded-3xl"/></div></section>;
}
