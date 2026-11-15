# Aditya Baranwal — AI/ML portfolio

A responsive, buildless portfolio for freelance clients and recruiters. All deployable files are in `dist/`.

## Local preview

Run `node serve.mjs` and visit http://127.0.0.1:4173.

## Editing

- `dist/index.html`: identity, services, experience, contact links, qualifications.
- `dist/styles.css`: responsive design and visual styling.
- `dist/services.css`: featured freelance case study and expanded service descriptions.
- `dist/app.js`: project details, filtering, accessible dialogs, and browser-local project brief creation.
- `dist/resume.pdf`: supplied resume, downloadable from the About section.
- `.openai/hosting.json`: Sites identity and static hosting configuration.

The site uses LinkedIn as the contact route. Project briefs are only copied or downloaded locally; there is no form backend or data collection. Fonts load from Google Fonts with system fallbacks. Project diagrams are illustrative. Professional metrics are attributed to the supplied resume. The featured real estate freelance case study is based on the supplied implementation account, with qualitative benefits and no invented client names, testimonials, or performance metrics. Expanded services describe prospective engagements, with related completed work linked separately.

## Deploy on Render

Use a Render Static Site linked to a Git repository containing this source.
The included render.yaml configures the site as a Blueprint.

For manual setup use the following fields.

- Build command: echo "Static files are ready"
- Publish directory: dist
- Environment variables: none required

The site contains public portfolio content and a phone-redacted resume.
