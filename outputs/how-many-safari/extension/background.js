importScripts('rules.js');
const webext = globalThis.browser || globalThis.chrome;
const defaults = {enabled:true, goal:30, theme:'hourglass'};
const themePrice = {hourglass:0, volcano:30, cat:50};
let queue = Promise.resolve();
const row = value => ({shorts:0, video:0, reels:0, instagramFeed:0, tiktok:0, everytime:0, shortsCount:0, videoCount:0, reelsCount:0, tiktokCount:0, ...value});
const total = value => HowManyRules.totalDuration(row(value));
const safeId = id => typeof id === 'string' && /^[\w-]{1,80}$/.test(id) ? id : null;

async function isActiveSupportedSite(sender) {
  try {
    const url = new URL(sender.url);
    if (url.protocol !== 'https:' || !HowManyRules.kind(url.href)) return false;
    return (await webext.tabs.get(sender.tab.id)).active;
  } catch { return false; }
}

function settleChallenge(challenge, currentKey, points, combo) {
  if (!challenge.active || challenge.key === currentKey || challenge.settled) return {challenge, points, combo, earned:0};
  challenge.settled = true;
  if (total(challenge.usage) > challenge.goal * 60000) return {challenge, points, combo:0, earned:0};
  combo += 1;
  const bonus = combo === 2 ? 5 : combo === 3 ? 10 : combo >= 4 ? 20 : 0;
  return {challenge, points:points + 20 + bonus, combo, earned:20 + bonus};
}

async function handle(message, sender) {
  const saved = await webext.storage.local.get(['days','blocks','settings','points','combo','challenge','seen','walletInitialized','ownedThemes']);
  const days = saved.days || {}, blocks = saved.blocks || {}, settings = {...defaults,...saved.settings};
  let points = saved.walletInitialized ? (Number(saved.points) || 0) : 50, combo = Number(saved.combo) || 0;
  const ownedThemes = {hourglass:true,...saved.ownedThemes};
  let challenge = saved.challenge || {active:false};
  const now = new Date(), key = HowManyRules.blockKey(now);
  let settled = settleChallenge(challenge, key, points, combo);
  challenge = settled.challenge; points = settled.points; combo = settled.combo;
  if (challenge.settled) challenge = {active:false, lastEarned:settled.earned};
  let accepted = 0;
  if (message.type === 'startChallenge' && !sender.tab) {
    challenge = {active:true, key, goal:settings.goal, usage:row(), settled:false};
  }
  if (message.type === 'sample' && settings.enabled && sender.tab && HowManyRules.durationFields.includes(message.kind)) {
    const ms = Number(message.ms);
    if (Number.isFinite(ms) && ms > 0 && ms <= 2500 && HowManyRules.kind(sender.url) === message.kind && await isActiveSupportedSite(sender)) {
      const end = Date.now();
      HowManyRules.addInterval(days, end-ms, end, message.kind);
      const block = row(blocks[key]); block[message.kind] += ms; blocks[key] = block;
      if (challenge.active && challenge.key === key) challenge.usage[message.kind] += ms;
      accepted = ms;
    }
  }
  if (message.type === 'view' && sender.tab && ['shorts','video','reels','tiktok'].includes(message.kind) && safeId(message.id) && HowManyRules.kind(sender.url) === message.kind && await isActiveSupportedSite(sender)) {
    const seen = saved.seen || {};
    const day = HowManyRules.dayKey(now), seenKey = `${day}:${message.kind}:${message.id}`;
    if (!seen[seenKey]) {
      seen[seenKey] = true;
      const daily = row(days[day]); daily[message.kind + 'Count'] += 1; days[day] = daily;
      const block = row(blocks[key]); block[message.kind + 'Count'] += 1; blocks[key] = block;
      for (const old of Object.keys(seen)) if (!old.startsWith(day + ':')) delete seen[old];
      await webext.storage.local.set({seen});
    }
  }
  if (message.type === 'settings' && !sender.tab) {
    if (typeof message.enabled === 'boolean') settings.enabled = message.enabled;
    if ([15,20,30,45,60].includes(message.goal)) settings.goal = message.goal;
    if (ownedThemes[message.theme]) settings.theme = message.theme;
  }
  let purchaseError = '';
  if (message.type === 'purchaseTheme' && !sender.tab && Object.hasOwn(themePrice, message.theme)) {
    if (ownedThemes[message.theme]) settings.theme = message.theme;
    else if (points < themePrice[message.theme]) purchaseError = '포인트가 부족해요.';
    else {
      points -= themePrice[message.theme];
      ownedThemes[message.theme] = true;
      settings.theme = message.theme;
    }
  }
  for (const old of Object.keys(days).sort().slice(0,-90)) delete days[old];
  await webext.storage.local.set({days,blocks,settings,points,combo,challenge,ownedThemes,walletInitialized:true});
  const today = row(days[HowManyRules.dayKey(now)]);
  return {today, block:row(blocks[key]), settings, points, combo, challenge, ownedThemes, purchaseError, accepted, earned:settled.earned};
}
webext.runtime.onMessage.addListener((message,sender,reply) => {
  if (!message || !['sample','view','stats','settings','startChallenge','purchaseTheme'].includes(message.type)) return;
  queue = queue.then(()=>handle(message,sender)).then(reply).catch(()=>reply({error:true}));
  return true;
});
