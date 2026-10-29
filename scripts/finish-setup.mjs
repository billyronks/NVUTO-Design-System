import fs from 'node:fs';
const patch=(file,from,to)=>{const text=fs.readFileSync(file,'utf8');if(text.includes(from))fs.writeFileSync(file,text.replaceAll(from,to));};
patch('catalogue/App.tsx','UI.Pagination','UI.TablePagination');
for(const file of ['scripts/document-extraction.mjs','registry/patterns.json'])patch(file,'src/app/components/layout/HRLayout.tsx','src/app/components/layout/AppLayout.tsx');
// Resolve the automation packages to one tested browser protocol/type version.
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));pkg.overrides={'playwright-core':'1.61.1'};pkg.devDependencies.pixelmatch='6.0.0';pkg.devDependencies.pngjs='7.0.0';pkg.scripts['prepare:catalogue']='node scripts/prepare-catalogue.mjs';pkg.scripts.catalogue='npm run prepare:catalogue && vite --config vite.catalogue.config.ts --host 127.0.0.1 --port 5187';pkg.scripts['build:catalogue']='npm run prepare:catalogue && vite build --config vite.catalogue.config.ts';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
