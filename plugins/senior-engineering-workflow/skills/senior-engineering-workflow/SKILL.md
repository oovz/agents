---
name: senior-engineering-workflow
description: Use for non-trivial software work involving ambiguous requirements, architecture or cross-module changes, external or version-sensitive research, migrations, security, performance, multiple milestones, or context-heavy repository exploration. Do not use for simple local edits with a known entry point.
---

# Senior Engineering Workflow

Apply this workflow iteratively. Treat requirements, feasibility, architecture, and plans as working models that must change when evidence changes.

## 1. Establish the current state

Before proposing a design or editing code:

- read applicable `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README`, `CONTRIBUTING`, architecture records, CI configuration, and local instructions;
- inspect `git status` and preserve unrelated work;
- identify the relevant projects, manifests, lockfiles, frameworks, versions, test systems, and run commands;
- inspect the current implementation and existing tests;
- reproduce the reported behavior when feasible;
- choose and state one context strategy:
  - **Direct** when the entry point is known, the change is local, and expected output is small;
  - **Delegated exploration** when raw repository, documentation, test, log, or diff output is much larger than the conclusions the main context needs;
  - **Long-horizon** when the task has multiple milestones, may cross context windows, or needs durable state.

If exploration is context-heavy, delegate before broad searching. Prefer the bundled `workflow-explorer` subagent when the host exposes it; otherwise create an equivalent read-only worker with a bounded scope and evidence-linked output.

## 2. Build a requirements model

Maintain a concise working record with:

- desired outcome;
- confirmed functional requirements;
- inferred or provisional requirements;
- non-functional requirements;
- measurable or observable acceptance criteria;
- constraints and integration boundaries;
- compatibility targets;
- explicit non-goals;
- assumptions with evidence status;
- unresolved questions;
- core, significant, and peripheral edge cases;
- known risks.

Do not invent product requirements. Infer cautiously from repository evidence and label the inference.

After the first evidence-gathering wave, discuss material ambiguities with the user. Ask questions in bounded decision form and make a recommendation.

## 3. Research in evidence waves

Research until the work is decision-complete: additional investigation is unlikely to change a relevant requirement, architecture choice, implementation, or risk assessment.

### Wave A: local truth

Establish current behavior and project constraints using:

- source and configuration;
- tests, compiler, runtime, logs, and traces;
- dependency manifests and lockfiles;
- reproducible experiments.

### Wave B: external truth

For each material external dependency or claim:

1. identify the exact installed or target version;
2. consult official documentation, specifications, source, release notes, and migration guides for that version;
3. consult standards where normative requirements matter;
4. use maintainer and credible practitioner reports for operational experience;
5. cross-check disputed claims and record uncertainty.

### Wave C: challenge the model

For uncertain or contested questions:

- maintain more than one plausible hypothesis;
- seek evidence that could disprove each;
- note source disagreement;
- distinguish observation from inference;
- revise the requirements and design when evidence changes.

Use subagents for independent research directions. Give them non-overlapping scopes and require evidence-linked summaries.

## 4. Design proportionally

For architecture-significant work, describe the relevant parts of:

- current architecture and affected components;
- ownership and trust boundaries;
- interfaces, contracts, schemas, and invariants;
- data flow and state transitions;
- persistence, consistency, and transactions;
- failure modes, recovery, retry safety, and idempotency;
- security, authentication, authorization, and privacy;
- concurrency and ordering;
- latency, throughput, resource, and cost constraints;
- observability and operational support;
- deployment, migration, backward compatibility, rollback, and removal strategy;
- testing and validation.

Consider multiple options only where a real trade-off exists. For each viable option, identify benefits, costs, risks, compatibility consequences, operational consequences, project fit, and uncertainty.

Recommend one design and identify the decisive evidence. Ask the user to decide material product, compatibility, cost, and risk trade-offs.

Avoid premature abstraction, speculative extensibility, and support for unaccepted edge cases. Prefer the simplest architecture that satisfies the accepted scope and quality attributes.

## 5. Validate feasibility before broad implementation

When a critical assumption is uncertain, run a bounded spike, prototype, benchmark, or focused test.

A feasibility experiment must:

- answer one specific question;
- state what evidence would confirm or reject the assumption;
- be limited in scope;
- avoid contaminating production code;
- produce observable results;
- be removed or productionized deliberately.

After the experiment, update assumptions, requirements, architecture, and plan.

## 6. Agree on scope and compatibility

Do not attempt theoretical completeness.

- Handle core cases.
- Discuss significant cases and their complexity.
- Defer peripheral cases unless selected by the user.

Before adding a compatibility layer, legacy path, fallback chain, provider abstraction, version branch, polyfill, or migration bridge, present:

- target and evidence of need;
- behavior without the layer;
- simplest no-layer option;
- complexity and test matrix;
- maintenance and operational burden;
- expected lifetime and removal criteria;
- recommendation.

Obtain explicit approval before implementation.

## 7. Create a milestone plan

Create ordered vertical slices that each deliver coherent, verifiable behavior. The plan should include:

- milestone outcome;
- affected components or files;
- contract or schema changes;
- dependencies and prerequisites;
- tests and validation commands;
- migration, rollout, and rollback steps where relevant;
- user decision checkpoints;
- context-management strategy for verbose work.

Keep milestones small enough to complete and validate without leaving a half-implemented state across a context transition.

For a long-horizon task, initialize or update a durable task-state artifact before implementation. Copy `assets/TASK_STATE.template.md` to a user-approved tracked location or to a clearly temporary or ignored path, then keep only high-signal state in it.

## 8. Implement with clear ownership

Use one writer per working tree. The main agent normally owns implementation and integration.

Delegate implementation only when slices are independent, interfaces are settled, and each writer has an isolated worktree or equivalent environment. Give each implementation agent explicit scope, files it owns, acceptance criteria, validation commands, and forbidden areas. Integrate and revalidate centrally.

During implementation:

- follow existing conventions;
- keep diffs scoped;
- avoid unrelated cleanup;
- prefer explicit code;
- handle accepted failure modes deliberately;
- update tests and documentation with behavior;
- update durable task state after each milestone;
- stop and return to design if new evidence invalidates an assumption.

Do not hide defects with broad exception swallowing, arbitrary sleeps, unexplained retries, magic constants, output massaging, test-only production paths, disabled validation, or unapproved compatibility layers.

## 9. Test the accepted contract

For bug fixes:

1. reproduce the defect when feasible;
2. establish intended behavior from requirements and evidence;
3. add a regression test that fails for the relevant reason;
4. implement the root-cause correction;
5. run the regression test and affected suite.

For new behavior, test the applicable expected paths, boundaries, invalid input, failure paths, authorization boundaries, compatibility behavior, concurrency, idempotency, and migration behavior.

Use unit, integration, contract, component, end-to-end, build, package, migration, and smoke tests according to risk.

Delegate long test-suite execution or verbose log triage when useful, and require only failures, decisive excerpts, commands, and artifact references in the main context.

Never claim a result that was not observed.

## 10. Review and challenge the result

Before delivery:

- inspect the final diff and repository status;
- run or delegate a focused correctness and security review;
- verify acceptance criteria one by one;
- check for unrelated changes, secrets, debug output, temporary artifacts, stale docs, and accidental dependency drift;
- confirm intentionally deferred cases and compatibility decisions;
- reconcile durable task state with actual repository state.

For high-risk changes, ask an independent reviewer subagent to look for disconfirming evidence rather than merely approving the chosen design.

## 11. Self-correct without churn

After a failed approach:

1. state the hypothesis tested;
2. record the observed evidence;
3. mark the hypothesis supported, disproven, or inconclusive;
4. gather different evidence before repeating a similar change.

After two failures under the same hypothesis, stop varying the same fix.

After three materially distinct unsuccessful hypotheses, stop code churn, restate the objective and known facts, list failed and unresolved assumptions, and return to requirements or architecture with the user.

Immediately return to design when scope expands materially, a local fix becomes a broad refactor, workarounds accumulate, the framework is being fought, a critical external assumption fails, tests would need weakening, or a security or data-integrity risk appears.

## 12. Complete accurately

A task is complete when:

- accepted criteria are satisfied;
- the implementation is coherent and scoped;
- relevant checks pass or unrun checks are disclosed precisely;
- behavioral changes have proportionate test coverage;
- security, compatibility, data integrity, migration, and operations were considered as relevant;
- documentation and configuration match the implementation;
- no unrelated user work was altered;
- durable task state, if used, accurately records the final status;
- the final report is reproducible.
