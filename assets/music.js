/* Tap2Me — nhạc nền nhẹ nhàng.
   Nếu có file music/nhac-nen.mp3 thì phát file đó (lặp lại).
   Nếu không có, trang tự tạo một giai điệu hộp nhạc êm dịu bằng Web Audio (không cần tải gì). */
(function () {
  const FILE = 'music/nhac-nen.mp3';
  const VOLUME = 0.45;
  const btn = document.getElementById('music-btn');
  if (!btn) return;

  let fileOk = false;
  const audio = new Audio();
  audio.loop = true; audio.volume = VOLUME; audio.preload = 'auto';
  audio.addEventListener('canplay', () => { fileOk = true; }, { once: true });
  audio.addEventListener('error', () => { fileOk = false; }, { once: true });
  audio.src = FILE;

  // ---------- bộ tổng hợp âm thanh ----------
  let ctx, master, bus, timer, nextTime = 0, step = 0;
  const BPM = 72, EIGHTH = 60 / BPM / 2;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // Fmaj7 – G6 – Em7 – Am7 (IV – V – iii – vi) cung Đô trưởng
  const CHORDS = [[53, 57, 60, 64], [55, 59, 62, 64], [52, 55, 59, 62], [57, 60, 64, 67]];
  const ARP = [0, 1, 2, 3, 4, 3, 2, 1]; // 4 = nốt gốc lên 1 quãng tám
  // Giai điệu 8 ô nhịp: [nốt midi, số phách] — 0 = nghỉ
  const MELODY = [
    [[76, 1], [79, 1], [81, 2]], [[79, 1.5], [76, .5], [74, 2]], [[76, 1], [74, 1], [71, 1], [67, 1]], [[69, 3], [0, 1]],
    [[72, 1], [76, 1], [81, 1], [79, 1]], [[79, 2], [74, 1], [76, 1]], [[76, 1.5], [74, .5], [71, 1], [74, 1]], [[72, 4]]
  ];

  function makeReverb() {
    const len = ctx.sampleRate * 2.8, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    const conv = ctx.createConvolver(); conv.buffer = buf; return conv;
  }

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    bus = ctx.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 3200;
    const dry = ctx.createGain(); dry.gain.value = .75;
    const wet = ctx.createGain(); wet.gain.value = .45;
    const rev = makeReverb();
    const delay = ctx.createDelay(); delay.delayTime.value = EIGHTH * 3;
    const fb = ctx.createGain(); fb.gain.value = .28;
    const dGain = ctx.createGain(); dGain.gain.value = .22;
    bus.connect(dry).connect(master);
    bus.connect(rev).connect(wet).connect(master);
    bus.connect(delay); delay.connect(fb).connect(delay); delay.connect(dGain).connect(master);
  }

  function tone(midi, t, dur, vol, type) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = mtof(midi);
    o2.type = 'sine'; o2.frequency.value = mtof(midi + 12); g2.gain.value = .18; // ánh kim hộp nhạc
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); o2.connect(g2).connect(g); g.connect(bus);
    o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
  }

  function pad(chord, t, dur) {
    chord.slice(0, 3).forEach((m, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = mtof(m); o.detune.value = (i - 1) * 6;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(.022, t + 1.2);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(bus); o.start(t); o.stop(t + dur + .1);
    });
  }

  function scheduleStep(s, t) {
    const bar = Math.floor(s / 8), inBar = s % 8, chord = CHORDS[bar % 4];
    if (inBar === 0) {
      pad(chord, t, EIGHTH * 8 + .6);
      tone(chord[0] - 12, t, 2.4, .09, 'sine');
    }
    if (inBar === 4) tone(chord[0] - 12, t, 1.8, .06, 'sine');
    const a = ARP[inBar], note = a === 4 ? chord[0] + 12 : chord[a];
    tone(note, t, 1.3, .045, 'triangle');
    // giai điệu ở 8 ô nhịp đầu của mỗi vòng 16 ô nhịp
    const phrase = bar % 16;
    if (phrase < 8 && inBar === 0) {
      let beat = 0;
      MELODY[phrase].forEach(([m, len]) => {
        if (m) tone(m, t + beat * EIGHTH * 2, Math.max(1.4, len * EIGHTH * 2 + .8), .075, 'sine');
        beat += len;
      });
    } else if (phrase >= 8 && inBar === 6 && bar % 2) {
      tone(chord[3] + 12, t, 2, .035, 'sine'); // chuông lấp lánh
    }
  }

  function scheduler() {
    while (nextTime < ctx.currentTime + .4) { scheduleStep(step, nextTime); nextTime += EIGHTH; step++; }
  }

  let playing = false;
  function play() {
    if (playing) return;
    playing = true; btn.classList.add('playing'); btn.setAttribute('aria-pressed', 'true');
    btn.title = 'Tắt nhạc nền';
    try { localStorage.setItem('tap2me-music', 'on'); } catch (e) {}
    if (fileOk) { audio.play().catch(() => {}); return; }
    if (!ctx) init();
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 2.5);
    nextTime = ctx.currentTime + .1;
    timer = setInterval(scheduler, 100);
  }

  function stop(remember) {
    if (!playing) return;
    playing = false; btn.classList.remove('playing'); btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Bật nhạc nền';
    if (remember) { try { localStorage.setItem('tap2me-music', 'off'); } catch (e) {} }
    audio.pause();
    if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + .8);
      clearInterval(timer);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 900);
    }
  }

  btn.addEventListener('click', e => { e.stopPropagation(); playing ? stop(true) : play(); hideHint(); });

  // Trình duyệt chặn tự phát nhạc: bắt đầu phát ở lần chạm/nhấp đầu tiên trên trang
  let pref = null; try { pref = localStorage.getItem('tap2me-music'); } catch (e) {}
  function firstTouch(e) {
    if (btn.contains(e.target)) return;
    removeFirst();
    if (pref !== 'off') play();
  }
  function removeFirst() { ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.removeEventListener(ev, firstTouch)); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, firstTouch, { passive: true }));

  const hint = document.getElementById('music-hint');
  function hideHint() { if (hint) hint.classList.add('hide'); }
  setTimeout(hideHint, 7000);

  document.addEventListener('visibilitychange', () => {
    if (!ctx || fileOk) return;
    if (document.hidden && playing) ctx.suspend(); else if (playing) ctx.resume();
  });
})();
