(() => {
  if (document.getElementById('how-many-root')) return;
  const R = HowManyRules;
  const webext = globalThis.browser || globalThis.chrome;
  const touchDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const host = document.createElement('div');
  host.id = 'how-many-root';
  host.style.cssText = 'position:fixed;right:18px;bottom:calc(118px + env(safe-area-inset-bottom, 0px));z-index:2147483647;display:none;width:124px;touch-action:none';
  const root = host.attachShadow({mode: 'open'});
  root.innerHTML = `<style>
    :host{all:initial}*{box-sizing:border-box}.hourglass{--accent:hsl(132 65% 40%);--sand:.96;--drop:0px;position:relative;width:124px;height:184px;transform:translateY(var(--drop));transition:transform 900ms cubic-bezier(.18,.9,.24,1);color:var(--accent);filter:drop-shadow(0 10px 8px #071c1740);cursor:move;user-select:none}.cap{position:absolute;left:7px;width:110px;height:9px;border-radius:8px;background:linear-gradient(180deg,#fff,#c8d4cd);border:2px solid var(--accent);box-shadow:inset 0 1px #fff}.cap.top{top:3px}.cap.bottom{bottom:3px}.glass{position:absolute;left:17px;top:12px;width:90px;height:160px;overflow:hidden}.glass:before,.glass:after{content:'';position:absolute;left:3px;width:84px;height:78px;border:3px solid var(--accent);background:#ffffffaa}.glass:before{top:0;clip-path:polygon(0 0,100% 0,57% 94%,43% 94%)}.glass:after{bottom:0;clip-path:polygon(43% 6%,57% 6%,100% 100%,0 100%)}.sand-top,.sand-bottom{position:absolute;left:7px;width:76px;background:linear-gradient(90deg,color-mix(in srgb,var(--accent),#ffe89d 38%),var(--accent));opacity:.9;transition:transform 1.7s cubic-bezier(.2,.8,.2,1)}.sand-top{top:5px;height:66px;clip-path:polygon(0 0,100% 0,56% 100%);transform:scaleY(var(--sand));transform-origin:top}.sand-bottom{bottom:5px;height:66px;clip-path:polygon(44% 0,56% 0,100% 100%,0 100%);transform:scaleY(calc(1 - var(--sand)));transform-origin:bottom}.stream{position:absolute;left:58px;top:72px;width:7px;height:23px;border-radius:8px;background:var(--accent);opacity:calc(.18 + (1 - var(--sand)) * .82);animation:flow 1.1s ease-in-out infinite alternate}.time{position:absolute;z-index:2;left:12px;right:12px;top:78px;padding:4px 1px;border-radius:10px;background:#ffffffe8;color:#173e34;text-align:center;font:800 13px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:-.8px;box-shadow:0 2px 5px #173e3430}.tag{position:absolute;z-index:3;left:50%;bottom:-9px;transform:translateX(-50%);width:196px;max-width:196px;padding:4px 9px;border-radius:99px;background:#fff;color:#30554a;text-align:center;font:700 9px/1.2 -apple-system,BlinkMacSystemFont,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 3px 10px #173e3422}.trade{position:absolute;z-index:4;left:-23px;top:46px;opacity:0;font-size:25px;pointer-events:none;filter:drop-shadow(0 3px 3px #173e3430)}.trade.show{animation:trade 3s cubic-bezier(.13,.82,.28,1) forwards}.hot .glass{animation:shake .38s ease-in-out infinite alternate}.hot .cap{background:linear-gradient(180deg,#fff2e1,#ffc3ad)}@keyframes flow{to{transform:scaleY(.58);opacity:.25}}@keyframes shake{to{transform:translateX(1px) rotate(.7deg)}}@keyframes trade{0%{opacity:0;transform:translate(18px,22px) scale(.5)}16%{opacity:1}74%{opacity:1;transform:translate(-12px,-26px) scale(1.12)}100%{opacity:0;transform:translate(-20px,-36px) scale(.95)}}@media (prefers-reduced-motion:reduce){.hourglass,.sand-top,.sand-bottom{transition:none}.stream,.hot .glass,.trade.show{animation:none}.trade.show{opacity:1}}
  </style><div class="hourglass" role="status" aria-label="오늘의 스크롤 시간"><i class="cap top"></i><div class="glass"><i class="sand-top"></i><i class="sand-bottom"></i><i class="stream"></i></div><i class="cap bottom"></i><div class="time">00:00:00</div><div class="tag">재생 대기</div><div class="trade" aria-hidden="true"></div></div>`;
  root.querySelector('style').textContent += '.sand-top{clip-path:polygon(0 0,100% 0,56% 100%,44% 100%)}.hourglass.character .cap,.hourglass.character .glass{display:none}.hourglass.character .time{top:104px}.hourglass.character .tag{bottom:-4px}.mascot{overflow:visible!important;font-size:0!important}.mascot.volcano{display:block!important;background:linear-gradient(135deg,#712d2b 0 45%,#e85a36 46% 67%,#85332e 68%);clip-path:polygon(6% 100%,28% 43%,42% 59%,56% 13%,70% 58%,84% 42%,100% 100%);animation:volcano-rumble .36s ease-in-out infinite alternate!important}.volcano .lava{position:absolute;left:32px;top:9px;width:18px;height:30px;border-radius:50% 50% 45% 45%;background:#ffdf63;box-shadow:0 0 16px #ff713b;animation:lava-pop .72s ease-out infinite}.volcano i{position:absolute;width:9px;height:9px;border-radius:50%;background:#ff8b42;animation:spark .9s ease-out infinite}.volcano i:nth-child(2){left:13px;top:16px;animation-delay:.2s}.volcano i:nth-child(3){right:12px;top:5px;animation-delay:.48s}.mascot.cat{display:block!important;width:76px!important;height:62px!important;top:39px!important;left:24px!important;background:#f5b86d;border-radius:48% 48% 42% 42%;animation:cat-breathe 2.2s ease-in-out infinite!important}.cat:before,.cat:after{content:"";position:absolute;top:-13px;border-style:solid;border-width:0 15px 22px;border-color:transparent transparent #f5b86d}.cat:before{left:5px;transform:rotate(-16deg)}.cat:after{right:5px;transform:rotate(16deg)}.cat .eye{position:absolute;top:27px;width:12px;height:3px;border-top:3px solid #613d2d;border-radius:50%}.cat .eye:first-child{left:18px}.cat .eye:nth-child(2){right:18px}.cat .tail{position:absolute;right:-23px;bottom:5px;width:31px;height:17px;border:7px solid #f5b86d;border-left:0;border-bottom:0;border-radius:0 30px 0 0;transform-origin:left bottom;animation:tail 1.5s ease-in-out infinite}.cat .zzz{position:absolute;right:-10px;top:-22px;color:#795c99;font:700 14px sans-serif;animation:zzz 1.9s ease-in-out infinite}@keyframes volcano-rumble{to{transform:translateY(2px) rotate(.8deg)}}@keyframes lava-pop{0%{transform:scale(.55) translateY(12px);opacity:.4}55%{opacity:1}100%{transform:scale(1.1) translateY(-16px);opacity:0}}@keyframes spark{to{transform:translateY(-35px) translateX(8px);opacity:0}}@keyframes cat-breathe{50%{transform:scale(1.045,.94) translateY(2px)}}@keyframes tail{50%{transform:rotate(22deg)}}@keyframes zzz{50%{transform:translate(6px,-10px);opacity:.35}}';
  document.documentElement.append(host);
  const hourglass = root.querySelector('.hourglass');
  const hourglassParts = root.querySelectorAll('.cap, .glass');
  const mascot = document.createElement('div');
  mascot.className = 'mascot';
  mascot.style.cssText = 'position:absolute;z-index:5;left:22px;top:28px;width:80px;height:80px;display:none;place-items:center;font-size:64px;filter:drop-shadow(0 5px 4px #0004);animation:mascot 1.4s ease-in-out infinite alternate';
  hourglass.append(mascot);
  const time = root.querySelector('.time'), tag = root.querySelector('.tag'), trade = root.querySelector('.trade');
  const detail = document.createElement('div');
  detail.hidden = true;
  detail.setAttribute('role', 'status');
  detail.style.cssText = 'position:absolute;right:108px;bottom:10px;width:215px;padding:11px 12px;border-radius:15px;background:#fffffff5;color:#244238;font:600 11px/1.55 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 24px #173e3430';
  root.append(detail);
  let previous = null, busy = false, drag = null, dragged = false, lastBlock = null, tradeTimer, latest, latestKind;
  const opportunityIcon = block => block < 3 ? '🧘' : block < 6 ? '📖' : block < 12 ? '👟' : '🍳';
  hourglass.addEventListener('pointerdown', e => {
    const rect = host.getBoundingClientRect();
    drag = {x:e.clientX, y:e.clientY, left:rect.left, top:rect.top};
    dragged = false;
    hourglass.setPointerCapture(e.pointerId);
  });
  hourglass.addEventListener('pointermove', e => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) > 5 || Math.abs(e.clientY - drag.y) > 5) dragged = true;
    host.style.right = 'auto'; host.style.bottom = 'auto';
    host.style.left = Math.max(0, Math.min(innerWidth - host.offsetWidth, drag.left + e.clientX - drag.x)) + 'px';
    host.style.top = Math.max(0, Math.min(innerHeight - host.offsetHeight, drag.top + e.clientY - drag.y)) + 'px';
  });
  function showDetail() {
    if (!latest || !latestKind) return;
    const {today, block, points, combo, challenge} = latest;
    const viewCount = today[latestKind + 'Count'];
    const count = Number.isFinite(viewCount) ? ` · ${viewCount}개 시청` : '';
    detail.hidden = !detail.hidden;
    if (!detail.hidden) detail.innerHTML = `<strong style="font-size:12px">${labels[latestKind]}</strong><br>오늘 ${R.clock(today[latestKind] || 0)}${count}<br>이번 6시간 블록 ${R.clock(R.totalDuration(block))}<br>${points}P · ${combo} 콤보 · ${challenge.active ? challenge.goal + '분 목표 진행 중' : '챌린지 시작 전'}`;
  }
  hourglass.addEventListener('pointerup', () => { if (!dragged) showDetail(); drag = null; });
  hourglass.addEventListener('pointercancel', () => drag = null);
  window.addEventListener('resize', () => { host.style.left='auto';host.style.top='auto';host.style.right='18px';host.style.bottom='calc(118px + env(safe-area-inset-bottom, 0px))'; });
  function videoOnScreen() {
    return [...document.querySelectorAll('video')].filter(v => {
      const r = v.getBoundingClientRect();
      return r.width > 50 && r.height > 50 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    }).sort((a,b) => Number(b.paused === false)-Number(a.paused === false))[0];
  }
  function celebrateBlock(block) {
    if (!block || lastBlock === block) return;
    lastBlock = block;
    trade.textContent = opportunityIcon(block);
    trade.classList.remove('show');
    void trade.offsetWidth;
    trade.classList.add('show');
    clearTimeout(tradeTimer);
    tradeTimer = setTimeout(() => trade.classList.remove('show'), 3100);
  }
  const labels = {shorts:'YouTube Shorts', video:'YouTube 롱폼', reels:'Instagram 릴스', instagramFeed:'Instagram 피드', tiktok:'TikTok', everytime:'에브리타임 피드'};
  const videoKinds = new Set(['shorts','video','reels','tiktok']);
  function contentId(kind) {
    if (kind === 'shorts') return location.pathname.split('/')[2];
    if (kind === 'video') return new URL(location.href).searchParams.get('v');
    if (kind === 'reels') return location.pathname.split('/')[2];
    if (kind === 'tiktok') return location.pathname.split('/').filter(Boolean).at(-1);
    return null;
  }
  let view = {id:null, kind:null, watched:0, reported:false};
  async function tick() {
    if (busy) return;
    busy = true;
    try {
      const kind = R.kind(location.href), video = videoOnScreen();
      // Show the current item immediately; measurement/storage can take a
      // moment to reply after Safari injects the script into a new page.
      if (kind) tag.textContent = labels[kind];
      const ad = !!document.querySelector('.ad-showing, .ad-interrupting');
      const current = {kind,video,passive:!videoKinds.has(kind),at:performance.now(),position:video?.currentTime || 0,rate:video?.playbackRate || 1,
        eligible:!!(kind && document.visibilityState === 'visible' && (touchDevice || document.hasFocus()) && (videoKinds.has(kind) ? video && !video.paused && !video.ended && !video.seeking && video.readyState >= 3 && !video.webkitDisplayingFullscreen && video.webkitPresentationMode !== 'picture-in-picture' && !ad : true))};
      const ms = R.measured(previous,current); previous = current;
      const result = await Promise.race([webext.runtime.sendMessage({type:'sample',kind,ms}),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),4000))]);
      if (result.error) throw Error('storage');
      const total = R.totalDuration(result.today);
      const id = contentId(kind);
      if (id !== view.id || kind !== view.kind) view = {id,kind,watched:0,reported:false};
      if (ms > 0) view.watched += ms;
      if (!view.reported && videoKinds.has(kind) && id && view.watched >= 3000) {
        view.reported = true;
        webext.runtime.sendMessage({type:'view',kind,id});
      }
      latest = result; latestKind = kind;
      const nudge = R.nudge(total);
      const isWatching = result.settings.enabled && result.accepted > 0;
      host.style.display = kind ? 'block' : 'none';
      hourglass.style.setProperty('--accent', `hsl(${nudge.hue} 72% ${nudge.block > 8 ? 48 : 39}%)`);
      hourglass.dataset.theme = result.settings.theme || 'hourglass';
      const theme = result.settings.theme || 'hourglass';
      hourglass.classList.toggle('character', theme !== 'hourglass');
      hourglassParts.forEach(part => part.style.display = theme === 'hourglass' ? '' : 'none');
      mascot.style.display = theme === 'hourglass' ? 'none' : 'grid';
      mascot.className = 'mascot '+theme;
      mascot.innerHTML = theme === 'volcano' ? '<b class="lava"></b><i></i><i></i>' : theme === 'cat' ? '<b class="eye"></b><b class="eye"></b><i class="tail"></i><i class="zzz">z</i>' : '';
      hourglass.style.setProperty('--sand', String(Math.max(.04, 1 - Math.min(total / (result.settings.goal * 60000), 1))));
      hourglass.style.setProperty('--drop', `${Math.min(72, nudge.block * 6)}px`);
      hourglass.classList.toggle('hot', nudge.block >= 9);
      celebrateBlock(nudge.block);
      time.textContent = R.clock(total);
      tag.textContent = labels[kind];
    } catch {
      previous = null; tag.textContent = '연결 확인 중';
      host.style.display = R.kind(location.href) ? 'block' : 'none';
    } finally { busy = false; }
  }
  for (const event of ['blur','focus','pagehide']) window.addEventListener(event,()=>previous=null);
  document.addEventListener('visibilitychange',()=>previous=null);
  document.addEventListener('yt-navigate-start',()=>previous=null);
  document.addEventListener('fullscreenchange',()=>{ const target=document.fullscreenElement || document.documentElement; if (target.tagName !== 'VIDEO') target.append(host); previous=null; });
  setInterval(tick,1000); tick();
})();
