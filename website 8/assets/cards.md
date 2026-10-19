# Kavach card design (v2)

Replaces the old flat cards (`bg-sand rounded-2xl p-6 shadow-md` + square cream icon tile). Goal: clean, premium, professional. Same colours: brown #2B1B12 (`brown`), sand #DCC5B8 (`sand`), cream #FFF6F0 (`cream`). Montserrat.

## 1. Feature card (default)
Use for risks, add-on covers, values, services, offices, team, etc.

```html
<article class="group relative bg-white rounded-2xl border border-brown/10 p-7 transition-all duration-300 hover:border-brown/25 hover:shadow-[0_18px_40px_-22px_rgba(43,27,18,0.45)]">
  <div class="flex items-start justify-between">
    <span class="w-11 h-11 rounded-full bg-brown text-cream flex items-center justify-center">
      <!-- existing icon svg, w-5 h-5 -->
    </span>
    <span class="text-xs font-bold text-brown/30 tracking-widest">01</span>   <!-- running number, 01, 02… -->
  </div>
  <h3 class="mt-6 text-lg font-bold">Title</h3>
  <p class="mt-2 text-sm leading-relaxed text-brown/70">Description</p>
  <!-- optional link row -->
  <a href="services.html#property" class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
    Learn more <span class="transition-transform group-hover:translate-x-1">→</span>
  </a>
  <span class="absolute left-7 right-7 bottom-0 h-0.5 bg-brown scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
</article>
```

On cream backgrounds the white card stands out; on white backgrounds use `bg-cream/60` instead of `bg-white`.

## 2. Dark feature card
For one section per page that sits on a brown band (`bg-brown text-cream`):

```html
<article class="rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:bg-white/[0.08]">
  <span class="w-11 h-11 rounded-full bg-cream text-brown flex items-center justify-center"><!-- icon --></span>
  <h3 class="mt-6 text-lg font-bold text-white">Title</h3>
  <p class="mt-2 text-sm leading-relaxed text-cream/70">Description</p>
</article>
```

## 3. Step card (numbered process)
Big outlined number, no icon, a thin connector line between steps on lg screens:

```html
<li class="relative bg-white rounded-2xl border border-brown/10 p-7">
  <span class="text-5xl font-extrabold text-transparent [-webkit-text-stroke:1.5px_#2B1B12] opacity-30">01</span>
  <h3 class="mt-4 text-lg font-bold">Title</h3>
  <p class="mt-2 text-sm leading-relaxed text-brown/70">Description</p>
</li>
```
Connector: `hidden lg:block absolute top-12 -right-3 w-6 h-px bg-brown/20` inside every step except the last.

## 4. Testimonial card
Quote first, person at the bottom:

```html
<figure class="flex flex-col bg-white rounded-2xl border border-brown/10 p-7">
  <div class="flex items-center gap-1 text-amber-500"> <!-- 5 small star svgs (w-4 h-4), dimmed (text-brown/15) for any missing --> </div>
  <blockquote class="mt-5 text-[15px] leading-relaxed">“…”</blockquote>
  <figcaption class="mt-auto pt-6 border-t border-brown/10 flex items-center gap-3">
    <span class="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-sm font-bold">SP</span>
    <div><div class="font-bold text-sm">Name</div><div class="text-xs text-brown/60">Company, City</div></div>
    <span class="ml-auto text-sm font-bold">5.0</span>
  </figcaption>
</figure>
```
(Add `mt-5` spacing so the figcaption sits at the bottom with `flex-col` + `h-full` cards in a grid.)

## Rules
- Equal heights in a row (`h-full` / grid stretch). Generous padding (p-7). Body text `text-brown/70`.
- Keep all existing text, links, ids, `data-*` attributes and JS hooks. Don't remove `data-no-lift` etc.
- Don't touch forms, the FAQ `<details>`, tables, the navbar, the footer, or the hero.
- Keep it mobile friendly (cards stack, no horizontal overflow at 390px).
- `assets/js/animations.js` adds a hover lift (`.lift`) to rounded cards with border/shadow; that is fine with this design.
