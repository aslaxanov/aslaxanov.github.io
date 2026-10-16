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
