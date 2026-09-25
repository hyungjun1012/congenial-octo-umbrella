/* Shared, pure measurement rules. */
(function (root) {
  const durationFields = ['shorts', 'video', 'reels', 'instagramFeed', 'tiktok', 'everytime'];
  const kind = input => {
    let url;
    try { url = new URL(input); } catch { url = new URL(input, 'https://www.youtube.com'); }
    const host = url.hostname.replace(/^(www|m)\./, ''), path = url.pathname;
    if (host === 'youtube.com') return /^\/shorts\/[^/]+/.test(path) ? 'shorts' : path === '/watch' ? 'video' : null;
    if (host === 'instagram.com') return /^\/(reel|reels)\/?/.test(path) ? 'reels' : (path === '/' || /^\/explore\/?/.test(path)) ? 'instagramFeed' : null;
    if (host === 'tiktok.com') return path === '/' || /^\/(foryou|@[^/]+\/video\/[^/]+|@[^/]+)\/?/.test(path) ? 'tiktok' : null;
    if (host === 'everytime.kr') return /^\/(login|register|find)/.test(path) ? null : 'everytime';
    return null;
  };
  const dayKey = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const blockKey = date => `${dayKey(date)}-${String(Math.floor(date.getHours() / 6) * 6).padStart(2, '0')}`;
  const clock = ms => {
    const s = Math.floor(Math.max(0, ms) / 1000);
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, '0')).join(':');
  };
  const stage = ms => ms < 600000 ? 'green' : ms < 1800000 ? 'yellow' : 'red';
  // A five-minute step interrupts automatic scrolling without becoming noisy.
  const nudge = ms => {
    const block = Math.min(12, Math.floor(Math.max(0, ms) / 300000));
    return {block, hue: Math.max(0, 132 - block * 11)};
  };
  const opportunity = ms => {
    const minutes = Math.floor(Math.max(0, ms) / 60000);
    if (minutes < 5) return '아직은 가벼운 한 편이에요.';
    if (minutes < 15) return '이 시간으로 목과 어깨를 한 번 풀 수 있어요.';
    if (minutes < 30) return '이 시간으로 책 5~10쪽을 읽을 수 있어요.';
    if (minutes < 60) return '이 시간으로 3km를 가볍게 걸을 수 있어요.';
    return '이 시간으로 한 끼를 천천히 준비할 수 있어요.';
  };
  function measured(previous, current) {
    if (!previous || !previous.eligible || !current.eligible || previous.kind !== current.kind || previous.video !== current.video) return 0;
    const elapsed = current.at - previous.at;
    if (previous.passive && current.passive) return elapsed > 0 && elapsed <= 2500 ? elapsed : 0;
    const progress = current.position - previous.position;
    // Ignore sleep/throttling gaps, buffering, backwards seeks and jumps.
    if (elapsed <= 0 || elapsed > 2500 || progress <= 0 || progress > elapsed / 1000 * current.rate + 1) return 0;
    return elapsed;
  }
  function addInterval(days, start, end, type) {
    let cursor = start;
    while (cursor < end) {
      const date = new Date(cursor), key = dayKey(date);
      const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
      const next = Math.min(end, midnight);
      const row = days[key] || {};
      row[type] = (Number(row[type]) || 0) + next - cursor;
      days[key] = row;
      cursor = next;
    }
    return days;
  }
  const totalDuration = row => durationFields.reduce((sum, field) => sum + (Number(row?.[field]) || 0), 0);
  root.HowManyRules = {kind, durationFields, totalDuration, dayKey, blockKey, clock, stage, nudge, opportunity, measured, addInterval};
  if (typeof module !== 'undefined') module.exports = root.HowManyRules;
})(globalThis);
