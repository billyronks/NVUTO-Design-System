/** Additional scalar/range constraints for this repository's fixed-input profile. */
export function strictTokenValue(value,type,name){
 const invalid=()=>{throw Error('Invalid '+type+' '+name);};
 if(type==='color'){
  if(!value||!Array.isArray(value.components)||value.components.length!==3||!value.components.every(Number.isFinite)||!Number.isFinite(value.alpha))invalid();
  if(value.colorSpace==='srgb'&&value.components.some(x=>x<0||x>1))invalid();
  if(value.colorSpace==='oklch'&&(value.components[0]<0||value.components[0]>1||value.components[1]<0||value.components[2]<0||value.components[2]>360))invalid();
 }
 if(type==='duration'&&(!value||!Number.isFinite(value.value)))invalid();
 if(type==='fontFamily'&&(!Array.isArray(value)||value.some(x=>typeof x!=='string'||!x.trim())))invalid();
 if(type==='string'&&(typeof value!=='string'||/[{}]/.test(value)))invalid();
}
