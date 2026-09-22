import { offboard, toJSON, toMarkdown, composePrompt } from "./src/offboard.js";
import { meetingParticipantPrompt, meetingOrchestratorPrompt } from "./src/meeting-brief.js";
import { feedbackPacket, refinementPrompt } from "./src/feedback-loop.js";

const $ = s => document.querySelector(s);
const toast = $("#toast");

const meeting = {
  id: "alignment-01",
  title: "Project alignment",
  purpose: "Surface what each person needs from the next phase and prepare the questions worth discussing together.",
  participants: ["Person A", "Person B"]
};

const specimens = {
  page: {
    transform: toJSON,
    payload: {
      kind: "content-critique",
      thesis: "The person can be the sender. The idea should sometimes be the image.",
      examples: ["HiPPO post", "burnout structure post", "AI readiness post"],
      research_notes: ["picture superiority", "processing fluency", "curiosity gap"],
      task: "Stress-test the critique. Separate evidence from design judgement and identify missing counterarguments."
    }
  },
  spar: {
    transform: value => composePrompt(value),
    payload: {
      context: {
        change: "Move project work from email threads into Teams",
        biggest_resistance: "People fear losing overview and ownership",
        desired_behaviour: "Decisions and files live with the team, not in inboxes"
      },
      task: "Act as a sparring partner. Challenge assumptions, identify missing stakeholder concerns, and make the next experiment more concrete.",
      output: "Return: assumptions, gaps, 3 questions, 2 practical next experiments."
    }
  },
  state: {
    transform: toJSON,
    payload: {
      day: "Tuesday",
      focus: ["Prepare Thursday AI workshop"],
      done: 6,
      total: 9,
      blocked: ["Room setup unclear"],
      next: ["Dry-run the exercise"],
      question: "Given this state, what is the most useful next 60 minutes?"
    }
  },
  selection: {
    transform: toMarkdown,
    payload: {
      item: "IT Services",
      type: "stakeholder",
      status: "Supportive, capacity constrained",
      role: "Technical delivery",
      notes: "Wants clearer ownership before rollout.",
      open_question: "Who owns adoption after go-live?",
      task: "Suggest 3 useful questions for the next conversation with this stakeholder."
    }
  },
  "meeting-a": { transform: meetingParticipantPrompt, payload: { meeting, participantLabel: "Person A" } },
  "meeting-b": { transform: meetingParticipantPrompt, payload: { meeting, participantLabel: "Person B" } }
};

document.querySelectorAll("[data-demo]").forEach(button => {
  button.addEventListener("click", async () => {
    const specimen = specimens[button.dataset.demo];
    if (!specimen) return;
    showResult(button, await offboard(specimen));
  });
});

$("#copy-notes")?.addEventListener("click", async event => {
  const includePrivate = $("#include-private").checked;
  const kind = $("#notes-kind").value;
  const notes = [
    { visibility: "shared", text: "Need a concrete pilot before discussing a broader rollout." },
    ...(includePrivate ? [{ visibility: "private", text: "Follow up on the unclear ownership question." }] : []),
    { visibility: "shared", text: "Next check-in in two weeks." }
  ];
  const result = await offboard({
    payload: { notes, kind },
    transform: value => composePrompt({
      context: { meeting_notes: value.notes },
      task: `Create a ${value.kind.toLowerCase()} from these notes. Do not invent commitments.`,
      output: "Keep facts, open questions, commitments and suggested follow-ups distinct."
    })
  });
  showResult(event.currentTarget, result);
});

document.querySelectorAll(".stars").forEach(group => {
  [...group.querySelectorAll("button")].forEach((button, i, buttons) => {
    button.addEventListener("click", () => {
      group.dataset.rating = String(i + 1);
      buttons.forEach((star, j) => star.classList.toggle("on", j <= i));
    });
  });
});

$("#copy-feedback")?.addEventListener("click", async event => {
  const examples = [
    { id: "ex-01", title: "Option 1", example: "AI adoption is not a training problem." },
    { id: "ex-02", title: "Option 2", example: "People don't need another AI workshop." },
    { id: "ex-03", title: "Option 3", example: "The hard part starts after the demo." }
  ];
  const evaluations = [...document.querySelectorAll("[data-feedback-id]")].map(card => ({
    id: card.dataset.feedbackId,
    rating: Number(card.querySelector(".stars").dataset.rating || 0) || null,
    comment: card.querySelector(".feedback-comment").value.trim()
  }));
  const feedback = feedbackPacket({
    goal: "Find a strong headline for a piece about AI adoption moving beyond one-off training.",
    examples,
    evaluations,
    iteration: 1
  });
  const result = await offboard({
    payload: { feedback, nextCount: 4 },
    transform: refinementPrompt
  });
  showResult(event.currentTarget, result);
});

$("#copy-orchestrator")?.addEventListener("click", async event => {
  const responses = [
    {
      schema: "ctrl-c-ai/meeting-input/v0", meeting_id: meeting.id, participant: "Person A",
      facts: ["Pilot work is complete."], goals: ["Clarify ownership for the next phase."],
      concerns: ["Responsibilities are currently implicit."], open_questions: ["Who owns adoption?"],
      requests: ["Leave with named owners."], non_negotiables: [], useful_context: []
    },
    {
      schema: "ctrl-c-ai/meeting-input/v0", meeting_id: meeting.id, participant: "Person B",
      facts: ["Technical delivery capacity is limited next month."], goals: ["Keep scope realistic."],
      concerns: ["The next phase may assume capacity that is not available."], open_questions: ["What can wait?"],
      requests: ["Prioritise the next two deliverables."], non_negotiables: [], useful_context: []
    }
  ];
  const result = await offboard({
    payload: { meeting, responses },
    transform: meetingOrchestratorPrompt
  });
  showResult(event.currentTarget, result);
});

function showResult(button, result) {
  const old = button.textContent;
  if (result.ok) {
    button.dataset.state = "copied";
    button.textContent = "Copied ✓";
    showToast(`${result.characters} characters copied`);
  } else {
    button.textContent = "Copy failed";
    showToast("Clipboard access failed");
  }
  setTimeout(() => { button.textContent = old; delete button.dataset.state; }, 1600);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove("show"), 1800);
}
