/* Tap2Me — vẽ móc khóa NFC mica + đĩa vinyl bằng SVG (không cần file ảnh sản phẩm) */
(function () {
  const F = "'Nunito','Segoe UI',Arial,sans-serif";
  const PASTEL = ['#ffb3c1', '#a0e7e5', '#b4f8c8', '#fde2a7', '#cdb4db', '#ffc8dd', '#bde0fe', '#fff3b0'];
  const HEART = 'M0,8 C-6,3 -10,0 -10,-4 C-10,-8 -6,-10 -3,-10 C-1,-10 0,-8 0,-7 C0,-8 1,-10 3,-10 C6,-10 10,-8 10,-4 C10,0 6,3 0,8Z';

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function star(x, y, r, rot) { const p = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2 + rot, rr = i % 2 ? r * .45 : r; p.push((x + rr * Math.cos(a)).toFixed(1) + ',' + (y + rr * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  function bow(x, y, c, k) { return `<g transform="translate(${x},${y}) scale(${k || 1})"><path d="M0,0 L-12,-8 L-12,8Z M0,0 L12,-8 L12,8Z" fill="${c}"/><circle r="4" fill="${c}"/></g>`; }
  const arcBottom = (id, r) => `<path id="${id}" d="M-${r},0 A${r},${r} 0 0 0 ${r},0" fill="none"/>`;

  // ---------- nhân vật chibi ----------
  function chibi(o) {
    const skin = '#ffe2cf', st = o.stroke ? ` stroke="${o.stroke}" stroke-width="1.5"` : '';
    let g = `<g transform="translate(${o.x},${o.y}) scale(${o.flip ? -o.s : o.s},${o.s})">`;
    if (o.veil) g += `<path d="M-38,-34 C-72,10 -66,70 -44,92 L44,92 C66,70 72,10 38,-34Z" fill="#fff" opacity=".8" stroke="#eadbe2"/>`;
    if (o.type === 'girl') g += `<path d="M-44,-4 C-52,-56 52,-56 44,-4 L50,46 C34,56 -34,56 -50,46Z" fill="${o.hair}"/>`;
    const legs = o.legs || '#5a4a42';
    g += `<rect x="-13" y="72" width="9" height="15" rx="4" fill="${legs}"/><rect x="4" y="72" width="9" height="15" rx="4" fill="${legs}"/>`;
    if (o.type === 'girl') g += `<path d="M-16,34 L16,34 L30,80 Q0,88 -30,80Z" fill="${o.outfit}"${st}/>`;
    else g += `<rect x="-20" y="34" width="40" height="44" rx="12" fill="${o.outfit}"${st}/>`;
    if (o.tie) g += `<path d="M-7,35 L7,35 L0,52Z" fill="#fff"/>` + bow(0, 38, o.tie, .6);
    g += `<ellipse cx="-22" cy="52" rx="7" ry="12" fill="${o.outfit}"${st} transform="rotate(20 -22 52)"/><circle cx="-25" cy="63" r="6" fill="${skin}"/>`;
    g += `<ellipse cx="22" cy="50" rx="7" ry="12" fill="${o.outfit}"${st} transform="rotate(-45 22 50)"/><circle cx="30" cy="58" r="6" fill="${skin}"/>`;
    g += `<circle r="40" fill="${skin}"/>`;
    if (o.type === 'girl') g += `<path d="M-42,4 C-46,-46 46,-46 42,4 C34,-12 14,-18 4,-8 C-4,-20 -30,-14 -42,4Z" fill="${o.hair}"/>`;
    else g += `<path d="M-42,6 C-48,-46 48,-46 42,6 C38,-6 30,-12 22,-8 C18,-18 6,-18 0,-10 C-6,-20 -20,-16 -24,-8 C-32,-12 -40,-4 -42,6Z" fill="${o.hair}"/>`;
    g += `<ellipse cx="-14" cy="8" rx="6" ry="8" fill="#3a2a2a"/><ellipse cx="14" cy="8" rx="6" ry="8" fill="#3a2a2a"/>`;
    g += `<circle cx="-12" cy="4.5" r="2.6" fill="#fff"/><circle cx="16" cy="4.5" r="2.6" fill="#fff"/><circle cx="-15.5" cy="11" r="1.2" fill="#fff"/><circle cx="12.5" cy="11" r="1.2" fill="#fff"/>`;
    g += `<ellipse cx="-25" cy="20" rx="7" ry="4" fill="#ff8fab" opacity=".55"/><ellipse cx="25" cy="20" rx="7" ry="4" fill="#ff8fab" opacity=".55"/>`;
    g += `<path d="M-5,21 Q0,27 5,21" stroke="#b5595f" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (o.bow) g += bow(24, -30, o.bow);
    if (o.crown) g += `<g transform="translate(-4,-38)">${[-18, -6, 6, 18].map(x => `<circle cx="${x}" r="5" fill="${o.crown}"/>`).join('')}</g>`;
    return g + '</g>';
  }

  // ---------- hình in trên đĩa ----------
  const ART = {};

  ART.ourDay = p => `<defs><radialGradient id="${p}bg" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#fff0f3"/><stop offset="1" stop-color="#ffb3c6"/></radialGradient>${arcBottom(p + 'arc', 74)}</defs>
    <rect x="-130" y="-130" width="260" height="260" fill="url(#${p}bg)"/>
    <path d="${HEART}" transform="translate(0,-20) scale(5)" fill="#ff8fab" opacity=".35"/>
    ${[[-64, -30, .7], [66, -22, .6], [-48, -64, .5], [50, -62, .8]].map(([x, y, k]) => `<path d="${HEART}" transform="translate(${x},${y}) scale(${k})" fill="#ff5d8f" opacity=".7"/>`).join('')}
    ${chibi({ x: -27, y: -24, s: .56, type: 'boy', hair: '#3d2b24', outfit: '#7fb7e8' })}
    ${chibi({ x: 27, y: -24, s: .56, type: 'girl', hair: '#8a5a44', outfit: '#ff8fab', flip: 1, bow: '#ff5d8f' })}
    <text font-family="${F}" font-size="12.5" font-weight="900" fill="#d6336c" letter-spacing="2"><textPath href="#${p}arc" startOffset="50%" text-anchor="middle">OUR DAY ♥ 25.09.2026</textPath></text>`;

  ART.fest = p => {
    let crowd = '';
    for (let i = -6; i <= 6; i++) {
      const x = i * 16 + (i % 2 ? 4 : 0), y = 64 + (i % 2 ? 5 : 0);
      crowd += `<circle cx="${x}" cy="${y}" r="8"/><rect x="${x - 10}" y="${y + 6}" width="20" height="34" rx="8"/>`;
      if (i % 3 === 0) crowd += `<path d="M${x + 6},${y + 4} L${x + 13},${y - 18}" stroke="#1b0b3a" stroke-width="4.5" stroke-linecap="round"/>`;
    }
    const r = rng(5); let st = '';
    for (let i = 0; i < 22; i++) st += `<circle cx="${(r() * 180 - 90).toFixed(1)}" cy="${(r() * 90 - 95).toFixed(1)}" r="${(r() * 1.2 + .4).toFixed(1)}" fill="#fff" opacity="${(r() * .5 + .4).toFixed(2)}"/>`;
    return `<defs><linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#240046"/><stop offset=".6" stop-color="#7b2cbf"/><stop offset="1" stop-color="#f72585"/></linearGradient></defs>
    <rect x="-130" y="-130" width="260" height="260" fill="url(#${p}bg)"/>${st}
    <polygon points="-55,-100 -100,70 -20,70" fill="#ffe66d" opacity=".24"/>
    <polygon points="55,-100 100,70 20,70" fill="#4cc9f0" opacity=".26"/>
    <polygon points="0,-100 -28,70 28,70" fill="#fff" opacity=".12"/>
    <text y="-42" text-anchor="middle" font-family="${F}" font-size="20" font-weight="900" fill="#fff" letter-spacing="1.5">SUMMER</text>
    <text y="-20" text-anchor="middle" font-family="${F}" font-size="18" font-weight="900" fill="#ffe66d" letter-spacing="1">FEST 2026</text>
    <g fill="#1b0b3a">${crowd}</g>`;
  };

  ART.moon = p => {
    const r = rng(7); let st = '';
    for (let i = 0; i < 46; i++) st += `<circle cx="${(r() * 250 - 125).toFixed(1)}" cy="${(r() * 160 - 128).toFixed(1)}" r="${(r() * 1.4 + .4).toFixed(1)}" fill="#fff" opacity="${(r() * .6 + .4).toFixed(2)}"/>`;
    const sp = [[-80, -20, '#ffc8dd'], [88, 10, '#bde0fe'], [-30, -95, '#fff3b0'], [20, -40, '#b4f8c8']].map(([x, y, c]) => `<polygon points="${star(x, y, 5, 0)}" fill="${c}"/>`).join('');
    return `<defs><radialGradient id="${p}bg" cx=".6" cy=".2" r=".95"><stop offset="0" stop-color="#4361ee"/><stop offset=".55" stop-color="#1d2e7a"/><stop offset="1" stop-color="#0b1340"/></radialGradient>
    <mask id="${p}m"><rect x="-130" y="-130" width="260" height="260" fill="#fff"/><circle cx="64" cy="-71" r="21" fill="#000"/></mask></defs>
    <rect x="-130" y="-130" width="260" height="260" fill="url(#${p}bg)"/>${st}${sp}
    <circle cx="52" cy="-62" r="42" fill="#fff6c9" opacity=".12"/>
    <circle cx="52" cy="-62" r="24" fill="#fff3b0" mask="url(#${p}m)"/>
    <path d="M-98,-72 L-54,-50" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/><polygon points="${star(-52, -49, 5, 0)}" fill="#fff"/>
    <path d="M-130,70 Q-60,40 10,58 T130,48 L130,130 L-130,130Z" fill="#3a56b0"/>
    ${chibi({ x: -24, y: 30, s: .45, type: 'boy', hair: '#1f1a1a', outfit: '#ffd166' })}
    ${chibi({ x: 24, y: 30, s: .45, type: 'girl', hair: '#3b2a24', outfit: '#cdb4db', flip: 1, bow: '#ffafcc' })}
    <path d="M-130,90 Q-30,62 50,82 T130,78 L130,130 L-130,130Z" fill="#22367f"/>
    <text y="108" text-anchor="middle" font-family="'Segoe Script','Brush Script MT',cursive" font-size="15" fill="#fff" opacity=".92">you &amp; me</text>`;
  };

  ART.wedding = p => {
    let fl = ''; const cols = ['#ffc2d1', '#ffffff', '#ffe5b4', '#ffafcc'];
    for (let i = 0; i <= 12; i++) {
      const a = (200 + i * 140 / 12) * Math.PI / 180, x = 72 * Math.cos(a), y = 72 * Math.sin(a);
      const lx = (x * 1.1).toFixed(1), ly = (y * 1.1).toFixed(1);
      fl += `<ellipse cx="${lx}" cy="${ly}" rx="6" ry="3" fill="#95d5b2" transform="rotate(${i * 25} ${lx} ${ly})"/>`;
      fl += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 2 ? 7 : 9}" fill="${cols[i % 4]}" stroke="#f4a7b9" stroke-width=".8"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="#ffd166"/>`;
    }
    return `<defs><radialGradient id="${p}bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffd6e0"/></radialGradient>${arcBottom(p + 'arc', 74)}</defs>
    <rect x="-130" y="-130" width="260" height="260" fill="url(#${p}bg)"/>${fl}
    ${chibi({ x: -26, y: -10, s: .54, type: 'boy', hair: '#2b2b2b', outfit: '#2f2f3f', tie: '#c9184a', legs: '#2f2f3f' })}
    ${chibi({ x: 26, y: -10, s: .54, type: 'girl', hair: '#6b3e2e', outfit: '#ffffff', stroke: '#e5c9d3', flip: 1, veil: 1, crown: '#ffc2d1' })}
    <text font-family="${F}" font-size="13.5" font-weight="900" fill="#c9184a" letter-spacing="2.5"><textPath href="#${p}arc" startOffset="50%" text-anchor="middle">♥ JUST MARRIED ♥</textPath></text>`;
  };

  ART.anniv = p => {
    const bl = [[-66, -30, '#ff99c8'], [-46, -58, '#a9def9'], [64, -38, '#fcf6bd'], [44, -64, '#d0f4de']].map(([x, y, c]) =>
      `<path d="M${x},${y + 14} Q${x + (x < 0 ? 6 : -6)},${y + 30} ${x + (x < 0 ? 14 : -14)},${y + 44}" stroke="#999" stroke-width="1" fill="none"/><ellipse cx="${x}" cy="${y}" rx="11" ry="14" fill="${c}" stroke="#00000018"/><ellipse cx="${x - 4}" cy="${y - 5}" rx="3" ry="4" fill="#fff" opacity=".7"/>`).join('');
    return `<defs><radialGradient id="${p}bg" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#ffd6a5"/></radialGradient>${arcBottom(p + 'arc', 74)}</defs>
    <rect x="-130" y="-130" width="260" height="260" fill="url(#${p}bg)"/>${bl}
    ${chibi({ x: -27, y: -20, s: .56, type: 'boy', hair: '#5c4033', outfit: '#90be6d' })}
    ${chibi({ x: 27, y: -20, s: .56, type: 'girl', hair: '#2b2b2b', outfit: '#e4c1f9', flip: 1, bow: '#f15bb5' })}
    <g transform="translate(0,28)"><rect x="-17" y="-2" width="34" height="18" rx="3" fill="#fff" stroke="#f4a7b9"/>
    <path d="M-17,2 Q-12,8 -8,2 Q-4,8 0,2 Q4,8 8,2 Q12,8 17,2 L17,-2 L-17,-2Z" fill="#ff8fab"/>
    <rect x="-1.5" y="-12" width="3" height="10" fill="#8ecae6"/><path d="M0,-18 Q3.5,-14 0,-11 Q-3.5,-14 0,-18Z" fill="#ffb703"/></g>
    <text font-family="${F}" font-size="12" font-weight="900" fill="#e85d75" letter-spacing="1.8"><textPath href="#${p}arc" startOffset="50%" text-anchor="middle">HAPPY ANNIVERSARY</textPath></text>`;
  };

  // Ảnh thật: {src, x, y, w, h} — toạ độ đặt ảnh sao cho khuôn mặt nằm trên lỗ giữa đĩa
  ART.photo = ph => p => `<rect x="-130" y="-130" width="260" height="260" fill="#eee"/><image href="${ph.src}" x="${ph.x}" y="${ph.y}" width="${ph.w}" height="${ph.h}"/>`;

  // ---------- đĩa vinyl ----------
  function disc(p, art, full, hole) {
    const Rd = 128, L = full ? 126 : 92; let gr = '';
    if (!full) for (let r = Rd - 4; r > L + 3; r -= 4.5) gr += `<circle r="${r}" fill="none" stroke="#303030" stroke-width=".8"/>`;
    let h = '';
    if (hole !== false) h = full
      ? `<circle r="15" fill="#f7f7f7" stroke="#cfcfcf"/><circle r="6" fill="#dfe3e8" stroke="#aaa" stroke-width=".6"/>`
      : `<circle r="6" fill="#eef0f3" stroke="#999" stroke-width=".6"/>`;
    return `<circle r="${Rd}" fill="url(#t2m-vinyl)"/>${gr}<circle r="${Rd}" fill="url(#t2m-sheen)"/>
      <clipPath id="${p}c"><circle r="${L}"/></clipPath><g clip-path="url(#${p}c)">${art(p)}</g>
      ${full ? `<circle r="${L}" fill="url(#t2m-sheen)" opacity=".7"/>` : `<circle r="${L}" fill="none" stroke="#000" stroke-opacity=".35"/>`}${h}`;
  }

  // ---------- móc khóa mica ----------
  const SQ = 'M-122,-150 L-34,-150 L-34,-176 Q-34,-192 -18,-192 L18,-192 Q34,-192 34,-176 L34,-150 L122,-150 Q150,-150 150,-122 L150,122 Q150,150 122,150 L-122,150 Q-150,150 -150,122 L-150,-122 Q-150,-150 -122,-150Z';
  const RD = 'M-30,-159.2 L-30,-180 Q-30,-194 -16,-194 L16,-194 Q30,-194 30,-180 L30,-159.2 A162,162 0 1 1 -30,-159.2Z';

  function keychain(o) {
    const p = o.id, sq = o.shape === 'sq', hy = sq ? -175 : -178, ry = hy - 88;
    let s = `<g filter="url(#t2m-sh)">`;
    s += `<circle cx="6" cy="${ry}" r="58" fill="none" stroke="url(#t2m-metal)" stroke-width="8.5"/>
      <circle cx="6" cy="${ry}" r="58" fill="none" stroke="#6b6b6b" stroke-width=".9" opacity=".55"/>
      <path d="M-40,${ry - 34} A58,58 0 0 1 20,${ry - 56}" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/>`;
    s += `<clipPath id="${p}f"><path d="${sq ? SQ : RD}"/></clipPath>`;
    s += `<path d="${sq ? SQ : RD}" fill="rgba(255,255,255,.6)" stroke="#bcc6d2" stroke-width="1.6"/>`;
    s += sq
      ? `<rect x="-138" y="-138" width="276" height="276" rx="20" fill="none" stroke="#b8c2cf" stroke-width="1" opacity=".7"/><rect x="-135" y="-135" width="270" height="270" rx="17" fill="none" stroke="#fff" stroke-width="3"/>`
      : `<circle r="150" fill="none" stroke="#b8c2cf" stroke-width="1" opacity=".7"/><circle r="147" fill="none" stroke="#fff" stroke-width="3"/>`;
    s += disc(p, o.art, o.full, o.hole);
    const r = rng(o.seed || 1); let c = '', n = 0;
    while (n < 18) {
      const x = r() * 284 - 142, y = r() * 284 - 142;
      if (sq ? (Math.abs(x) > 130 || Math.abs(y) > 130) : Math.hypot(x, y) > 140) continue;
      if (Math.hypot(x, y) < 100) continue;
      if (o.full && Math.abs(x) < 70 && y > 80) continue;
      n++;
      const t = r(), col = PASTEL[Math.floor(r() * PASTEL.length)], sz = 6 + r() * 5, rot = r() * 6.28;
      if (t < .45) c += `<polygon points="${star(x, y, sz, rot)}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linejoin="round"/>`;
      else if (t < .75) c += `<polygon points="${star(x, y, sz * .9, rot)}" fill="${col}" stroke="#0000000f"/>`;
      else c += `<path d="${HEART}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(rot * 57).toFixed(0)}) scale(${(sz / 11).toFixed(2)})" fill="${col}" stroke="#0000000f"/>`;
    }
    s += c;
    s += `<g clip-path="url(#${p}f)"><path d="M-175,60 L60,-175 L112,-175 L-175,112Z" fill="#fff" opacity=".14"/><path d="M-175,150 L150,-175 L166,-175 L-175,166Z" fill="#fff" opacity=".1"/></g>`;
    s += sq
      ? `<path d="M-142,-40 L-142,-126 Q-142,-142 -126,-142 L-40,-142" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M142,60 L142,126 Q142,142 126,142 L70,142" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".85"/>`
      : `<path d="M-154,-10 A154,154 0 0 1 -44,-148" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M150,30 A154,154 0 0 1 64,140" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".85"/>`;
    const [bx, by] = sq ? [112, 116] : [98, 100];
    s += `<g transform="translate(${bx},${by})"><circle r="14" fill="#fff" opacity=".95" stroke="#c5cdd8"/><g transform="translate(-4,0)" fill="none" stroke="#3d4a5c" stroke-width="1.7" stroke-linecap="round"><path d="M-4,-3.5 A5,5 0 0 1 -4,3.5"/><path d="M-1,-6.5 A9,9 0 0 1 -1,6.5"/><path d="M2,-9 A12,12 0 0 1 2,9"/></g></g>`;
    s += `<circle cy="${hy}" r="8" fill="#e6e9ed" stroke="#b9c3cf" stroke-width="1.5"/><ellipse cy="${hy - 14}" rx="8" ry="17" fill="none" stroke="url(#t2m-metal)" stroke-width="4.5"/>`;
    return s + '</g>';
  }

  const DEFS = `<defs>
    <radialGradient id="t2m-vinyl"><stop offset="0" stop-color="#262626"/><stop offset="1" stop-color="#0c0c0c"/></radialGradient>
    <linearGradient id="t2m-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset=".46" stop-color="#fff" stop-opacity=".13"/><stop offset=".56" stop-color="#fff" stop-opacity="0"/><stop offset=".76" stop-color="#fff" stop-opacity="0"/><stop offset=".82" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="t2m-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5f5f5"/><stop offset=".3" stop-color="#a3a3a3"/><stop offset=".55" stop-color="#ececec"/><stop offset=".8" stop-color="#8a8a8a"/><stop offset="1" stop-color="#d6d6d6"/></linearGradient>
    <filter id="t2m-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="8" flood-color="#5C3A21" flood-opacity=".18"/></filter>
  </defs>`;

  // Trả về một thẻ <svg> hoàn chỉnh cho một móc khóa
  function svg(o) {
    return `<svg class="keychain-svg" viewBox="-185 -335 370 525" role="img" aria-label="${o.label || 'Móc khóa NFC'}">${keychain(o)}</svg>`;
  }

  window.Tap2MeKeychain = { ART, svg, DEFS };
})();
