import { copyAndOpen, composePrompt, offboard, toJSON, toMarkdown } from "./src/offboard.js";

const $ = selector => document.querySelector(selector);
const toast = $("#toast");

const specimens = {
  context: {
    transform: toMarkdown,
    payload: {
      project: "Project Atlas",
      status: "blocked",
      evidence: ["Pilot complete", "Users understand the prototype", "Legal review pending"],
      open_questions: ["What evidence does legal need?", "Who owns the next decision?"]
    }
  },
  prompt: {
    transform: value => composePrompt(value),
    payload: {
      context: {
        project: "Project Atlas",
        status: "blocked",
        evidence: ["Pilot complete", "Legal review pending"]
      },
      task: "Challenge the plan. Find assumptions, missing evidence and useful next actions.",
      output: "Return observations, risks, missing evidence, and three next actions."
    }
  },
  selection: {
    transform: toMarkdown,
    payload: {
      current_view: "Risks tagged high",
      selected_records: [
        "Legal approval has no named owner",
        "Migration window overlaps semester start",
        "Fallback path has not been tested"
      ]
    }
  },
  typed: {
    transform: toJSON,
    payload: {
      schema: "ctrl-c-ai/offboard/v0",
      kind: "content-critique",
      thesis: "The idea should sometimes be the image.",
      evidence: ["picture-superiority research", "processing fluency"],
      task: "Stress-test the thesis and identify where the evidence does not support the design judgement."
    }
  }
};

document.querySelectorAll("[data-demo]").forEach(button => {
  button.addEventListener("click", async () => {
    const specimen = specimens[button.dataset.demo];
    const open = button.dataset.open;

    const result = open
      ? await copyAndOpen({ ...specimen, url: open })
      : await offboard(specimen);

    showResult(button, result);
  });
});

const controls = ["#title", "#status", "#owner", "#evidence", "#task"].map($);
controls.forEach(control => control.addEventListener("input", renderPreview));

$("#copy-playground").addEventListener("click", async event => {
  const result = await offboard({
    payload: playgroundState(),
    transform: state => composePrompt({
      context: state.context,
      task: state.task,
      output: "Observations, missing evidence, hidden assumptions, three next moves."
    }),
    label: "project handoff"
  });
  showResult(event.currentTarget, result);
});

$("#copy-json").addEventListener("click", async event => {
  const result = await offboard({
    payload: {
      schema: "ctrl-c-ai/project-handoff/v0",
      ...playgroundState()
    },
    transform: toJSON,
    label: "typed project handoff"
  });
  showResult(event.currentTarget, result);
});

function playgroundState() {
  return {
    context: {
      project: $("#title").value.trim(),
      status: $("#status").value,
      owner: $("#owner").value.trim(),
      evidence: $("#evidence").value.split("\n").map(x => x.trim()).filter(Boolean)
    },
    task: $("#task").value.trim()
  };
}

function renderPreview() {
  const state = playgroundState();
  $("#preview").textContent = composePrompt({
    context: state.context,
    task: state.task,
    output: "Observations, missing evidence, hidden assumptions, three next moves."
  });
}

function showResult(button, result) {
  const original = button.textContent;

  if (result.ok) {
    button.dataset.state = "copied";
    button.textContent = "Copied ✓";
    showToast(`${result.characters} characters copied`);
  } else {
    button.dataset.state = "error";
    button.textContent = "Copy failed";
    showToast("Clipboard access failed — inspect/copy the payload manually.");
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

renderPreview();
