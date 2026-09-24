# gardenoflove3.com

Sito vetrina di **The Garden of Love** e della sua app **Il Giardino del Cuore**.
HTML/CSS/JS statici, pubblicati con GitHub Pages; nessun build.

- `index.html` — pagina unica, bilingue: ogni testo c'è in `lang="it"` e `lang="en"`,
  `js/sito.js` mostra la lingua del browser (o quella scelta col pulsante IT/EN).
- Progetti attivi: letti dal vivo dalla tabella `campagne` di Supabase (stessa dell'app,
  si aggiornano dal pannello admin); senza rete resta il contenuto statico.
- Font ospitati in `fonts/` (niente richieste a Google), nessun cookie, nessun tracciamento.
- `privacy.html`, `termini.html`, `elimina-account.html`: copie di `docs/legale` del repo
  dell'app (lì la fonte).
- `?anteprima` nell'indirizzo mostra tutto senza animazioni (per screenshot a pagina intera).

Quando l'app sarà su Google Play: sostituire il pulsante «Presto su Google Play» in
`index.html` (sezione `#app`) con il link alla scheda.
