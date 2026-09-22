# Meeting Brief Relay

## A compound Clipboard Offboard

This pattern uses the same low-tech transport for a surprisingly useful multi-person workflow.

Two people are preparing for a meeting. Instead of asking one shared model to summarize a messy thread, each person gets the **same preparation prompt** and answers independently in the LLM of their choice.

Each LLM returns the same small JSON contract.

Those JSON returns are then copied into an **orchestrator prompt**, which creates a neutral shared brief.

```text
                 same preparation pack
                  ↙               ↘
             Person A           Person B
                ↓                  ↓
             own LLM            own LLM
                ↓                  ↓
           JSON return A      JSON return B
                  ↘               ↙
                  orchestrator
                       ↓
                 meeting brief
```

No account linking. No shared AI workspace. No API. The only shared contract is text.

## Why it is interesting

This is more than "copy a prompt."

The clipboard becomes a simple coordination bus between:

- multiple humans;
- potentially different LLM providers;
- a common return schema;
- one final synthesis step.

It is a small example of **manual orchestration through typed handoffs**.

## Step 1 — generate the participant pack

Both participants receive the same meeting framing, questions and return schema.

The prompt should tell the model to:

- answer only from that participant's perspective;
- distinguish facts from interpretations;
- preserve uncertainty;
- avoid guessing what the other person thinks;
- return JSON only.

The reference schema is:

```json
{
  "schema": "ctrl-c-ai/meeting-input/v0",
  "meeting_id": "meeting-123",
  "participant": "participant-a",
  "facts": [],
  "goals": [],
  "concerns": [],
  "open_questions": [],
  "requests": [],
  "non_negotiables": [],
  "useful_context": []
}
```

The participant may inspect and edit the result before sending it onward.

## Step 2 — collect the returns

The meeting tool can offer two paste boxes:

```text
[ paste participant A JSON ]

[ paste participant B JSON ]
```

Validate the schema locally before creating the orchestrator packet.

Nothing requires the two participants to use the same model.

## Step 3 — orchestrate, don't average

The orchestrator's job is not to "merge" two people into one synthetic opinion.

It should preserve:

- shared ground;
- different views;
- contradictions;
- unresolved questions;
- decisions that need the actual meeting;
- proposed agenda;
- watchouts.

A useful orchestrator instruction is:

> Preserve disagreements; do not manufacture consensus.

The reference output schema is:

```json
{
  "schema": "ctrl-c-ai/meeting-brief/v0",
  "meeting_id": "meeting-123",
  "shared_ground": [],
  "different_views": [
    {
      "topic": "string",
      "views": [
        { "participant": "string", "position": "string" }
      ]
    }
  ],
  "questions_to_resolve": [],
  "decisions_needed": [],
  "proposed_agenda": [
    { "topic": "string", "purpose": "string", "minutes": 0 }
  ],
  "watchouts": [],
  "suggested_opening": "string"
}
```

## Good use cases

- manager / employee check-ins;
- consultant / client alignment;
- project handovers;
- difficult cross-team meetings;
- co-founder alignment;
- workshop preparation;
- two experts approaching the same decision from different domains.

The pattern also scales beyond two people, but the cost of manual collection grows quickly. That growth is a useful signal for when a clipboard workflow should graduate to a form, API or shared system.

## Privacy boundary

Independent preparation can feel safer than typing directly into a shared form, but the result is still intended to be shared.

The UI should therefore make that transition explicit:

**private preparation → review → shareable JSON**

Do not imply that private free-form conversation with the participant's LLM will be shared. Only the reviewed structured return should cross the boundary.

## Reference code

See `src/meeting-brief.js` for:

- `meetingParticipantPrompt()`;
- `meetingOrchestratorPrompt()`;
- the two schema identifiers.

This is intentionally a module beside the generic clipboard helper rather than logic added to `offboard.js`. It is a workflow built *with* the primitive, not a reason to bloat the primitive.
