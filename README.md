# Staartdeling Avontuur (iPhone via website)

Ja: je kunt dit project direct op **GitHub Pages** hosten, zodat je op je iPhone gewoon naar een URL gaat.

## 1) Eenmalig instellen

1. Push deze repo naar GitHub.
2. Zorg dat je default branch **main** heet (of pas de workflow aan).
3. Ga in GitHub naar **Settings → Pages**.
4. Bij **Source** kies je: **GitHub Actions**.

Daarna publiceert de workflow automatisch bij elke push naar `main`.

## 2) URL op iPhone

Na een succesvolle run vind je de site op:

- `https://<jouw-gebruikersnaam>.github.io/<repo-naam>/`

Open deze URL in Safari op je iPhone.

## 3) Als app op beginscherm zetten (optioneel)

In Safari:

1. Open de Pages-URL.
2. Tik op **Delen**.
3. Kies **Zet op beginscherm**.

Dan opent de app fullscreen (PWA-achtig gedrag).

## 4) Let op bij subpad op GitHub Pages

Omdat GitHub Pages meestal onder `/<repo-naam>/` draait, werken relatieve paden in deze app goed.

## 5) Lokale test

```bash
python3 -m http.server 8080
```

Ga dan naar `http://localhost:8080`.
