// The Garden of Love — lingua, animazioni all'apparire, campagne dal vivo.

// Stesso progetto Supabase dell'app. La chiave "anon" è pubblica per
// definizione (è anche nell'app): permette solo le letture consentite dalle
// regole del database, qui le campagne attive.
const SUPABASE_URL = 'https://drhbznklwwlrsrikgrvr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaGJ6bmtsd3dscnNyaWtncnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDgzMTEsImV4cCI6MjA5ODkyNDMxMX0.MQm5TrflJsLVTp6apmnkPNWdaEHApmXuRFIDcW7MeDo';

// ---------- lingua ----------
function leggiLingua() {
  try {
    const salvata = localStorage.getItem('lingua');
    if (salvata === 'it' || salvata === 'en') return salvata;
  } catch (_) { /* archiviazione non disponibile */ }
  return (navigator.language || 'en').toLowerCase().startsWith('it') ? 'it' : 'en';
}

// La lingua si salva solo quando la sceglie chi visita (pulsante IT/EN);
// altrimenti segue quella del browser.
function impostaLingua(l, salva = false) {
  document.documentElement.dataset.lingua = l;
  document.documentElement.lang = l;
  const b = document.getElementById('cambia-lingua');
  if (b) b.textContent = l === 'it' ? 'EN' : 'IT';
  if (salva) {
    try { localStorage.setItem('lingua', l); } catch (_) { /* pazienza */ }
  }
}

impostaLingua(leggiLingua());
if (new URLSearchParams(location.search).has('anteprima')) {
  document.documentElement.classList.add('anteprima');
}
document.addEventListener('DOMContentLoaded', () => {
  impostaLingua(document.documentElement.dataset.lingua);
  document.getElementById('cambia-lingua')?.addEventListener('click', () =>
    impostaLingua(document.documentElement.dataset.lingua === 'it' ? 'en' : 'it', true));
  osservaApparizioni();
  caricaCampagne();
});

// ---------- animazioni all'apparire ----------
function osservaApparizioni(radice = document) {
  const elementi = radice.querySelectorAll('.appare:not(.visibile)');
  if (!('IntersectionObserver' in window)) {
    elementi.forEach((e) => e.classList.add('visibile'));
    return;
  }
  const oss = new IntersectionObserver((voci) => {
    for (const v of voci) {
      if (v.isIntersecting) { v.target.classList.add('visibile'); oss.unobserve(v.target); }
    }
  }, { threshold: 0.12 });
  elementi.forEach((e) => oss.observe(e));
}

// ---------- campagne ----------
const euro = (n) => new Intl.NumberFormat('it-IT', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
}).format(n);

function testo(t) {
  const d = document.createElement('div');
  d.textContent = t ?? '';
  return d.innerHTML;
}

async function caricaCampagne() {
  const box = document.getElementById('campagne');
  if (!box) return;
  try {
    const r = await fetch(
      SUPABASE_URL + '/rest/v1/campagne?select=slug,titolo,sottotitolo,testo,link_donazione,obiettivo,' +
      'raccolto,numero_donazioni,importi_aggiornati_il,immagine_copertina,immagini' +
      '&attiva=eq.true&order=ordine.asc',
      { headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + SUPABASE_ANON } });
    if (!r.ok) return;
    const campagne = await r.json();
    if (!campagne.length) return;
    box.innerHTML = campagne.map((c) => {
      const foto = c.immagine_copertina || (c.immagini || [])[0] || '';
      const quota = c.obiettivo ? Math.min(100, (c.raccolto / c.obiettivo) * 100) : null;
      const primo = (c.testo || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
        .find((p) => p.length > 150) || '';
      const gofundme = (c.link_donazione || '').includes('gofundme.com');
      const data = c.importi_aggiornati_il
        ? new Date(c.importi_aggiornati_il).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;
      const link = encodeURI(c.link_donazione || '');
      const ancora = testo(c.slug || '');
      return `
      <article class="campagna appare" id="${ancora}">
        <a class="foto" href="${link}" target="_blank" rel="noopener" aria-label="${testo(c.titolo)}"
           style="background-image:url('${encodeURI(foto)}')"></a>
        <div class="corpo">
          <h3><a class="titolo-campagna" href="${link}" target="_blank" rel="noopener">${testo(c.titolo)}</a></h3>
          ${c.sottotitolo ? `<p style="color:var(--grigio);margin:0">${testo(c.sottotitolo)}</p>` : ''}
          ${quota !== null ? `<div class="barra-progresso" role="progressbar" aria-valuemin="0" aria-valuemax="100"
               aria-valuenow="${Math.round(quota)}"><span data-quota="${quota}"></span></div>` : ''}
          <p class="importi">${euro(c.raccolto)}
            <small><span lang="it">raccolti</span><span lang="en">raised</span>
            ${c.obiettivo ? `<span lang="it">su</span><span lang="en">of</span> ${euro(c.obiettivo)}` : ''}
            ${c.numero_donazioni ? ` · ${c.numero_donazioni} <span lang="it">donazioni</span><span lang="en">donations</span>` : ''}
            ${data ? `<br><span lang="it">aggiornato al</span><span lang="en">updated</span> ${data}` : ''}</small></p>
          <p>${testo(primo)}</p>
          <a class="bottone" href="${link}" target="_blank" rel="noopener">
            <span lang="it">${gofundme ? 'Dona su GoFundMe' : 'Dona'}</span>
            <span lang="en">${gofundme ? 'Donate on GoFundMe' : 'Donate'}</span></a>
        </div>
      </article>`;
    }).join('');
    osservaApparizioni(box);
    if (location.hash.length > 1) {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    }
    requestAnimationFrame(() => setTimeout(() => {
      box.querySelectorAll('[data-quota]').forEach((s) => { s.style.width = s.dataset.quota + '%'; });
    }, 300));
  } catch (_) {
    // Senza rete resta il contenuto statico già nella pagina.
  }
}
