import { copyAndOpen, composePrompt, offboard, toJSON, toMarkdown } from "./src/offboard.js";
import { meetingParticipantPrompt, meetingOrchestratorPrompt } from "./src/meeting-brief.js";
import { exampleRequestPrompt, feedbackPacket, refinementPrompt } from "./src/feedback-loop.js";

const $ = selector => document.querySelector(selector);
const toast = $("#toast");

const meeting = {
  id: "cactus-treaty-01",
  title: "Cactus Placement Treaty",
  purpose: "Find a placement that keeps the cactus alive without turning Max's window into shared infrastructure.",
  participants: ["Lina", "Max"]
};

const fakeResponses = [
  {
    schema: "ctrl-c-ai/meeting-input/v0",
    meeting_id: meeting.id,
    participant: "Lina",
    facts: ["The cactus has visibly declined away from the window."],
    goals: ["Move it closer to natural light."],
    concerns: ["We are treating a plant like a political constituency."],
    open_questions: ["Could it sit near the window without occupying Max's desk?"],
    requests: ["Agree one location for two weeks and observe."],
    non_negotiables: ["Do not put it back on the filing cabinet."],
    useful_context: ["Lina waters it on Mondays."]
  },
  {
    schema: "ctrl-c-ai/meeting-input/v0",
    meeting_id: meeting.id,
    participant: "Max",
    facts: ["The window ledge is next to Max's primary work surface."],
    goals: ["Keep the desk visually clear."],
    concerns: ["Temporary objects become permanent through organisational inertia."],
    open_questions: ["Can the plant use a stand beside the window?"],
    requests: ["No pot directly on the desk."],
    non_negotiables: [],
    useful_context: ["Max is fine with the cactus, less fine with soil."]
  }
];

const specimens = {
  context: {
    transform: toMarkdown,
    payload: {
      incident: "Gallery 4 movement alert",
      time: "23:47",
      sensor: "motion",
      camera: "no person visible",
      observation: "linen display moved ~2 cm",
      guard_note: "I blame the vent, not Tutankhamun.",
      question: "What should the morning conservator check first?"
    }
  },
  prompt: {
    transform: value => composePrompt(value),
    payload: {
      context: {
        business: "Crumb & Consequence bakery",
        product: "Burnt Honey Croissant",
        price: "4.80",
        current_sign: "Indulge in an artisanal moment of flaky excellence."
      },
      task: "Rewrite the chalkboard line like a human bakery. Dry wit welcome. Do not use elevated, journey, artisanal, crafted with passion, or mouthwatering.",
      output: "Return 5 short options, each under 9 words."
    }
  },
  selection: {
    transform: toMarkdown,
    payload: {
      current_filter: "umbrellas / black",
      selected_only: [
        { id: "U-114", clue: "tiny plastic duck taped to handle" },
        { id: "U-201", clue: "smells strongly of peppermint" },
        { id: "U-330", clue: "engraving: NOT YOURS, MARTIN" }
      ],
      task: "Suggest one discriminating question staff could ask each claimant. Do not infer identity."
    }
  },
  typed: {
    transform: toJSON,
    payload: {
      schema: "plant-clinic/triage/v1",
      specimen: "F-019",
      species: "Boston fern",
      symptoms: ["brown tips"],
      soil: "damp",
      light: "north window",
      owner_theory: "dramatic personality",
      task: "Rank likely causes and suggest low-risk checks."
    }
  },
  radio: {
    transform: value => composePrompt(value),
    payload: {
      context: {
        bulletin: "17:00",
        items: [
          "Bridge closed temporarily because goats escaped onto access road.",
          "School fête moved indoors because of rain.",
          "Mayor says resident goose is not an official mascot."
        ]
      },
      task: "Turn this into a 30-second local radio bulletin. Warm, factual, no fake quotes.",
      output: "Presenter-ready script."
    }
  },
  roundtrip: {
    transform: value => composePrompt(value),
    payload: {
      context: {
        bugs: [
          "Login button occasionally becomes French.",
          "Invoice PDF prints one haunted blank page.",
          "Dark mode makes the legal footer disappear."
        ]
      },
      task: "Triage each bug.",
      output: 'Return JSON only with fields: id, severity, likely_area, repro_steps, needs_human.'
    }
  },
  "meeting-lina": {
    transform: value => meetingParticipantPrompt(value),
    payload: { meeting, participantLabel: "Lina" }
  },
  "meeting-max": {
    transform: value => meetingParticipantPrompt(value),
    payload: { meeting, participantLabel: "Max" }
  },
  feedback: {
    transform: value => exampleRequestPrompt(value),
    payload: {
      goal: "Name a deliberately low-tech AI handoff pattern.",
      count: 5,
      criteria: ["memorable", "clear enough to explain", "not generic enterprise language"],
      context: "It transforms application state into a portable clipboard payload for a human to paste into any LLM."
    }
  }
};

/* --------------------------------------------------------------------------
   Wiring
   -------------------------------------------------------------------------- */

/** Render a specimen's payload exactly as the clipboard will receive it. */
function renderSpecimen(key) {
  const specimen = specimens[key];
  if (!specimen) return null;
  return specimen.transform(specimen.payload);
}

document.querySelectorAll("[data-demo]").forEach(button => {
  button.addEventListener("click", async () => {
    const specimen = specimens[button.dataset.demo];
    if (!specimen) return;
    const result = button.dataset.open
      ? await copyAndOpen({ ...specimen, url: button.dataset.open })
      : await offboard(specimen);
    showResult(button, result);
  });
});

/* Keep transport visible: each inspector shows the literal text that the
   button beside it would copy. Filled on first open, not on page load. */
document.querySelectorAll("[data-inspect]").forEach(details => {
  details.addEventListener("toggle", () => {
    if (!details.open || details.dataset.filled) return;

    const text = renderSpecimen(details.dataset.inspect);
    if (text == null) return;

    const meta = document.createElement("p");
    meta.className = "inspect-meta";
    meta.textContent = `${text.length} characters · plain text · nothing is sent anywhere`;

    const pre = document.createElement("pre");
    pre.textContent = text;

    details.append(meta, pre);
    details.dataset.filled = "true";
  });

  if (details.open) details.dispatchEvent(new Event("toggle"));
});

$("#copy-orchestrator")?.addEventListener("click", async event => {
  const result = await offboard({
    payload: { meeting, responses: fakeResponses },
    transform: value => meetingOrchestratorPrompt(value),
    label: "cactus treaty orchestrator pack"
  });
  showResult(event.currentTarget, result);
});

$("#copy-feedback")?.addEventListener("click", async event => {
  const examples = [
    { id: "ex-01", title: "Pasteport", example: "Pasteport" },
    { id: "ex-02", title: "Context Ferry", example: "Context Ferry" },
    { id: "ex-03", title: "Ctrl-C AI", example: "Ctrl-C AI" }
  ];

  const evaluations = [...document.querySelectorAll("[data-feedback-id]")].map(card => ({
    id: card.dataset.feedbackId,
    rating: Number(card.querySelector(".stars input:checked")?.value) || null,
    comment: card.querySelector(".feedback-comment").value.trim()
  }));

  const feedback = feedbackPacket({
    goal: "Name a deliberately low-tech AI handoff pattern.",
    examples,
    evaluations,
    iteration: 1
  });

  const result = await offboard({
    payload: { feedback, nextCount: 5 },
    transform: value => refinementPrompt(value),
    label: "rated naming feedback"
  });

  showResult(event.currentTarget, result);
});

/* Mark the section actually on screen, rather than hard-coding one. */
const sideLinks = new Map(
  [...document.querySelectorAll(".side-link[href^='#']")].map(link => [link.hash.slice(1), link])
);

/* #top wraps the whole page, so it is the fallback rather than a target: it
   wins only while no section occupies the reading band. */
const overview = sideLinks.get("top");
const sections = [...sideLinks.keys()]
  .filter(id => id !== "top")
  .map(id => document.getElementById(id))
  .filter(Boolean);

if (sections.length) {
  const HEADER = 57; // the sticky topbar, plus a pixel of tolerance
  let queued = false;

  /* The active section is the last one whose top has passed under the header.
     Asking each rect directly avoids the boundary case that trips up an
     intersection band, where the outgoing and incoming sections overlap it
     by a fraction of a pixel and either could be picked. */
  const sync = () => {
    queued = false;

    let active = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= HEADER) active = section;
    }

    // The last section can be too short to ever reach the header.
    const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (bottom) active = sections[sections.length - 1];

    sideLinks.forEach(link => link.removeAttribute("aria-current"));
    (active ? sideLinks.get(active.id) : overview)?.setAttribute("aria-current", "true");
  };

  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(sync);
  }, { passive: true });

  window.addEventListener("resize", sync, { passive: true });
  sync();
}

/* Feedback never relies on colour alone: the label changes too (AGENTS.md 8). */
function showResult(button, result) {
  const original = button.dataset.label ?? button.textContent;
  button.dataset.label = original;

  if (result.ok) {
    button.dataset.state = "copied";
    button.textContent = "Copied ✓";
    showToast(`${result.characters} characters copied`);
  } else {
    button.dataset.state = "error";
    button.textContent = "Copy failed ✕";
    showToast("Clipboard access failed.");
  }

  window.clearTimeout(button.resetTimer);
  button.resetTimer = window.setTimeout(() => {
    button.textContent = original;
    delete button.dataset.state;
  }, 1600);
}

function showToast(message) {
  toast.textContent = message;
  toast.dataset.show = "true";
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => delete toast.dataset.show, 1800);
}
