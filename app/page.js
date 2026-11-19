"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Recycle,
  Heart,
  Truck,
  ShieldCheck,
  MoveUpRight,
  Sparkles,
  MapPin,
  Search,
  UserRound,
  ShoppingCart,
  Heart as HeartIcon,
  ChevronDown,
} from "lucide-react";
import DeliveryLocationPanel from "../components/DeliveryLocationPanel";
import styles from "../components/DeliveryLocationPanel.module.css";

const categories = [
  {
    title: "Bags & Totes",
    description: "Carry a little nature, every day.",
    image: "/categories/bags.png",
    link: "/categories/bags",
    number: "01",
    note: "Everyday companions",
  },
  {
    title: "Home & Living",
    description: "Natural details for considered spaces.",
    image: "/categories/home.png",
    link: "/categories/home-living",
    number: "02",
    note: "Objects for living",
  },
  {
    title: "Accessories",
    description: "Small details. Distinctive character.",
    image: "/categories/accessories.png",
    link: "/categories/accessories",
    number: "03",
    note: "The finishing touch",
  },
  {
    title: "Gifting",
    description: "Thoughtful gestures, beautifully wrapped.",
    image: "/categories/gifting.png",
    link: "/categories/gifting",
    number: "04",
    note: "Made to be given",
  },
];

const products = [
  {
    id: "1",
    name: "Everyday Banana Fibre Tote",
    price: "₹899",
    oldPrice: "₹1,199",
    image: "/products/tote.png",
    tag: "BESTSELLER",
  },
  {
    id: "2",
    name: "Handwoven Storage Basket",
    price: "₹649",
    oldPrice: "",
    image: "/products/basket.png",
    tag: "HANDMADE",
  },
  {
    id: "3",
    name: "Natural Fibre Sling Bag",
    price: "₹1,099",
    oldPrice: "",
    image: "/products/sling.png",
    tag: "NEW ARRIVAL",
  },
  {
    id: "4",
    name: "Woven Table Mat Set",
    price: "₹499",
    oldPrice: "₹599",
    image: "/products/table-mat.png",
    tag: "POPULAR",
  },
];

const benefits = [
  {
    icon: Leaf,
    title: "Nature inspired",
    description: "Products inspired by the natural beauty of banana fibre.",
  },
  {
    icon: Recycle,
    title: "Thoughtful materials",
    description: "Explore alternatives made using plant-based materials.",
  },
  {
    icon: Heart,
    title: "Crafted with care",
    description: "Celebrate craftsmanship and attention to detail.",
  },
  {
    icon: Truck,
    title: "Easy shopping",
    description: "A simple and convenient shopping experience.",
  },
];

const promises = [
  {
    icon: ShieldCheck,
    title: "Quality focus",
    description: "Carefully described products and clear information.",
    number: "01",
  },
  {
    icon: Truck,
    title: "Convenient shopping",
    description: "A simple journey from browsing to checkout.",
    number: "02",
  },
  {
    icon: Heart,
    title: "Made with care",
    description: "A brand that celebrates natural creativity.",
    number: "03",
  },
];

export default function HomePage() {
  const [locationOpen, setLocationOpen] = useState(false);
  const [savedPincode, setSavedPincode] = useState("");
  const { totalItems } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem("banafibre-delivery-pincode");
    if (saved && /^\d{6}$/.test(saved)) setSavedPincode(saved);
  }, []);

  function savePincode(pin) {
    if (!/^\d{6}$/.test(String(pin))) return;
    setSavedPincode(String(pin));
    localStorage.setItem("banafibre-delivery-pincode", String(pin));
  }

  return (
    <main className="bana-home overflow-hidden">
      {/* Store utility header */}
      <header className="bana-store-header">
        <div className="bana-store-top">
          <Link
            href="/"
            className="bana-store-logo"
            aria-label="Bananafibre home"
          >
            <span className="bana-store-logo-mark">B</span>
            <span>
              Banana<strong>fibre</strong>
              <i>.</i>
            </span>
          </Link>

          <button
            type="button"
            className={styles.trigger}
            onClick={() => setLocationOpen(true)}
            aria-expanded={locationOpen}
          >
            <MapPin size={17} fill="currentColor" />
            <span className={styles.triggerLabel}>
              <small>DELIVER TO</small>
              <strong>{savedPincode || "Select delivery location"}</strong>
            </span>
            <ChevronDown size={15} />
          </button>

          <DeliveryLocationPanel
            open={locationOpen}
            onClose={() => setLocationOpen(false)}
            savedAddresses={[]}
            onSelectAddress={(address) => savePincode(address.pincode)}
            onPincodeSubmit={savePincode}
            onUseCurrentLocation={() => {
              if (!navigator.geolocation) {
                window.alert("Location is not available in this browser. Enter your 6-digit PIN code instead.");
                return;
              }
              navigator.geolocation.getCurrentPosition(
                () => window.alert("Location permission received. Please enter your 6-digit PIN code so delivery availability can be checked."),
                () => window.alert("Location permission was not granted. You can enter your PIN code manually.")
              );
            }}
          />
        </div>

        <div className="bana-store-mainrow">
          <form
            className="bana-store-search"
            action="/shop"
            method="get"
            role="search"
          >
            <Search size={19} />
            <input
              type="search"
              name="q"
              placeholder="Search for products, collections and more"
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>
          <nav
            className="bana-store-actions"
            aria-label="Account and shopping links"
          >
            <Link href="/login" className="bana-store-action">
              <UserRound size={19} />
              <span>Login</span>
            </Link>
            <Link href="/wishlist" className="bana-store-action">
              <HeartIcon size={19} />
              <span>Wishlist</span>
            </Link>
            <Link href="/cart" className="bana-store-action bana-cart-action">
              <ShoppingCart size={20} />
              <span>Cart</span>
              <b>{totalItems}</b>
            </Link>
          </nav>
        </div>

        <nav className="bana-store-categories" aria-label="Shop categories">
          <Link href="/shop" className="bana-store-category">
            <span className="bana-category-symbol">✳</span>All Products
          </Link>
          <Link href="/categories/bags" className="bana-store-category">
            <span className="bana-category-symbol">▱</span>Bags & Totes
          </Link>
          <Link href="/categories/home-living" className="bana-store-category">
            <span className="bana-category-symbol">⌂</span>Home & Living
          </Link>
          <Link href="/categories/accessories" className="bana-store-category">
            <span className="bana-category-symbol">◇</span>Accessories
          </Link>
          <Link href="/categories/gifting" className="bana-store-category">
            <span className="bana-category-symbol">▧</span>Gifting
          </Link>
          <Link href="/about" className="bana-store-category">
            <span className="bana-category-symbol">❋</span>Our Story
          </Link>
          <Link href="/sustainability" className="bana-store-category">
            <span className="bana-category-symbol">♧</span>Sustainability
          </Link>
        </nav>
      </header>

      {/* Announcement strip */}
      <div className="bana-announcement">
        <span className="bana-announcement-line" />
        <span>Objects with a natural point of view</span>
        <Sparkles size={12} strokeWidth={1.5} aria-hidden="true" />
        <span>Discover the Bananafibre collection</span>
        <span className="bana-announcement-line" />
      </div>

      {/* Editorial hero */}
      <section className="bana-hero" id="top">
        <div className="bana-hero-topline">
          <span>THE BANANAFIBRE JOURNAL</span>
          <span>CRAFT / MATERIAL / EVERYDAY</span>
          <span>EST. IN INDIA</span>
        </div>

        <div className="bana-hero-grid">
          <div className="bana-hero-copy">
            <p className="bana-kicker hero-enter">
              <span className="bana-kicker-dot" />A DIFFERENT KIND OF NATURAL
            </p>

            <h1 className="bana-display hero-enter hero-enter-delay-1">
              The beauty
              <br />
              of <em>being</em>
              <br />
              <span>natural.</span>
            </h1>

            <div className="bana-hero-bottom hero-enter hero-enter-delay-2">
              <p>
                A considered collection of lifestyle pieces inspired by banana
                fibre, shaped by creativity and made for the rhythm of everyday
                life.
              </p>
              <Link href="/shop" className="bana-text-link">
                Explore the collection
                <span className="bana-link-arrow">
                  <ArrowUpRight size={17} />
                </span>
              </Link>
            </div>
          </div>

          <div className="bana-hero-art hero-enter hero-enter-delay-1">
            <div className="bana-hero-banner-shell">
              <div className="bana-hero-banner">
                <img
                  src="/hero/banana-fibre-hero.png"
                  alt="Banafibre handmade banana fibre lifestyle collection"
                  className="bana-hero-banner-image"
                  fetchPriority="high"
                />

                {/* Clickable area over the button inside the image */}
                <Link
                  href="/shop"
                  className="bana-hero-banner-cta"
                  aria-label="Explore the Banafibre collection"
                />
              </div>
            </div>

            <div className="bana-hero-image-index">
              <span>FIG. 01</span>
              <span>TEXTURE / FORM / FUNCTION</span>
            </div>
            <div className="bana-hero-note">
              <span className="bana-note-mark">B.</span>
              <span>
                <strong>Rooted in nature.</strong>
                <small>Designed for living.</small>
              </span>
            </div>
            <span className="bana-hero-vertical">
              THE NATURAL EDITION — 001
            </span>
          </div>
        </div>

        <div className="bana-hero-footer">
          <span>THOUGHTFUL BY DESIGN</span>
          <Link href="#collections">
            SCROLL TO EXPLORE <ArrowDown size={13} />
          </Link>
          <span>01 — 05</span>
        </div>
      </section>

      {/* Intro statement */}
      <section className="bana-intro-section" data-reveal>
        <div className="bana-intro-label">
          <span>01 / OUR POINT OF VIEW</span>
          <span className="bana-small-rule" />
        </div>
        <div className="bana-intro-content">
          <p className="bana-intro-overline">NOT JUST ANOTHER OBJECT.</p>
          <h2>
            Everyday things,
            <br />
            <em>with a little more meaning.</em>
          </h2>
          <div className="bana-intro-aside">
            <p>
              We look at familiar materials in new ways. Banana fibre becomes an
              invitation to explore texture, form and the possibilities of
              thoughtful design.
            </p>
            <Link href="/about" className="bana-underlined-link">
              Get to know us <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="bana-values" aria-label="Banafibre values">
        {benefits.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              className="bana-value"
              key={item.title}
              data-reveal
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <div className="bana-value-icon">
                <Icon size={21} strokeWidth={1.35} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Collections */}
      <section className="bana-collections" id="collections">
        <div className="bana-section-head" data-reveal>
          <div>
            <p className="bana-kicker">02 / FIND YOUR FORM</p>
            <h2 className="bana-section-title">
              Collections, <em>considered.</em>
            </h2>
          </div>
          <p className="bana-section-intro">
            A place for the useful, the beautiful and everything in between.
          </p>
        </div>

        <div className="bana-collection-grid">
          {categories.map((category, index) => (
            <Link
              href={category.link}
              key={category.title}
              className={`bana-collection-card bana-collection-${index + 1}`}
              data-reveal
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="bana-collection-image-wrap">
                <img
                  src={category.image}
                  alt={category.title}
                  className="bana-collection-image"
                  loading="lazy"
                />
                <span className="bana-collection-number">
                  {category.number}
                </span>
                <span className="bana-collection-cta">
                  <ArrowUpRight size={19} />
                </span>
              </div>
              <div className="bana-collection-meta">
                <div>
                  <span>{category.note}</span>
                  <h3>{category.title}</h3>
                </div>
                <p>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="bana-collections-footer" data-reveal>
          <span>FOUR WAYS TO BRING NATURE CLOSER</span>
          <Link href="/shop" className="bana-underlined-link">
            View all categories <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* Moving editorial band */}
      <section
        className="bana-marquee"
        aria-label="Banafibre collection message"
      >
        <div className="bana-marquee-track">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="bana-marquee-group" key={index}>
              <span>MADE OF NATURAL POSSIBILITIES</span>
              <Leaf size={19} strokeWidth={1.2} />
              <span>FORM FOLLOWS FEELING</span>
              <span className="bana-marquee-star">✳</span>
              <span>THE ART OF EVERYDAY LIVING</span>
              <Leaf size={19} strokeWidth={1.2} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bana-products" id="featured">
        <div className="bana-section-head bana-products-head" data-reveal>
          <div>
            <p className="bana-kicker">03 / THE SELECTED EDIT</p>
            <h2 className="bana-section-title">
              Objects to <em>keep close.</em>
            </h2>
          </div>
          <Link href="/shop" className="bana-underlined-link">
            Shop all pieces <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="bana-product-grid">
          {products.map((product, index) => (
            <article
              className="bana-product-card"
              key={product.id}
              data-reveal
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link
                href={`/products/${product.id}`}
                className="bana-product-link"
              >
                <div className="bana-product-image-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="bana-product-image"
                    loading="lazy"
                  />
                  <span className="bana-product-tag">{product.tag}</span>
                  <span className="bana-product-open">
                    Discover <ArrowUpRight size={16} />
                  </span>
                </div>
                <div className="bana-product-info">
                  <h3>{product.name}</h3>
                  <div className="bana-product-price">
                    <span>{product.price}</span>
                    {product.oldPrice && <del>{product.oldPrice}</del>}
                  </div>
                  <span className="bana-product-detail">
                    VIEW PRODUCT <MoveUpRight size={13} />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="bana-products-bottom" data-reveal>
          <span>SELECTED FOR THEIR CHARACTER</span>
          <Link href="/shop" className="bana-dark-button">
            Explore all products <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Craft story */}
      <section className="bana-story" id="about">
        <div className="bana-story-visual" data-reveal>
          <div className="bana-story-image-wrap">
            <img
              src="/hero/fibre-process.png"
              alt="Banana fibre craft and material process"
              className="bana-story-image"
              loading="lazy"
            />
          </div>
          <span className="bana-story-image-caption">
            MATERIAL STUDY / BANANA FIBRE
          </span>
          <div className="bana-story-sticker">
            <span>THE</span>
            <strong>
              ART OF
              <br />
              MAKING
            </strong>
            <Leaf size={19} />
          </div>
        </div>

        <div className="bana-story-copy" data-reveal>
          <p className="bana-kicker">04 / THE STORY IN THE MATERIAL</p>
          <h2 className="bana-story-title">
            From a natural
            <br />
            beginning to
            <br />
            <em>something lasting.</em>
          </h2>
          <p className="bana-story-description">
            Banana fibre offers exciting possibilities for creative and
            functional products. At Banafibre, we celebrate thoughtful design,
            natural textures and the people behind handmade craftsmanship.
          </p>
          <p className="bana-story-description">
            Explore the journey from plant material to finished product and
            discover the story behind each creation.
          </p>
          <Link href="/about" className="bana-text-link bana-story-link">
            Discover our story
            <span className="bana-link-arrow">
              <ArrowUpRight size={17} />
            </span>
          </Link>
          <span className="bana-story-footnote">
            A MATERIAL WITH A STORY TO TELL.
          </span>
        </div>
      </section>

      {/* Sustainability feature */}
      <section className="bana-sustainability" id="sustainability">
        <div className="bana-sustainability-image">
          <img
            src="/hero/banana-fibre-hero.png"
            alt="Natural banana fibre textures"
            loading="lazy"
          />
        </div>
        <div className="bana-sustainability-copy" data-reveal>
          <p className="bana-kicker">05 / A THOUGHTFUL WAY FORWARD</p>
          <h2>
            Choose with
            <br />
            <em>intention.</em>
          </h2>
          <p>
            Discover how natural materials, considered design and responsible
            production can shape the products we use.
          </p>
          <Link href="/sustainability" className="bana-light-button">
            Explore sustainability <ArrowUpRight size={16} />
          </Link>
          <span className="bana-sustainability-index">B / 005</span>
        </div>
      </section>

      {/* Brand promise */}
      <section className="bana-promise">
        <div className="bana-promise-heading" data-reveal>
          <p className="bana-kicker">THE BANANAFIBRE PROMISE</p>
          <h2>
            Thoughtful in
            <br />
            <em>every detail.</em>
          </h2>
        </div>

        <div className="bana-promise-list">
          {promises.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                className="bana-promise-item"
                key={item.title}
                data-reveal
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <span className="bana-promise-number">{item.number}</span>
                <div className="bana-promise-icon">
                  <Icon size={22} strokeWidth={1.3} />
                </div>
                <div className="bana-promise-text">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <ArrowUpRight className="bana-promise-arrow" size={19} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bana-newsletter">
        <div className="bana-newsletter-inner" data-reveal>
          <span className="bana-newsletter-mark">B.</span>
          <p className="bana-kicker">LETTERS FROM BANANAFIBRE</p>
          <h2>
            A little more
            <br />
            <em>nature in your inbox.</em>
          </h2>
          <p className="bana-newsletter-description">
            Notes on new collections, natural materials and the stories behind
            what we make.
          </p>
          <form className="bana-newsletter-form" action="#" method="get">
            <label className="sr-only" htmlFor="bana-email">
              Email address
            </label>
            <input
              id="bana-email"
              type="email"
              name="email"
              required
              placeholder="Your email address"
              autoComplete="email"
            />
            <button type="submit" aria-label="Subscribe to newsletter">
              Subscribe <ArrowUpRight size={17} />
            </button>
          </form>
          <small className="bana-newsletter-note">
            Connect this form to your newsletter service before launch.
          </small>
        </div>
      </section>

      {/* Editorial footer */}
      <footer className="bana-footer">
        <div className="bana-footer-top">
          <div className="bana-footer-brand">
            <Link href="/" className="bana-wordmark">
              Banana<span>fibre.</span>
            </Link>
            <p>
              Natural materials.
              <br />
              Thoughtful everyday living.
            </p>
          </div>

          <div className="bana-footer-column">
            <span>EXPLORE</span>
            <Link href="/shop">Shop all</Link>
            <Link href="/categories/bags">Bags & Totes</Link>
            <Link href="/categories/home-living">Home & Living</Link>
            <Link href="/categories/accessories">Accessories</Link>
            <Link href="/categories/gifting">Gifting</Link>
          </div>

          <div className="bana-footer-column">
            <span>THE BRAND</span>
            <Link href="/about">Our story</Link>
            <Link href="/sustainability">Sustainability</Link>
            <Link href="/shop">Collections</Link>
          </div>

          <div className="bana-footer-column">
            <span>FOLLOW ALONG</span>
            <Link href="/contact">Contact</Link>
            <Link
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram <ArrowUpRight size={13} />
            </Link>
            <Link
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
            >
              Facebook <ArrowUpRight size={13} />
            </Link>
            <Link
              href="https://www.whatsapp.com/"
              target="_blank"
              rel="noreferrer"
            >
              Whatsapp <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        <div className="bana-footer-bottom">
          <span>© BANANAFIBRE. ALL RIGHTS RESERVED.</span>
          <span>MADE WITH A NATURAL POINT OF VIEW.</span>
          <Link href="#top">BACK TO TOP ↑</Link>
        </div>
      </footer>
    </main>
  );
}
