# Design Spec — CRAFTY Mobile Optimization
**Data:** 2026-05-17  
**Status:** Aprovado

## Context

O site CRAFTY usa GSAP + ScrollTrigger + Lenis + SplitType. As seções desktop funcionam bem, mas mobile apresentava:
1. Menu de navegação sem links (sumia abaixo de 900px)
2. Showcase (02) com scroll horizontal GSAP — não adequado para touch
3. Process (03) com pin + sticker stack quebrando em mobile
4. Animações pesadas sem adaptação para touch

## Decisões de Design

| Área | Mobile (< 900px) | Desktop (≥ 900px) |
|------|-----------------|-------------------|
| Nav | Hamburger menu overlay | Menu horizontal atual |
| Showcase 02 | Scroll-snap nativo | GSAP horizontal pinado |
| Process 03 | Vertical + fade-in | Pin + sticker stack |
| Parallax, word reveal | Mantidos | Mantidos |
| Lenis | Mantido | Mantido |

## A. Hamburger Menu

**HTML:**
```html
<!-- dentro do <nav> -->
<button class="nav__hamburger" aria-label="Menu" aria-expanded="false">
  <span></span><span></span><span></span>
</button>

<!-- overlay após o <nav> -->
<div class="nav__mobile" aria-hidden="true">
  <ul class="nav__mobile-menu">
    <li><a href="#intro">História</a></li>
    ...
  </ul>
  <a class="btn btn--primary" href="#contact">Encomendar →</a>
</div>
```

**CSS:**
- `.nav__hamburger`: 44×44px touch target, 3 barras, só visível abaixo de 900px
- `.nav__mobile`: `position:fixed; inset:0; z-index:150; background:var(--bg-dark)`, `opacity:0; pointer-events:none`, transition `.4s`
- `.nav__mobile.is-open`: `opacity:1; pointer-events:all`
- Links em stagger via CSS delay ou GSAP

**JS:**
- Toggle `.is-open` no click do hamburger
- `aria-expanded` e `aria-hidden` atualizados
- Click em link fecha o menu + usa `lenis.scrollTo(target)`
- `body.is-menu-open { overflow:hidden }` para travar scroll

## B. Showcase 02 — Scroll-snap no mobile

**CSS (max-width: 900px):**
```css
/* desativa height fixo do pin container */
.showcase__pin { height: auto; overflow: visible; }
/* scroll nativo */
.showcase__track {
  overflow-x: scroll; scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 2rem clamp(1.5rem,4vw,3rem);
  align-items: stretch;
}
.showcase__track::-webkit-scrollbar { display: none; }
.card { scroll-snap-align: start; width: 82vw; flex: 0 0 82vw; height: auto; min-height: 70vw; }
```

**JS:** `gsap.matchMedia()` — no mobile, pular o bloco `if (hScrollSection && hTrack)` (não criar ScrollTrigger).

## C. Process 03 — Vertical + fade no mobile

**CSS (max-width: 900px):**
```css
.process__sticky { height: auto; padding: 8vh 1.5rem; }
.process__stack { position: relative; display: flex; flex-direction: column; gap: 1.5rem; height: auto; }
.sticker { position: relative; inset: auto; height: 60vw; opacity: 0; transform: translateY(20px); }
.process__list li { opacity: 1; } /* todos visíveis */
```

**JS:** `gsap.matchMedia()` — no mobile, pular o pin da `.process`, e em vez disso usar `gsap.to(sticker, { opacity:1, y:0, scrollTrigger:{ trigger: sticker, start:'top 85%', once:true } })` para cada sticker individualmente.

## Arquivos Modificados

- `index.html` — hamburger button + `.nav__mobile` overlay
- `styles.css` — hamburger, overlay, showcase scroll-snap, process vertical
- `script.js` — `gsap.matchMedia()`, hamburger JS

## Verificação

1. Viewport 375px (iPhone): hamburger abre, links navegam, fecha ao clicar
2. Scroll até showcase: swipe horizontal funciona, cards snappam
3. Scroll até process: 4 stickers aparecem verticalmente com fade
4. Viewport 1440px: tudo igual ao comportamento atual
5. prefers-reduced-motion: animações respeitadas
