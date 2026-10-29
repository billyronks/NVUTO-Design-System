import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');const write=(p,v)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2)+'\n');};
const snapshot=JSON.parse(read('audit/source-snapshot.json'));
const css=read('audit/as-is/src/styles/theme.css');
const origin=(selector,symbol,raw)=>({path:'src/styles/theme.css',selector,symbol,revision:snapshot.revision,evidence:'OBSERVED',adoption:'candidate',sourceCSS:raw});
const extensions=(selector,symbol,raw)=>({'io.nvuto.extraction':origin(selector,symbol,raw)});
const core={primitive:{color:{},spacing:{},size:{},motion:{}},component:{button:{},layout:{}}};
function typed(raw){
 if(/^#[\da-f]{3,8}$/i.test(raw)){let x=raw.slice(1);if(x.length===3||x.length===4)x=[...x].map(v=>v+v).join('');return{$type:'color',$value:{colorSpace:'srgb',components:[0,2,4].map(i=>parseInt(x.slice(i,i+2),16)/255),alpha:x.length===8?parseInt(x.slice(6),16)/255:1}};}
 if(raw==='transparent')return{$type:'color',$value:{colorSpace:'srgb',components:[0,0,0],alpha:0}};
 if(/^rgba?\(/.test(raw)){const v=raw.match(/[\d.]+/g).map(Number);return{$type:'color',$value:{colorSpace:'srgb',components:v.slice(0,3).map(n=>n/255),alpha:v[3]??1}};}
 if(/^oklch\(/.test(raw)){const v=raw.match(/[\d.]+/g).map(Number);return{$type:'color',$value:{colorSpace:'oklch',components:v.slice(0,3),alpha:v[3]??1}};}
 const dim=raw.match(/^(-?[\d.]+)(px|rem)$/);if(dim)return{$type:'dimension',$value:{value:Number(dim[1]),unit:dim[2]}};
 const duration=raw.match(/^([\d.]+)(ms|s)$/);if(duration)return{$type:'duration',$value:{value:Number(duration[1]),unit:duration[2]}};
 if(/^\d+$/.test(raw))return{$type:'number',$value:Number(raw)};
 if(/Poppins|JetBrains/.test(raw))return{$type:'fontFamily',$value:raw.split(',').map(x=>x.trim().replace(/^['"]|['"]$/g,''))};
 return{$type:'string',$value:raw};
}
function declarations(selector){const at=css.indexOf(selector+' {');if(at<0)throw Error('Missing '+selector);return Object.fromEntries([...css.slice(at,css.indexOf('\n}',at)).matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));}
const light=declarations(':root'),dark={...light,...declarations('.dark')};
for(const [theme,values]of Object.entries({light,dark})){
 const semantic={};for(const [name,raw]of Object.entries(values)){
  let token=typed(raw);if(token.$type==='color'){
   const key=(raw.replaceAll('#','hex-').replace(/[^a-z\d]+/gi,'-').replace(/-$/,'')).toLowerCase();
   core.primitive.color[key]??={...token,$extensions:extensions(theme==='light'?':root':'.dark','--'+name,raw)};
   token={...token,$value:`{primitive.color.${key}}`};
  }
  semantic[name]={...token,$extensions:extensions(theme==='light'?':root':'.dark','--'+name,raw)};
 }
 write(`tokens/${theme}.tokens.json`,{semantic});
}
// These values are explicitly used by source controls/layouts; framework scale
// relationships are recorded as inferred rather than global Nvuto approval.
for(const n of [0,0.5,1,1.5,2,2.5,3,3.5,4,5,6,8,10,12,16])core.primitive.spacing['step-'+String(n).replace('.','-')]={$type:'dimension',$value:{value:n*0.25,unit:'rem'},$extensions:{'io.nvuto.extraction':{path:'src/styles/tailwind.css',symbol:'Tailwind 4 spacing scale used by component utilities',revision:snapshot.revision,evidence:'INFERRED',derivation:`${n} × 0.25rem`,sourceCSS:`${n*0.25}rem`,adoption:'candidate'}}};
for(const n of [16,18,20,24,28,36,44,48,56,240,280,320,512])core.primitive.size['px-'+n]={$type:'dimension',$value:{value:n,unit:'px'},$extensions:{'io.nvuto.extraction':{path:'src/app/components/ui/button.tsx',symbol:'control/icon/layout utility values; see raw-value/utility inventory for actual usages',revision:snapshot.revision,evidence:'OBSERVED',sourceCSS:n+'px',adoption:'candidate'}}};
for(const n of [150,180,200,300])core.primitive.motion['ms-'+n]={$type:'duration',$value:{value:n,unit:'ms'},$extensions:{'io.nvuto.extraction':{path:'src/app/components/ui/Modal.tsx',symbol:'motion transitions and shared transition utilities',revision:snapshot.revision,evidence:'OBSERVED',sourceCSS:n+'ms',adoption:'candidate'}}};
core.component.button={height:{$type:'dimension',$value:'{primitive.size.px-44}',$extensions:{'io.nvuto.extraction':{path:'src/app/components/ui/button.tsx',symbol:'buttonVariants.size.md',revision:snapshot.revision,evidence:'OBSERVED',adoption:'candidate'}}},background:{$type:'color',$value:'{semantic.primary}',$extensions:{'io.nvuto.extraction':{path:'src/app/components/ui/button.tsx',symbol:'buttonVariants.variant.primary',revision:snapshot.revision,evidence:'PROPOSED',reason:'Alias matches observed source primary value; does not normalize contrasting component values',adoption:'candidate'}}}};
write('tokens/core.tokens.json',core);
write('tokens/profile.json',{format:'DTCG Format Module 2025.10 typed subset',specification:'https://www.designtokens.org/tr/2025.10/format/',editable:['core.tokens.json','light.tokens.json','dark.tokens.json'],extensions:'io.nvuto.extraction preserves exact CSS source, selector, symbol, evidence and revision',deviations:['No claim of complete DTCG tool conformance: this fixed-input generator supports the listed types and whole-token curly aliases, not group $extends, property-level references, JSON-pointer $ref or externally supplied token documents. Unsupported constructs are rejected.','Additional string tokens preserve CSS expressions without pretending they are fully structured DTCG shadows/gradients.','Themes are separate token documents merged with shared core; this is project build configuration, not a new DTCG theme syntax.']});
console.log('Extracted editable core/light/dark token sources.');
