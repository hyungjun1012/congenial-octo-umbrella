const $ = id => document.getElementById(id);
const webext = globalThis.browser || globalThis.chrome;
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="shop.css">');

function render(result, preview=false) {
  const {today, settings} = result;
  const total = HowManyRules.totalDuration(today);
  $('total').textContent = HowManyRules.clock(total);
  for (const kind of ['shorts', 'video']) $(kind).textContent = `${HowManyRules.clock(today[kind])} · ${today[kind+'Count'] || 0}개`;
  $('instagram').textContent = `릴스 ${HowManyRules.clock(today.reels || 0)} · 피드 ${HowManyRules.clock(today.instagramFeed || 0)}`;
  $('tiktok').textContent = `${HowManyRules.clock(today.tiktok || 0)} · ${today.tiktokCount || 0}개`;
  $('everytime').textContent = HowManyRules.clock(today.everytime || 0);
  $('remaining').textContent = preview ? '미리보기 · 실제 기록은 Safari YouTube에서 시작돼요.' : total >= settings.goal * 60000 ? '오늘 목표 시간에 도달했어요.' : '목표 ' + settings.goal + '분 · 남은 시간 ' + HowManyRules.clock(settings.goal * 60000 - total);
  const nudge = HowManyRules.nudge(total);
  $('meter-fill').style.width = Math.min(100, total / (settings.goal * 60000) * 100) + '%';
  document.body.style.setProperty('--nudge', `hsl(${nudge.hue} 72% ${nudge.block > 8 ? 52 : 42}%)`);
  $('points').textContent = result.points || 0;
  const challenge = result.challenge || {active:false};
  $('challenge-title').textContent = challenge.active ? `${challenge.goal}분 이내 보기` : '시작 전';
  $('challenge-status').textContent = preview ? 'Safari 확장에서 6시간 목표를 지키면 포인트를 받습니다.' : challenge.active ? `이번 블록 ${HowManyRules.clock(HowManyRules.totalDuration(result.block))} · ${result.combo || 0} 콤보` : '이번 블록을 시작하면 목표 달성 시 20P를 받아요.';
  $('start-challenge').disabled = preview || challenge.active;
  $('start-challenge').textContent = challenge.active ? '이번 블록 진행 중' : '이번 블록 챌린지 시작';
  $('enabled').checked = settings.enabled;
  $('goal').value = String(settings.goal);
  for (const button of document.querySelectorAll('[data-theme]')) {
    const theme = button.dataset.theme, owned = !!result.ownedThemes?.[theme];
    button.classList.toggle('selected', settings.theme === theme);
    button.disabled = preview;
    button.querySelector('small').textContent = settings.theme === theme ? '사용 중' : owned ? '보유함 · 선택' : theme === 'volcano' ? '30 P 구매' : theme === 'cat' ? '50 P 구매' : '기본 제공';
  }
}

async function update(message={type:'stats'}) {
  try {
    const result = await webext.runtime.sendMessage(message);
    if (result.error) throw Error();
    render(result);
    $('error').textContent = result.purchaseError || '';
  } catch {
    $('error').textContent = '기록을 불러오지 못했어요. 확장을 다시 로드해 주세요.';
  }
}

if (webext?.runtime?.id && webext?.runtime?.sendMessage) {
  $('enabled').onchange = () => update({type:'settings', enabled:$('enabled').checked});
  $('goal').onchange = () => update({type:'settings', goal:Number($('goal').value)});
  document.querySelectorAll('[data-theme]').forEach(button => button.onclick = () => update({type:'purchaseTheme', theme:button.dataset.theme}));
  $('start-challenge').onclick = () => update({type:'startChallenge'});
  update();
  setInterval(() => update(), 1000);
} else {
  render({today:{shorts:7*60000, video:5*60000, shortsCount:9, videoCount:1}, block:{shorts:7*60000,video:5*60000}, challenge:{active:true,goal:30}, settings:{enabled:true, goal:30}, points:0, combo:0}, true);
  $('enabled').disabled = true;
  $('goal').disabled = true;
  $('error').textContent = '이 페이지는 UI 미리보기입니다. 실제 측정은 Safari 확장 프로그램에서 실행됩니다.';
}
