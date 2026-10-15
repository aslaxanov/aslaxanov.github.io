// Shared effects for the design concepts. Pages opt in with data-attributes.
(() => {
  if (!window.Motion || !document.documentElement.classList.contains("fx")) return;
  const { animate, inView, scroll, stagger } = Motion;
  const ease = [0.22, 1, 0.36, 1];

  function wrapWords(node) {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const outer = document.createElement("span");
          outer.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          outer.append(inner);
          frag.append(outer);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== "BR") {
        wrapWords(child);
      }
    }
  }

  document.querySelectorAll("[data-split]").forEach((el) => {
    wrapWords(el);
    el.style.opacity = 1;
    const words = el.querySelectorAll(".w > span");
    inView(el, () => {
      animate(words, { y: ["110%", "0%"], opacity: [0, 1], filter: ["blur(8px)", "blur(0px)"] },
        { duration: 0.9, ease, delay: stagger(0.06, { startDelay: Number(el.dataset.split) || 0 }) });
    }, { amount: 0.4 });
  });

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const clip = el.dataset.reveal === "clip";
    // a fully clipped element never counts as "in view", so watch its parent instead
    inView(clip ? el.parentElement : el, () => {
      animate(el, clip
        ? { clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"], opacity: [1, 1] }
        : { opacity: [0, 1], y: [28, 0] },
        { duration: clip ? 1.2 : 0.8, ease, delay: Number(el.dataset.delay) || 0 });
    }, { amount: 0.25 });
  });

  document.querySelectorAll("[data-stagger]").forEach((el) => {
    inView(el, () => {
      animate([...el.children], { opacity: [0, 1], y: [24, 0] }, { duration: 0.7, ease, delay: stagger(0.08) });
    }, { amount: 0.2 });
  });

  document.querySelectorAll("[data-parallax]").forEach((el) => {
    const d = Number(el.dataset.parallax) * 100;
    scroll(animate(el, { y: [-d, d] }, { ease: "linear" }), { target: el.parentElement, offset: ["start end", "end start"] });
  });

  document.querySelectorAll("[data-zoom-out]").forEach((el) => {
    scroll(animate(el, { scale: [1.25, 1] }, { ease: "linear" }), { target: el.parentElement, offset: ["start end", "end end"] });
  });

  document.querySelectorAll("[data-fill]").forEach((el) => {
    scroll(animate(el, { scaleY: [0, 1] }, { ease: "linear" }), { target: el.parentElement, offset: ["start 70%", "end 70%"] });
  });

  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    inView(el, () => {
      animate(0, to, { duration: 1.6, ease, onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString("ru-RU"); } });
    });
  });

  const bar = document.querySelector("[data-progress]");
  if (bar) scroll(animate(bar, { scaleX: [0, 1] }, { ease: "linear" }));

  // Horizontal track driven by vertical scroll: <section data-hscroll><div class="sticky"><div class="track">
  document.querySelectorAll("[data-hscroll]").forEach((sec) => {
    const track = sec.querySelector(".track");
    const update = () => {
      const max = track.scrollWidth - innerWidth;
      sec.style.height = `${max + innerHeight}px`;
      return max;
    };
    let max = update();
    addEventListener("resize", () => { max = update(); });
    scroll((p) => { track.style.transform = `translateX(${-p * max}px)`; }, { target: sec, offset: ["start start", "end end"] });
  });

  // Magnetic buttons
  if (matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        animate(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35 }, { type: "spring", bounce: 0.3, visualDuration: 0.3 });
      });
      el.addEventListener("pointerleave", () => animate(el, { x: 0, y: 0 }, { type: "spring", bounce: 0.4, visualDuration: 0.5 }));
    });
  }

  // Spotlight that follows the cursor on cards
  document.querySelectorAll("[data-spot]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
})();
