# Agent Plugins

A collection of agent plugins for Claude Code, Codex, Gemini CLI, and OpenCode. Each plugin packages a skill and a read-only exploration subagent from a single source tree.

## Available plugins

| Plugin | Description |
|---|---|
| [senior-engineering-workflow](plugins/senior-engineering-workflow/) | Evidence-driven workflow for non-trivial software engineering tasks |

See each plugin's own README for what the skill does, its workflow steps, and its subagent.

## Install

### Claude Code

Add the marketplace and install the plugin from within a Claude Code session:

```text
/plugin marketplace add oovz/agents
/plugin install senior-engineering-workflow@senior-engineering-workflow
```

To install without the interactive picker, run the shell command instead:

```text
claude plugin install senior-engineering-workflow@senior-engineering-workflow
```

Both the skill and the `workflow-explorer` subagent are installed by the plugin. Run `/reload-plugins` after updating an installed plugin. For local testing, replace `oovz/agents` with the repository path.

### Codex

```text
codex plugin marketplace add oovz/agents
codex plugin add senior-engineering-workflow@senior-engineering-workflow
```

The plugin installs the skill. Codex plugins do not package custom-agent files, so install the subagent separately:

```text
node scripts/install-adapters.mjs codex --scope user
```

Use `--scope project --project <path>` to install the agent into one project's `.codex/agents/` directory. Start a new Codex task after installing or updating the agent.

You can also install **Senior Engineering Workflow** from the ChatGPT desktop plugin directory, then run the adapter command above for the subagent.

### Gemini CLI

Gemini reads skills and agents from the extension root. The canonical sources live under `plugins/`, so generate the extension tree first:

```text
git clone https://github.com/oovz/agents
cd agents
npm run generate:gemini
gemini extensions install .
```

For local development, use `gemini extensions link .` instead of `install`. Restart Gemini CLI after installation or update so it reloads extension components.

### OpenCode

OpenCode's plugin API covers executable event hooks, not skills or agents. This repository installs those components through OpenCode's documented configuration directories.

Clone the repository, then run:

```text
git clone https://github.com/oovz/agents
cd agents
node scripts/install-adapters.mjs opencode --scope user
```

This copies the skill to `~/.config/opencode/skills/` and the subagent to `~/.config/opencode/agents/`. Use `--scope project --project <path>` for a project-local `.opencode/` installation. The installer refuses to overwrite modified files unless `--force` is supplied.

## Package model

| Host | Native package | Skill | Exploration subagent |
|---|---|---|---|
| Claude Code | Plugin marketplace | Installed by the plugin | Installed by the plugin |
| Codex | Plugin marketplace | Installed by the plugin | Installed separately with the adapter script |
| Gemini CLI | Extension | Generated from `plugins/` | Generated from `adapters/gemini/` |
| OpenCode | Config bundle | Installed with the adapter script | Installed with the adapter script |

## Repository layout

```text
plugins/<name>/                     canonical plugin source (skills, agents, manifests)
adapters/codex/                     Codex-specific agent definition
adapters/gemini/                    Gemini-specific agent definition
adapters/opencode/                  OpenCode-specific agent definition
.claude-plugin/marketplace.json     Claude marketplace catalog
.agents/plugins/marketplace.json    Codex marketplace catalog
gemini-extension.json               Gemini extension manifest
scripts/                            adapter installation and validation
```

`skills/` and `agents/` at the repository root are generated for Gemini CLI and are gitignored. Do not edit them — edit the canonical sources under `plugins/` and `adapters/`, then run `npm run generate:gemini` to regenerate.

## Development

Edit canonical sources under `plugins/` and `adapters/`. Then validate:

```text
npm run validate
```

The validation step checks manifest consistency, marketplace paths, required skill and agent metadata, and read-only agent restrictions across all four hosts.

GitHub Actions runs the same validation on every push and pull request.
