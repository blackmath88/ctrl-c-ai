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

$("#copy-orchestrator")?.addEventListener("click", async event => {
  const result = await offboard({
    payload: { meeting, responses: fakeResponses },
    transform: value => meetingOrchestratorPrompt(value),
    label: "cactus treaty orchestrator pack"
  });
  showResult(event.currentTarget, result);
});

document.querySelectorAll(".stars").forEach(group => {
  const buttons = [...group.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const rating = index + 1;
      group.dataset.rating = String(rating);
      buttons.forEach((star, i) => star.classList.toggle("on", i < rating));
    });
  });
});

$("#copy-feedback")?.addEventListener("click", async event => {
  const examples = [
    { id: "ex-01", title: "Pasteport", example: "Pasteport" },
    { id: "ex-02", title: "Context Ferry", example: "Context Ferry" },
    { id: "ex-03", title: "Ctrl-C AI", example: "Ctrl-C AI" }
  ];

  const evaluations = [...document.querySelectorAll("[data-feedback-id]")].map(card => ({
    id: card.dataset.feedbackId,
    rating: Number(card.querySelector(".stars").dataset.rating || 0) || null,
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

function showResult(button, result) {
  const original = button.textContent;
  if (result.ok) {
    button.dataset.state = "copied";
    button.textContent = "COPIED ✓";
    showToast(`${result.characters} characters copied`);
  } else {
    button.dataset.state = "error";
    button.textContent = "COPY FAILED";
    showToast("Clipboard access failed.");
  }
  window.setTimeout(() => {
    button.textContent = original;
    delete button.dataset.state;
  }, 1600);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}
