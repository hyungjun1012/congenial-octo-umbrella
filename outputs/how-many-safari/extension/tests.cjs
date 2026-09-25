const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const R = require('./rules.js');

test('Shorts, watch and unrelated routes are distinct', () => {
  assert.equal(R.kind('/shorts/abc'), 'shorts');
  assert.equal(R.kind('/watch'), 'video');
  assert.equal(R.kind('https://www.instagram.com/reel/abc/'), 'reels');
  assert.equal(R.kind('https://www.instagram.com/'), 'instagramFeed');
  assert.equal(R.kind('https://www.tiktok.com/@creator/video/123'), 'tiktok');
  assert.equal(R.kind('https://everytime.kr/community/board'), 'everytime');
  for (const path of ['/','/results','/shorts/','/feed/subscriptions']) assert.equal(R.kind(path), null);
});
const previous={at:1000,position:10,eligible:true,kind:'shorts',video:1,rate:1};
test('Only advancing, focused playback counts real time (including 2x playback)',()=>{
  assert.equal(R.measured(previous,{...previous,at:2000,position:11}),1000);
  assert.equal(R.measured(previous,{...previous,at:2000,position:12,rate:2}),1000);
  for (const change of [{eligible:false},{position:10},{position:40},{position:9},{at:9000},{video:2},{kind:'video'}]) {
    assert.equal(R.measured(previous,{...previous,at:2000,position:11,...change}),0);
  }
  assert.equal(R.measured({at:1000,eligible:true,kind:'instagramFeed',video:null,passive:true},{at:2000,eligible:true,kind:'instagramFeed',video:null,passive:true}),1000);
});
test('Color boundaries and duration formatting',()=>{
  assert.deepEqual([0,599999,600000,1799999,1800000].map(R.stage),['green','green','yellow','yellow','red']);
  assert.equal(R.clock(3661000),'01:01:01');
});
test('Five-minute nudges shift from green to red',()=>{
  assert.deepEqual([0,299999,300000,1500000,3600000].map(ms=>R.nudge(ms).block),[0,0,1,5,12]);
  assert.ok(R.nudge(0).hue > R.nudge(1800000).hue);
});
test('Intervals are split at local midnight',()=>{
  const midnight=new Date(2026,8,22).getTime();
  const days=R.addInterval({},midnight-700,midnight+300,'shorts');
  assert.equal(days['2026-09-21'].shorts,700);
  assert.equal(days['2026-09-22'].shorts,300);
});
function worker() {
  let listener, active=true,focused=true,data={};
  const context={HowManyRules:R,Date,URL,importScripts:()=>{},browser:{
    runtime:{onMessage:{addListener:fn=>listener=fn}},
    storage:{local:{get:async()=>structuredClone(data),set:async patch=>{data={...data,...structuredClone(patch)};}}},
    tabs:{get:async()=>({active,windowId:1})},windows:{get:async()=>({focused,state:'normal'})}
  }};
  vm.runInNewContext(fs.readFileSync(__dirname+'/background.js','utf8'),context);
  return {send:(message,sender={})=>new Promise(resolve=>listener(message,sender,resolve)),setFocus:a=>focused=a,setActive:a=>active=a};
}
const sender={tab:{id:1},url:'https://www.youtube.com/watch?v=test'};
const shortSender={tab:{id:1},url:'https://www.youtube.com/shorts/test'};
test('Concurrent samples are serialized without overwriting totals',async()=>{
  const w=worker();
  await Promise.all(Array.from({length:20},()=>w.send({type:'sample',ms:1000,kind:'video'},sender)));
  assert.equal((await w.send({type:'stats'})).today.video,20000);
});
test('Inactive tabs and disabled tracking cannot accumulate',async()=>{
  const w=worker(),sample={type:'sample',ms:1000,kind:'shorts'};
  w.setActive(false);assert.equal((await w.send(sample,shortSender)).accepted,0);
  w.setActive(true);await w.send({type:'settings',enabled:false});
  assert.equal((await w.send(sample,shortSender)).accepted,0);
  await w.send({type:'settings',enabled:true});assert.equal((await w.send(sample,shortSender)).accepted,1000);
});
test('New wallets start with 50 points and themes require a purchase', async()=>{
  const w=worker();
  const start = await w.send({type:'stats'});
  assert.equal(start.points,50);
  assert.equal(start.ownedThemes.hourglass,true);
  const purchased = await w.send({type:'purchaseTheme',theme:'volcano'});
  assert.equal(purchased.points,20);
  assert.equal(purchased.settings.theme,'volcano');
  const unavailable = await w.send({type:'purchaseTheme',theme:'cat'});
  assert.equal(unavailable.points,20);
  assert.equal(unavailable.purchaseError,'포인트가 부족해요.');
});
test('Supported sites are accepted; lookalike domains and HTTP rejected',async()=>{
  const w=worker(),sample={type:'sample',ms:1000,kind:'shorts'};
  assert.equal((await w.send(sample,{tab:{id:1},url:'https://m.youtube.com/shorts/a'})).accepted,1000);
  assert.equal((await w.send({type:'sample',ms:1000,kind:'reels'},{tab:{id:1},url:'https://www.instagram.com/reel/a/'})).accepted,1000);
  assert.equal((await w.send({type:'sample',ms:1000,kind:'tiktok'},{tab:{id:1},url:'https://www.tiktok.com/@a/video/1'})).accepted,1000);
  assert.equal((await w.send({type:'sample',ms:1000,kind:'everytime'},{tab:{id:1},url:'https://everytime.kr/board'})).accepted,1000);
  for (const url of ['https://www.youtube.com.evil.test/watch','http://m.youtube.com/shorts/a','https://example.com/']) {
    assert.equal((await w.send(sample,{tab:{id:1},url})).accepted,0);
  }
});
test('Reject oversized samples and content-script settings changes',async()=>{
  const w=worker();
  assert.equal((await w.send({type:'sample',ms:60000,kind:'video'},sender)).accepted,0);
  assert.equal((await w.send({type:'settings',enabled:false},sender)).settings.enabled,true);
});
