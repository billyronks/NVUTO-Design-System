# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layouts.spec.ts >> layout rails, role preview and drawer at 320
- Location: tests\browser\layouts.spec.ts:2:44

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 321
Received:    463
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - paragraph [ref=e6]: NVUTO HR · extraction 0.1.0-extraction.1
      - heading "Design-system reference" [level=1] [ref=e7]
      - paragraph [ref=e8]: Observed HR source, candidate shared APIs. Synthetic examples only. No organization-wide approval or full accessibility conformance claim.
    - generic [ref=e9]:
      - button "Switch to dark" [ref=e10] [cursor=pointer]
      - generic [ref=e11]:
        - text: Find family
        - textbox "Find family" [ref=e12]:
          - /placeholder: Component name
    - navigation "Catalogue sections" [ref=e13]:
      - button "foundations" [ref=e14] [cursor=pointer]
      - button "components" [ref=e15] [cursor=pointer]
      - button "patterns" [ref=e16] [cursor=pointer]
      - button "layouts" [active] [pressed] [ref=e17] [cursor=pointer]
      - button "index" [ref=e18] [cursor=pointer]
    - generic [ref=e19]: Light/dark implemented. Glass themes unverified. White-on-orange small text is a preserved source contrast defect; see audit/normalization-register.json.
    - generic [ref=e20]:
      - heading "Complete layout layer · synthetic role previews" [level=2] [ref=e21]
      - paragraph [ref=e22]: Shared navigation geometry is independent of role permissions. The host supplies authorized items, real destinations and workspace identity. All links below use local example anchors.
      - generic [ref=e23]:
        - text: Preview role
        - combobox "Preview role" [ref=e24]:
          - option "HR admin"
          - option "Employee"
          - option "Manager" [selected]
          - option "Finance"
          - option "Executive"
          - option "IT admin"
          - option "Platform admin"
      - generic [ref=e26]:
        - link "Skip to workspace content" [ref=e27] [cursor=pointer]:
          - /url: "#:r1q:"
        - generic [ref=e28]:
          - banner [ref=e29]:
            - button "Open workspace navigation" [ref=e30] [cursor=pointer]: Menu
            - textbox "Search workspace" [ref=e32]:
              - /placeholder: Search synthetic records
            - generic [ref=e33]:
              - generic [ref=e34]: Manager
              - button "Example profile" [ref=e35] [cursor=pointer]: EX
          - main [ref=e36]:
            - region "Recruitment workspace" [ref=e37]:
              - navigation "Example module navigation" [ref=e38]:
                - link "Pipeline" [ref=e39] [cursor=pointer]:
                  - /url: "#layout-pipeline"
                - link "Candidates" [ref=e40] [cursor=pointer]:
                  - /url: "#layout-candidates"
                - link "Interviews" [ref=e41] [cursor=pointer]:
                  - /url: "#layout-interviews"
                - link "Integrations" [ref=e42] [cursor=pointer]:
                  - /url: "#layout-integrations"
              - navigation "Section navigation" [ref=e43]:
                - link "Overview" [ref=e44] [cursor=pointer]:
                  - /url: "#layout-overview"
                - link "History" [ref=e45] [cursor=pointer]:
                  - /url: "#layout-history"
              - generic [ref=e46]:
                - heading "Manager workspace" [level=3] [ref=e47]
                - generic [ref=e48]:
                  - heading "No synthetic records" [level=2] [ref=e49]
                  - generic [ref=e50]: This shell contains no authentication, router, roles or backend.
      - generic [ref=e51]: "import { WorkspaceLayout, PrimarySidebar, SecondarySidebar, RoleSidebarNav, GlobalHeader, SubNavTabs, RecruitmentShell } from \"nvuto-hr-ui\"; // Supply authorized NavigationItem[] and route adapters from the host."
      - heading "Dashboard and detail layouts" [level=3] [ref=e52]
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]:
            - generic "24" [ref=e58]
            - generic "Synthetic records" [ref=e60]
          - generic [ref=e61]:
            - generic "18" [ref=e64]
            - generic "Reviewed examples" [ref=e66]
        - generic [ref=e67]:
          - generic [ref=e69]:
            - heading "Primary dashboard content" [level=3] [ref=e71]
            - generic [ref=e72]: Bounded grid, stacked at narrow widths.
          - complementary [ref=e73]:
            - status [ref=e74]:
              - heading "Example activity" [level=2] [ref=e75]
              - generic [ref=e76]: Text equivalent and explicit state.
      - generic [ref=e77]:
        - button "Example action" [ref=e79] [cursor=pointer]
        - generic [ref=e80]:
          - complementary [ref=e81]:
            - generic [ref=e83]: Example identity summary
          - generic [ref=e85]:
            - heading "Detail content" [level=3] [ref=e87]
            - generic [ref=e88]: One column on mobile; summary plus two-column detail area at desktop.
      - heading "Split workspace and multi-step layout" [level=3] [ref=e89]
      - generic [ref=e90]:
        - complementary "Workspace list" [ref=e91]:
          - list [ref=e92]:
            - listitem [ref=e93]:
              - link "Example conversation" [ref=e94] [cursor=pointer]:
                - /url: "#layout-conversation"
        - generic [ref=e96]: The host supplies selected content, messages/documents and permissions.
      - generic [ref=e97]:
        - list "Progress" [ref=e98]:
          - listitem [ref=e99]:
            - generic [ref=e100]: "1"
            - text: Configure
          - listitem [ref=e101]:
            - generic [ref=e102]: "2"
            - text: Review
          - listitem [ref=e103]:
            - generic [ref=e104]: "3"
            - text: Complete
        - generic [ref=e105]:
          - heading "Review example" [level=2] [ref=e106]
          - generic [ref=e107]: Step transitions are caller-owned.
      - heading "Authentication layout · presentation only" [level=3] [ref=e108]
      - generic [ref=e110]:
        - paragraph [ref=e111]: Example sign-in surface
        - main [ref=e112]:
          - generic [ref=e113]:
            - heading "Example access form" [level=4] [ref=e114]
            - generic [ref=e115]:
              - generic [ref=e116]: Example email
              - textbox "Example email" [ref=e118]
            - button "Example continue" [ref=e119] [cursor=pointer]
            - paragraph [ref=e120]: No login is submitted.
        - paragraph [ref=e121]: Footer slot
      - heading "Public portal and marketing section" [level=3] [ref=e122]
      - generic [ref=e123]:
        - banner [ref=e124]:
          - img "NVUTO HR" [ref=e125]
          - link "Example public navigation" [ref=e127] [cursor=pointer]:
            - /url: "#layout-public-content"
        - generic [ref=e129]:
          - heading "Public example" [level=4] [ref=e130]
          - paragraph [ref=e131]: Observed treatment, no invented brand campaign.
        - main [ref=e132]:
          - generic [ref=e133]:
            - heading "Public content" [level=3] [ref=e135]
            - generic [ref=e136]: Career/detail pages own their data and tenant branding.
        - paragraph [ref=e137]: Public footer slot
  - generic [ref=e138]: "0"
```

# Test source

```ts
  1 | import {test,expect} from '@playwright/test';
> 2 | for(const width of [320,375,768,1024,1440])test(`layout rails, role preview and drawer at ${width}`,async({page})=>{await page.setViewportSize({width,height:900});await page.goto('/');await page.getByRole('button',{name:'layouts',exact:true}).click();await page.getByRole('combobox',{name:'Preview role'}).selectOption('Manager');await expect(page.getByRole('heading',{name:'Manager workspace',exact:true})).toBeVisible();const before=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(before.scroll).toBeLessThanOrEqual(before.width+1);
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ^ Error: expect(received).toBeLessThanOrEqual(expected)
  3 | if(width<1024){const trigger=page.getByRole('button',{name:'Open workspace navigation'});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('navigation',{name:'Workspace navigation',exact:true})).toBeVisible();await dialog.getByRole('button',{name:'Operations and support'}).click();await expect(dialog.getByRole('link',{name:'Settings',exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();}else{await page.getByRole('button',{name:'Expand application navigation'}).click();await expect(page.locator('[data-navigation-rail="primary"]')).toHaveCSS('width','240px');await page.getByRole('button',{name:'Collapse workspace navigation'}).click();await expect(page.locator('[data-navigation-rail="secondary"]')).toHaveCSS('width','80px');}
  4 | await page.getByRole('button',{name:'Switch to dark'}).click();await expect(page.locator('[data-nvuto-theme]')).toHaveAttribute('data-nvuto-theme','dark');await page.screenshot({path:`audit/layouts-${width}.png`,fullPage:true});});
  5 | 
```