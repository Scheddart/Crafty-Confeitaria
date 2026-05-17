/* ============================================================
   CRAFTY — SCROLL EXPERIENCE
   GSAP + ScrollTrigger + Lenis + SplitType
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* Pin por transform (não position:fixed) evita o flicker de seções
   adjacentes durante a interpolação suave do Lenis. */
ScrollTrigger.defaults({ pinType: "transform" });

/* ----------------------------------------------------------
   1. SMOOTH SCROLL
   ---------------------------------------------------------- */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ----------------------------------------------------------
   2. PRE-WRAP DAS LINHAS DO HERO + ESTADOS INICIAIS
   ---------------------------------------------------------- */
document.querySelectorAll(".hero__title .line").forEach((line) => {
  const inner = document.createElement("span");
  inner.className = "line__inner";
  inner.textContent = line.textContent;
  line.textContent = "";
  line.appendChild(inner);
});

gsap.set(".hero__title .line__inner", { yPercent: 120 });
gsap.set(".hero__floating .float", { scale: 0, opacity: 0, rotate: -10 });

/* ----------------------------------------------------------
   3. LOADER + INTRO DO HERO
   ---------------------------------------------------------- */
function runIntro() {
  const tl = gsap.timeline();

  tl.to("[data-loader-bar]", { width: "100%", duration: 1.2, ease: "power2.inOut" })
    .to("[data-loader]",     { yPercent: -100, duration: .9, ease: "power3.inOut" }, "+=.1")
    .from(".nav",            { yPercent: -100, duration: .8, ease: "power3.out" }, "-=.5")
    .to(".hero__title .line__inner", {
      yPercent: 0, duration: 1.1, ease: "power4.out", stagger: .1
    }, "-=.6")
    .to("[data-reveal]", {
      opacity: 1, y: 0, duration: .9, ease: "power3.out", stagger: .08
    }, "-=.8")
    .to(".hero__floating .float", {
      scale: 1, opacity: 1, rotate: 0,
      duration: 1.2, ease: "expo.out", stagger: .15
    }, "-=1");
}
window.addEventListener("load", () => {
  runIntro();

  /* Workaround: o Chromium às vezes ignora o inline padding-bottom/height
     que o ScrollTrigger seta no pin-spacer no primeiro paint. Re-aplicar
     o valor força o recálculo. NÃO chamar ScrollTrigger.refresh() depois,
     porque o refresh reverte o spacer pro estado bugado. */
  setTimeout(() => {
    document.querySelectorAll(".pin-spacer").forEach((sp) => {
      const h  = sp.style.height;
      const pb = sp.style.paddingBottom;
      if (pb) { sp.style.paddingBottom = ""; void sp.offsetHeight; sp.style.paddingBottom = pb; }
      if (h)  { sp.style.height = "";        void sp.offsetHeight; sp.style.height = h; }
    });
  }, 1500);
});

/* ----------------------------------------------------------
   4. NAV — esconde ao descer, mostra ao subir
   ---------------------------------------------------------- */
const nav = document.querySelector("[data-nav]");
let lastScroll = 0;
ScrollTrigger.create({
  start: 0, end: "max",
  onUpdate: (self) => {
    const y = self.scroll();
    if (y > 200 && y > lastScroll) nav.classList.add("is-hidden");
    else nav.classList.remove("is-hidden");
    lastScroll = y;
  }
});

/* ----------------------------------------------------------
   5. HERO — parallax e fade do background
   ---------------------------------------------------------- */
document.querySelectorAll("[data-float]").forEach((el) => {
  const speed = parseFloat(el.dataset.float);
  gsap.to(el, {
    yPercent: speed * 100,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
});

gsap.to(".hero__bg", {
  scale: 1.2, opacity: .3, ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

/* ----------------------------------------------------------
   6. MARQUEE infinito com boost por velocidade
   ---------------------------------------------------------- */
const marquee = document.querySelector("[data-marquee]");
if (marquee) {
  gsap.to(marquee, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });

  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity() / 800;
      gsap.to(marquee, { skewX: gsap.utils.clamp(-10, 10, v), duration: .5 });
    }
  });
}

/* ----------------------------------------------------------
   7. WORD REVEAL para H2 / H1 grandes
   set + to + once:true evita o bug do `from` deixar palavras
   travadas no estado inicial quando ScrollTrigger recalcula.
   ---------------------------------------------------------- */
document.querySelectorAll("[data-split-words]").forEach((el) => {
  const split = new SplitType(el, { types: "words" });
  split.words.forEach((w) => {
    const wrap = document.createElement("span");
    wrap.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;";
    w.parentNode.insertBefore(wrap, w);
    wrap.appendChild(w);
    w.style.display = "inline-block";
  });

  gsap.set(split.words, { yPercent: 110 });

  gsap.to(split.words, {
    yPercent: 0,
    duration: 1.1,
    ease: "power4.out",
    stagger: .05,
    scrollTrigger: { trigger: el, start: "top 85%", once: true }
  });
});

/* ----------------------------------------------------------
   8. GENERIC REVEAL (data-reveal fora do hero)
   ---------------------------------------------------------- */
document.querySelectorAll("section:not(.hero) [data-reveal]").forEach((el) => {
  gsap.to(el, {
    opacity: 1, y: 0,
    duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%", once: true }
  });
});

/* ----------------------------------------------------------
   9. INTRO — parallax e carimbo girando
   ---------------------------------------------------------- */
gsap.to("[data-parallax='0.15']", {
  yPercent: -15, ease: "none",
  scrollTrigger: { trigger: ".intro", start: "top bottom", end: "bottom top", scrub: true }
});

gsap.to("[data-spin]", {
  rotation: 360, ease: "none",
  scrollTrigger: { trigger: ".intro", start: "top bottom", end: "bottom top", scrub: 1 }
});

gsap.from("[data-mask] img", {
  scale: 1.3, ease: "none",
  scrollTrigger: { trigger: "[data-mask]", start: "top 90%", end: "bottom top", scrub: true }
});

/* ----------------------------------------------------------
   10. SHOWCASE — scroll horizontal pinned
   ---------------------------------------------------------- */
const hScrollSection = document.querySelector("[data-h-scroll]");
const hTrack = document.querySelector("[data-h-track]");

if (hScrollSection && hTrack) {
  const getDistance = () => hTrack.scrollWidth - window.innerWidth + 80;

  gsap.to(hTrack, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: hScrollSection,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1,
      start: "top top",
      end: () => "+=" + getDistance(),
      invalidateOnRefresh: true
    }
  });
}

/* ----------------------------------------------------------
   11. PROCESS — pinned + stack de stickers
   ---------------------------------------------------------- */
const processSection = document.querySelector(".process");
const stickers = document.querySelectorAll(".sticker");
const steps    = document.querySelectorAll("[data-step]");

if (processSection && stickers.length) {
  const total = stickers.length;

  /* posicionamento inicial: stack apertado */
  stickers.forEach((s, i) => {
    const depth = i; // 0 = front, total-1 = back
    gsap.set(s, {
      zIndex: total - depth,
      rotate: depth === 0 ? 0 : (depth % 2 === 0 ? depth * 1.2 : depth * -1.2),
      x: depth * 4,
      y: depth * 6,
      scale: 1 - depth * 0.025,
      opacity: 1,
      transformOrigin: "center center"
    });
  });

  /* Timeline única atrelada ao pin — evita o bug dos ScrollTriggers
     separados firarem em posições calculadas erradas. Cada transição
     (sticker i sai + sticker i+1 avança) ocupa um "slot" do scrub. */
  const processTl = gsap.timeline({
    scrollTrigger: {
      trigger: processSection,
      start: "top top",
      end: () => "+=" + ((total - 1) * window.innerHeight * 0.9),
      pin: ".process__sticky",
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(total - 1, Math.round(self.progress * (total - 1)));
        steps.forEach((step, i) => step.classList.toggle("is-active", i === idx));
      }
    }
  });

  stickers.forEach((s, i) => {
    if (i === total - 1) return;
    /* sticker da frente sai pra cima */
    processTl.to(s, {
      yPercent: -130,
      rotate: -12,
      opacity: 0,
      ease: "power2.in",
      duration: 1
    }, i);
    /* próximo sticker avança pra posição central simultaneamente */
    processTl.to(stickers[i + 1], {
      x: 0, y: 0, rotate: 0, scale: 1,
      ease: "power2.out",
      duration: 1
    }, i);
  });
}

/* ----------------------------------------------------------
   12. FEATURED — parallax forte do fundo
   ---------------------------------------------------------- */
gsap.to("[data-parallax-bg]", {
  yPercent: 20, scale: 1.15, ease: "none",
  scrollTrigger: { trigger: ".featured", start: "top bottom", end: "bottom top", scrub: true }
});

gsap.from(".featured__content", {
  opacity: 0, y: 60, duration: 1.2, ease: "power3.out",
  scrollTrigger: { trigger: ".featured", start: "top 60%", toggleActions: "play none none reverse" }
});

/* ----------------------------------------------------------
   13. STATS — contadores
   ---------------------------------------------------------- */
document.querySelectorAll("[data-counter]").forEach((el) => {
  const target = parseInt(el.dataset.counter, 10);
  const obj = { val: 0 };

  ScrollTrigger.create({
    trigger: el, start: "top 85%", once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target, duration: 2, ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(obj.val); }
      });
    }
  });
});

/* ----------------------------------------------------------
   14. TESTIMONIALS — carrossel infinito com boost por scroll
   ---------------------------------------------------------- */
const tTrack = document.querySelector("[data-testimonials-track]");
if (tTrack) {
  /* duplica o conteúdo pra loop sem corte */
  tTrack.innerHTML = tTrack.innerHTML + tTrack.innerHTML;

  const trackWidth = () => tTrack.scrollWidth / 2;

  const carousel = gsap.to(tTrack, {
    x: () => -trackWidth(),
    duration: 50,
    ease: "none",
    repeat: -1,
    modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % -trackWidth()) }
  });

  /* boost suave com a velocidade do scroll */
  ScrollTrigger.create({
    trigger: ".quote",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const v = self.getVelocity() / 1000;
      gsap.to(carousel, { timeScale: 1 + Math.abs(v), duration: .4, overwrite: true });
    },
    onLeave:    () => gsap.to(carousel, { timeScale: 1, duration: .5 }),
    onLeaveBack:() => gsap.to(carousel, { timeScale: 1, duration: .5 })
  });
}

/* ----------------------------------------------------------
   15. ANCHOR LINKS via Lenis
   ---------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target, { offset: -60, duration: 1.5 });
    }
  });
});

/* ----------------------------------------------------------
   16. REFRESH ao redimensionar (importante p/ pin/horizontal)
   ---------------------------------------------------------- */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
});
