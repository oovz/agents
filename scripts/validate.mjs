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
  check(codex.author?.name && codex.author?.url, "Codex plugin author must include name and url");
  check(codex.homepage && codex.repository, "Codex plugin must have homepage and repository");
  check(codex.license === "MIT", "Codex plugin license must be MIT");
  check(Array.isArray(codex.keywords) && codex.keywords.length >= 3, "Codex plugin must have at least 3 keywords");
  check(codex.interface?.developerName, "Codex plugin interface must have developerName");
  check(codex.interface?.websiteURL, "Codex plugin interface must have websiteURL");
  check(codex.interface?.brandColor, "Codex plugin interface must have brandColor");
  check(Array.isArray(codex.interface?.defaultPrompt) && codex.interface.defaultPrompt.length > 0 && codex.interface.defaultPrompt.length <= 3, "Codex defaultPrompt must contain one to three prompts");

  check(claude.displayName === "Senior Engineering Workflow", "Claude plugin must have displayName");
  check(claude.author?.name && claude.author?.url, "Claude plugin author must include name and url");
  check(claude.homepage && claude.repository, "Claude plugin must have homepage and repository");
  check(claude.license === "MIT", "Claude plugin license must be MIT");
  check(Array.isArray(claude.keywords) && claude.keywords.length >= 3, "Claude plugin must have at least 3 keywords");
  check(claude.skills === "./skills/", "Claude plugin skills path is invalid");
  check(claude.agents === "./agents/", "Claude plugin agents path is invalid");

  check(claudeMarket.name === NAME, "Claude marketplace name is invalid");
  check(claudeMarket.owner?.name, "Claude marketplace must have owner name");
  check(claudeMarket.owner?.url, "Claude marketplace must have owner url");
  check(typeof claudeMarket.description === "string", "Claude marketplace must have description");
  check(claudeMarket.plugins?.[0]?.source === `./plugins/${NAME}`, "Claude marketplace source is invalid");
  check(claudeMarket.plugins?.[0]?.version === codex.version, "Claude marketplace plugin version must match manifest");
  check(claudeMarket.plugins?.[0]?.license === "MIT", "Claude marketplace plugin entry must declare MIT license");
  check(claudeMarket.plugins?.[0]?.category === "Productivity", "Claude marketplace plugin entry must have category");

  check(codexMarket.name === NAME, "Codex marketplace name is invalid");
  check(codexMarket.interface?.displayName === "Senior Engineering Workflow", "Codex marketplace must have interface.displayName");
  check(codexMarket.plugins?.[0]?.source?.path === `./plugins/${NAME}`, "Codex marketplace source is invalid");
  check(codexMarket.plugins?.[0]?.policy?.installation === "AVAILABLE", "Codex marketplace plugin must have AVAILABLE installation policy");
  check(codexMarket.plugins?.[0]?.policy?.authentication === "ON_INSTALL", "Codex marketplace plugin must have ON_INSTALL authentication policy");
  check(codexMarket.plugins?.[0]?.category === "Productivity", "Codex marketplace plugin entry must have category");

  const licenseText = await readFile(path.join(ROOT, "LICENSE"), "utf8");
  check(/MIT License/.test(licenseText), "LICENSE file must contain MIT License text");

  const skillText = await readFile(path.join(PLUGIN, "skills", NAME, "SKILL.md"), "utf8");
  const skillMeta = frontmatter(skillText);
  check(skillMeta.name === NAME, "Skill name does not match its directory");
  check(typeof skillMeta.description === "string" && skillMeta.description.length > 40, "Skill description is missing or too short");

  const claudeResearcher = await readFile(path.join(PLUGIN, "agents", "workflow-researcher.md"), "utf8");
  const claudeReviewer = await readFile(path.join(PLUGIN, "agents", "workflow-reviewer.md"), "utf8");
  const claudeExecutor = await readFile(path.join(PLUGIN, "agents", "workflow-executor.md"), "utf8");
  const geminiResearcher = await readFile(path.join(ROOT, "adapters", "gemini", "agents", "workflow-researcher.md"), "utf8");
  const geminiReviewer = await readFile(path.join(ROOT, "adapters", "gemini", "agents", "workflow-reviewer.md"), "utf8");
  const geminiExecutor = await readFile(path.join(ROOT, "adapters", "gemini", "agents", "workflow-executor.md"), "utf8");
  const opencodeResearcher = await readFile(path.join(ROOT, "adapters", "opencode", "agents", "workflow-researcher.md"), "utf8");
  const opencodeReviewer = await readFile(path.join(ROOT, "adapters", "opencode", "agents", "workflow-reviewer.md"), "utf8");
  const opencodeExecutor = await readFile(path.join(ROOT, "adapters", "opencode", "agents", "workflow-executor.md"), "utf8");
  const codexResearcher = await readFile(path.join(ROOT, "adapters", "codex", "agents", "workflow-researcher.toml"), "utf8");
  const codexReviewer = await readFile(path.join(ROOT, "adapters", "codex", "agents", "workflow-reviewer.toml"), "utf8");
  const codexExecutor = await readFile(path.join(ROOT, "adapters", "codex", "agents", "workflow-executor.toml"), "utf8");

  check(frontmatter(claudeResearcher).name === "workflow-researcher", "Claude researcher agent name is invalid");
  check(frontmatter(claudeResearcher).disallowedTools?.includes("Write") && frontmatter(claudeResearcher).disallowedTools?.includes("Bash"), "Claude researcher agent is not write-restricted");
  check(frontmatter(claudeResearcher).effort === "max", "Claude researcher agent must use max reasoning effort");
  check(frontmatter(claudeReviewer).name === "workflow-reviewer", "Claude reviewer agent name is invalid");
  check(frontmatter(claudeReviewer).disallowedTools?.includes("Write") && frontmatter(claudeReviewer).disallowedTools?.includes("Bash"), "Claude reviewer agent is not write-restricted");
  check(frontmatter(claudeReviewer).effort === "max", "Claude reviewer agent must use max reasoning effort");
  check(frontmatter(claudeExecutor).name === "workflow-executor", "Claude executor agent name is invalid");
  check(frontmatter(claudeExecutor).effort === "max", "Claude executor agent must use max reasoning effort");

  check(frontmatter(geminiResearcher).name === "workflow-researcher", "Gemini researcher agent name is invalid");
  check(frontmatter(geminiReviewer).name === "workflow-reviewer", "Gemini reviewer agent name is invalid");
  check(frontmatter(geminiExecutor).name === "workflow-executor", "Gemini executor agent name is invalid");

  check(frontmatter(opencodeResearcher).mode === "subagent", "OpenCode researcher agent is not a subagent");
  check(/\n\s*edit:\s*deny\b/.test(opencodeResearcher), "OpenCode researcher agent is not write-restricted");
  check(/\n\s*bash:\s*deny\b/.test(opencodeResearcher), "OpenCode researcher agent still allows shell mutation");
  check(frontmatter(opencodeReviewer).mode === "subagent", "OpenCode reviewer agent is not a subagent");
  check(/\n\s*edit:\s*deny\b/.test(opencodeReviewer), "OpenCode reviewer agent is not write-restricted");
  check(/\n\s*bash:\s*deny\b/.test(opencodeReviewer), "OpenCode reviewer agent still allows shell mutation");
  check(frontmatter(opencodeExecutor).mode === "subagent", "OpenCode executor agent is not a subagent");
  check(/\n\s*edit:\s*allow\b/.test(opencodeExecutor), "OpenCode executor agent must allow editing");

  check(/^name\s*=\s*"workflow_researcher"/m.test(codexResearcher), "Codex researcher agent name is invalid");
  check(/^sandbox_mode\s*=\s*"read-only"/m.test(codexResearcher), "Codex researcher agent is not read-only");
  check(/^model\s*=\s*"gpt-5\.6-sol"/m.test(codexResearcher), "Codex researcher agent must use the advanced gpt-5.6-sol model");
  check(/^model_reasoning_effort\s*=\s*"max"/m.test(codexResearcher), "Codex researcher agent must use max reasoning effort");
  check(/^developer_instructions\s*=\s*"""/m.test(codexResearcher), "Codex researcher agent instructions are missing");

  check(/^name\s*=\s*"workflow_reviewer"/m.test(codexReviewer), "Codex reviewer agent name is invalid");
  check(/^sandbox_mode\s*=\s*"read-only"/m.test(codexReviewer), "Codex reviewer agent is not read-only");
  check(/^model\s*=\s*"gpt-5\.6-terra"/m.test(codexReviewer), "Codex reviewer agent must use the mid-tier gpt-5.6-terra model");
  check(/^model_reasoning_effort\s*=\s*"max"/m.test(codexReviewer), "Codex reviewer agent must use max reasoning effort");
  check(/^developer_instructions\s*=\s*"""/m.test(codexReviewer), "Codex reviewer agent instructions are missing");

  check(/^name\s*=\s*"workflow_executor"/m.test(codexExecutor), "Codex executor agent name is invalid");
  check(/^sandbox_mode\s*=\s*"workspace-write"/m.test(codexExecutor), "Codex executor agent must allow workspace writes");
  check(/^model\s*=\s*"gpt-5\.6-luna"/m.test(codexExecutor), "Codex executor agent must use the cost-effective gpt-5.6-luna model");
  check(/^model_reasoning_effort\s*=\s*"max"/m.test(codexExecutor), "Codex executor agent must use max reasoning effort");
  check(/^developer_instructions\s*=\s*"""/m.test(codexExecutor), "Codex executor agent instructions are missing");

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
