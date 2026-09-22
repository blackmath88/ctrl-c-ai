# Rate + Comment Feedback Loop

## A human preference loop without an API

This pattern turns clipboard offboarding into a tiny iterative evaluation loop.

The LLM generates several examples in a known JSON shape. A small UI renders them. The human rates each example and can add a short comment. The app packages those explicit evaluations into a new payload that is copied back to the LLM for the next iteration.

```text
       ask for examples
              ↓
             LLM
              ↓
       structured examples
              ↓
        RATE + COMMENT
              ↓
       feedback packet
              ↓
             LLM
              ↓
        better next batch
              ↺
```

No embedded model client is required.

## Why it matters

A plain prompt often makes preference learning fuzzy:

> "More like the second one, but less corporate, and maybe shorter."

The UI can make that feedback much more legible:

```text
Example A   ★★☆☆☆   "Too generic."
Example B   ★★★★★   "This is concrete and slightly weird. More like this."
Example C   ★★★★☆   "Good structure, but too long."
Example D   ★☆☆☆☆   "Sounds like consulting copy."
```

Then the application offboards the ratings and comments as typed feedback.

The clipboard becomes the transport for a small **human evaluation harness**.

## Step 1 — ask for comparable examples

Ask the model for multiple variants that are different enough to create a meaningful preference signal.

Reference return shape:

```json
{
  "schema": "ctrl-c-ai/examples/v0",
  "goal": "Create names for a lightweight AI handoff pattern",
  "examples": [
    {
      "id": "ex-01",
      "title": "Pasteport",
      "example": "Pasteport",
      "rationale": "Portable context + paste."
    }
  ]
}
```

Stable IDs matter because the next step needs to refer to the same examples.

## Step 2 — rate and comment

The UI should make feedback fast:

- 1–5 rating or a simpler like / neutral / dislike scale;
- optional free-text comment;
- optional tags such as `too generic`, `too long`, `keep this structure`;
- no requirement to comment on every example.

The human should be evaluating the examples, not editing JSON.

## Step 3 — offboard the evaluation

The app packages the review:

```json
{
  "schema": "ctrl-c-ai/example-feedback/v0",
  "iteration": 1,
  "goal": "Create names for a lightweight AI handoff pattern",
  "evaluations": [
    {
      "id": "ex-01",
      "rating": 5,
      "comment": "Memorable. Keep the physical metaphor."
    },
    {
      "id": "ex-02",
      "rating": 2,
      "comment": "Accurate but sounds like enterprise software."
    }
  ]
}
```

Then it adds a refinement instruction:

> Infer preferences only from the explicit ratings and comments. Keep diversity. Do not simply clone the highest-rated item.

## Step 4 — repeat

The next batch is rendered back into the same UI and can be rated again.

That gives a simple loop:

```text
generate → evaluate → copy feedback → regenerate
```

## Good use cases

- naming;
- copywriting;
- UI microcopy;
- workshop formats;
- example generation;
- visual-direction descriptions;
- prompt variants;
- scenario generation;
- synthetic test cases;
- tone calibration;
- "show me five ways this could work" exploration.

## Rating is not truth

The score is a preference signal for the next iteration, not a universal quality metric.

The UI should preserve comments because the explanation often carries more useful information than the numeric rating.

A 5/5 with "good because it is concrete and strange" is much more actionable than the number 5 alone.

## Reference code

See `src/feedback-loop.js`:

- `exampleRequestPrompt()` creates the first LLM request;
- `feedbackPacket()` packages ratings and comments;
- `refinementPrompt()` creates the next iteration.

This is another compound workflow built on the generic clipboard primitive. It does not belong inside `offboard.js`.
