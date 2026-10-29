import fs from 'node:fs';
fs.mkdirSync('catalogue/public',{recursive:true});
for(const folder of ['docs','tokens','registry'])fs.cpSync(folder,`catalogue/public/${folder}`,{recursive:true});
fs.mkdirSync('catalogue/public/audit',{recursive:true});for(const file of fs.readdirSync('audit').filter(f=>f.endsWith('.json')))fs.copyFileSync('audit/'+file,'catalogue/public/audit/'+file);
fs.mkdirSync('catalogue/public/packages/react/src',{recursive:true});for(const file of fs.readdirSync('packages/react/src'))if(/\.(tsx?|css)$/.test(file))fs.copyFileSync('packages/react/src/'+file,'catalogue/public/packages/react/src/'+file);
console.log('Prepared local documentation downloads; no publication.');

fs.cpSync('examples/snippets','catalogue/public/examples/snippets',{recursive:true});
