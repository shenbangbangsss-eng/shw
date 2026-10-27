const progress = document.querySelector("#progress");
const musicControl = document.querySelector("#musicControl");
const musicLabel = musicControl.querySelector(".music-control__label");
const song = document.querySelector("#birthdaySong");

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

musicControl.addEventListener("click", async () => {
  if (song.paused) {
    try {
      await song.play();
      musicControl.classList.add("is-playing");
      musicControl.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "暂停音乐";
    } catch {
      musicLabel.textContent = "再点一次播放";
    }
  } else {
    song.pause();
    musicControl.classList.remove("is-playing");
    musicControl.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "继续播放";
  }
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8%" },
  );
  reveals.forEach((element) => observer.observe(element));
}
