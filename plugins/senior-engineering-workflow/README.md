# Senior Engineering Workflow

An evidence-driven workflow for non-trivial software engineering tasks. Installs as a skill and a read-only exploration subagent for Claude Code, Codex, Gemini CLI, and OpenCode.

## What it does

The skill activates when a task involves ambiguous requirements, architecture or cross-module changes, version-sensitive research, migrations, security, performance, multiple milestones, or context-heavy repository exploration. It skips for simple local edits with a known entry point.

The workflow is a twelve-step iterative process:

1. **Establish the current state** — read project docs, inspect git status, identify frameworks and test systems, reproduce reported behavior, pick a context strategy (direct, delegated exploration, or long-horizon).
2. **Build a requirements model** — record desired outcome, confirmed and inferred requirements, acceptance criteria, constraints, non-goals, assumptions with evidence status, and risks.
3. **Research in evidence waves** — Wave A establishes local truth from source, tests, and logs. Wave B consults official docs and release notes for exact dependency versions. Wave C challenges hypotheses with disconfirming evidence.
4. **Design proportionally** — describe affected architecture, interfaces, data flow, failure modes, security, and deployment. Recommend one option with decisive evidence. Ask the user to decide material trade-offs.
5. **Validate feasibility** — run a bounded spike or prototype when a critical assumption is uncertain, then update the plan.
6. **Agree on scope and compatibility** — handle core cases, discuss significant cases, defer peripheral cases. Get explicit approval before adding compatibility layers or fallback chains.
7. **Create a milestone plan** — ordered vertical slices, each delivering verifiable behavior with tests and validation commands.
8. **Implement with clear ownership** — one writer per working tree, scoped diffs, follow existing conventions, no hidden defects.
9. **Test the accepted contract** — regression tests for bug fixes, boundary and failure-path tests for new behavior. Never claim a result that was not observed.
10. **Review and challenge the result** — inspect the final diff, verify acceptance criteria, check for secrets and unrelated changes. Use an independent reviewer for high-risk changes.
11. **Self-correct without churn** — after a failed approach, record evidence before retrying. After three failed hypotheses, stop and return to requirements with the user.
12. **Complete accurately** — the task is done when criteria are met, checks pass, coverage is proportionate, and the final report is reproducible.

For long-horizon tasks, the skill uses a durable task-state artifact (template included) that survives context transitions.

## Tiered subagents

The plugin includes three subagents that split work by task type to balance cost, capability, and independence:

| Subagent | Task type | Codex model | Effort | Sandbox |
|---|---|---|---|---|
| `workflow-researcher` | Research, design, exploration | `gpt-5.6-sol` (most advanced) | `max` | read-only |
| `workflow-reviewer` | Code review, security analysis, verification | `gpt-5.6-terra` (mid-tier) | `max` | read-only |
| `workflow-executor` | Implementation, test execution | `gpt-5.6-luna` (cost-effective) | `max` | workspace-write |

All three use `max` reasoning effort. DeepSWE v1.1 benchmark data shows this is decisive, especially for Luna: it jumps from 44.2% pass@1 at `high` effort to 67.2% at `max` — a 23-point improvement that makes it competitive with Terra (69.6%) and Sol (72.7%) at a fraction of the cost ($3.03 vs $4.95 vs $8.39 per task). Sol is reserved for the hardest research and design work; Terra handles review at 59% of Sol's cost and provides independence through a different model tier; Luna handles high-volume execution at 36% of Sol's cost.

On Claude Code, all three inherit the parent model with `effort: max`. On Gemini CLI and OpenCode, model pinning is not available, so the subagents rely on their tool restrictions and instructions.

The researcher maps codebases, traces execution paths, gathers exact-version documentation, analyzes architecture, and gathers evidence. It cannot create, edit, delete, or format files. It returns a compact findings handoff (claims linked to evidence, open questions, risks, artifact references) to the parent agent.

The reviewer is an independent read-only reviewer that looks for defects, security issues, and disconfirming evidence in work completed by other agents — not to approve it. It checks correctness, security, test coverage, scope creep, compatibility, and conventions. Using a different model tier from the researcher and executor provides genuine independence.

The executor implements well-scoped, settled code changes and runs validation commands. It does not make architectural or design decisions — if the task is ambiguous, it stops and reports back. It owns an explicit set of files assigned by the parent and does not edit outside that set, preventing conflicts when multiple executors run in parallel. It returns a summary of changes, validation results, issues, and follow-up needs.

## Components

```text
plugins/senior-engineering-workflow/
├── .claude-plugin/plugin.json     Claude Code plugin manifest
├── .codex-plugin/plugin.json      Codex plugin manifest
├── agents/
│   ├── workflow-researcher.md     Claude-format read-only research subagent
│   └── workflow-executor.md       Claude-format write-capable execution subagent
└── skills/
    └── senior-engineering-workflow/
        ├── SKILL.md               the twelve-step workflow skill
        ├── agents/openai.yaml     Codex interface metadata
        └── assets/
            └── TASK_STATE.template.md   durable task-state template
```

Adapter-specific agent definitions live in the repository's `adapters/` directory:

```text
adapters/
├── codex/agents/
│   ├── workflow-researcher.toml   Codex-format read-only research agent (gpt-5.6-sol, max effort)
│   ├── workflow-reviewer.toml     Codex-format read-only review agent (gpt-5.6-terra, max effort)
│   └── workflow-executor.toml     Codex-format write-capable execution agent (gpt-5.6-luna, max effort)
├── gemini/agents/
│   ├── workflow-researcher.md     Gemini-format read-only research subagent
│   └── workflow-executor.md       Gemini-format write-capable execution subagent
└── opencode/agents/
    ├── workflow-researcher.md     OpenCode-format read-only research subagent
    └── workflow-executor.md       OpenCode-format write-capable execution subagent
```
