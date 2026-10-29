# Shea: a skin scan that knows deep skin

Shea is a skincare and style assistant built for melanin-rich skin, starting in Accra. It runs on the **YouCam API** (Perfect Corp.):

1. **Skin Analysis** (`/s2s/v2.0/task/skin-analysis`, SD, 8 concerns, 12 units) scores dark marks (PIH), under-eye darkness, oil, breakouts, texture, pores, hydration and radiance.
2. **Skin Tone Analysis** (`/task/skin-tone-analysis`, 20 units) returns the measured skin colour.
3. **Clothes Virtual Try-On** (`/task/cloth-v4`, 2 units) puts a ranked garment on your full-length photo.

A small, transparent **agent** (`shared/agent.ts`) turns those readings into a plan. Each step appears in the UI as Observe → Reason → Guard → Act:

- It re-weights concerns for deep skin, so PIH and uneven tone come first.
- It builds AM and PM routines that always include SPF.
- It **refuses** products Ghana FDA does not permit in cosmetics: hydroquinone, mercury and potent steroids, each with its reason.
- It ranks garments by WCAG contrast against the measured skin colour, then gives you a starter basket priced in GH₵.

## Run it

```bash
npm install
cp .env.example .env     # add YOUCAM_API_KEY to enable live mode
npm run dev              # web on :9300, API on :9301
npm test                 # vitest: agent, colour, and API routes with a mocked YouCam
npm run build            # type-check, Vite build, prerender the first paint
```

**Demo vs live:**

- **Demo mode** (no key): the scan returns sample results for the bundled portrait, and the page labels them as such. Try-on says it needs a key and never fakes a render.
- **Live mode**: set `YOUCAM_API_KEY` on the server. The key never reaches the browser.
  - Uploads are cached by SHA-1, so the same photo is only uploaded once.
  - Daily unit caps protect the credit balance: `YOUCAM_DAILY_UNIT_CAP` and `YOUCAM_PER_IP_DAILY`.

## Stack

- Vite, React 19, TypeScript, Tailwind 4, Framer Motion and Lenis.
- One Vercel serverless function (`server/vercel.ts`) proxies the YouCam API. `server/dev.ts` runs the same core locally.

## Privacy and safety

- Photos go only to YouCam for analysis, and Shea does not store them.
- Shea is not medical advice. For anything persistent or painful, see a dermatologist.

## Photo credits

All photos are from Pexels, used under the Pexels licence:

- face: [Evlogia Pictures / Pexels](https://www.pexels.com/photo/portrait-of-beautiful-woman-smiling-12626141/)
- body: [Marlon Schmeiski / Pexels](https://www.pexels.com/photo/african-woman-posing-in-a-studio-20610322/)
- mirror: [Ron Lach / Pexels](https://www.pexels.com/photo/woman-with-black-hair-and-red-lipstick-9442300/)
- patches: [Anna Shvets / Pexels](https://www.pexels.com/photo/young-peaceful-black-woman-with-golden-patches-under-eyes-3852192/)
- market: [Reagan Agyei Mensah / Pexels](https://www.pexels.com/photo/african-market-scene-with-woman-carrying-basket-36537041/)
- weave: [Benjamin K Ashley-Lassen / Pexels](https://www.pexels.com/photo/traditional-kente-weaving-in-accra-ghana-36773397/)
- portrait: [Nemmy Media / Pexels](https://www.pexels.com/photo/portrait-of-woman-wearing-golden-jewelry-22619770/)
- g-linen: [dayong tien / Pexels](https://www.pexels.com/photo/shirt-on-hanger-on-branch-22441297/)
- g-sage-tee: [Ron Lach / Pexels](https://www.pexels.com/photo/fashion-shopping-indoors-no-people-9594692/)
- g-olive-shirt: [Ron Lach / Pexels](https://www.pexels.com/photo/person-holding-green-dress-shirt-9594952/)
- g-rose-shirt: [MART PRODUCTION / Pexels](https://www.pexels.com/photo/hanging-of-pink-shirt-on-a-clothing-rack-9558711/)
- g-floral-dress: [Lisa Fotios / Pexels](https://www.pexels.com/photo/dress-hanging-and-drying-on-windows-16427119/)

## Licence

MIT. See LICENSE.
