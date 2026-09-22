/**
 * Compound clipboard workflow: two or more people prepare independently,
 * then an orchestrator model merges their structured returns into a meeting brief.
 *
 * Nothing is sent automatically. Participants can use different LLMs.
 */

export const MEETING_INPUT_SCHEMA = "ctrl-c-ai/meeting-input/v0";
export const MEETING_BRIEF_SCHEMA = "ctrl-c-ai/meeting-brief/v0";

export function meetingParticipantPrompt({
  meeting,
  participantLabel = "participant",
  questions = defaultQuestions()
}) {
  return `# Meeting pre-brief

You are helping one participant prepare independently for a meeting.

## Meeting
Title: ${meeting.title}
Purpose: ${meeting.purpose}
Participants: ${meeting.participants.join(", ")}

## Instructions
Answer the questions below from this participant's perspective.
Do not invent the other participant's views.
Separate facts, interpretations, concerns and requests.
Be concise but specific.

## Questions
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

## Return contract
Return JSON only. No markdown fences.

{
  "schema": "${MEETING_INPUT_SCHEMA}",
  "meeting_id": "${meeting.id}",
  "participant": "${participantLabel}",
  "facts": ["string"],
  "goals": ["string"],
  "concerns": ["string"],
  "open_questions": ["string"],
  "requests": ["string"],
  "non_negotiables": ["string"],
  "useful_context": ["string"]
}

Keep empty arrays when there is nothing to add.
Do not collapse uncertainty into certainty.`;
}

export function meetingOrchestratorPrompt({
  meeting,
  responses
}) {
  return `# Meeting brief orchestrator

You are preparing a neutral brief from independently prepared participant inputs.

## Meeting
Title: ${meeting.title}
Purpose: ${meeting.purpose}
Participants: ${meeting.participants.join(", ")}

## Participant returns
${responses.map((response, i) => `### Input ${i + 1}\n${JSON.stringify(response, null, 2)}`).join("\n\n")}

## Orchestration rules
- Preserve disagreements; do not manufacture consensus.
- Distinguish shared facts from interpretations.
- Never attribute a view to a participant unless it appears in their input.
- Surface contradictions and missing information explicitly.
- Prefer questions that can be resolved in the meeting.
- Keep sensitive or personal material out unless it is directly necessary for the meeting purpose.
- Produce a brief for both participants, not a judgement of either person.

## Return contract
Return JSON only. No markdown fences.

{
  "schema": "${MEETING_BRIEF_SCHEMA}",
  "meeting_id": "${meeting.id}",
  "shared_ground": ["string"],
  "different_views": [
    {
      "topic": "string",
      "views": [
        { "participant": "string", "position": "string" }
      ]
    }
  ],
  "questions_to_resolve": ["string"],
  "decisions_needed": ["string"],
  "proposed_agenda": [
    { "topic": "string", "purpose": "string", "minutes": 0 }
  ],
  "watchouts": ["string"],
  "suggested_opening": "string"
}

Do not score the participants. Do not select a winner. Do not erase meaningful differences.`;
}

export function defaultQuestions() {
  return [
    "What outcome would make this meeting useful for you?",
    "What facts or context should both people have before the meeting?",
    "What is unclear, blocked or unresolved from your perspective?",
    "What are you concerned could be misunderstood?",
    "What do you need from the other person?",
    "What should not be decided or compressed too quickly?"
  ];
}
