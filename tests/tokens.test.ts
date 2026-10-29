import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {flatten,resolve,validate} from '../scripts/token-lib.mjs';
const extension={'io.nvuto.extraction':{path:'synthetic-test'}};
const token=(value:unknown,type='number')=>({$type:type,$value:value,$extensions:extension});
describe('token profile',()=>{
 it('validates both complete theme maps',()=>{const core=JSON.parse(fs.readFileSync('tokens/core.tokens.json','utf8'));for(const theme of ['light','dark'])expect(validate(flatten({...core,...JSON.parse(fs.readFileSync(`tokens/${theme}.tokens.json`,'utf8'))}))).toBe(true);});
 it('rejects missing aliases',()=>expect(()=>resolve({a:token('{missing}')},'a')).toThrow());
 it('rejects cycles',()=>expect(()=>resolve({a:token('{b}'),b:token('{a}')},'a')).toThrow(/cycle/));
 it('rejects alias type drift',()=>expect(()=>resolve({a:token('{b}'),b:token('x','string')},'a')).toThrow(/type/));
 it('rejects unsupported inheritance',()=>expect(()=>flatten({$extends:'external'})).toThrow(/Unsupported/));
 it('rejects invalid dimensions',()=>expect(()=>validate({a:token({value:'4',unit:'px'},'dimension')})).toThrow());
 it('rejects CSS naming collisions',()=>expect(()=>validate({'a-b':token(1),'a.b':token(2)})).toThrow(/collision/));
 it('rejects nonnumeric durations',()=>expect(()=>validate({a:token({value:'fast',unit:'ms'},'duration')})).toThrow());
 it('rejects out-of-range sRGB channels',()=>expect(()=>validate({a:token({colorSpace:'srgb',components:[2,0,0],alpha:1},'color')})).toThrow());
 it('rejects non-string font names',()=>expect(()=>validate({a:token([42],'fontFamily')})).toThrow());
});
