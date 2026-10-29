# Layout, navigation and shell contracts

The complete discovery index is [audit/layouts.json](../../audit/layouts.json); [layout-summary](../../audit/layout-summary.json) supplies denominators. It scans source TSX for intrinsic navigation/header/footer/main/aside, layout components and grid/scroll/sticky structures. Every discovered item has a disposition; lexical discovery is not exhaustive runtime acceptance. Parallel platform-console layouts remain an explicit boundary. Module/domain composition files are mapped/documented, not advertised as separate shared components.

Portable implementation: [layouts.tsx](../../packages/react/src/layouts.tsx). Public imports come from `nvuto-hr-ui`. Source references/hashes are in [layout registry](../../registry/layouts.json), with untouched source snapshots under audit/as-is/layouts. APIs/slots are proposed extraction adapters, not organization-wide approved contracts.

| Export | Source evidence | Contract |
| --- | --- | --- |
| WorkspaceLayout | AppLayout | Dual rails, header, skip link, bounded workspace scrolling, mobile navigation drawer. Explicit mobileOpen/onMobileOpenChange; no router/auth. |
| PrimarySidebar | PrimarySidebar | Controlled expanded/onExpandedChange; 80px compact / 240px expanded rail; brand, modules, footer slots. |
| SecondarySidebar | SecondarySidebar | 80px compact / 264px expanded; 96px brand/workspace header, content/footer. workspaceName required; no company fallback. |
| RoleSidebarNav | RoleSidebarNav + EmployeeSidebar/ManagerSidebar/SidebarNavigation | Shared disclosure/item presentation. Host resolves roles, feature flags, routes and active state. Categories carry stable IDs and explicit NavigationItem data. |
| GlobalHeader | GlobalHeader/GlobalSearchBar/RoleSwitcher | 72px header; search/leading/actions/profile slots. Wallet/notification/workspace-switcher logic remains host-owned. |
| SubNavTabs | SubNavTabs/CalendarTabs/PerformanceSubNavigation | 48px sticky, horizontally scrolling navigation; items/hrefs/active explicit. No slug generation, URL matching or API prefetch. |
| SecondarySubNavTabs | SecondarySubNavTabs | 40px secondary rail positioned below the primary bar; same data/adapter contract. |
| ModuleShell / RecruitmentShell | RecruitmentShell and module compositions | Navigation → secondary navigation → padded content canvas. Recruitment names the section; no hardcoded ATS routes. |
| AuthLayout | Login/Forgot/Reset/ForcePassword pages | One-column narrow form, two-column brand/form from 768px. Brand/header/footer/content slots; no credentials, login effects, decorative grid or unverified security claims. |
| PublicPortalLayout | PublicCareerPortalPreview/PublicJobDetailView | Header/hero, bounded max-w-4xl public content, footer slots; tenant branding and job data supplied by host. |
| MarketingSection | HR MarketingSection | Observed light/dark/indigo/slate section treatments and narrow/default/wide/full containers. These are section treatments, not new app themes. Grid/glow effects remain a documented boundary. |
| DetailPageLayout | EmployeeRecordManager | Mobile stack; desktop summary plus detail, separate action row. |
| DashboardLayout | HR/finance/manager/employee/executive dashboards | Responsive metric grid, main content and optional supporting sidebar. Metrics and data remain caller-owned. |
| SplitWorkspaceLayout | UnifiedChatWorkspace/document hub | Bounded list/detail split, stacking below 768px. No conversation/document service. |
| StepFlow / SettingsSection / ListPage | Onboarding/run/settings/list compositions | Numbered progress, settings description/fields/actions and list heading/filters/content. Domain steps and permissions remain host-owned. |

`NavigationItem` contains id/label/href/icon plus optional active/disabled/badge. Icons are presentational React nodes. `renderLink` adapts an anchor-shaped contract to the host router; keep href, accessible name/current state, disabled guard and keyboard semantics. Never construct tenant URLs or infer authorization in the shared core. `onNavigate` is a notification, not a permission decision. Slugs must already be correct when passed by the host.

Disclosure buttons expose expanded/controls; collapsed links use `hidden`, fixing source focusability behind a collapsed grid animation. Compact rails retain accessible link names. Disabled items are not tab stops. Normal links preserve native modified-click/navigation. Active text/color have aria-current support. Workspace has a skip target; multiple workspaces use stable unique IDs. Mobile drawer uses Radix focus entry/containment/Escape/return; caller supplies its trigger. It closes when moving to desktop at 1024px. Test resize, long categories, missing icons and keyboard focus in the actual host. A UI hidden link does not replace backend authorization.

Light/dark scope and portal requirements are unchanged: wrap in NvutoProvider; do not nest opposite themes. Both collapsed/expanded rail combinations, role previews and phone/tablet/desktop samples appear in the catalogue Layouts view. Synthetic role labels demonstrate structure only; they are not accepted role routes. Automated viewport coverage is separate from real touch/zoom/screen-reader acceptance. Public/auth layouts preserve geometry, while module-specific copy, tenant identity, notifications and branding approval are excluded.

The initial AppShell slot wrapper remains for simple modules; WorkspaceLayout is the fuller source dual-rail composition. Neither silently replaces source AppLayout. Migrate navigation one bounded route at a time and compare active matching, focus, scrolling and all host permissions before rollout.

Extraction mobile refinement: the compact primary rail is 80px; when explicitly expanded in the narrow drawer it takes a 240px single-rail view and the secondary rail hides. Collapse it to return to workspace sections. This is a proposed narrow-width adapter, not a new source-wide behavior approval. Code examples use the exported nvuto-navigation-trigger class for desktop hiding; arbitrary host utility strings are not guaranteed to exist in precompiled CSS.

AuthLayout supports variant="split" (LoginPage brand/form grid, default) and variant="centered" (ForgotPasswordPage/ResetPasswordPage/ForcePasswordReset max-w-md card). Header/footer/children slots are shared; centered mode omits the brand column. Recovery/invitation tokens and password policy remain in the host. Both variants appear in the layout catalogue.
