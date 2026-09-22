# Clipboard Offboarding

## A deliberately small integration pattern for software → LLM handoff

### Abstract

Modern AI integration tends to jump quickly from "the user wants to think about this content with an LLM" to APIs, embedded chat, agent frameworks, MCP servers, authentication flows and provider-specific infrastructure.

Sometimes that is correct.

Sometimes the actual requirement is much smaller:

> transform the state already present in an application into a useful context artifact, let the user inspect it, and let the user move it into the model of their choice.

Clipboard Offboarding names that smaller pattern.

The clipboard is not interesting by itself. The interesting design decision is the **boundary immediately before the clipboard**: what is selected, transformed, structured, omitted, labelled and handed to the human.

## 1. Definition

A Clipboard Offboard is a user-triggered transformation of application state into a portable artifact intended for manual transfer into another reasoning environment.

```text
state → transform → inspectable artifact → clipboard → chosen destination
```

The destination can be ChatGPT, Claude, Copilot, a local model, an IDE assistant, or something not yet invented.

The source application does not need to know.

## 2. Why call it an offboard?

"Copy prompt" is too narrow.

Real implementations often copy more than a prompt:

- a case record;
- a filtered view;
- a decision history;
- a content critique;
- evidence and citations;
- UI selections;
- task instructions;
- output schemas for a later roundtrip.

The source application is **offboarding context** from its own interaction model into another one.

## 3. What the pattern buys

Clipboard Offboarding is:

- provider agnostic;
- credential free;
- inspectable before transmission;
- editable by the human;
- compatible with local models;
- cheap to prototype;
- easy to remove;
- a useful fallback even after deeper integrations exist.

It also makes an important boundary visible: nothing leaves the interface until the user deliberately copies it.

## 4. What it does not buy

The pattern is a poor fit when the workflow needs:

- high-frequency automation;
- guaranteed delivery;
- background execution;
- large binary payloads;
- reliable bidirectional state synchronization;
- long-running tool use;
- machine-to-machine authentication;
- transactional writes.

At that point, graduate to a deeper integration.

## 5. The integration ladder

Clipboard Offboarding should be understood as one rung:

1. clipboard;
2. clipboard + destination/deep link;
3. API;
4. MCP/tool surface;
5. persistent agent/orchestrator.

The question is not which rung is "best."

The question is: **what is the smallest rung that satisfies the real workflow?**

## 6. Human-mediated transport

In automated architecture diagrams, a human in the transport loop can look like a defect.

Here it is deliberate.

The person:

- sees what will be transferred;
- decides whether it is appropriate;
- may edit it;
- chooses the destination model;
- can stop the handoff entirely.

That makes the pattern particularly useful for exploratory tools, prototypes, mixed-provider environments and workflows where explicit user agency is desirable.

## 7. The transformation is the product

A generic "copy everything" button is rarely good enough.

A useful offboard answers:

- What does the destination model need?
- What can be omitted?
- What ordering makes the state legible?
- Which facts should be labelled as evidence vs judgement?
- What task should accompany the context?
- Should the output be prose, Markdown, JSON or a specific schema?
- Is a return contract needed?

The reusable idea is therefore not `navigator.clipboard.writeText()`.

It is:

```text
application semantics
      ↓
purpose-specific projection
      ↓
portable artifact
```

## 8. Provenance in this repo

This pattern was extracted from repeated implementations rather than invented as an abstract component first.

Two concrete examples:

### feedback-samzuercher

A critique page exposes "Für LLM kopieren" / "JSON für LLM kopieren". The payload contains the thesis, picture taxonomy, research notes and sources. The user can continue the critique in another model without the page embedding an AI client.

### Changefield

The change-management prototype builds prompts from the current case: initiative context, force fields, stakeholders, communication objectives and other module state. It then copies that assembled context into the clipboard and optionally opens Claude or ChatGPT.

A newer case brief implementation independently converts a deterministic context brief to Markdown and copies it.

Those implementations share the same boundary strongly enough to justify a small pattern library.

## 9. Status

This is not a standard, protocol body, SDK or attempt to make copy/paste sound more sophisticated than it is.

It is a name for a useful design move, plus tiny code that makes the move easy to reuse.

That is enough.
