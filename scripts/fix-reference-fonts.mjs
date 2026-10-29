import fs from 'node:fs';
const lines=fs.readFileSync('audit/as-is/src/styles/fonts.css','utf8').split(/\r?\n/);if(!lines[0].startsWith('@import '))throw Error('Unexpected source font baseline');lines.shift();fs.writeFileSync('catalogue/source-fonts.css','/* Source font baseline preserved; Google transport replaced by packaged fonts. */\n'+lines.join('\n'));
let repair=fs.readFileSync('scripts/repair-validation.mjs','utf8');repair=repair.replace("replace(/^@import[^;]+;\\s*/,", "replace(/^@import[^\\r\\n]+[\\r\\n]+/,");fs.writeFileSync('scripts/repair-validation.mjs',repair);
console.log('Removed the complete Google Fonts import line; preserved all source font rules.');
