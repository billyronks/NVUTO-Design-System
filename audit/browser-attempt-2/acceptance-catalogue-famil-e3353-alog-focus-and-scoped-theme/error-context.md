# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: acceptance.spec.ts >> catalogue families render, form state, keyboard dialog focus and scoped theme
- Location: tests\browser\acceptance.spec.ts:2:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Design-system reference' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Design-system reference' })

```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';import fs from 'node:fs';import {PNG} from 'pngjs';import pixelmatch from 'pixelmatch';
  2  | test('catalogue families render, form state, keyboard dialog focus and scoped theme',async({page})=>{
> 3  |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('heading',{name:'Design-system reference'})).toBeVisible();await page.evaluate(()=>document.fonts.ready);
     |                                                                                                                                                                        ^ Error: expect(locator).toBeVisible() failed
  4  |  await page.getByRole('button',{name:'Switch to dark'}).click();await expect(page.locator('[data-nvuto-theme]')).toHaveAttribute('data-nvuto-theme','dark');
  5  |  const trigger=page.getByRole('button',{name:'Open dialog',exact:true});await trigger.focus();await page.keyboard.press('Enter');const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('..').locator('xpath=ancestor-or-self::*[@data-nvuto-theme]')).toHaveCount(1);await page.keyboard.press('Tab');await expect(dialog).toContainText('Dialog field');await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
  6  |  await page.getByRole('button',{name:'patterns',exact:true}).click();await page.getByRole('textbox',{name:'Workspace name'}).fill('Synthetic accepted example');await page.getByRole('button',{name:'Save example',exact:true}).click();await expect(page.getByRole('heading',{name:'Example saved'})).toBeVisible();
  7  |  expect(errors).toEqual([]);
  8  | });
  9  | test('WCAG 2.2 AA automated audit records source defects without claiming conformance',async({page})=>{
  10 |  const reports=[];for(const theme of ['light','dark']){await page.goto('/');if(theme==='dark')await page.getByRole('button',{name:'Switch to dark'}).click();await page.evaluate(()=>document.fonts.ready);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();reports.push({theme,violations:result.violations,incomplete:result.incomplete,passes:result.passes.length});}
  11 |  fs.writeFileSync('audit/axe-results.json',JSON.stringify(reports,null,2));
  12 |  // This test records findings; release status is separately derived from them.
  13 |  expect(reports).toHaveLength(2);
  14 | });
  15 | for(const width of [320,375,640,767,768,900,1024,1280,1440])test(`responsive patterns at ${width}`,async({page})=>{await page.setViewportSize({width,height:900});await page.goto('/');await page.getByRole('button',{name:'patterns',exact:true}).click();await expect(page.getByRole('heading',{name:'Workspace records'})).toBeVisible();const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));expect(sizes.scroll).toBeLessThanOrEqual(sizes.width+1);if([320,768,1440].includes(width))await page.screenshot({path:`audit/responsive-${width}.png`,fullPage:true});});
  16 | test('reference fidelity: same controlled source fixture against public package',async({page,browser})=>{
  17 |  const reference=await browser.newPage();const results=[];
  18 |  for(const theme of ['light','dark'])for(const width of [375,768,1440]){
  19 |   await page.setViewportSize({width,height:1000});await reference.setViewportSize({width,height:1000});await page.goto(`/fixture.html?theme=${theme}`);await reference.goto(`http://127.0.0.1:5187/reference.html?theme=${theme}`);
  20 |   for(const p of [page,reference]){await p.evaluate(()=>document.fonts.ready);await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});}
  21 |   const measure=async(p:any)=>p.locator('[data-compare]').evaluateAll((els:HTMLElement[])=>els.map(el=>({id:el.dataset.compare,rect:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height},children:[...el.querySelectorAll('button,input,select,table,[data-slot="card"]')].map((c:Element)=>{const s=getComputedStyle(c);return {tag:c.tagName,color:s.color,background:s.backgroundColor,fontFamily:s.fontFamily,fontSize:s.fontSize,lineHeight:s.lineHeight,borderRadius:s.borderRadius,height:c.getBoundingClientRect().height};})})));
  22 |   const actual=await measure(page),expected=await measure(reference);results.push({theme,width,actual,expected});await page.locator('#fidelity').screenshot({path:`audit/extracted-${theme}-${width}.png`});await reference.locator('#fidelity').screenshot({path:`audit/reference-${theme}-${width}.png`});
  23 |   const a=PNG.sync.read(fs.readFileSync(`audit/extracted-${theme}-${width}.png`)),b=PNG.sync.read(fs.readFileSync(`audit/reference-${theme}-${width}.png`));let pixels:number|null=null;if(a.width===b.width&&a.height===b.height){const diff=new PNG({width:a.width,height:a.height});pixels=pixelmatch(a.data,b.data,diff.data,a.width,a.height,{threshold:0.1});fs.writeFileSync(`audit/diff-${theme}-${width}.png`,PNG.sync.write(diff));}Object.assign(results[results.length-1],{pixelDifference:pixels,dimensionsMatch:a.width===b.width&&a.height===b.height,tolerance:'Pixelmatch threshold 0.1, <0.5% changed pixels; exact computed geometry/style equality'});
  24 |   fs.writeFileSync('audit/fidelity-results.json',JSON.stringify(results,null,2));expect.soft(actual).toEqual(expected);expect.soft(pixels).not.toBeNull();if(pixels!==null)expect.soft(pixels/(a.width*a.height)).toBeLessThan(.005);
  25 |  }
  26 |  await reference.close();
  27 | });
  28 | 
```