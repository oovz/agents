import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAME = "senior-engineering-workflow";
const PLUGIN = path.join(ROOT, "plugins", NAME);
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const scalar = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.+)$/);
    if (scalar) values[scalar[1]] = scalar[2].trim();
  }
  return values;
}

export async function validateRepository() {
  errors.length = 0;
  const [codex, claude, gemini, codexMarket, claudeMarket] = await Promise.all([
    json("plugins/senior-engineering-workflow/.codex-plugin/plugin.json"),
    json("plugins/senior-engineering-workflow/.claude-plugin/plugin.json"),
    json("gemini-extension.json"),
    json(".agents/plugins/marketplace.json"),
    json(".claude-plugin/marketplace.json"),
  ]);

  for (const manifest of [codex, claude, gemini]) {
    check(manifest.name === NAME, `Manifest name must be ${NAME}`);
    check(/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(manifest.version), `Invalid version in ${manifest.name}`);
    check(typeof manifest.description === "string" && manifest.description.length > 20, "Manifest description is too short");
  }
  check(codex.version === claude.version && claude.version === gemini.version, "Host manifest versions differ");
  check(codex.skills === "./skills/", "Codex skills path is invalid");
  check(codex.author?.name && codex.interface?.developerName, "Codex publisher metadata is incomplete");
  check(Array.isArray(codex.interface?.defaultPrompt) && codex.interface.defaultPrompt.length > 0 && codex.interface.defaultPrompt.length <= 3, "Codex defaultPrompt must contain one to three prompts");
  check(claudeMarket.name === NAME && claudeMarket.plugins?.[0]?.source === `./plugins/${NAME}`, "Claude marketplace source is invalid");
  check(codexMarket.name === NAME && codexMarket.plugins?.[0]?.source?.path === `./plugins/${NAME}`, "Codex marketplace source is invalid");

  const skillText = await readFile(path.join(PLUGIN, "skills", NAME, "SKILL.md"), "utf8");
  const skillMeta = frontmatter(skillText);
  check(skillMeta.name === NAME, "Skill name does not match its directory");
  check(typeof skillMeta.description === "string" && skillMeta.description.length > 40, "Skill description is missing or too short");

  const claudeAgent = await readFile(path.join(PLUGIN, "agents", "workflow-explorer.md"), "utf8");
  const geminiAgent = await readFile(path.join(ROOT, "adapters", "gemini", "agents", "workflow-explorer.md"), "utf8");
  const opencodeAgent = await readFile(path.join(ROOT, "adapters", "opencode", "agents", "workflow-explorer.md"), "utf8");
  const codexAgent = await readFile(path.join(ROOT, "adapters", "codex", "agents", "workflow-explorer.toml"), "utf8");
  check(frontmatter(claudeAgent).name === "workflow-explorer", "Claude agent name is invalid");
  check(frontmatter(claudeAgent).disallowedTools?.includes("Write") && frontmatter(claudeAgent).disallowedTools?.includes("Bash"), "Claude agent is not write-restricted");
  check(frontmatter(geminiAgent).name === "workflow-explorer", "Gemini agent name is invalid");
  check(frontmatter(opencodeAgent).mode === "subagent", "OpenCode agent is not a subagent");
  check(/\n\s*edit:\s*deny\b/.test(opencodeAgent), "OpenCode agent is not write-restricted");
  check(/\n\s*bash:\s*deny\b/.test(opencodeAgent), "OpenCode agent still allows shell mutation");
  check(/^name\s*=\s*"workflow_explorer"/m.test(codexAgent), "Codex agent name is invalid");
  check(/^sandbox_mode\s*=\s*"read-only"/m.test(codexAgent), "Codex agent is not read-only");
  check(/^developer_instructions\s*=\s*"""/m.test(codexAgent), "Codex agent instructions are missing");

  const pluginStat = await stat(PLUGIN);
  check(pluginStat.isDirectory(), "Plugin directory is missing");
  return [...errors];
}

if (typeof process !== "undefined" && fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  const validationErrors = await validateRepository();
  if (validationErrors.length) {
    for (const error of validationErrors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
  } else {
    console.log("Repository validation passed.");
  }
}
