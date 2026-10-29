# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: acceptance.spec.ts >> reference fidelity: same controlled source fixture against public package
- Location: tests\browser\acceptance.spec.ts:16:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

@@ -80,11 +80,11 @@
      "children": Array [
        Object {
          "background": "rgb(255, 255, 255)",
          "borderRadius": "14px",
          "color": "rgb(15, 23, 42)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "16px",
          "height": 201.5,
          "lineHeight": "26px",
          "tag": "DIV",
        },
@@ -99,11 +99,11 @@
      "children": Array [
        Object {
          "background": "rgba(0, 0, 0, 0)",
          "borderRadius": "0px",
          "color": "oklch(0.372 0.044 257.287)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "14px",
          "height": 120.5,
          "lineHeight": "20px",
          "tag": "TABLE",
        },
```

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

@@ -80,11 +80,11 @@
      "children": Array [
        Object {
          "background": "rgb(255, 255, 255)",
          "borderRadius": "14px",
          "color": "rgb(15, 23, 42)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "16px",
          "height": 149.5,
          "lineHeight": "26px",
          "tag": "DIV",
        },
@@ -99,11 +99,11 @@
      "children": Array [
        Object {
          "background": "rgba(0, 0, 0, 0)",
          "borderRadius": "0px",
          "color": "oklch(0.372 0.044 257.287)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "14px",
          "height": 120.5,
          "lineHeight": "20px",
          "tag": "TABLE",
        },
```

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

@@ -80,11 +80,11 @@
      "children": Array [
        Object {
          "background": "rgb(255, 255, 255)",
          "borderRadius": "14px",
          "color": "rgb(15, 23, 42)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "16px",
          "height": 155.5,
          "lineHeight": "26px",
          "tag": "DIV",
        },
@@ -99,11 +99,11 @@
      "children": Array [
        Object {
          "background": "rgba(0, 0, 0, 0)",
          "borderRadius": "0px",
          "color": "oklch(0.372 0.044 257.287)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "14px",
          "height": 120.5,
          "lineHeight": "20px",
          "tag": "TABLE",
        },
```

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

@@ -80,11 +80,11 @@
      "children": Array [
        Object {
          "background": "rgb(17, 22, 37)",
          "borderRadius": "14px",
          "color": "rgb(248, 250, 252)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "16px",
          "height": 201.5,
          "lineHeight": "26px",
          "tag": "DIV",
        },
@@ -99,11 +99,11 @@
      "children": Array [
        Object {
          "background": "rgba(0, 0, 0, 0)",
          "borderRadius": "0px",
          "color": "rgb(226, 232, 240)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "14px",
          "height": 120.5,
          "lineHeight": "20px",
          "tag": "TABLE",
        },
```

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

@@ -80,11 +80,11 @@
      "children": Array [
        Object {
          "background": "rgb(17, 22, 37)",
          "borderRadius": "14px",
          "color": "rgb(248, 250, 252)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "16px",
          "height": 149.5,
          "lineHeight": "26px",
          "tag": "DIV",
        },
@@ -99,11 +99,11 @@
      "children": Array [
        Object {
          "background": "rgba(0, 0, 0, 0)",
          "borderRadius": "0px",
          "color": "rgb(226, 232, 240)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "14px",
          "height": 120.5,
          "lineHeight": "20px",
          "tag": "TABLE",
        },
```

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

@@ -80,11 +80,11 @@
      "children": Array [
        Object {
          "background": "rgb(17, 22, 37)",
          "borderRadius": "14px",
          "color": "rgb(248, 250, 252)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "16px",
          "height": 155.5,
          "lineHeight": "26px",
          "tag": "DIV",
        },
@@ -99,11 +99,11 @@
      "children": Array [
        Object {
          "background": "rgba(0, 0, 0, 0)",
          "borderRadius": "0px",
          "color": "rgb(226, 232, 240)",
-         "fontFamily": "Poppins, sans-serif",
+         "fontFamily": "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
          "fontSize": "14px",
          "height": 120.5,
          "lineHeight": "20px",
          "tag": "TABLE",
        },
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Controlled HR primitives" [level=1] [ref=e4]
  - paragraph [ref=e5]: Same viewport, fonts, data and animation conditions.
  - generic [ref=e6]:
    - button "Primary" [ref=e7] [cursor=pointer]
    - button "Secondary" [ref=e8] [cursor=pointer]
    - button "Disabled" [disabled]
  - generic [ref=e10]:
    - generic [ref=e11]: Example name
    - textbox "Example name" [ref=e13]: Synthetic workspace
  - generic [ref=e14]:
    - text: Example selection
    - combobox "Example selection" [ref=e15]:
      - option "Example one" [selected]
      - option "Example two"
  - generic [ref=e17]:
    - generic [ref=e18]:
      - heading "Example card" [level=3] [ref=e19]
      - paragraph [ref=e20]: Synthetic supporting description
    - generic [ref=e21]: Long example content wraps at narrow widths without a product backend.
  - region "Fidelity example" [ref=e24]:
    - table "Fidelity example" [ref=e25]:
      - caption [ref=e26]: Synthetic rows
      - rowgroup [ref=e27]:
        - row "Name State" [ref=e28]:
          - columnheader "Name" [ref=e29]
          - columnheader "State" [ref=e30]
      - rowgroup [ref=e31]:
        - row "Example Alpha Ready" [ref=e32]:
          - cell "Example Alpha" [ref=e33]
          - cell "Ready" [ref=e34]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';import fs from 'node:fs';import {PNG} from 'pngjs';import pixelmatch from 'pixelmatch';
  2  | test('catalogue families render, form state, keyboard dialog focus and scoped theme',async({page})=>{
  3  |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('heading',{name:'Design-system reference'})).toBeVisible();await page.evaluate(()=>document.fonts.ready);
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
> 24 |   fs.writeFileSync('audit/fidelity-results.json',JSON.stringify(results,null,2));expect.soft(actual).toEqual(expected);expect.soft(pixels).not.toBeNull();if(pixels!==null)expect.soft(pixels/(a.width*a.height)).toBeLessThan(.005);
     |                                                                                                      ^ Error: expect(received).toEqual(expected) // deep equality
  25 |  }
  26 |  await reference.close();
  27 | });
  28 | 
```