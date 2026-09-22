# AGENTS.md — ctrl-c-ai

## Purpose

This repo is a tiny pattern library and reference site for clipboard-mediated AI handoffs.

Protect the smallness of the idea.

## Rules

1. **No framework by default.** Vanilla HTML, CSS and ES modules are the reference implementation.
2. **Transformation is the product.** A copy button without a meaningful payload transformation is not a new pattern.
3. **Keep transport visible.** Users should be able to inspect what will be copied.
4. **Human chooses destination.** Do not silently send payloads to a provider.
5. **Provider agnostic.** Claude, ChatGPT, Copilot, local models and future tools should all fit.
6. **Progressive integration.** Clipboard first; deep links/API/MCP only when a real use case proves the need.
7. **Modular files.** Do not collapse the site into a single giant HTML file.
8. **Accessible feedback.** Copy success/failure must be perceivable without relying only on colour.
9. **No decorative AI UI.** No glowing gradients, fake chat bubbles, generic robot art or serif AI-headline styling.
10. **Examples must come from real boundaries.** Follow the Webcraft/Lumpesammlig rule: do not extract a shared abstraction until at least two implementations prove it.

## Visual canon

Use the bridge-work structural palette:
- teal `#1a7a6d`
- teal bright `#23A595`
- amber `#c48a2a`
- violet `#6e43a7`
- rose `#d4416b` only for earned semantic signal
- black `#050505`
- cream `#f0ebe3`

UI is documentation-first: compact navigation, strong hierarchy, flat surfaces, mono labels, minimal rounding.

## Development direction

Grow this repo in small modules:
- core copy helper
- payload transforms
- reusable specimens
- real-world example adapters
- optional roundtrip/import utilities

Do not turn it into a platform.
