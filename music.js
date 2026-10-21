/* ============ BIRTHDAY MUSIC ============
   1) Put your mp3 files in the "music" folder (no spaces in the names).
   2) List them below, in play order. Remove the // in front of each line.
   The music starts by itself on every page (including the countdown screen).
   Browsers sometimes block sound until the first tap — if so, the button says
   "Tap to play music" and the song starts from the beginning on her first tap. */
(function () {
  var SONGS = [
    'music/song3.mp3',
	'music/song1.mp3',
    'music/song2.mp3',
	
  ];

  var KEY = 'bdayMusic';
  var player = null, track = 0, wantOn = true, btn = null, failed = {};
  var audioCtx = null, synthOn = false, synthTimer = null, unlockBound = false;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ on: wantOn, i: track, t: player ? player.currentTime : 0 })); } catch (e) {} }
  function label(text, state) {
    if (!btn) return;
    btn.textContent = text;
    btn.classList.toggle('waiting', state === 'wait');
    btn.setAttribute('aria-pressed', state === 'on' ? 'true' : 'false');
  }
  function isPlaying() { return (player && !player.paused) || synthOn; }

  function makePlayer() {
    if (player) return player;
    player = new Audio();
    player.preload = 'auto';
    player.volume = 0.7;
    player.addEventListener('ended', function () {
      track = (track + 1) % SONGS.length;
      player.src = SONGS[track];
      if (wantOn) player.play().catch(function () {});
    });
    player.addEventListener('playing', function () { label('♫ Pause music', 'on'); });
    player.addEventListener('error', function () {
      failed[track] = true;
      console.warn('Music file not found or unreadable:', SONGS[track]);
      if (Object.keys(failed).length >= SONGS.length) {      // every song failed
        player = null; wantOn = false;
        label('⚠ Music files not found – check the names', 'err');
        return;
      }
      track = (track + 1) % SONGS.length;                      // skip to the next song
      player.src = SONGS[track];
      if (wantOn) player.play().catch(function () {});
    });
    player.src = SONGS[track];
    return player;
  }

  /* built-in tiny tune, used only when SONGS is empty */
  async function startSynth() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      await Promise.race([audioCtx.resume(), new Promise(function (r) { setTimeout(r, 300); })]);
      if (audioCtx.state !== 'running') { label('♫ Tap to play music', 'wait'); bindUnlock(); return; }
      synthOn = true; label('♫ Pause music', 'on'); playTune();
    } catch (e) { label('♫ Music unavailable', 'err'); }
  }
  function playTune() {
    var notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 783.99], i = 0;
    (function next() {
      if (!synthOn) return;
      var o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = audioCtx.currentTime;
      o.type = 'sine'; o.frequency.value = notes[i++ % notes.length];
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.035, t + .04); g.gain.exponentialRampToValueAtTime(.0001, t + .38);
      o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(t + .4);
      synthTimer = setTimeout(next, 450);
    })();
  }

  async function start() {
    wantOn = true;
    if (!SONGS.length) return startSynth();
    var p = makePlayer();
    try { await p.play(); label('♫ Pause music', 'on'); save(); }
    catch (e) {
      if (e && e.name === 'NotAllowedError') { label('♫ Tap to play music', 'wait'); bindUnlock(); }
      else console.warn('Music error:', e);                    // missing files are handled by the error listener
    }
  }
  function stop() {
    wantOn = false;
    if (player) player.pause();
    synthOn = false; clearTimeout(synthTimer);
    label('♫ Play music', 'off'); save();
  }

  /* browsers need one tap before sound — start on the very first one */
  function bindUnlock() {
    if (unlockBound) return; unlockBound = true;
    var evs = ['pointerup', 'click', 'touchend', 'keydown'];
    function go(e) {
      if (e && btn && btn.contains(e.target)) return;      // the button has its own handler
      evs.forEach(function (n) { document.removeEventListener(n, go, true); });
      unlockBound = false;
      if (wantOn && !isPlaying()) start();
    }
    evs.forEach(function (n) { document.addEventListener(n, go, true); });
  }

  function init() {
    btn = document.createElement('button');
    btn.className = 'music-fab'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle music');
    btn.addEventListener('click', function () { isPlaying() ? stop() : start(); });
    document.body.appendChild(btn);

    var saved = load();
    if (saved) {
      wantOn = saved.on !== false;
      if (SONGS.length) {
        track = Math.min(saved.i || 0, SONGS.length - 1);
        var p = makePlayer();
        if (saved.t) p.addEventListener('loadedmetadata', function () { if (saved.t < p.duration) p.currentTime = saved.t; }, { once: true });
      }
    }
    if (wantOn) { label('♫ Play music', 'off'); start(); } else label('♫ Play music', 'off');
    setInterval(function () { if (player && wantOn) save(); }, 1000);
    addEventListener('pagehide', save);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
