/* script.js
   - Configurado para Victor & Ana Clara
   - Data de início: 2024-09-28
   - As fotos estão em /imagens/foto1.jpg ... foto5.jpg
   - Player usa API IFrame do YouTube para reproduzir o link que você enviou.
*/

/* ========== CONFIGURAÇÃO ========== */
const CONFIG = {
  coupleNames: "Victor & Ana Clara",
  startDateISO: "2024-09-28T00:00:00",
  // YouTube video ID (extraído do link que você forneceu)
  youtubeId: "D0IEyuBL5Do",
  // Fotos locais (colocadas na pasta imagens/)
  photos: [
    {src: "imagens/foto1.jpg", title: "No carro", caption: "Sol e sorrisos."},
    {src: "imagens/foto2.jpg", title: "Selfie", caption: "Espelho e carinho."},
    {src: "imagens/foto3.jpg", title: "Abraço", caption: "No abraço mais quentinho."},
    {src: "imagens/foto4.jpg", title: "Passeio", caption: "Mais um dia juntos."},
    {src: "imagens/foto5.jpg", title: "Beijo", caption: "Momentos que valem ouro."},
    {src: "imagens/foto6.jpg", title: "A gente fazendo caretas", caption: "Momentos mais especiais que diamantes"},
    {src: "imagens/foto7.jpg", title: "A gente fazendo caretas denvo...", caption: "Eu te amo 💓"},
  ]
};
/* =================================== */

/* DOM */
const coupleNamesEl = document.getElementById('coupleNames');
const startDateTextEl = document.getElementById('startDateText');
const timerEls = {
  years: document.getElementById('years'),
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds')
};
const galleryEl = document.getElementById('gallery');
const lb = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
const lbCaption = document.getElementById('lbCaption');
const lbClose = document.getElementById('lbClose');
const downloadBtn = document.getElementById('downloadBtn');
const ytPlayBtn = document.getElementById('ytPlayBtn');
const addMemoryBtn = document.getElementById('addMemoryBtn');
const loadMoreBtn = document.getElementById('loadMore');

let photos = CONFIG.photos.slice();
let audioPlaying = false;
let player; // YouTube player
let currentIndex = 0;

/* Inicialização */
coupleNamesEl.textContent = CONFIG.coupleNames;
startDateTextEl.textContent = new Date(CONFIG.startDateISO).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

/* TIMER */
function updateTimer(){
  const start = new Date(CONFIG.startDateISO);
  const now = new Date();
  let diffMs = Math.max(0, now - start);
  const msInSecond = 1000;
  const msInMinute = msInSecond * 60;
  const msInHour = msInMinute * 60;
  const msInDay = msInHour * 24;
  const years = Math.floor(diffMs / (msInDay * 365));
  diffMs -= years * msInDay * 365;
  const days = Math.floor(diffMs / msInDay);
  diffMs -= days * msInDay;
  const hours = Math.floor(diffMs / msInHour);
  diffMs -= hours * msInHour;
  const minutes = Math.floor(diffMs / msInMinute);
  diffMs -= minutes * msInMinute;
  const seconds = Math.floor(diffMs / msInSecond);

  timerEls.years.textContent = years;
  timerEls.days.textContent = days;
  timerEls.hours.textContent = hours;
  timerEls.minutes.textContent = minutes;
  timerEls.seconds.textContent = seconds;
}
setInterval(updateTimer, 1000);
updateTimer();

/* GALERIA */
function renderGallery(){
  galleryEl.innerHTML = '';
  photos.forEach((p, idx) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="photo" style="background-image:url('${p.src}')"></div>
      <div class="meta">
        <h3>${escapeHtml(p.title || 'Memória')}</h3>
        <p>${escapeHtml(p.caption || '')}</p>
        <div class="actions">
          <button class="btn ghost viewBtn" data-index="${idx}">Abrir</button>
        </div>
      </div>
    `;
    card.querySelector('.photo').addEventListener('click', () => openLightbox(idx));
    card.querySelector('.viewBtn').addEventListener('click', (e) => { e.stopPropagation(); openLightbox(idx); });
    galleryEl.appendChild(card);
  });
}
renderGallery();

/* LIGHTBOX */
function openLightbox(index){
  const p = photos[index];
  if(!p) return;
  currentIndex = index;
  lbImage.src = p.src;
  lbCaption.textContent = p.caption || '';
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){ lb.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; }
document.getElementById('lbClose').addEventListener('click', closeLightbox);
lb.addEventListener('click', (e)=>{ if(e.target===lb) closeLightbox(); });
downloadBtn.addEventListener('click', ()=>{ const a=document.createElement('a'); a.href=photos[currentIndex].src; a.download=(photos[currentIndex].title||'memoria')+'.jpg'; document.body.appendChild(a); a.click(); a.remove(); });

/* ADD MEMORY */
addMemoryBtn.addEventListener('click', addMemoryInteractive);
function addMemoryInteractive(){
  const title = prompt('Título da memória:');
  if(!title) return;
  const src = prompt('URL da imagem (ou coloque imagens na pasta imagens/ e informe o caminho relativo):');
  if(!src) return;
  const caption = prompt('Legenda (curta):')||'';
  photos.unshift({src,title,caption});
  renderGallery();
}
loadMoreBtn.addEventListener('click', ()=>{ photos.push({src:'imagens/foto1.jpg', title:'Mais memórias', caption:'Uma lembrança a mais.'}); renderGallery(); });

/* YouTube Player - utiliza IFrame API para controlar play/pause do vídeo enviado */
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: CONFIG.youtubeId,
    playerVars: { 'playsinline': 1, 'rel':0, 'controls':0 },
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

// Carrega API
(function loadYouTubeAPI(){
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
})();

function onPlayerStateChange(e){
  // opcional: atualizar UI se necessário
  if(e.data === YT.PlayerState.ENDED){
    audioPlaying = false;
    ytPlayBtn.textContent = '▶︎ Tocar música';
  }
}
ytPlayBtn.addEventListener('click', async () => {
  if(!player) { alert('Player ainda carregando — aguarde um segundo e tente novamente.'); return; }
  if(!audioPlaying){
    player.playVideo();
    audioPlaying = true;
    ytPlayBtn.textContent = '⏸︎ Parar música';
  } else {
    player.pauseVideo();
    audioPlaying = false;
    ytPlayBtn.textContent = '▶︎ Tocar música';
  }
});

/* UTIL */
function escapeHtml(text){ return String(text||'').replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLightbox(); });
