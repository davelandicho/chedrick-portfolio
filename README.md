# Chedrick Salazar Portfolio

Static portfolio built from the **REVAMP E-PORTFOLIO** Figma file (home frame, Projects, Certificates, and the Let's Connect overlay), including its prototype interactions.

- `index.html` home page: hero, expertise, about and experience, skills, impact, FAQ, certificates, contact footer
- `projects.html` project cards
- `certificates.html` all certificates
- `styles.css` all styles; colors, fonts and shadows are CSS variables at the top (light and dark themes)
- `script.js` theme toggle, sticky nav, mobile menu, Figma prototype interactions, star ratings, FAQ, and the Let's Connect form
- `img/` photos, certificates, tool logos and icons exported from the Figma file

Open `index.html` in a browser, or upload the folder to any static host (GitHub Pages, Netlify, Vercel).

## Prototype interactions (from Figma)
- **Home / Expertise / Impact** smooth-scroll on the home page (ease-out, 300 / 200 / 300 ms). From the other pages they go back to the home page section.
- **Project** and **Certificate** open `projects.html` and `certificates.html`. **View All** goes to the certificates page.
- **Let's Talk** opens the Let's Connect panel: it slides in from the right over a 70% black backdrop and closes on an outside click, the × button, or Esc. **Send Message** opens the visitor's email app with the message filled in, since a static site has no server to send mail.

## Fonts
Satoshi (Fontshare) for nearly everything, Inter for a few small labels, and Geist on the project cards, as in the Figma file.

## Still to fill in
- Social links: replace `YOUR-HANDLE` in the Instagram, LinkedIn and GitHub links (hero photo and footer, on all three pages)
- Projects: real descriptions, screenshots and Visit links (the Figma has lorem ipsum and only one screenshot). See the comment in `projects.html`.
- FAQ answers: the Figma only has the questions, so the answers in `index.html` are drafts to rewrite in your own words
- IBM UI/UX Designer certificate: add its Coursera verify link as a View Article button (comment in the markup)
- Experience: older roles can be added to the list; the Show All button appears automatically once there are more than three
