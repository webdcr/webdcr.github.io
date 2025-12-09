(function() {
  function formatTime(sec) {
    if (!Number.isFinite(sec)) return '0:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s}`;
    }
    return `${m}:${s}`;
  }

  // Pause all other audio when one plays
  const allAudio = document.querySelectorAll('audio');
  allAudio.forEach(a => {
    a.addEventListener('play', () => {
      allAudio.forEach(other => {
        if (other !== a && !other.paused) other.pause();
      });
    });
  });

  // Play button handler
  document.querySelectorAll('[data-play]').forEach(btn => {
    const audioId = btn.dataset.play;
    const audio = document.getElementById(audioId);
    if (!audio) return;

    const iconPlay = btn.querySelector('.icon-play');
    const iconPause = btn.querySelector('.icon-pause');

    function updateIcon() {
      if (audio.paused) {
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
      } else {
        iconPlay.style.display = 'none';
        iconPause.style.display = '';
      }
    }

    btn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', updateIcon);
    audio.addEventListener('pause', updateIcon);
    audio.addEventListener('ended', () => { audio.currentTime = 0; updateIcon(); });
  });

  // Progress bars
  document.querySelectorAll('[data-progress]').forEach(bar => {
    const audioId = bar.dataset.progress;
    const audio = document.getElementById(audioId);
    if (!audio) return;

    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      bar.style.width = pct + '%';
    });
  });

  // Seek on progress click
  document.querySelectorAll('[data-seek]').forEach(track => {
    const audioId = track.dataset.seek;
    const audio = document.getElementById(audioId);
    if (!audio) return;

    track.addEventListener('click', e => {
      const rect = track.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = pct * audio.duration;
      }
    });
  });

  // Time displays
  document.querySelectorAll('[data-current]').forEach(el => {
    const audioId = el.dataset.current;
    const audio = document.getElementById(audioId);
    if (!audio) return;

    audio.addEventListener('timeupdate', () => {
      el.textContent = formatTime(audio.currentTime);
    });
  });

  document.querySelectorAll('[data-duration]').forEach(el => {
    const audioId = el.dataset.duration;
    const audio = document.getElementById(audioId);
    if (!audio) return;

    audio.addEventListener('loadedmetadata', () => {
      el.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('durationchange', () => {
      el.textContent = formatTime(audio.duration);
    });
  });
})();
