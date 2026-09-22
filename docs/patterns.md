# Pattern catalogue

## Context Offboard

**Intent:** move the current state of a project, case or screen into an LLM.

**Input:** structured application state.

**Transform:** remove UI noise, preserve semantic labels, output Markdown or plain text.

**Typical label:** `Copy context for AI`.

Use when the LLM should understand *what exists* before doing anything with it.

---

## Prompt Offboard

**Intent:** move context plus a specific cognitive task.

**Input:** application state + chosen task/mode.

**Transform:** context projection followed by an explicit task and optionally a return shape.

**Typical labels:** `Challenge this`, `Explain this`, `Find holes`, `Plan from this`.

This is the pattern used heavily in Changefield: the app already knows the case context and the person chooses the kind of AI sparring they want.

---

## Selection Offboard

**Intent:** transfer only the user's current focus.

**Input:** selected rows, current filter, active pane or highlighted evidence.

**Transform:** preserve selection semantics and include enough parent context to avoid ambiguity.

**Typical label:** `Current view → AI`.

A good Selection Offboard is deliberately lossy.

---

## Typed Offboard

**Intent:** give another model or tool a stable machine-readable contract.

**Input:** domain state.

**Transform:** versioned JSON or another explicit schema.

Example:

```json
{
  "schema": "ctrl-c-ai/offboard/v0",
  "kind": "content-critique",
  "thesis": "...",
  "evidence": [],
  "task": "..."
}
```

Use stable names and include a schema/version identifier once the payload may live beyond a single paste.

---

## Copy + Open

**Intent:** remove one navigation step without pretending the handoff is automated.

Sequence:

1. generate payload;
2. copy;
3. confirm success;
4. open chosen provider in a new tab;
5. user pastes.

Do not open the destination if the copy failed.

Do not encode sensitive payloads into provider URLs.

---

## Roundtrip Offboard

**Intent:** bring structured reasoning back into the originating application without building a live model integration.

Sequence:

```text
APP
 ↓
COPY CONTEXT + RETURN CONTRACT
 ↓
LLM
 ↓
COPY STRUCTURED RESULT
 ↓
PASTE / IMPORT
 ↓
VALIDATE
 ↓
APP
```

The return contract should specify:

- schema id and version;
- allowed fields;
- required fields;
- whether unknown fields are rejected;
- human preview before applying;
- merge vs replace behaviour.

Example request:

```text
Return only JSON matching:

{
  "schema": "ctrl-c-ai/risk-review/v0",
  "risks": [
    {
      "title": "string",
      "reasoning": "string",
      "evidence_needed": ["string"]
    }
  ]
}
```

The app must still treat model output as untrusted input.

---

## Pattern selection heuristic

Use Context when the destination mainly needs **state**.

Use Prompt when the destination needs **state + job**.

Use Selection when scope is the key interaction.

Use Typed when downstream structure matters.

Use Roundtrip when the result must come home.\n\nUse Meeting Brief Relay when several humans need independent preparation plus a shared synthesis.
