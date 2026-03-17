const phrases = [
  'Respira. Tu bienestar también necesita espacio.',
  'Vivir lento es elegir lo importante.',
  'Menos prisa, más presencia.',
  'Cada pausa es una forma de cuidarte.'
];

const tasks = [
  'Cocinar con calma una receta y comerla disfrutando cada sabor.',
  'Pasear por el parque más cercano, escuchar lo que te rodea y sentir cada paso.',
  'Escribir 5 cosas que agradeces hoy mientras tomas una infusión.',
  'Ordenar un rincón de casa y donar algo que ya no uses.',
  'Dedicar 20 minutos a una actividad sin pantallas.'
];

const recipes = [
  { title: 'Sopa de calabaza consciente', desc: 'Corta, respira y cocina a fuego lento. Sirve con semillas y pan integral.' },
  { title: 'Ensalada tibia de temporada', desc: 'Verduras de mercado, aceite de oliva, limón y una pausa antes de comer.' },
  { title: 'Avena nocturna calmante', desc: 'Prepara por la noche con fruta y canela. Desayuno sin prisas.' }
];

const loginView = document.getElementById('loginView');
const homeView = document.getElementById('homeView');
const loginForm = document.getElementById('loginForm');
const userName = document.getElementById('userName');
const dailyPhrase = document.getElementById('dailyPhrase');
const todayDate = document.getElementById('todayDate');
const todayTask = document.getElementById('todayTask');
const tomorrowTask = document.getElementById('tomorrowTask');
const recipeList = document.getElementById('recipeList');
const emotionForm = document.getElementById('emotionForm');
const emotionSelect = document.getElementById('emotionSelect');
const emotionTimeline = document.getElementById('emotionTimeline');
const emotionStats = document.getElementById('emotionStats');
const dailyNotes = document.getElementById('dailyNotes');

const storage = {
  get user() {
    return JSON.parse(localStorage.getItem('sslow-user') || 'null');
  },
  set user(val) {
    localStorage.setItem('sslow-user', JSON.stringify(val));
  },
  get emotions() {
    return JSON.parse(localStorage.getItem('sslow-emotions') || '[]');
  },
  set emotions(val) {
    localStorage.setItem('sslow-emotions', JSON.stringify(val));
  }
};

function daySeed(offset = 0) {
  const now = new Date();
  return now.getFullYear() * 1000 + now.getMonth() * 100 + now.getDate() + offset;
}

function renderHome(user) {
  userName.textContent = user.name;
  dailyPhrase.textContent = phrases[daySeed() % phrases.length];
  todayDate.textContent = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  todayTask.textContent = tasks[daySeed() % tasks.length];
  tomorrowTask.textContent = tasks[daySeed(1) % tasks.length];
  recipeList.innerHTML = recipes
    .map((recipe) => `<article class="recipe-card"><h4>${recipe.title}</h4><p>${recipe.desc}</p></article>`)
    .join('');
  dailyNotes.value = localStorage.getItem('sslow-notes') || '';
  renderEmotions();
}

function renderEmotions() {
  const emotions = storage.emotions.sort((a, b) => (a.date < b.date ? 1 : -1));
  emotionTimeline.innerHTML = emotions
    .slice(0, 10)
    .map((entry) => `<li><strong>${entry.date}:</strong> ${entry.emotion}</li>`)
    .join('') || '<li>Aún no hay registros.</li>';

  const counts = emotions.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(counts), 1);
  emotionStats.innerHTML = Object.entries(counts)
    .map(
      ([emotion, total]) =>
        `<div class="bar"><span style="width:${(total / max) * 100}%">${emotion} (${total})</span></div>`
    )
    .join('') || '<p>Registra emociones para ver tu evolución.</p>';
}

function openHome() {
  loginView.classList.remove('active');
  homeView.classList.add('active');
  const user = storage.user;
  if (user) renderHome(user);
}

function openLogin() {
  homeView.classList.remove('active');
  loginView.classList.add('active');
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const user = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim()
  };
  storage.user = user;
  openHome();
});

emotionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!emotionSelect.value) return;
  const date = new Date().toISOString().slice(0, 10);
  const emotions = storage.emotions.filter((entry) => entry.date !== date);
  emotions.push({ date, emotion: emotionSelect.value });
  storage.emotions = emotions;
  emotionForm.reset();
  renderEmotions();
});

dailyNotes.addEventListener('input', () => {
  localStorage.setItem('sslow-notes', dailyNotes.value);
});

document.getElementById('navLogin').addEventListener('click', openLogin);
document.getElementById('navHome').addEventListener('click', () => {
  if (storage.user) openHome();
});
document.getElementById('navNotes').addEventListener('click', () => {
  if (!homeView.classList.contains('active')) return;
  document.getElementById('notes').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.service').forEach((card) => {
  card.addEventListener('click', () => {
    document.getElementById(card.dataset.target).scrollIntoView({ behavior: 'smooth' });
  });
});

if (storage.user) {
  openHome();
}
