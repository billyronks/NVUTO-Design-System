# Contribution and review

This is a candidate extraction. No maintainers or organization-wide approvers have been assigned. Propose review to the repository owner; do not invent approval.

For each change: record source revision/path/symbol/usage and OBSERVED/INFERRED/PROPOSED/UNVERIFIED evidence, then separately record adoption/maturity. Explain why reuse belongs in the core. Preserve raw source evidence, and list visual/behavioral/API differences in audit/remediations.json. Include tokens, modes, long content, keyboard/focus, error/empty/loading states, responsive and reduced-motion checks.

Run the README command sequence. Add a regression test before repairing confirmed defects when practical. Review generated diffs; no silent token renaming or broad normalization. Update CHANGELOG.md and migration notes for visible/interaction changes. Before approval, inspect packed exports, declarations, fonts/assets/notices and the external consumer. Document unsupported combinations and manual acceptance gaps.

Product-only domain behavior stays in modules. A missing shared capability uses the exception process in docs/governance/releases.md; routine copying into product folders is not an upgrade strategy.
