import fs from 'node:fs';import postcss from 'postcss';import parser from 'postcss-selector-parser';
const input='packages/react/dist/unscoped.css', output='packages/react/dist/styles.css';
const root=postcss.parse(fs.readFileSync(input,'utf8'));
root.walkDecls(d=>{if(['scrollbar-width','-ms-overflow-style'].includes(d.prop)&&d.value==='none')d.remove();});
root.walkRules(rule=>{
 if(rule.parent?.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;
 // Tailwind nesting is compiled by Vite. Guard any remaining nested rules.
 if(rule.selector.includes('&'))return;
 if(rule.selector.includes('::-webkit-scrollbar')&&/display:\s*none|width:\s*0|height:\s*0/.test(rule.toString())){rule.remove();return;}
 rule.selector=parser(selectors=>selectors.each(sel=>{
  // Replace document roots, otherwise prefix the whole selector, retaining :is commas.
  let startsRoot=false;
  sel.walk(n=>{if((n.type==='pseudo'&&[':root',':host'].includes(n.value))||(n.type==='tag'&&['html','body'].includes(n.value))||(n.type==='id'&&n.value==='root')){if(n===sel.first)startsRoot=true;n.replaceWith(parser.className({value:'nvuto-root'}));}});
  if(sel.first?.type==='class'&&sel.first.value==='dark') {sel.prepend(parser.className({value:'nvuto-root'}));return;}
  if(startsRoot||sel.first?.value==='nvuto-root')return;
  sel.prepend(parser.combinator({value:' '}));sel.prepend(parser.className({value:'nvuto-root'}));
 })).processSync(rule.selector);
});
// @property registration is global by CSS design. Only --tw-* internals are used;
// document this bounded side effect. It does not select or reset host elements.
root.prepend(postcss.comment({text:'GENERATED scoped source styles. Edit packages/react/src/styles.css; npm run build. Global @property --tw-* registration is an explicit Tailwind boundary.'}));
fs.writeFileSync(output,root.toString());
console.log('Scoped compiled selectors to .nvuto-root; source hidden-scrollbar rules removed.');
