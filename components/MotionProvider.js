"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/*
  Site-wide scroll reveal.
  - Homepage elements marked with [data-reveal] keep their own stagger delays.
  - Inner pages get reveal targets automatically: the direct children of each
    .section .container, and the items inside its grids (cards, tiles).
  - Content rendered later by client components (filters, cart updates) is picked
    up through a MutationObserver, so newly inserted items also reveal.
  - Respects prefers-reduced-motion: everything shows immediately.
*/

const REVEAL_SELECTOR = [
  "[data-reveal]",
  ".section .container > *",
  ".section .container .grid > *",
].join(", ");

const STAGGER_MS = 70;
const MAX_STEPS = 8;

export default function MotionProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const seen = new WeakSet();

    function revealAll() {
      document
        .querySelectorAll(REVEAL_SELECTOR)
        .forEach((el) => el.classList.add("is-visible"));
    }

    if (reduced || !("IntersectionObserver" in window)) {
      revealAll();
      return undefined;
    }

    root.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    function scan() {
      let index = 0;
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
        if (!el.style.transitionDelay) {
          el.style.transitionDelay = `${Math.min(index, MAX_STEPS) * STAGGER_MS}ms`;
        }
        index += 1;
        observer.observe(el);
      });
    }

    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    scan();

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      root.classList.remove("motion-ready");
    };
  }, [pathname]);

  return children;
}
