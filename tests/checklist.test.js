// Checklist unit test for websites 7, 8 and 9.
// Run from the repo root:  node --test tests/
// No dependencies: pages are checked as static HTML, validators are loaded as modules.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
// extra: client-specific pages; dashboard: whether the client asked for login + dashboard
const SITES = {
  'website 7': { extra: ['calculator.html'], dashboard: true },
  'website 8': { extra: [], dashboard: true },
  'website 9': { extra: [], dashboard: true },
  'website 13': { extra: ['case-studies.html'], dashboard: false },
};
const BASE_PAGES = ['index.html', 'home-2.html', 'about.html', 'services.html', 'blog.html', 'contact.html'];
const DASHBOARD_PAGES = ['login.html', 'dashboard.html'];
const AUTH_PAGES = ['login.html'];
const APP_PAGES = ['dashboard.html']; // own app chrome, not the marketing header/footer
const MAX_IMAGE_BYTES = 300 * 1024;

const read = (file) => fs.readFileSync(file, 'utf8');
const stripScripts = (html) => html.replace(/<script\b[\s\S]*?<\/script>/gi, '');

// Returns the full element (open tag .. matching close tag) for the first tag that matches `attrRe`.
function findElement(html, tag, attrRe) {
  const open = new RegExp(`<${tag}\\b[^>]*${attrRe}[^>]*>`, 'i');
  const m = open.exec(html);
  if (!m) return null;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = m.index;
  let depth = 0, t;
  while ((t = re.exec(html))) {
    depth += t[1] ? -1 : 1;
    if (depth === 0) return html.slice(m.index, re.lastIndex);
  }
  return html.slice(m.index);
}

function findAll(html, tag, attrRe) {
  const out = [];
  let rest = html;
  for (;;) {
    const el = findElement(rest, tag, attrRe);
    if (!el) break;
    out.push(el);
    rest = rest.slice(rest.indexOf(el) + el.length);
  }
  return out;
}

const attr = (tagHtml, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tagHtml);
  return m ? m[1] : null;
};
const openTag = (el) => el.slice(0, el.indexOf('>') + 1);
const imgSrcs = (html) => [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => ({ tag: m[0], src: attr(m[0], 'src') }));

for (const [site, { extra, dashboard }] of Object.entries(SITES)) {
  const dir = path.join(ROOT, site);
  const pages = [...BASE_PAGES, ...(dashboard ? DASHBOARD_PAGES : []), ...extra];
  const html = {};
  for (const p of pages) if (fs.existsSync(path.join(dir, p))) html[p] = stripScripts(read(path.join(dir, p)));
  const marketing = pages.filter((p) => !AUTH_PAGES.includes(p) && !APP_PAGES.includes(p));

  describe(site, () => {
    it('has every required page', () => {
      for (const p of pages) assert.ok(html[p], `missing ${p}`);
    });

    describe('1. Global / branding', () => {
      it('every page links a favicon that exists', () => {
        for (const p of pages) {
          const link = /<link\b[^>]*rel="(?:shortcut )?icon"[^>]*>/i.exec(html[p]);
          assert.ok(link, `${p}: no favicon link`);
          assert.ok(fs.existsSync(path.join(dir, attr(link[0], 'href'))), `${p}: favicon file missing`);
        }
      });

      it('logo is identical on every page and links to the home page', () => {
        let ref = null;
        for (const p of pages) {
          const logo = findElement(html[p], 'a', 'data-logo');
          assert.ok(logo, `${p}: no [data-logo] link`);
          assert.equal(attr(openTag(logo), 'href'), 'index.html', `${p}: logo must link to index.html`);
          const inner = logo.replace(/\s+/g, ' ');
          ref ??= inner;
          assert.equal(inner, ref, `${p}: logo markup/size differs from other pages`);
        }
      });

      it('defines one shared primary CTA style', () => {
        const css = read(path.join(dir, 'assets/css/site.css'));
        assert.match(css, /\.btn-primary\s*[{,]/, 'assets/css/site.css must define .btn-primary');
      });

      it('no image is reused across different pages', () => {
        const seen = new Map();
        for (const p of pages) {
          for (const { src } of imgSrcs(html[p])) {
            if (!src || /logo|favicon/i.test(src)) continue;
            if (seen.has(src) && seen.get(src) !== p) assert.fail(`${src} used on ${seen.get(src)} and ${p}`);
            seen.set(src, p);
          }
        }
      });

      it('all images are local, exist, have alt text and are optimized', () => {
        for (const p of pages) {
          for (const { tag, src } of imgSrcs(html[p])) {
            assert.ok(src && !/^https?:/.test(src), `${p}: image must be local (${src})`);
            const file = path.join(dir, src);
            assert.ok(fs.existsSync(file), `${p}: missing image ${src}`);
            assert.ok(fs.statSync(file).size <= MAX_IMAGE_BYTES, `${p}: ${src} is over 300KB`);
            assert.ok(attr(tag, 'alt') !== null, `${p}: ${src} has no alt`);
          }
        }
      });
    });

    describe('2. Header / navigation', () => {
      it('navbar has a primary CTA, theme toggle and RTL toggle of the same size', () => {
        for (const p of marketing) {
          const header = findElement(html[p], 'header', '');
          assert.ok(header, `${p}: no <header>`);
          const cta = /<a\b[^>]*data-nav-cta[^>]*>/i.exec(header);
          const theme = /<button\b[^>]*data-theme-toggle[^>]*>/i.exec(header);
          const rtl = /<button\b[^>]*data-rtl-toggle[^>]*>/i.exec(header);
          assert.ok(cta && theme && rtl, `${p}: header needs [data-nav-cta], [data-theme-toggle], [data-rtl-toggle]`);
          assert.match(attr(cta[0], 'class') || '', /\bbtn-primary\b/, `${p}: nav CTA must use .btn-primary`);
          for (const el of [cta[0], theme[0], rtl[0]]) {
            assert.match(attr(el, 'class') || '', /\bnav-ctl\b/, `${p}: toggles and CTA must share .nav-ctl (same height/radius)`);
          }
        }
      });

      it('Home 1 and Home 2 are grouped under a Home dropdown', () => {
        for (const p of marketing) {
          const dd = findElement(html[p], '\\w+', 'data-home-dropdown');
          assert.ok(dd, `${p}: no [data-home-dropdown]`);
          assert.match(dd, /href="index\.html"/, `${p}: dropdown missing Home 1`);
          assert.match(dd, /href="home-2\.html"/, `${p}: dropdown missing Home 2`);
        }
      });

      it('every internal link points to a page that exists', () => {
        for (const p of pages) {
          for (const m of html[p].matchAll(/href="([^"]+)"/g)) {
            const href = m[1];
            if (/^(https?:|mailto:|tel:|#|javascript:)/.test(href)) continue;
            const target = href.split('#')[0].split('?')[0];
            if (!target) continue;
            assert.ok(fs.existsSync(path.join(dir, target)), `${p}: broken link ${href}`);
          }
          assert.ok(!/href="#"/.test(html[p]), `${p}: has a dead href="#" link`);
        }
      });
    });

    describe('3. Hero', () => {
      const heroes = {};
      it('home pages have a centered hero with a background image and at most 2 CTAs', () => {
        for (const p of ['index.html', 'home-2.html']) {
          const hero = findElement(html[p], 'section', 'data-hero');
          assert.ok(hero, `${p}: no section[data-hero]`);
          assert.match(hero, /text-center/, `${p}: hero content must be centered`);
          assert.match(hero, /<img\b|url\(/, `${p}: hero needs a background image`);
          const ctas = (hero.match(/<a\b[^>]*class="[^"]*\bbtn-/g) || []).length;
          assert.ok(ctas >= 1 && ctas <= 2, `${p}: hero has ${ctas} CTAs (allowed 1-2)`);
          heroes[p] = (/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(hero) || [])[1];
        }
        assert.notEqual(heroes['index.html'], heroes['home-2.html'], 'Home 1 and Home 2 heroes must differ');
      });
    });

    describe('4. Layout / content', () => {
      it('every testimonial card has a profile image', () => {
        let count = 0;
        for (const p of marketing) {
          for (const card of findAll(html[p], '\\w+', 'data-testimonial')) {
            count++;
            assert.match(card, /<img\b/, `${p}: testimonial card without profile image`);
          }
        }
        assert.ok(count > 0, 'no [data-testimonial] cards found');
      });

      it('supports dark theme and RTL', () => {
        const js = read(path.join(dir, 'assets/js/site.js'));
        assert.match(js, /classList\.toggle\(\s*['"]dark['"]/, 'site.js must toggle the dark class');
        assert.match(js, /['"]dir['"]/, 'site.js must switch dir=rtl');
      });
    });

    describe('5. Forms and validation', () => {
      const V = require(path.join(dir, 'assets/js/validation.js'));

      it('name rejects single characters and numbers', () => {
        for (const bad of ['', 'A', 'J0hn', '12345', 'Ravi 2', '  ']) assert.equal(V.name(bad), false, `name("${bad}")`);
        for (const ok of ['Al', 'Priya Sharma', "O'Neil", 'Anne-Marie']) assert.equal(V.name(ok), true, `name("${ok}")`);
      });

      it('email rejects missing @ or domain', () => {
        for (const bad of ['', 'user', 'user.com', 'user@', 'user@domain', '@domain.com', 'a b@c.com']) assert.equal(V.email(bad), false, `email("${bad}")`);
        for (const ok of ['a@b.co', 'first.last@company.in']) assert.equal(V.email(ok), true, `email("${ok}")`);
      });

      it('phone accepts digits only', () => {
        for (const bad of ['', '98765abcde', 'phone', '12345', '+91-98765']) assert.equal(V.phone(bad), false, `phone("${bad}")`);
        for (const ok of ['9876543210', '02212345678']) assert.equal(V.phone(ok), true, `phone("${ok}")`);
      });

      it('every form uses the shared validators', () => {
        for (const p of pages) {
          for (const form of findAll(html[p], 'form', '')) {
            const tag = openTag(form);
            assert.match(tag, /novalidate/, `${p}: form needs novalidate (JS validation)`);
            assert.match(tag, /data-validate-form/, `${p}: form needs data-validate-form`);
            for (const input of form.match(/<input\b[^>]*>/gi) || []) {
              const type = attr(input, 'type');
              if (type === 'email') assert.match(input, /data-validate="email"/, `${p}: email input not validated`);
              if (type === 'tel') assert.match(input, /data-validate="phone"/, `${p}: tel input not validated`);
              if (/name="[^"]*name"/i.test(input) && type !== 'hidden') assert.match(input, /data-validate="name"/, `${p}: name input not validated`);
            }
          }
          if (/<form\b/i.test(html[p])) assert.match(read(path.join(dir, p)), /validation\.js/, `${p}: validation.js not loaded`);
        }
      });
    });

    describe('6. Contact page', () => {
      it('has an FAQ and an embedded map', () => {
        const faq = findElement(html['contact.html'], '\\w+', 'data-faq');
        assert.ok(faq, 'no [data-faq] section');
        assert.ok((faq.match(/<details\b/g) || []).length >= 4, 'FAQ needs at least 4 questions');
        assert.match(html['contact.html'], /<iframe\b[^>]*src="https:\/\/(www\.)?google\.com\/maps/, 'no embedded Google map');
      });
    });

    describe('7. Footer', () => {
      it('has social icons and top-aligned columns', () => {
        for (const p of marketing) {
          const footer = findElement(html[p], 'footer', '');
          assert.ok(footer, `${p}: no <footer>`);
          const social = findElement(footer, '\\w+', 'data-social');
          assert.ok(social, `${p}: no [data-social] block`);
          const links = social.match(/<a\b[^>]*aria-label="[^"]+"[^>]*>/g) || [];
          assert.ok(links.length >= 3, `${p}: needs 3+ labelled social links`);
          assert.match(footer, /data-logo/, `${p}: footer needs the logo`);
          assert.match(footer, /items-start/, `${p}: footer columns must align to the top (items-start)`);
        }
      });
    });

    describe('8. Authentication page', () => {
      if (!dashboard) {
        it('no dashboard requested, so no login/dashboard pages or links', () => {
          for (const p of DASHBOARD_PAGES) assert.ok(!fs.existsSync(path.join(dir, p)), `${p} should not exist`);
          for (const p of pages) assert.ok(!/href="(login|dashboard)\.html/.test(html[p]), `${p}: links to login/dashboard`);
        });
        return;
      }
      it('login has no header/footer, offers sign up, Google and Apple', () => {
        const page = html['login.html'];
        assert.ok(!/<header\b/i.test(page), 'login.html must not have a <header>');
        assert.ok(!/<footer\b/i.test(page), 'login.html must not have a <footer>');
        assert.match(page, /sign[\s-]?up/i, 'login.html needs a sign-up option');
        const social = findElement(page, '\\w+', 'data-social-login');
        assert.ok(social, 'no [data-social-login] block');
        assert.match(social, /Google/, 'no Google sign-in');
        assert.match(social, /Apple/, 'no Apple sign-in');
        assert.match(openTag(social), /justify-center/, 'social login buttons must be centered');
      });
    });

    describe('9. Responsive / performance', () => {
      it('every page has a viewport meta and smooth scrolling', () => {
        for (const p of pages) {
          assert.match(html[p], /<meta\b[^>]*name="viewport"/, `${p}: no viewport meta`);
          assert.match(html[p], /<html\b[^>]*scroll-smooth/, `${p}: <html> needs scroll-smooth`);
        }
      });

      it('below-the-fold images are lazy loaded', () => {
        for (const p of pages) {
          const imgs = imgSrcs(html[p]).filter(({ src }) => !/logo|favicon/i.test(src || ''));
          const lazy = imgs.filter(({ tag }) => /loading="lazy"/.test(tag)).length;
          assert.ok(imgs.length - lazy <= 2, `${p}: only the hero/first images may skip loading="lazy"`);
        }
      });
    });
  });
}
