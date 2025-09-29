# Matma Henio

Prosty projekt przeglądarkowy pomagający w utrwalaniu tabliczki mnożenia. Repozytorium zawiera dwie miniaplikacje:

- **Poziomy z zadaniami** (`index.html`, `app.js`) – trzy zestawy losowo wybieranych zadań z tabliczki mnożenia.
- **Wyzwanie z tabliczką** (`tabliczka.html`, `table.js`) – tabela 10×10 z losowo ukrytymi wynikami do uzupełnienia.

## Uruchomienie lokalne

Do lokalnego testowania wystarczy Node.js w wersji 18 lub nowszej. Projekt nie ma zależności zewnętrznych, więc nie trzeba instalować paczek.

```bash
node server.js
```

Po uruchomieniu w przeglądarce otwórz adres [http://localhost:3000](http://localhost:3000), aby przejść do strony głównej. Strona `tabliczka.html` jest dostępna pod adresem [http://localhost:3000/tabliczka.html](http://localhost:3000/tabliczka.html).

### Zmiana portu

Jeśli port `3000` jest zajęty, ustaw zmienną środowiskową `PORT`, np.:

```bash
PORT=4000 node server.js
```

## Szukanie błędów

1. Otwórz narzędzia deweloperskie w przeglądarce (zazwyczaj klawisz <kbd>F12</kbd> lub <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>).
2. Na zakładce **Console** sprawdzaj, czy pojawiają się komunikaty o błędach JavaScript.
3. W zakładce **Network** upewnij się, że wszystkie pliki statyczne (HTML, CSS, JS, czcionki) wczytują się poprawnie – status `200`.
4. Przetestuj wprowadzanie poprawnych i niepoprawnych odpowiedzi w zadaniach oraz w tabeli.
5. Zweryfikuj komunikaty o ukończeniu poziomu oraz o wypełnieniu całej tablicy.

W razie wykrycia problemu możesz go zreprodukować, zapisując kroki i wartości wprowadzane podczas testów, a następnie zgłosić w Pull Requeście.
