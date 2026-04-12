# Staartdeling Avontuur

![Pages deploy](https://github.com/pribrbpie/Huiswerk/actions/workflows/deploy-pages.yml/badge.svg)

Een mobiele (iPhone-vriendelijke) oefenapp voor klassieke staartdelingen.

## GitHub Pages en 404 oplossen

Top dat je de repo op **public** hebt gezet ✅

Als je op `https://<gebruikersnaam>.github.io/Huiswerk/` nog een 404 krijgt, controleer:

1. In **Settings → Pages** staat de bron op **GitHub Actions**.
2. De workflow **Deploy static app to GitHub Pages** is succesvol afgerond (groene check).
3. Open exact deze URL: `https://<gebruikersnaam>.github.io/Huiswerk/`.
4. Wacht 1-3 minuten na de eerste succesvolle deploy (DNS/cache kan even duren).

## Lokaal starten

Open `index.html` direct in je browser, of start een simpele server:

```bash
python3 -m http.server 8000
```

Daarna naar `http://localhost:8000`.
