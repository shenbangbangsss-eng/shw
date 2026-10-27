const body = document.body;
const cover = document.querySelector('#cover');
const card = document.querySelector('#card');
const openButton = document.querySelector('#open-card');
const soundToggle = document.querySelector('#sound-toggle');
const soundLabel = soundToggle.querySelector('.sound-label');
const replayButton = document.querySelector('#replay');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
const closeLightbox = lightbox.querySelector('.lightbox-close');

let audioContext;
let masterGain;
let musicTimer;
let isPlaying = false;

const progression = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 440.0],
  [174.61, 220.0, 261.63, 349.23],
  [196.0, 246.94, 293.66, 392.0]
];

function playNote(frequency, start, duration, volume = 0.045) {
  if (!audioContext || !masterGain) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function schedulePhrase() {
  if (!isPlaying || !audioContext) return;
  const now = audioContext.currentTime + 0.05;
  progression.forEach((chord, chordIndex) => {
    chord.forEach((note, noteIndex) => {
      const start = now + chordIndex * 2.4 + noteIndex * 0.42;
      playNote(note, start, 2.35, noteIndex === 0 ? 0.032 : 0.024);
      if (noteIndex === 3) playNote(note * 2, start + 0.18, 1.7, 0.012);
    });
  });
  musicTimer = window.setTimeout(schedulePhrase, 9300);
}

async function startMusic() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.62;
    masterGain.connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') await audioContext.resume();
  if (isPlaying) return;
  isPlaying = true;
  soundToggle.setAttribute('aria-pressed', 'true');
  soundLabel.textContent = '音乐开启';
  schedulePhrase();
}

function stopMusic() {
  isPlaying = false;
  window.clearTimeout(musicTimer);
  if (masterGain && audioContext) masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.08);
  soundToggle.setAttribute('aria-pressed', 'false');
  soundLabel.textContent = '音乐关闭';
}

function resumeMusic() {
  if (masterGain && audioContext) masterGain.gain.setTargetAtTime(0.62, audioContext.currentTime, 0.08);
  startMusic();
}

openButton.addEventListener('click', () => {
  openButton.blur();
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  cover.classList.add('opened');
  cover.setAttribute('aria-hidden', 'true');
  card.classList.add('visible');
  card.setAttribute('aria-hidden', 'false');
  body.classList.remove('locked');
  startMusic();
  window.setTimeout(() => { cover.hidden = true; }, 1200);
});

soundToggle.addEventListener('click', () => {
  if (isPlaying) stopMusic(); else resumeMusic();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('.photo-card').forEach((photo) => {
  const show = () => {
    lightboxImage.src = photo.dataset.full;
    lightboxImage.alt = photo.querySelector('img').alt;
    lightbox.showModal();
  };
  photo.addEventListener('click', show);
  photo.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      show();
    }
  });
});

closeLightbox.addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

replayButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
