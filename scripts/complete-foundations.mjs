import fs from 'node:fs';import path from 'node:path';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const core=read('tokens/core.tokens.json'), snapshot=read('audit/source-snapshot.json');
delete core.component.layout;
// Correct the provenance of inferred utility-derived values; never turn a
// framework convention into an organization-approved decision.
for(const [key,t]of Object.entries(core.primitive.size)) {
 t.$extensions['io.nvuto.extraction']={path:'audit/utility-values.json',symbol:key,revision:snapshot.revision,evidence:'INFERRED',adoption:'candidate',reason:'Pixel interpretation of observed shared utility sizes; validate individual use against utility inventory',sourceCSS:t.$value.value+'px'};
}
for(const [key,t]of Object.entries(core.primitive.motion)) {
 t.$extensions['io.nvuto.extraction']={path:key==='ms-180'||key==='ms-200'?'src/app/components/ui/Modal.tsx':'audit/utility-values.json',symbol:key,revision:snapshot.revision,evidence:key==='ms-180'||key==='ms-200'?'OBSERVED':'INFERRED',adoption:'candidate',sourceCSS:t.$value.value+'ms'};
}
fs.writeFileSync('tokens/core.tokens.json',JSON.stringify(core,null,2)+'\n');
// Vendored font files from exact locked dependencies, not fetched at runtime.
fs.mkdirSync('packages/foundations/fonts',{recursive:true});fs.mkdirSync('packages/foundations/notices',{recursive:true});
let css='/* Locally packaged OFL fonts. Optional; import foundations/fonts.css before UI CSS. */\n';
for(const [family,weights]of [['poppins',[300,400,500,600,700,800]],['jetbrains-mono',[400,500,600]]]) {
 const dir=`node_modules/@fontsource/${family}`; const name=family==='poppins'?'Poppins':'JetBrains Mono';
 for(const weight of weights){const file=`${family}-latin-${weight}-normal.woff2`;fs.copyFileSync(`${dir}/files/${file}`,`packages/foundations/fonts/${file}`);css+=`@font-face { font-family:'${name}'; font-style:normal; font-weight:${weight}; font-display:swap; src:url('./fonts/${file}') format('woff2'); }\n`;}
 fs.copyFileSync(`${dir}/LICENSE`,`packages/foundations/notices/${family}-OFL.txt`);
}
fs.writeFileSync('packages/foundations/fonts.css',css);
const manifest=read('packages/foundations/package.json');manifest.files=['dist','assets','fonts','fonts.css','notices','README.md'];manifest.exports['./fonts.css']='./fonts.css';manifest.exports['./assets/*']='./assets/*';fs.writeFileSync('packages/foundations/package.json',JSON.stringify(manifest,null,2)+'\n');
const ui=read('packages/react/package.json');delete ui.dependencies['@tanstack/react-query'];fs.writeFileSync('packages/react/package.json',JSON.stringify(ui,null,2)+'\n');
console.log('Font files/notices copied; dependency boundary corrected.');
