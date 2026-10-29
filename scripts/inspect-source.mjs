import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.resolve(process.argv[2]||'');
if(!fs.existsSync(path.join(source,'src/app/components/ui/index.ts'))) throw Error('Pass the NVUTO HR source directory explicitly.');
const req=createRequire(path.join(source,'package.json'));
const ts=req('typescript');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const id=(family,key)=>family+'-'+hash(key).slice(0,12);
const read=p=>fs.readFileSync(path.join(source,p),'utf8');
const write=(p,v)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');};
const git=(...args)=>execFileSync('git',['-c',`safe.directory=${source.replaceAll('\\','/')}`,...args],{cwd:source,encoding:'utf8',maxBuffer:64*1024*1024}).trim();
const revision=git('rev-parse','HEAD');
const tracked=git('ls-files','--','src','public','nvuto-superadmin-web/src','package.json','package-lock.json','tailwind.config.js','vite.config.ts').split('\n');
const dirty=git('status','--porcelain');
const stack=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const uiFiles=tracked.filter(p=>/^src\/app\/components\/ui\/[^/]+\.(tsx?|css)$/.test(p)&&!p.endsWith('/index.ts'));
const appFiles=tracked.filter(p=>/^(src|nvuto-superadmin-web\/src)\//.test(p)&&/\.(tsx?|css)$/.test(p)&&!/(?:\/tests\/|\.__tests__\/|\/__tests__\/|\.test\.|\.spec\.)/.test(p));
const parsed=new Map(), imports=new Map(), usages=new Map();
for(const p of appFiles){
 const sf=ts.createSourceFile(p,read(p),ts.ScriptTarget.Latest,true,p.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 parsed.set(p,sf);
 const im=[];const use=[];
 function visit(n){
  if(ts.isImportDeclaration(n)&&n.moduleSpecifier&&ts.isStringLiteral(n.moduleSpecifier)){
   const module=n.moduleSpecifier.text;
   const names=[];
   if(n.importClause?.name)names.push(n.importClause.name.text);
   for(const el of n.importClause?.namedBindings?.elements||[])names.push(el.name.text);
   im.push({module,names,line:sf.getLineAndCharacterOfPosition(n.pos).line+1});
  }
  if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))use.push(n.tagName.getText(sf));
  ts.forEachChild(n,visit);
 }visit(sf);imports.set(p,im);usages.set(p,use);
}
const knownCoupled={
 'select.tsx':'Business option loading must be replaced by explicit options; presentation adapter required.',
 'PasswordStrengthInput.tsx':'Password strength heuristics are authentication policy; document only, use Input presentation in shared core.',
 'BrandIcons.tsx':'Third-party provider marks; redistribution permissions not established.',
 'InteractiveGridBackground.tsx':'Product decorative/global-theme behavior; retain as evidence, not shared core.',
 'NvutoConfirmModal.tsx':'Application confirmation context types; document composition using Dialog/Modal.',
 'NvutoPromptModal.tsx':'Application prompt context types; document form-dialog composition.',
 'NetworkStatusIndicator.tsx':'Browser connectivity/global reload behavior; extract state presentation through StatePanel pattern.',
 'ErrorBoundary.tsx':'Application error diagnostics/reload/navigation behavior; document boundary integration separately.'
};
const items=[];
for(const p of uiFiles){
 const sf=parsed.get(p)||ts.createSourceFile(p,read(p),99,true), exports=[];
 function visit(n){
  if(n.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)){
   const names=n.name?[n.name.text]:n.declarationList?.declarations?.map(d=>d.name.getText(sf))||[];
   for(const name of names)if(name)exports.push({name,line:sf.getLineAndCharacterOfPosition(n.pos).line+1,kind:ts.SyntaxKind[n.kind]});
  }
  if(ts.isExportDeclaration(n)&&n.exportClause?.elements)for(const e of n.exportClause.elements)exports.push({name:e.name.text,line:sf.getLineAndCharacterOfPosition(n.pos).line+1,kind:'NamedExport'});
  ts.forEachChild(n,visit);
 }visit(sf);
 const name=path.basename(p);const reason=knownCoupled[name];
 const deps=imports.get(p)||[];
 const external=deps.filter(d=>!d.module.startsWith('.')).map(d=>d.module);
 const used=appFiles.filter(f=>f!==p&&((imports.get(f)||[]).some(i=>i.module.endsWith('/'+name.replace(/\.tsx?$/,''))||i.module.endsWith('/ui')))&&((usages.get(f)||[]).some(u=>exports.some(e=>e.name===u))));
 items.push({id:id('ui',p),name,source:{path:p,revision,sha256:hash(read(p)),exports},usage:{fileCount:used.length,examples:used.slice(0,8)},classification:reason?'product-specific pattern':'shared primitive',evidence:'OBSERVED',adoption:'candidate',inspection:'AST + imports; manual family review pending',extraction:name==='select.tsx'?'adapter required':reason?'documented only':'selected for extraction',destination:reason&&name!=='select.tsx'?`docs/migration/source-boundaries.md`:`packages/react/src/${name}`,validation:'not run',blocker:reason||null,dependencies:deps,externalDependencies:external});
}
const routes=[];
const app=parsed.get('src/app/App.tsx');
function routeVisit(n){if((ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))&&n.tagName.getText(app)==='Route'){
 const attrs=n.attributes.properties;
 const a=attrs.find(x=>x.name?.text==='path');
 if(a&&a.initializer&&ts.isStringLiteral(a.initializer)){
  const snippet=n.getText(app);const targets=[...snippet.matchAll(/<([A-Z][A-Za-z0-9]+)/g)].map(m=>m[1]).filter(x=>!['Route','AuthGuard','Navigate','CandidateAuthGuard'].includes(x));
  const target=targets.at(-1)||null;const imp=(imports.get('src/app/App.tsx')||[]).find(i=>i.names.includes(target));
  routes.push({id:id('route',a.initializer.text),path:a.initializer.text,source:{path:'src/app/App.tsx',line:app.getLineAndCharacterOfPosition(n.pos).line+1,revision},target,import:imp?.module||null,roleContract:(snippet.match(/allowedRoles=\{(\[[^\]]*\])/s)||[])[1]||'inherited/public/dynamic',feature:(snippet.match(/requiredFeatureFlag="([^"]+)"/)||[])[1]||null,classification:'product-specific screen',inspection:'AST enumerated; runtime sampling only',extraction:'documented only',destination:'docs/patterns/product-screen-map.md',validation:'not run'});
 }}ts.forEachChild(n,routeVisit);}routeVisit(app);
const screens=appFiles.filter(p=>p.endsWith('.tsx')&&!p.startsWith('src/app/components/ui/')).map(p=>({id:id('screen',p),source:{path:p,revision,sha256:hash(read(p))},exports:(read(p).match(/export (?:const|function|class) ([A-Z]\w+)/g)||[]),classification:p.startsWith('nvuto-superadmin')?'parallel platform-console implementation':p.includes('/layout/')?'product shell/composition':'product UI',inspection:'AST enumerated; source file not copied',extraction:'product-specific',destination:'docs/patterns/product-screen-map.md',validation:'not run'}));
const values=new Map();
for(const p of appFiles){const text=read(p);for(const m of text.matchAll(/#[\da-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch)\([^\)]+\)|\b\d+(?:\.\d+)?(?:px|rem|em|ms|vh|vw|dvh)\b/g)){
 const value=m[0], key=value;const row=values.get(key)||{id:id('literal',key),value,classification:value.startsWith('#')||value.includes('(')?'color':'dimension/motion',occurrences:[]};
 row.occurrences.push({path:p,line:text.slice(0,m.index).split('\n').length});values.set(key,row);
}}
const utilities=new Map();for(const [p,sf]of parsed){function visit(n){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))for(const v of n.text.split(/\s+/)){if(/^(?:(?:dark|sm|md|lg|xl|hover|focus|focus-visible|disabled|active):)*(?:bg|text|border|ring|rounded|shadow|p[trblxy]?|m[trblxy]?|gap|w|h|min-w|min-h|max-w|max-h|duration|ease|z|grid-cols|backdrop-blur)-/.test(v)){const row=utilities.get(v)||{id:id('utility',v),value:v,occurrences:[]};row.occurrences.push({path:p,line:sf.getLineAndCharacterOfPosition(n.pos).line+1});utilities.set(v,row);}}ts.forEachChild(n,visit);}visit(sf);}
const assets=tracked.filter(p=>/^(src\/assets\/|public\/images\/|public\/favicon\.svg)/.test(p)).map(p=>({id:id('asset',p),source:{path:p,revision,sha256:hash(fs.readFileSync(path.join(source,p)))},bytes:fs.statSync(path.join(source,p)).size,extraction:/src\/assets\/NVUTO.*\.svg$/.test(p)?'local brand reference copy; publication rights pending':'excluded',reason:/src\/assets\/NVUTO.*\.svg$/.test(p)?'Owned-brand identity evidenced in product; no redistribution license found':'Product imagery or third-party mark; unnecessary to shared core / rights not established',destination:/src\/assets\/NVUTO.*\.svg$/.test(p)?'packages/foundations/assets/':'audit/assets.json',validation:'not run'}));
const dependencies=Object.entries({...stack.dependencies,...stack.devDependencies}).map(([name,requested])=>{const entry=lock.packages?.['node_modules/'+name];let installed={};try{installed=JSON.parse(fs.readFileSync(path.join(source,'node_modules',name,'package.json'),'utf8'));}catch{}return{name,requested,resolved:entry?.version||installed.version||null,license:installed.license||entry?.license||'UNVERIFIED',designSystemPackage:/nvuto.*design|design.*nvuto/.test(name)};});
const snapshotFiles=[...new Set([...appFiles.filter(p=>p.startsWith('src/styles/')), ...uiFiles,'package.json','package-lock.json','tailwind.config.js','vite.config.ts','src/app/App.tsx'])].map(p=>({path:p,sha256:hash(read(p))}));
write('audit/source-snapshot.json',{product:'NVUTO HR web',repository:git('remote','get-url','origin').replace(/\/\/[^/@]+@/,'//[redacted]@'),localPath:source,revision,branch:git('branch','--show-current'),dirty:!!dirty,dirtyPaths:dirty?dirty.split('\n').map(x=>x.slice(3)):[],inspectedAt:new Date().toISOString(),runtime:{node:process.version,platform:process.platform,architecture:process.arch},manifestName:stack.name,manifestVersion:stack.version,lockfile:'package-lock.json',lockfileVersion:lock.lockfileVersion,snapshotFiles});
write('audit/components.json',items);write('audit/routes.json',routes);write('audit/screens.json',screens);write('audit/raw-values.json',[...values.values()]);write('audit/utility-values.json',[...utilities.values()]);write('audit/assets.json',assets);write('audit/dependencies.json',dependencies);
write('audit/themes.json',[{id:'theme-light',name:'light',evidence:'OBSERVED',source:'src/styles/theme.css :root',extraction:'selected',validation:'not run'},{id:'theme-dark',name:'dark',evidence:'OBSERVED',source:'src/styles/theme.css .dark',extraction:'selected',validation:'not run'},...['light-glass','dark-glass'].map(name=>({id:'theme-'+name,name,evidence:'UNVERIFIED',source:'Desk handover reference unavailable; no HR implementation observed',extraction:'not observed',validation:'blocked — contract/source unavailable'}))]);
write('audit/scope.json',{included:['NVUTO HR React web shared UI/foundations','source routes/screens/role navigation inventory','controlled synthetic fixtures'],documentedOnly:['HR business screens/workflows','parallel superadmin console','Flutter/mobile styling — no adapter implemented'],excluded:[{glob:'artifacts/**',reason:'retained historical evidence, not current application source'},{glob:'.tmp/**',reason:'local test evidence/runtime artifacts'},{glob:'backend/**',reason:'business services and sensitive configuration; only visible contract names referenced'},{glob:'node_modules/**',reason:'vendor implementation; dependency metadata/notices only'},{glob:'public/courses/**',reason:'learning content, not shared UI'},{glob:'src/tests/**',reason:'test fixtures, not production design authority'}]});
for(const p of [...uiFiles,...snapshotFiles.filter(f=>f.path.startsWith('src/styles/')).map(f=>f.path)])write('audit/as-is/'+p,read(p));
write('audit/inventory-summary.json',{sourceRevision:revision,routes:routes.length,screenFiles:screens.length,sharedUIFiles:items.length,selectedUIFiles:items.filter(x=>x.extraction==='selected for extraction').length,adapterUIFiles:1,assets:assets.length,brandAssets:assets.filter(x=>x.extraction!=='excluded').length,rawDistinctValues:values.size,rawValueOccurrences:[...values.values()].reduce((n,x)=>n+x.occurrences.length,0),distinctUtilities:utilities.size,themesObserved:2,glassThemesUnverified:2,externalDesignSystemPackages:dependencies.filter(d=>d.designSystemPackage)});
console.log(JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'audit/inventory-summary.json'),'utf8')),null,2));
