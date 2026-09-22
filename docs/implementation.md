# Implementation notes

## Clipboard API

Prefer `navigator.clipboard.writeText()` in secure contexts. Keep a small fallback when the environment warrants it.

Always surface success and failure.

The reference helper returns:

```js
{
  ok: true,
  method: "clipboard",
  text: "...",
  characters: 1234
}
```

## UX rules

### 1. Let users understand what will be copied

For small payloads, show the actual output.

For large payloads, show a meaningful summary and provide a preview/inspect action.

### 2. Name the transformation, not the mechanism

Weak:
- Copy

Better:
- Copy project context
- Copy critique as JSON
- Challenge this in AI
- Current view → AI

### 3. Copy first, open second

For Copy + Open:

1. await copy success;
2. then open the provider.

This avoids sending the user to another tab with an empty clipboard.

### 4. Preserve explicit user agency

No automatic network call is part of this pattern.

If the feature starts silently posting the payload to a model, it has crossed into a different integration architecture.

## Payload design

Good payloads tend to contain:

1. a short identity/header;
2. essential state;
3. provenance or evidence labels where relevant;
4. the task;
5. requested output shape.

Avoid dumping raw application state when a semantic projection is possible.

## Security and privacy

Clipboard Offboarding does **not** make information safe merely because no API is embedded.

The user can still paste data into an inappropriate external service.

Therefore:

- make sensitive sections visible;
- warn when a payload contains fields the user may not intend to transfer;
- exclude secrets and credentials by default;
- never copy hidden authentication tokens;
- consider a redaction transform for real-world enterprise use.

## Accessibility

Copy controls should:

- be keyboard reachable;
- have clear labels;
- announce success/failure with text or an `aria-live` region;
- not rely on colour alone;
- preserve focus after copying.

## Testing

At minimum test:

- exact transformed payload;
- copy success state;
- copy failure state;
- fallback behaviour if supported;
- no destination open on copy failure;
- schema version for Typed/Roundtrip patterns.

The transformation deserves more tests than the button.
