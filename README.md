# Verdant & Stone: premium landscaping website

A static, single-page landscaping site template, ready to pitch. Open `index.html` in a browser. No build step.

## What's inside
- Cinematic hero with intro loader, masked headline reveal and Ken Burns zoom
- Proof bar with animated counters and a marquee of awards
- Philosophy text whose words highlight as you scroll
- Three customer paths (Residential / Commercial / Care); each one pre-fills the quote form
- Pinned horizontal project gallery on desktop, stacked cards on mobile
- Draggable before/after slider
- 4-step process with a scroll-driven progress line
- Rotating testimonials, then a multi-step lead form (project → budget → timeline → contact)
- Sticky mobile call/quote bar, schema.org LocalBusiness data, reduced-motion support

Libraries: GSAP + ScrollTrigger and Lenis, bundled in `assets/vendor/` (no CDN needed).

## Rebranding for a client
1. Replace the name, phone, address and service area in `index.html` and the JSON-LD block.
2. Swap the Unsplash photo URLs for the client's own project photos. Use a real before/after pair in `.ba__slider`.
3. Replace the placeholder stats, awards and testimonials with real ones. Never ship invented claims.
4. Change the colours in the `:root` tokens in `assets/css/styles.css`.
5. Connect the form: in `assets/js/main.js`, look for `Lead captured` and post to the client's CRM or a form service.
