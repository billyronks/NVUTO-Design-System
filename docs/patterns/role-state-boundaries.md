# Roles, permissions, locale and states

Source routes and lexical role/permission occurrences are indexed separately from runtime authorization. HR/finance/manager/employee/executive/platform variations are product contracts, not design-system permission checks. AppShell navigation is passed by the host. Forbidden/disabled/loading/empty/offline/degraded are explicit presentation states, not inferred authorization or successful empty responses.

The state inventory records exact source occurrences and locations; counts are not unique visible states and do not prove every route/role combination works. Locale inventory preserves Intl/currency/timeZone usage without moving financial/date rules into core. Source uses a mixture of locale-aware formatting and literal display strings; no universal locale/RTL support is invented.
