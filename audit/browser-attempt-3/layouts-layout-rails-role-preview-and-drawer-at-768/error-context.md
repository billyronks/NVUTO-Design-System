# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layouts.spec.ts >> layout rails, role preview and drawer at 768
- Location: tests\browser\layouts.spec.ts:2:44

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('button', { name: 'Open workspace navigation' })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Open workspace navigation' })
    14 × locator resolved to <button type="button" data-slot="button" aria-label="Open workspace navigation" class="inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F00] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F19] cursor-pointer disabled:opacity-50 disabled:pointer-events-none border border-slate-200 dark:border-[#232D42] bg-white dark:bg-[#171E2E] text-slate-900 dark:text-[#F8FAFC] hover:bg-sl…>Menu</button>
       - unexpected value "inactive"

```

```yaml
- button "Open workspace navigation": Menu
```

# Test source

```ts
  1 | import {test,expect} from '@playwright/test';
  2 | for(const width of [320,375,768,1024,1440])test(`layout rails, role preview and drawer at ${width}`,async({page})=>{await page.setViewportSize({width,height:900});await page.goto('/');await page.getByRole('button',{name:'layouts',exact:true}).click();await page.getByRole('combobox',{name:'Preview role'}).selectOption('Manager');await expect(page.getByRole('heading',{name:'Manager workspace',exact:true})).toBeVisible();const before=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(before.scroll).toBeLessThanOrEqual(before.width+1);
> 3 | if(width<1024){const trigger=page.getByRole('button',{name:'Open workspace navigation'});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('navigation',{name:'Workspace navigation',exact:true})).toBeVisible();await dialog.getByRole('button',{name:'Operations and support'}).click();await expect(dialog.getByRole('link',{name:'Settings',exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();}else{await page.getByRole('button',{name:'Expand application navigation'}).click();await expect(page.locator('[data-navigation-rail="primary"]')).toHaveCSS('width','240px');await page.getByRole('button',{name:'Collapse workspace navigation'}).click();await expect(page.locator('[data-navigation-rail="secondary"]')).toHaveCSS('width','80px');}
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ^ Error: expect(locator).toBeFocused() failed
  4 | await page.getByRole('button',{name:'Switch to dark'}).click();await expect(page.locator('[data-nvuto-theme]')).toHaveAttribute('data-nvuto-theme','dark');await page.screenshot({path:`audit/layouts-${width}.png`,fullPage:true});});
  5 | 
```