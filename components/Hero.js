import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export default function Hero() {
  return (
    <section className="hero">
      <div className="container grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div className="max-w-xl">
          <p className="eyebrow !text-[#d9bd8a]">A more thoughtful everyday</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.08] md:text-7xl">
            Nature has a way of making things{" "}
            <em className="text-[#d9bd8a]">beautiful.</em>
          </h1>
          <p className="mt-6 max-w-lg leading-7 text-white/75">
            Explore thoughtfully designed products made with the natural
            character of banana fibre.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn bg-[#f5ebd7] text-[#183d2b]" href="/shop">
              Explore the collection <ArrowUpRight size={17} />
            </Link>
            <Link
              className="btn border border-white/35 text-white"
              href="/about"
            >
              Our story
            </Link>
          </div>
        </div>
        <div
          className="hero-image shadow-2xl"
          role="img"
          aria-label="Banana fibre products in a natural setting"
        />
      </div>
    </section>
  );
}
