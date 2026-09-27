import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(resolve(root,p),'utf8');
const html=read('index.html'), css=read('styles.css'), js=read('main.js');
let checks=0;
function test(name, fn){fn();checks++;console.log(`PASS ${name}`);}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
test('Unique IDs and one complete main landmark',()=>{
  assert.equal(new Set(ids).size,ids.length);
  assert.equal((html.match(/<main\b/g)||[]).length,1);
  assert.equal((html.match(/<\/main>/g)||[]).length,1);
  assert(html.indexOf('</main>')>html.indexOf('id="early-access"'));
  assert(html.indexOf('</main>')<html.indexOf('<footer'));
});
test('All fragment destinations exist',()=>{
  for(const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id),id);
});
test('All local runtime references exist',()=>{
  const refs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
  for(const [,set] of html.matchAll(/srcset="([^"]+)"/g)) refs.push(...set.split(',').map(s=>s.trim().split(' ')[0]));
  refs.push(...[...css.matchAll(/url\("([^"]+)"\)/g)].map(m=>m[1]));
  for(let ref of refs){
    if(/^(?:https?:|mailto:|#)/.test(ref))continue;
    assert(!ref.includes('.dev/'),ref);
    ref=ref.replace(/^\//,'');
    let file=resolve(root,ref);
    if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
    assert(existsSync(file),`Missing ${ref}`);
  }
  assert(existsSync(resolve(root,'assets/og/living-page-card.png')),'Open Graph image');
});
test('Founder quote and truthful access action retained',()=>{
  assert(html.includes('I built InnerReset because some feelings don’t need advice — they need somewhere to go, and something to come back to. No feed. No streaks. Just your words, made worth keeping. If that’s what you’ve been missing, I’d love you in early access.'));
  assert(html.includes('Benyachou Doha'));
  assert.equal((html.match(/href="mailto:support@innerreset.life\?subject=Early%20access"/g)||[]).length,3);
  assert(!html.includes('apps.apple.com'));
});
test('Static content and motion fallbacks',()=>{
  assert(!/<(?:audio|video)\b/i.test(html));
  assert(css.includes('@media(prefers-reduced-motion:reduce)'));
  assert(css.includes('@media(forced-colors:active)'));
  assert(!/<div class="experience-panel"[^>]*\bhidden/.test(html));
  assert(!/<svg\b/.test(html));
  assert(js.length<14000);assert(css.length<40000);
  assert.equal(read('CNAME').trim(),'innerreset.life');
});
test('Real brush font, single semantic titles and solid-text fallbacks',()=>{
  assert.equal((html.match(/class="[^"]*\bpainted-heading\b/g)||[]).length,9);
  assert(![html,css,js].some(source=>source.includes('ink-texture')),'No decorative text clones');
  assert(!css.includes('background-clip:text'),'No texture-painted serif substitute');
  assert(css.includes('--display:"Kaushan Script",Georgia,serif'));
  assert(css.includes('font-family:var(--display);font-weight:400;font-synthesis:none;letter-spacing:0'));
  assert(css.includes('.painted-heading{color:var(--action)'));
  assert(/@media\(forced-colors:active\)\{\.painted-heading\{color:CanvasText\}/.test(css));
  assert(html.includes('href="assets/fonts/KaushanScript-Regular.ttf" as="font"'));
  const font=readFileSync(resolve(root,'assets/fonts/KaushanScript-Regular.ttf'));
  assert.equal(createHash('sha256').update(font).digest('hex'),'6d8d379d9bba98178bee476d68114c8f83812c18005ecccf679e70f60e03d8f6');
  assert(font.length<250000);
  assert(read('assets/fonts/KaushanScript-OFL.txt').includes('SIL OPEN FONT LICENSE'));
});
test('Asset manifest hashes, responsive dimensions and transfer budget',()=>{
  const manifest=JSON.parse(read('assets/living-page/manifest.json'));
  for(const asset of [...manifest.produce,...manifest.direct]){
    const bytes=readFileSync(resolve(root,asset.output_path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.output_sha256,asset.id);
    if(asset.output_path.endsWith('.webp')) assert(bytes.length<500000,`${asset.id} exceeds 500 kB`);
  }
  const byPath=new Map([...manifest.produce,...manifest.direct].map(a=>[a.output_path,a]));
  for(const tag of html.matchAll(/<img\b[^>]*>/g)){
    const src=tag[0].match(/src="([^"]+)"/)?.[1];
    const asset=byPath.get(src);
    const width=Number(tag[0].match(/\bwidth="(\d+)"/)?.[1]);
    const height=Number(tag[0].match(/\bheight="(\d+)"/)?.[1]);
    assert(width>0&&height>0,`Intrinsic dimensions: ${src}`);
    if(asset?.dimensions) assert(Math.abs(width/height-asset.dimensions[0]/asset.dimensions[1])<.01,`Aspect ratio: ${src}`);
  }
  const masters=[...manifest.produce,...manifest.direct].filter(a=>a.output_path.endsWith('.webp')&&!a.id.endsWith('-600'));
  const total=masters.reduce((sum,a)=>sum+a.bytes,0);
  assert(total<2500000,`Runtime WebP masters ${total} bytes exceed 2.5 MB`);
  console.log(`Runtime WebP masters: ${total} bytes (mobile alternatives excluded).`);
});
class Element{
  constructor(dataset={},attrs={}){this.dataset=dataset;this.attrs=attrs;this.listeners={};this.hidden=false;this.tabIndex=0;this.classes=new Set();this.classList={add:(c)=>this.classes.add(c),remove:(c)=>this.classes.delete(c),toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)};}
  setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,v){this.listeners[k]=v;}focus(){this.focused=true;}
  fire(name,event={}){this.listeners[name]?.({preventDefault(){},...event});}
}
function mount(hash='',reduced=false){
  const tabs=['carry','mind'].map(name=>new Element({experience:name}));
  const panels=['carry','mind'].map(name=>new Element({panel:name}));
  const picks=['carry','mind'].map(name=>new Element({choose:name}));
  const tablist=new Element(), menu=new Element({}, {'aria-expanded':'false'}),nav=new Element(),target=new Element(),doc=new Element();
  const lookup={'.experience-tabs':tablist,'.menu-toggle':menu,'#site-nav':nav,'#early-access':target};
  doc.documentElement=new Element();doc.querySelector=sel=>lookup[sel]||null;
  doc.querySelectorAll=sel=>sel==='[data-experience]'?tabs:sel==='[data-panel]'?panels:sel==='[data-choose]'?picks:[];
  const mediaEvents={},windowEvents={},location={hash};
  const win={matchMedia:query=>({matches:query.includes('max-width')||reduced,addEventListener:(name,fn)=>{mediaEvents[query]=fn;}}),addEventListener:(name,fn)=>{windowEvents[name]=fn;}};
  vm.runInNewContext(js,{document:doc,window:win,location});
  return {tabs,panels,picks,tablist,menu,nav,target,doc,mediaEvents,windowEvents,location};
}
test('Carry/Mind click, arrow, Home and End states',()=>{
  const {tabs,panels,picks,tablist}=mount();
  assert.equal(tablist.attrs.role,'tablist');assert.equal(tabs[0].attrs['aria-selected'],'true');assert(panels[1].hidden);
  tabs[1].fire('click');assert(panels[0].hidden);assert(!panels[1].hidden);assert.equal(tabs[1].tabIndex,0);
  tabs[1].fire('keydown',{key:'ArrowLeft'});assert(!panels[0].hidden);assert(tabs[0].focused);
  tabs[0].fire('keydown',{key:'End'});assert(!panels[1].hidden);
  tabs[1].fire('keydown',{key:'Home'});assert(!panels[0].hidden);
  picks[1].fire('click');assert(!panels[1].hidden);
});
test('Deep-link and reduced-motion tab behavior',()=>{
  const {tabs,panels,windowEvents,location}=mount('#mind-example',true);
  assert(!panels[1].hidden);assert(panels[0].hidden);
  tabs[0].fire('click');assert(!panels[0].classes.has('is-changing'));
  location.hash='#mind-example';windowEvents.hashchange();assert(!panels[1].hidden);
});
test('Mobile menu, Escape, link focus and breakpoint reset',()=>{
  const {menu,nav,target,doc,mediaEvents}=mount();
  assert(!menu.hidden);menu.fire('click');assert.equal(menu.attrs['aria-expanded'],'true');assert(nav.classes.has('is-open'));
  doc.fire('keydown',{key:'Escape'});assert.equal(menu.attrs['aria-expanded'],'false');assert(menu.focused);
  menu.fire('click');nav.fire('click',{target:{closest:()=>({getAttribute:()=> '#early-access'})}});
  assert.equal(menu.attrs['aria-expanded'],'false');assert(target.focused);assert.equal(target.attrs.tabindex,'-1');
  target.fire('blur');assert.equal(target.attrs.tabindex,undefined);
  menu.fire('click');mediaEvents['(max-width: 1050px)']();assert.equal(menu.attrs['aria-expanded'],'false');
});
console.log(`${checks} checks passed.`);
