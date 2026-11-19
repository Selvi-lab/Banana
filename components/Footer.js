import Link from "next/link";
export default function Footer() {
  return (
    <footer className="footer mt-16">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl">Bananafibre</div>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
            Thoughtfully made products inspired by nature. Discover the beauty
            and versatility of banana fibre.
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Explore</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <Link href="/shop">Shop all</Link>
            <Link href="/about">Our story</Link>
            <Link href="/sustainability">Sustainability</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Help</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <Link href="/account">My account</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/track-order">Track order</Link>
            <Link href="/cart">Shopping cart</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container py-5 text-xs text-white/60">
          © {new Date().getFullYear()} Bananafibre. Replace this demo content
          with your verified brand and business details.
        </div>
      </div>
    </footer>
  );
}
