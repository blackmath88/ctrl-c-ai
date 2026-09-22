/**
 * Compound clipboard workflow: ask an LLM for examples in a typed shape,
 * let a human rate/comment on them, then offboard that feedback for the next round.
 *
 * The human evaluation is the state. The clipboard carries the loop.
 */

export const FEEDBACK_EXAMPLES_SCHEMA = "ctrl-c-ai/examples/v0";
export const FEEDBACK_RETURN_SCHEMA = "ctrl-c-ai/example-feedback/v0";

export function exampleRequestPrompt({
  goal,
  count = 4,
  criteria = ["useful", "specific", "surprising"],
  context = ""
}) {
  return `# Generate examples for human review

## Goal
${goal}

${context ? `## Context\n${context}\n` : ""}
## Task
Generate ${count} meaningfully different examples.
Optimise for the criteria below, but do not score your own work.

Criteria:
${criteria.map((criterion, i) => `${i + 1}. ${criterion}`).join("\n")}

## Return contract
Return JSON only. No markdown fences.

{
  "schema": "${FEEDBACK_EXAMPLES_SCHEMA}",
  "goal": "${escapeJSON(goal)}",
  "examples": [
    {
      "id": "ex-01",
      "title": "string",
      "example": "string",
      "rationale": "string"
    }
  ]
}

Make the examples different enough that a human preference signal is useful.`;
}

export function feedbackPacket({
  goal,
  examples,
  evaluations,
  iteration = 1
}) {
  const byId = new Map((evaluations || []).map(item => [item.id, item]));

  return {
    schema: FEEDBACK_RETURN_SCHEMA,
    iteration,
    goal,
    evaluations: (examples || []).map(example => {
      const evaluation = byId.get(example.id) || {};
      return {
        id: example.id,
        title: example.title,
        example: example.example,
        rating: Number.isFinite(Number(evaluation.rating)) ? Number(evaluation.rating) : null,
        comment: evaluation.comment || ""
      };
    })
  };
}

export function refinementPrompt({ feedback, nextCount = 4 }) {
  return `# Improve the next batch from human feedback

You generated examples for a human reviewer. Below is their explicit feedback.

## Feedback
${JSON.stringify(feedback, null, 2)}

## Task
Infer preferences only from the ratings and comments above.
Do not overfit to one example.
Keep useful diversity.
Generate ${nextCount} new examples that respond to the feedback.

Briefly explain the preference pattern you inferred, then return the new examples.

## Return contract
Return JSON only. No markdown fences.

{
  "schema": "${FEEDBACK_EXAMPLES_SCHEMA}",
  "inferred_preferences": ["string"],
  "examples": [
    {
      "id": "ex-next-01",
      "title": "string",
      "example": "string",
      "rationale": "string"
    }
  ]
}`;
}

function escapeJSON(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
