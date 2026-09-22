# ctrl-c-ai

**A tiny UI pattern library for moving useful context from software into AI — with the oldest integration protocol on the desktop: copy and paste.**

> When MCP is too much, use Ctrl+C.

`ctrl-c-ai` treats the clipboard as a deliberate integration boundary. An application turns its current state into a useful, inspectable payload; the human copies it; the human chooses where it goes.

No API key. No OAuth. No model lock-in. No backend. No fake chatbot embedded in every page.

This repo is both the **reference site** and the **working notes / pattern documentation**.

## The idea

```text
application state
      ↓
deterministic transformation
      ↓
LLM-ready artifact
      ↓
clipboard
      ↓
human chooses the model
```

This is not an alternative to APIs, MCP, agents, or deep integrations. It is the smallest useful rung on the integration ladder.

Use it when the job is simply:

> get *this context* from *here* into *that model* without building a transport system.

## Why this exists

The pattern emerged repeatedly in other projects:

- **feedback-samzuercher** — a critique page can package its thesis, evidence, taxonomy and sources into structured JSON for another LLM.
- **Changefield / change-management-platform-demo** — case data is transformed into deterministic Markdown or task-specific prompts, then copied into Claude, ChatGPT or another model.
- Related bridge-work experiments use the same move for project briefs, current views, selected state, handoffs and "continue this elsewhere" actions.

The common boundary is not the button. It is the transformation immediately before the button.

## Pattern family

| Pattern | What gets copied | Good for |
|---|---|---|
| Context Offboard | current application state | bring a case/project into an LLM |
| Prompt Offboard | context + explicit task | critique, refine, explain, plan |
| Selection Offboard | current filter / selected records | focused analysis |
| Typed Offboard | JSON or another schema | predictable downstream use |
| Copy + Open | payload, then provider link | low-friction handoff |
| Roundtrip Offboard | export + structured import contract | bring results back into the app |
| Meeting Brief Relay | same prompt → separate JSON returns → orchestrated brief | prepare two or more people without a shared AI workspace |
| Rate + Comment Loop | examples → human ratings/comments → next batch | teach an LLM preferences without embedding it |

The site demonstrates each pattern as a reusable interface primitive.

## Design position

The visual system is intentionally quieter than the idea.

- Basel-ish sans + mono typography.
- bridge-work structural palette: teal for structure, amber for action, violet for governance; rose only when semantically earned.
- flat, navigable, documentation-like layout rather than a marketing landing page.
- no decorative AI gradients.
- no serif headlines.
- no framework unless the implementation earns one.

The repo follows the Webcraft rule: **use the smallest tool that fits**.

## Use

The core helper is plain browser JavaScript:

```js
import { offboard, toMarkdown } from "./src/offboard.js";

await offboard({
  payload: {
    title: "Project Atlas",
    status: "blocked",
    evidence: ["Pilot complete", "Legal review pending"]
  },
  transform: toMarkdown,
  label: "project context"
});
```

Or with a task:

```js
await offboard({
  payload: caseState,
  transform: state => [
    "# Context",
    toMarkdown(state),
    "",
    "# Task",
    "Challenge the assumptions. Return risks, missing evidence, and next actions."
  ].join("\n")
});
```

## Run locally

No build step.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## GitHub Pages

The repository is Pages-ready from the repo root. Enable **Settings → Pages → Deploy from a branch → main / root**.

## Repository map

```text
index.html            reference site + live specimens
styles.css            site and component styling
src/
  offboard.js         tiny clipboard / transformation library
  meeting-brief.js    compound multi-person meeting workflow
  feedback-loop.js    rate/comment preference loop
docs/
  whitepaper.md       why this pattern exists
  patterns.md         pattern definitions and boundaries
  implementation.md   UX, accessibility and security notes
  meeting-brief.md    two-person JSON relay + neutral orchestration
  feedback-loop.md    examples → ratings/comments → refinement
examples/
  README.md           how to contribute real implementations
AGENTS.md              development rules for coding agents
```

## Principle

**The human is not a workaround in this pattern. The human is the transport and approval boundary.**

That is sometimes exactly the right amount of integration.

---

Experimental pattern library by bridge-work.ai. Small enough to understand in one sitting, useful enough to steal.
