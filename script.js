const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Theme toggle (dark by default)
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// Scroll reveals (Motion)
if (window.Motion && !reduceMotion) {
  const { animate, inView, scroll, stagger } = Motion;
  document.documentElement.classList.add("js-motion");

  const rise = { opacity: [0, 1], y: [24, 0] };
  const ease = [0.22, 1, 0.36, 1];

  inView(".reveal", (el) => {
    animate(el, rise, { duration: 0.7, ease });
  }, { amount: 0.3 });

  inView(".stagger", (list) => {
    animate([...list.children], { opacity: [0, 1], x: [-16, 0] }, { duration: 0.6, ease, delay: stagger(0.12) });
  }, { amount: 0.3 });

  inView(".step", (el) => {
    animate(el, { opacity: [0, 1], y: [32, 0], scale: [0.98, 1] }, { duration: 0.6, ease });
  }, { amount: 0.2 });

  inView(".carousel", (el) => {
    animate([...el.children], { opacity: [0, 1], y: [32, 0] }, { duration: 0.6, ease, delay: stagger(0.08) });
  }, { amount: 0.2 });

  const bar = document.querySelector(".progress");
  scroll((p) => { bar.style.transform = `scaleX(${p})`; });
}

// Program: show 4 steps, expand to 12
const ladder = document.querySelector(".ladder");
const ladderBtn = document.querySelector(".ladder-toggle");
ladder.classList.add("collapsed");
ladderBtn.addEventListener("click", () => {
  const open = ladder.classList.toggle("collapsed") === false;
  ladderBtn.setAttribute("aria-expanded", open);
  ladderBtn.textContent = open ? "Свернуть" : "Показать все 12 основ";
  if (!open) ladder.scrollIntoView({ block: "start" });
});

// Reviews carousel
const track = document.querySelector(".carousel");
const cards = track.querySelectorAll(".review");
const count = document.querySelector(".carousel-count");
const [prevBtn, nextBtn] = document.querySelectorAll(".carousel-nav .round");

function currentIndex() {
  const step = cards[1].offsetLeft - cards[0].offsetLeft;
  return Math.round(track.scrollLeft / step);
}
let target = 0;
function updateNav() {
  const i = currentIndex();
  count.textContent = `${i + 1} / ${cards.length}`;
  prevBtn.disabled = track.scrollLeft < 4;
  nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
}
document.querySelectorAll(".carousel-nav .round").forEach((btn) => {
  btn.addEventListener("click", () => {
    const i = Math.min(Math.max(target + Number(btn.dataset.dir), 0), cards.length - 1);
    target = i;
    track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
  });
});
track.addEventListener("scroll", updateNav, { passive: true });
track.addEventListener("scrollend", () => { target = currentIndex(); });
track.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextBtn.click();
  if (e.key === "ArrowLeft") prevBtn.click();
});
updateNav();

// Screenshot lightbox
const box = document.querySelector(".lightbox");
const boxImg = box.querySelector("img");
document.querySelectorAll(".proof").forEach((btn) => {
  btn.addEventListener("click", () => {
    boxImg.src = btn.dataset.full;
    boxImg.alt = btn.querySelector("img").alt;
    box.showModal();
    if (window.Motion && !reduceMotion) {
      Motion.animate(boxImg, { opacity: [0, 1], scale: [0.94, 1] }, { type: "spring", bounce: 0.15, visualDuration: 0.35 });
    }
  });
});
box.querySelector(".lightbox-close").addEventListener("click", () => box.close());
box.addEventListener("click", (e) => { if (e.target === box) box.close(); });

// Countdown to course start
const cd = document.querySelector(".countdown");
const start = new Date(cd.dataset.start);
function tick() {
  const ms = Math.max(0, start - Date.now());
  const pad = (n) => String(n).padStart(2, "0");
  cd.querySelector('[data-unit="d"]').textContent = pad(Math.floor(ms / 864e5));
  cd.querySelector('[data-unit="h"]').textContent = pad(Math.floor(ms / 36e5) % 24);
  cd.querySelector('[data-unit="m"]').textContent = pad(Math.floor(ms / 6e4) % 60);
}
tick();
setInterval(tick, 30000);

// Free lesson: load YouTube only on click
const video = document.querySelector(".video");
video.querySelector(".video-play").addEventListener("click", () => {
  const id = video.dataset.youtube;
  if (!id) return;
  video.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" title="Бесплатный урок" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
});

// Sticky mobile CTA after the hero
const hero = document.querySelector(".hero");
const sticky = document.querySelector(".sticky-cta");
new IntersectionObserver(([e]) => sticky.classList.toggle("show", !e.isIntersecting)).observe(hero);
