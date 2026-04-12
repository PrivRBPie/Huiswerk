# Staartdeling Avontuur

![Pages deploy](https://github.com/pribrbpie/Huiswerk/actions/workflows/deploy-pages.yml/badge.svg)

Een mobiele (iPhone-vriendelijke) oefenapp voor klassieke staartdelingen.

## GitHub Pages en 404 oplossen


> Let op: deploy naar GitHub Pages draait automatisch bij elke push naar `main`.

Top dat je de repo op **public** hebt gezet ✅

Als je op `https://<gebruikersnaam>.github.io/Huiswerk/` nog een 404 krijgt, controleer:

1. In **Settings → Pages** staat de bron op **GitHub Actions**.
2. Push je laatste wijzigingen naar **main** (deploy start automatisch).
3. Open exact deze URL: `https://<gebruikersnaam>.github.io/Huiswerk/`.
4. Wacht 1-3 minuten na een deploy (DNS/cache kan even duren).

De deploy-workflow controleert nu automatisch of de live-URL bereikbaar is (met retries).

## Lokaal starten

Open `index.html` direct in je browser, of start een simpele server:

```bash
python3 -m http.server 8000
```

Daarna naar `http://localhost:8000`.


## PR-opmerking

Gebruik bij voorkeur een nieuwe PR vanaf de opgeschoonde `work` branch (single-commit) om merge-conflicts te minimaliseren.
