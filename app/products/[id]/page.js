"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
  Heart,
  Share2,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Check,
  Leaf,
  PackageCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { products as localProducts, formatPrice } from "@/data";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [catalog, setCatalog] = useState(localProducts);
  const [product, setProduct] = useState(() => localProducts.find((item) => String(item.id) === String(id)) || null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const text = await response.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; }
        catch { throw new Error("Invalid products API response."); }
        if (response.status === 404) {
          if (active) {
            setCatalog([]);
            setProduct(null);
          }
          return;
        }
        if (!response.ok) throw new Error(data.message || "Could not load product.");
        if (active && Array.isArray(data.products)) {
          setCatalog(data.products);
          setProduct(data.products.find((item) => String(item.id) === String(id)) || null);
        }
      } catch (error) {
        console.warn("Using local product preview:", error.message);
        if (active) {
          setCatalog(localProducts);
          setProduct(localProducts.find((item) => String(item.id) === String(id)) || null);
        }
      } finally {
        if (active) setCatalogLoading(false);
      }
    }
    setCatalogLoading(true);
    loadProduct();
    return () => { active = false; };
  }, [id]);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [pin, setPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [openPanel, setOpenPanel] = useState("highlights");

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.galleryImages?.length
      ? product.galleryImages
      : [product.image];
  }, [product]);

  if (!product && catalogLoading) {
    return <main className="bf-detail-page"><div className="bf-detail-empty">Loading product...</div></main>;
  }

  if (!product) {
    return (
      <main className="bf-detail-page">
        <div className="bf-detail-empty">
          <h1>Product not found</h1>
          <p>This product may have been moved or is no longer available.</p>
          <Link href="/shop" className="bf-primary-button">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  const similarProducts = catalog.filter(
    (item) => item.id !== product.id && item.category === product.category,
  );
  const suggestions = catalog.filter(
    (item) =>
      item.id !== product.id &&
      !similarProducts.some((similar) => similar.id === item.id),
  );

  function handleAddToCart(goToCart = false) {
    const added = addToCart(product, quantity);
    if (!added) {
      setNotice("This product could not be added. Please try again.");
      return;
    }
    setNotice(`${product.name} added to your cart.`);
    if (goToCart) router.push("/cart");
  }

  function toggleWishlist() {
    const current = JSON.parse(
      localStorage.getItem("banafibre-wishlist") || "[]",
    );
    const exists = current.some((item) => String(item) === String(product.id));
    const next = exists
      ? current.filter((item) => String(item) !== String(product.id))
      : [...current, product.id];
    localStorage.setItem("banafibre-wishlist", JSON.stringify(next));
    setSaved(!exists);
  }

  function checkPin(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setPinMessage("Please enter a valid 6-digit PIN code.");
      return;
    }
    setPinMessage(
      "PIN code saved for this visit. Delivery availability will be confirmed at checkout.",
    );
  }

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <main className="bf-detail-page">
      <div className="bf-breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop">Shop</Link>
        <ChevronRight size={14} />
        <Link href={`/categories/${product.category}`}>
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </div>

      <div className="bf-product-layout">
        <section className="bf-gallery" aria-label="Product images">
          <div className="bf-gallery-thumbs">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`bf-thumb ${activeImage === index ? "is-active" : ""}`}
                onClick={() => setActiveImage(index)}
                aria-label={`View product image ${index + 1}`}
              >
                <img src={image} alt={`${product.name} view ${index + 1}`} />
              </button>
            ))}
          </div>
          <div className="bf-main-image-wrap">
            <img
              className="bf-main-image"
              src={gallery[activeImage] || product.image}
              alt={product.name}
            />
            {product.tag && <span className="bf-image-tag">{product.tag}</span>}
            <button
              className={`bf-image-wishlist ${saved ? "is-saved" : ""}`}
              onClick={toggleWishlist}
              aria-label="Toggle wishlist"
            >
              <Heart size={21} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </section>

        <section className="bf-product-info">
          <p className="bf-overline">
            <Leaf size={14} /> BANANAFIBRE · NATURAL LIVING
          </p>
          <h1>{product.name}</h1>
          <div className="bf-rating-line">
            <span className="bf-rating-stars">★★★★★</span>
            <span>Customer reviews</span>
            <span className="bf-rating-note">Review section below</span>
          </div>
          <div className="bf-price-row">
            <strong>{formatPrice(product.price)}</strong>
            {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
            {discount > 0 && (
              <span className="bf-discount">{discount}% off</span>
            )}
          </div>
          <p className="bf-tax-note">
            Inclusive of applicable taxes. Shipping calculated at checkout.
          </p>
          <p className="bf-description">{product.description}</p>

          <div className="bf-stock-note">
            <span className="bf-stock-dot" /> Product information available ·
            Add to cart to continue
          </div>

          <div className="bf-quantity-row">
            <span>Quantity</span>
            <div className="bf-quantity-control">
              <button
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((value) => value + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="bf-action-row">
            <button className="bf-add-button" onClick={() => handleAddToCart(false)}>
              <ShoppingBag size={17} /> Add to cart
            </button>
            <button className="bf-buy-button" onClick={() => handleAddToCart(true)}>
              Buy now <ArrowRight size={17} />
            </button>
          </div>
          <button
            className={`bf-save-link ${saved ? "is-saved" : ""}`}
            onClick={toggleWishlist}
          >
            <Heart size={17} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved to wishlist" : "Add to wishlist"}
          </button>
          {notice && (
            <p className="bf-cart-notice">
              <Check size={16} />
              {notice} <Link href="/cart">View cart</Link>
            </p>
          )}

          <div className="bf-delivery-box">
            <h2>Delivery details</h2>
            <form onSubmit={checkPin} className="bf-pin-form">
              <MapPin size={18} />
              <input
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                placeholder="Enter 6-digit PIN code"
                aria-label="Delivery PIN code"
              />
              <button type="submit">Check</button>
            </form>
            {pinMessage && <p className="bf-pin-message">{pinMessage}</p>}
            <div className="bf-service-row">
              <Truck size={18} />
              <span>Delivery options confirmed at checkout</span>
            </div>
            <div className="bf-service-row">
              <RotateCcw size={18} />
              <span>
                Return policy: refer to the store policy before ordering
              </span>
            </div>
            <div className="bf-service-row">
              <ShieldCheck size={18} />
              <span>Secure checkout experience</span>
            </div>
          </div>

          <div className="bf-product-attributes">
            <div>
              <span>Material</span>
              <strong>{product.material || "Bananafibre"}</strong>
            </div>
            <div>
              <span>Dimensions</span>
              <strong>{product.dimensions || "See product description"}</strong>
            </div>
            <div>
              <span>Care instructions</span>
              <strong>{product.care || "Handle with care"}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="bf-detail-sections">
        <div className="bf-accordion">
          <button
            onClick={() =>
              setOpenPanel(openPanel === "highlights" ? "" : "highlights")
            }
          >
            <span>
              <PackageCheck size={19} /> Product highlights
            </span>
            {openPanel === "highlights" ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openPanel === "highlights" && (
            <div className="bf-accordion-content bf-highlight-grid">
              <div>
                <span>Material</span>
                <strong>{product.material || "Bananafibre"}</strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{product.category.replace("-", " ")}</strong>
              </div>
              <div>
                <span>Dimensions</span>
                <strong>{product.dimensions || "As described"}</strong>
              </div>
              <div>
                <span>Craft</span>
                <strong>Natural fibre design</strong>
              </div>
            </div>
          )}
        </div>
        <div className="bf-accordion">
          <button
            onClick={() =>
              setOpenPanel(openPanel === "description" ? "" : "description")
            }
          >
            <span>
              <Leaf size={19} /> Product details & care
            </span>
            {openPanel === "description" ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openPanel === "description" && (
            <div className="bf-accordion-content">
              <p>{product.description}</p>
              <p>
                <strong>Care:</strong> {product.care}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bf-related-section">
        <div className="bf-related-heading">
          <div>
            <p className="bf-overline">COMPLETE THE COLLECTION</p>
            <h2>Similar products</h2>
            <p>More pieces from the same Banafibre category.</p>
          </div>
          <Link href="/shop">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {similarProducts.length ? (
          <div className="bf-related-grid">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <p className="bf-empty-related">
            Explore more pieces from our collection below.
          </p>
        )}
      </section>

      <section className="bf-related-section bf-suggestion-section">
        <div className="bf-related-heading">
          <div>
            <p className="bf-overline">CURATED FOR YOU</p>
            <h2>You may also like</h2>
            <p>Discover other natural fibre favourites.</p>
          </div>
          <Link href="/shop">
            Explore shop <ArrowRight size={16} />
          </Link>
        </div>
        <div className="bf-related-grid">
          {suggestions.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <div className="bf-review-wrap">
        <ReviewSection />
      </div>
      <div className="bf-mobile-buybar">
        <div>
          <small>{product.name}</small>
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <button onClick={() => handleAddToCart(false)}>Add to cart</button>
      </div>
    </main>
  );
}
