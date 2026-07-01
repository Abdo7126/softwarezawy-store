# SoftwareZawy AI Subscriptions Store

Static RTL-first website for selling AI subscription plans through WhatsApp order flow.

## Pages

- `index.html`: home page with dynamic AI sections.
- `softwarezawy-store.html`: all subscriptions with search and filtering.
- `softwarezawy-section.html?section=writing`: dynamic category page.
- `softwarezawy-cart.html`: cart and WhatsApp checkout.
- `softwarezawy-info.html`: support and policies.
- `softwarezawy-admin.html`: admin login.

## Admin

Default local demo login:

- Username: `admin`
- Password: `admin123`

Important: this is a static site. Admin edits are saved in the current browser `localStorage`. To make changes public for all visitors, copy the final data into `assets/softwarezawy-data.js` before uploading.

## Visual Sections

Open `softwarezawy-admin-visual.html` after login. You can:

- Add more homepage sections.
- Change each section title, description, icon, gradient, order, and visibility.
- Use the generated link `softwarezawy-section.html?section=SECTION_ID`.

## GitHub Pages

Upload all files to the repository root. Keep relative links as they are. Add a `CNAME` file only if you have a custom domain.
