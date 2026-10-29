import fs from 'node:fs';
const file='scripts/token-lib.mjs';let text=fs.readFileSync(file,'utf8');if(!text.includes('strictTokenValue')){text="import {strictTokenValue} from './strict-token-value.mjs';\n"+text;text=text.replace('const v=resolve(tokens,name);switch(t.$type)','const v=resolve(tokens,name);strictTokenValue(v,t.$type,name);switch(t.$type)');fs.writeFileSync(file,text);}
