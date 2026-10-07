/* SPDX-License-Identifier: GPL-3.0-or-later
 * Copyright 2026 Chariot Technologies Lab (Extella).
 * File persistence adapter; source and full license accompany this package. */
(function () {
 'use strict';
 const H='playThrough angularVelocity position dy dt angle targetAngle ct lastCombo comboTime comboMultiplier delay'.split(' ');
 const B='settled fallingLane checked angle angularVelocity targetAngle deleted removed tint opacity initializing ict iter initLen attachedLane distFromHex'.split(' ');
 const W='lastGen last nextGen start ct difficulty dt prevTimeScored'.split(' ');
 const patterns='randomGeneration doubleGeneration crosswiseGeneration spiralGeneration circleGeneration halfCircleGeneration'.split(' ');
 const pick=(o,ks)=>Object.fromEntries(ks.filter(k=>o[k]!==undefined).map(k=>[k,o[k]]));
 const copy=o=>JSON.parse(JSON.stringify(o));
 let paused=false;
 const originalLoop=window.animLoop;
 window.animLoop=function(){if(paused){lastTime=Date.now();requestAnimFrame(window.animLoop);}else originalLoop();};
 const bar=document.createElement('section');bar.setAttribute('aria-label','Save and load game');bar.style.cssText='position:fixed;bottom:8px;left:8px;right:8px;z-index:10000;padding:10px;background:#fff;color:#243447;display:flex;gap:8px;align-items:center;font:14px system-ui;flex-wrap:wrap';
 const save=document.createElement('button'),load=document.createElement('button'),resume=document.createElement('button'),input=document.createElement('input'),status=document.createElement('span');
 save.textContent='Save game';load.textContent='Load game';resume.textContent='Continue game';resume.hidden=true;input.type='file';input.accept='.json,application/json';input.hidden=true;status.setAttribute('role','status');status.textContent='Save your board and score to a file. Temporary score labels and screen shake are not saved. File limit: 2 MB / 500 blocks.';for(const b of [save,load,resume])b.style.cssText='color:#fff;background:#243447;border:1px solid #243447;border-radius:4px;padding:8px 12px;font:14px system-ui;cursor:pointer';bar.append(save,load,resume,input,status);document.body.append(bar);for(const type of ['mousedown','mouseup','click','touchstart','touchend'])bar.addEventListener(type,e=>e.stopPropagation());
 for(const type of ['keydown','keyup','mousedown','mouseup','click','touchstart','touchend'])document.addEventListener(type,e=>{if(paused&&!bar.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);
 function block(b){return {...pick(b,B),color:b.color,distFromHex:b.distFromHex/settings.scale};}
 function snapshot(){
  if(!MainHex||![1,-1].includes(gameState))throw Error('Start a game before saving.');
  const pattern=patterns.find(k=>waveone[k]===waveone.currentFunction);if(!pattern)throw Error('Unsupported wave pattern.');
  return {format:'extella-hextris',version:1,hex:{...pick(MainHex,H),lastColorScored:MainHex.lastColorScored,blocks:MainHex.blocks.map(a=>a.map(block))},blocks:blocks.map(block),wave:{...pick(waveone,W),pattern},score,highscores:highscores.slice(),comboTime:settings.comboTime,palette:copy({colors,hexColorsToTintedColors,rgbToHex,rgbColorsToTintedColors})};
 }
 const num=x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=1e12;
 const integer=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
 function fields(o,ks,optional=[]){if(!o||typeof o!=='object'||Array.isArray(o)||!ks.every(k=>optional.includes(k)&&o[k]===undefined||num(o[k])))throw Error('Invalid numeric state.');}
 const allowedColors=['#e74c3c','#f1c40f','#3498db','#2ecc71','#8e44ad','#d35400'];
 const color=x=>typeof x==='string'&&(/^(#[0-9a-f]{3}(?:[0-9a-f]{3})?|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/i.test(x));
 function validate(d){
  if(d?.format!=='extella-hextris'||d.version!==1)throw Error('Unsupported save format.');
  if(!d.palette||!Array.isArray(d.palette.colors)||d.palette.colors.length!==4||!d.palette.colors.every(c=>allowedColors.includes(c)))throw Error('Invalid palette.');
  for(const k of ['hexColorsToTintedColors','rgbToHex','rgbColorsToTintedColors']){const m=d.palette[k];if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).length>16||!Object.entries(m).every(([k,v])=>color(k)&&color(v)))throw Error('Invalid palette map.');}
  fields(d.hex,H,['delay','comboMultiplier']);fields(d.wave,W,['prevTimeScored']);if(!patterns.includes(d.wave.pattern)||!integer(d.hex.position,0,5)||!integer(d.score,0,1e12)||!num(d.comboTime)||d.comboTime<=0)throw Error('Invalid game state.');
  if(!Array.isArray(d.highscores)||d.highscores.length>3||!d.highscores.every(x=>integer(x,0,1e12)))throw Error('Invalid scores.');
  if(!Array.isArray(d.hex.blocks)||d.hex.blocks.length!==6||!Array.isArray(d.blocks))throw Error('Invalid board.');
  const all=[...d.hex.blocks,d.blocks];if(!all.every(a=>Array.isArray(a)&&a.length<=100)||all.reduce((n,a)=>n+a.length,0)>500)throw Error('Too many blocks.');
  for(const a of all)for(const b of a){fields(b,B);if(!integer(b.fallingLane,0,5)||!integer(b.attachedLane,0,5)||!allowedColors.includes(b.color)||![0,1].includes(b.settled)||!integer(b.deleted,0,2)||!integer(b.removed,0,1)||!integer(b.checked,0,1)||!integer(b.initializing,0,1)||b.distFromHex<0||b.iter<0)throw Error('Invalid block.');}
  if(!/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(d.hex.lastColorScored))throw Error('Invalid color.');
 }
 function hydrate(d){
  const h=new Hex(settings.hexWidth);Object.assign(h,pick(d.hex,H));h.lastColorScored=d.hex.lastColorScored;h.lastRotate=0;h.y=trueCanvas.height/2;h.x=trueCanvas.width/2;
  const make=b=>{const n=new Block(b.fallingLane,b.color,b.iter,b.distFromHex*settings.scale,b.settled);Object.assign(n,pick(b,B));n.distFromHex=b.distFromHex*settings.scale;n.color=b.color;return n;};
  h.blocks=d.hex.blocks.map(a=>a.map(make));const incoming=d.blocks.map(make);const w=new waveGen(h);Object.assign(w,pick(d.wave,W));w.currentFunction=w[d.wave.pattern];return {h,incoming,w};
 }
 function apply(d){const {h,incoming,w}=hydrate(d);colors=d.palette.colors.slice();hexColorsToTintedColors=copy(d.palette.hexColorsToTintedColors);rgbToHex=copy(d.palette.rgbToHex);rgbColorsToTintedColors=copy(d.palette.rgbColorsToTintedColors);MainHex=h;blocks=incoming;waveone=w;score=d.score;highscores=d.highscores.slice();settings.comboTime=d.comboTime;gdx=0;gdy=0;importing=0;gameState=1;lastTime=Date.now();rush=1;settings.prevScale=settings.scale;hideUIElements();$('#pauseBtn').show();}
 save.onclick=()=>{try{const d=snapshot();validate(d);paused=true;resume.hidden=false;const url=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='hextris-save.json';a.hidden=true;bar.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Game exported and paused.';}catch(e){status.textContent='Could not save: '+e.message;}};
 load.onclick=()=>input.click();
 input.onchange=async()=>{try{const f=input.files[0];if(!f)return;if(f.size>2000000)throw Error('File exceeds 2 MB.');const d=JSON.parse(await f.text());validate(d);hydrate(d);paused=true;apply(d);render();apply(d);resume.hidden=false;status.textContent='Game loaded and paused.';}catch(e){status.textContent='Could not load: '+e.message;}finally{input.value='';}};
 resume.onclick=()=>{paused=false;lastTime=Date.now();gameState=1;resume.hidden=true;status.textContent='Game continued.';};
})();
