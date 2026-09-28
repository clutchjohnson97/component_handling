# Component Handling — PCI Chapter 8

A small React calculator for precast concrete component handling, built
around PCI Design Handbook (8th ed.) Chapter 8, "Design for Handling and
Erection."

Three modules:

- **Flat-Panel Stripping** — 4-point and 8-point equal-load pickup, moment
  coefficients, flexural cracking check, and lifter/anchor capacity check
  per §8.3. This reproduces the methodology of the included Mathcad
  reference sheet.
- **Tilt-Up Erection** — flexural stress during rotation from horizontal to
  vertical, amplified by editable dynamic/impact factors, plus an insert
  capacity check at an actual rigging angle.
- **Lifting Insert** — concrete-strength adjustment and angled-pick
  resolution for a single embedded lifting anchor.

Every result reports the governing formula, the demand-to-capacity ratio,
and an OK/NG verdict, alongside a plan and force diagram for the flat-panel
stripping case.

> This tool is for preliminary design and checking. It does not replace
> review by a licensed engineer or the manufacturer's rated hardware
> literature.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds the app and publishes it to
GitHub Pages on every push to `main`.

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).
4. The app will be live at `https://<your-username>.github.io/<repo-name>/`.

To link it from your GitHub profile, pin the repo on your profile page, or
add the Pages URL to your profile README.

## Reference

PCI Design Handbook: Precast and Prestressed Concrete, 8th ed., Chapter 8
— Design for Handling and Erection, §8.3 (flat panel stripping) and §8.4
(dynamic/impact considerations).
