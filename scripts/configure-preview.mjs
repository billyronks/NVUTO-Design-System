import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));pkg.scripts['preview:catalogue']='vite preview --config vite.catalogue.config.ts --host 127.0.0.1 --port 5187 --strictPort';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
// Preserve interrupted attempt evidence before Playwright resets output folders.
if(fs.existsSync('audit/browser-artifacts'))fs.cpSync('audit/browser-artifacts','audit/browser-attempt-1',{recursive:true});
