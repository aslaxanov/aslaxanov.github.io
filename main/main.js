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
