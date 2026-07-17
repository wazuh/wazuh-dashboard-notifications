---
name: issue-creation
description: Create a well-formed GitHub issue in a Wazuh Dashboard repo — pick the right issue template, run an issue-first duplicate check, and produce a ready-to-file body with the template's default labels. Use when the user asks to create, open, file, or draft an issue.
---

# Create a Wazuh Dashboard issue

Pick the right issue template, check for duplicates first, then fill the
template verbatim and hand off a ready-to-file body.

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Classify intent → choose issue template (ask only if ambiguous)
- [ ] 2. Issue-first check: search existing issues for duplicates
- [ ] 3. Fill the chosen .github/ISSUE_TEMPLATE/*.md verbatim
- [ ] 4. Keep the template's default labels; add a triage label only if named
- [ ] 5. Emit the ready-to-file body + report (default stop; gh issue create only if asked)
```

### 1. Classify intent → choose template

| Intent | Template | Labels (from template frontmatter) |
|--------|----------|--------|
| Something is broken | `bug_report.md` | `bug, untriaged` |
| New capability / improvement | `feature_request.md` | `enhancement, untriaged` |
| Document a shipped feature | `documentation.md` | _(no frontmatter — no default labels)_ |
| Track OpenSearch version compatibility work | `compatibility_request.md` | `request/operational, level/task, type/maintenance` |

> **Label caveat (verified via `gh label list --repo wazuh/wazuh-dashboard-notifications`):**
> this repo's real label taxonomy is `type/bug`, `type/enhancement`,
> `type/maintenance`, `level/task`, `request/operational`, `untriaged`, etc. —
> there is **no** bare `bug` or `enhancement` label. `bug_report.md` and
> `feature_request.md` still carry the stale upstream `bug` / `enhancement`
> names in their frontmatter; applying them via `gh issue create --label`
> will fail (unknown label) even though GitHub's own template picker applies
> them fine from the web UI. `compatibility_request.md`'s labels
> (`request/operational`, `level/task`, `type/maintenance`) all exist as-is.
> Do not invent a replacement mapping — surface this mismatch to the user and
> let them decide (e.g. file via the web UI, or swap in `type/bug` /
> `type/enhancement` manually) rather than silently substituting labels.

Ask the user only if intent is genuinely ambiguous between templates.

### 2. Issue-first duplicate check

Search before drafting anything:

```bash
gh issue list --repo wazuh/wazuh-dashboard-notifications --search "<keywords>" --state all
gh search issues "<keywords>" --repo wazuh/wazuh-dashboard-notifications
```

If a likely duplicate exists, report it and ask whether to proceed, comment on
the existing issue instead, or continue with a new one.

### 3. Fill the template

Read the chosen file under
[`.github/ISSUE_TEMPLATE/`](../../../.github/ISSUE_TEMPLATE/) first, then fill
it **verbatim** — every heading and prompt exactly as written, no inlining or
paraphrasing of its structure here. `bug_report.md` and `feature_request.md`
use the frontmatter `title` prefix (`[BUG]` / `[FEATURE]`) — keep it.

### 4. Labels — keep template defaults, no invented labels/workflow

Use exactly the labels in the chosen template's frontmatter (see the caveat in
step 1). Add a triage/priority label only if the user explicitly names one
that exists in this repo (`gh label list --repo wazuh/wazuh-dashboard-notifications`).
Never invent a label or a triage workflow that isn't already documented.

Note: [`.github/workflows/add-untriaged.yml`](../../../.github/workflows/add-untriaged.yml)
auto-applies the `untriaged` label to every opened/reopened/transferred issue,
regardless of the template's own labels — so `untriaged` will end up on the
issue either way.
[`.github/ISSUE_TEMPLATE/config.yml`](../../../.github/ISSUE_TEMPLATE/config.yml)
does not set `blank_issues_enabled`, and only defines `contact_links` (OpenSearch
Community Support, AWS/Amazon Security) — it does not disable blank issues.

### 5. Emit ready-to-file body + report, gh issue create only if asked

**Default deliverable:** the filled template body plus a short report (chosen
template, labels, duplicate-check result, label caveats). Only run
`gh issue create --repo wazuh/wazuh-dashboard-notifications --title "..." --body-file <path> --label ...`
when the user explicitly asks you to file it.
