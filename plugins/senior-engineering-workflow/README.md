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

## Exploration subagent

The plugin includes a read-only `workflow-explorer` subagent. It maps codebases, traces execution paths, gathers exact-version documentation, and digests verbose evidence in its own context window. It returns a compact findings handoff (claims linked to evidence, open questions, risks, artifact references) to the parent agent, keeping the main context clean.

The subagent cannot create, edit, delete, or format files. It cannot spawn additional agents. It stays within the scope assigned by the parent and states explicitly when evidence is insufficient.

## Components

```text
plugins/senior-engineering-workflow/
├── .claude-plugin/plugin.json     Claude Code plugin manifest
├── .codex-plugin/plugin.json      Codex plugin manifest
├── agents/
│   └── workflow-explorer.md       Claude-format read-only subagent
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
├── codex/agents/workflow-explorer.toml      Codex-format read-only agent
├── gemini/agents/workflow-explorer.md       Gemini-format read-only subagent
└── opencode/agents/workflow-explorer.md     OpenCode-format read-only subagent
```
