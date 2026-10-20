// Screenshot lightbox: any [data-zoom] opens its image full size
const box = document.querySelector(".lightbox");
if (box) {
  const img = box.querySelector("img");
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-zoom]");
    if (!t) return;
    img.src = t.dataset.zoom;
    box.showModal();
  });
  box.addEventListener("click", (e) => { if (e.target === box || e.target.closest("button")) box.close(); });
}

// Mobile sticky "book" button appears after the hero
// (hidden again near the final call-to-action, so the page ends with one button)
const sticky = document.querySelector(".sticky-book");
const hero = document.querySelector("[data-hero]");
const finalCta = document.querySelector("[data-final]");
if (sticky && hero) {
  const seen = new Set();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    sticky.classList.toggle("show", seen.size === 0);
  });
  io.observe(hero);
  if (finalCta) io.observe(finalCta);
}

// Arrow buttons for horizontal scroll carousels: <div data-carousel> + [data-prev]/[data-next]
document.querySelectorAll("[data-carousel]").forEach((track) => {
  const root = track.closest("section");
  const step = () => track.firstElementChild.getBoundingClientRect().width + 12;
  root.querySelector("[data-prev]")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  root.querySelector("[data-next]")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
});

// Countdown "scoreboard": <div class="cd" data-countdown="ISO date"> with [data-cd="d0"] … [data-cd="s1"] digits
const clocks = document.querySelectorAll("[data-countdown]");
if (clocks.length) {
  const start = new Date(clocks[0].dataset.countdown).getTime();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick = () => {
    const ms = Math.max(0, start - Date.now());
    const v = { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
    clocks.forEach((c) => {
      c.classList.toggle("over", ms === 0);
      for (const k in v) {
        const t = String(Math.min(v[k], 99)).padStart(2, "0");
        for (let i = 0; i < 2; i++) {
          const el = c.querySelector(`[data-cd="${k}${i}"]`);
          if (el.textContent === t[i]) continue;
          el.textContent = t[i];
          if (!reduce) el.animate([{ transform: "translateY(-30%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" });
        }
      }
    });
    if (ms === 0) clearInterval(timer);
  };
  const timer = setInterval(tick, 1000);
  tick();
}

// Bubble popup: after 30 s on the page Shamil's photo inflates like a bubble, stays 4 s, then pops.
// Once per visit (sessionStorage). Add ?bubble to the URL to see it after 1.5 s.
(() => {
  const pop = document.querySelector(".bubble-pop");
  if (!pop) return;
  const force = location.search.includes("bubble");
  try { if (!force && sessionStorage.getItem("bubbleShown")) return; } catch (e) {}
  const bubble = pop.querySelector(".bubble"), text = pop.querySelector(".bubble-text");
  const M = window.Motion;
  const calm = !M || matchMedia("(prefers-reduced-motion: reduce)").matches;
  let floating, closed = false, timer;

  const show = () => {
    if (document.hidden) { document.addEventListener("visibilitychange", show, { once: true }); return; }
    try { sessionStorage.setItem("bubbleShown", "1"); } catch (e) {}
    pop.hidden = false;
    pop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "both" });
    if (calm) {
    } else {
      M.animate(bubble, { scale: [0, 1], opacity: [0, 1] }, { type: "spring", bounce: 0.5, visualDuration: 0.55 });
      M.animate(bubble, { scaleX: [1, 1.07, 0.96, 1.02, 1], scaleY: [1, 0.93, 1.05, 0.98, 1] }, { duration: 0.9, delay: 0.3, ease: "easeInOut" });
      M.animate(text, { opacity: [0, 1], y: [16, 0], scale: [0.9, 1] }, { type: "spring", bounce: 0.4, visualDuration: 0.5, delay: 0.25 });
      floating = M.animate(bubble, { y: [0, -6, 0] }, { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 });
    }
    timer = setTimeout(close, 4000 + 600);
  };

  const close = async () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    if (calm) {
      await pop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).finished;
      pop.hidden = true;
      return;
    }
    floating?.stop();
    M.animate(text, { opacity: 0, scale: 0.85 }, { duration: 0.15 });
    await M.animate(bubble, { scale: 1.15 }, { duration: 0.12, ease: "easeOut" }).finished;
    const r = bubble.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const drops = Array.from({ length: 14 }, (_, i) => {
      const d = document.createElement("span");
      d.className = "drop";
      d.style.left = cx + "px"; d.style.top = cy + "px";
      document.body.append(d);
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4, dist = r.width * (0.55 + Math.random() * 0.35);
      return M.animate(d, { x: [Math.cos(a) * r.width * 0.45, Math.cos(a) * dist], y: [Math.sin(a) * r.width * 0.45, Math.sin(a) * dist], scale: [1, 0], opacity: [1, 0] },
        { duration: 0.5 + Math.random() * 0.2, ease: "easeOut" }).finished.then(() => d.remove());
    });
    M.animate(bubble, { scale: 1.4, opacity: 0 }, { duration: 0.12, ease: "easeIn" });
    await Promise.all([...drops, pop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "both" }).finished]);
    pop.hidden = true;
  };

  bubble.addEventListener("click", close);
  setTimeout(show, force ? 1500 : 30000);
})();
