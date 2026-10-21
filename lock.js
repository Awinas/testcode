/* Birthday lock — keeps every page sealed until the birthday arrives.
   Change BDAY_ISO to move the date. Time is Malaysia (UTC+8). */
(function () {
  var BDAY_ISO = '2026-10-22T00:35:00+08:00';
  var TARGET = new Date(BDAY_ISO).getTime();

  /* ---- TEST MODE (only works on your own computer, never on the live site) ----
     open any page with  ?test=15   → pretends the birthday arrives in 15 seconds
                         ?test=0    → pretends it is already the birthday (unlocked)
                         ?test=reset → back to the real date                       */
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
  var testMode = false;
  if (isLocal) {
    try {
      var params = new URLSearchParams(location.search), q = params.get('test');
      if (q === 'reset') sessionStorage.removeItem('bdayTest');
      else if (q !== null && q !== '' && !isNaN(+q)) sessionStorage.setItem('bdayTest', String(Date.now() + (+q) * 1000));
      if (q !== null) {                              // clean the URL so a reload doesn't restart the test
        params.delete('test');
        var qs = params.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      }
      var saved = sessionStorage.getItem('bdayTest');
      if (saved) { TARGET = +saved; testMode = true; }
    } catch (e) {}
  }
  window.BDAY_TARGET = TARGET;

  function testBadge() {
    if (!testMode) return;
    var b = document.createElement('a');
    b.className = 'test-badge'; b.href = '?test=reset';
    b.textContent = '🧪 TEST MODE · click to reset';
    b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;padding:8px 12px;border-radius:999px;background:#4e354d;color:#fff;font:600 12px DM Sans,sans-serif;text-decoration:none;opacity:.9';
    document.body.appendChild(b);
  }

  if (Date.now() >= TARGET) {                       // birthday has arrived → site is open
    if (testMode) document.addEventListener('DOMContentLoaded', testBadge);
    return;
  }

  var root = document.documentElement;
  root.classList.add('locked');
  var st = document.createElement('style');
  st.textContent = 'html.locked body>*:not(.lock-screen):not(.music-fab):not(.test-badge){display:none!important}';
  document.head.appendChild(st);

  function pad(n) { return String(n).padStart(2, '0'); }

  function build() {
    document.title = 'Sabaq sat na… 🎁 | For Ishami ♡';
    document.body.innerHTML =
      '<div class="lock-screen" role="main">' +
        '<span class="lk lk1">🌷</span><span class="lk lk2">🐈</span><span class="lk lk3">📚</span>' +
        '<span class="lk lk4">✦</span><span class="lk lk5">🌷</span><span class="lk lk6">♡</span>' +
        '<div class="lock-card">' +
          '<button class="gift" id="gift" aria-label="A locked birthday">🎁</button>' +
          '<div class="eyebrow">sealed with love · bukak masa lahirmuu</div>' +
          '<h1 class="lock-title">Dak lagi tunggu sat…</h1>' +
          '<p class="lead">Something is waiting for you, Ishami :)</p>' +
          '<div class="countdown lock-count" aria-live="off">' +
            '<div class="time-box"><strong id="lkD">--</strong><span>Days</span></div>' +
            '<div class="time-box"><strong id="lkH">--</strong><span>Hours</span></div>' +
            '<div class="time-box"><strong id="lkM">--</strong><span>Minutes</span></div>' +
            '<div class="time-box"><strong id="lkS">--</strong><span>Seconds</span></div>' +
          '</div>' +
          '<div class="lock-bar"><span id="lkBar"></span></div>' +
          '<p class="tiny" id="lkMsg">Bukak time <b>23 October 2026</b>, at midnight  tauuuu :)</p>' +
        '</div>' +
      '</div>';

    testBadge();
    var start = Date.now(), done = false;
    var msgs = ['Sabaqqq, birthday girl 🌷', 'Kucing tengah jaga hang. 🐈', 'Sikit lagiii… 📚', 'No peeking laa! 🎀', 'Sabaq naa sabaq ✨'];
    var mi = 0;
    var gift = document.getElementById('gift');
    gift.addEventListener('click', function () {
      gift.classList.remove('shake'); void gift.offsetWidth; gift.classList.add('shake');
      document.getElementById('lkMsg').textContent = msgs[mi++ % msgs.length];
    });

    function tick() {
      var d = TARGET - Date.now();
      if (d <= 0) {
        if (done) return; done = true;
        document.getElementById('lkMsg').textContent = 'Happy Birthday, Camiiiii! Opening your surprise niii… 🎂';
        ['lkD','lkH','lkM','lkS'].forEach(function (id) { document.getElementById(id).textContent = '00'; });
        setTimeout(function () { location.reload(); }, 1600);
        return;
      }
      var days = Math.floor(d / 864e5); d %= 864e5;
      var h = Math.floor(d / 36e5); d %= 36e5;
      var m = Math.floor(d / 6e4), s = Math.floor(d % 6e4 / 1000);
      document.getElementById('lkD').textContent = days;
      document.getElementById('lkH').textContent = pad(h);
      document.getElementById('lkM').textContent = pad(m);
      document.getElementById('lkS').textContent = pad(s);
      var pct = Math.min(100, Math.max(3, (Date.now() - start) / (TARGET - start) * 100));
      document.getElementById('lkBar').style.width = pct + '%';
    }
    tick(); setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
