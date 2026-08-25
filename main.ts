// Falling Notes: a browser instrument. Notes fall down lanes as a visual
// invitation to press along, but every press makes that lane's sound
// immediately — there is no timing to grade, so there's no way to miss.
// Holding a lane sustains its note; releasing lets it decay, so how long a
// note lasts is the player's choice, not something graded.

// C major pentatonic plus the octave root: any combination sounds musical
// together, so there's no wrong note either, not just no wrong timing.
const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
const KEY_TO_LANE: Record<string, number> = { a: 0, s: 1, d: 2, j: 3, k: 4, l: 5 };

type Difficulty = "easy" | "hard";
const DIFFICULTY_LANES: Record<Difficulty, number[]> = {
  easy: [0, 1, 2],
  hard: [0, 1, 2, 3, 4, 5],
};

const ATTACK_SECONDS = 0.015;
const SUSTAIN_LEVEL = 0.28;
const RELEASE_SECONDS = 0.18;

let activeLanes = new Set<number>(DIFFICULTY_LANES.easy);
let audioCtx: AudioContext | null = null;
// A shared send-effect bus every lane feeds into. A single note barely
// echoes, but notes held together overlap in the delay and ring on past the
// press --- so playing more than one lane at once is heard blending, not just
// seen as separate presses.
let harmonyBus: DelayNode | null = null;
const soundingLanes = new Map<number, { oscillator: OscillatorNode; gain: GainNode }>();

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();

    const delay = audioCtx.createDelay(1);
    delay.delayTime.value = 0.28;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.22;
    const wet = audioCtx.createGain();
    wet.gain.value = 0.18;

    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(audioCtx.destination);
    harmonyBus = delay;
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function setLaneHeld(lane: number, held: boolean): void {
  const laneEl = document.querySelector<HTMLElement>(`.lane[data-lane="${lane}"]`);
  laneEl?.classList.toggle("held", held);
}

function updateChordGlow(): void {
  document.getElementById("lanes")?.classList.toggle("chord", soundingLanes.size >= 2);
}

function startLane(lane: number): void {
  if (soundingLanes.has(lane)) return;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = NOTE_FREQUENCIES[lane];

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(SUSTAIN_LEVEL, now + ATTACK_SECONDS);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  if (harmonyBus) gain.connect(harmonyBus);
  oscillator.start(now);

  soundingLanes.set(lane, { oscillator, gain });
  setLaneHeld(lane, true);
  updateChordGlow();
}

function stopLane(lane: number): void {
  const sounding = soundingLanes.get(lane);
  if (!sounding) return;
  soundingLanes.delete(lane);

  const ctx = getAudioContext();
  const now = ctx.currentTime;
  sounding.gain.gain.cancelScheduledValues(now);
  sounding.gain.gain.setValueAtTime(sounding.gain.gain.value, now);
  sounding.gain.gain.exponentialRampToValueAtTime(0.0001, now + RELEASE_SECONDS);
  sounding.oscillator.stop(now + RELEASE_SECONDS + 0.02);

  setLaneHeld(lane, false);
  updateChordGlow();
}

function releaseAllLanes(): void {
  for (const lane of [...soundingLanes.keys()]) stopLane(lane);
}

const LONG_NOTE_CHANCE = 0.25;

function spawnFallingNote(lane: number): void {
  const track = document.querySelector<HTMLElement>(`.track[data-track="${lane}"]`);
  if (!track) return;

  const note = document.createElement("div");
  note.className = "note";
  if (Math.random() < LONG_NOTE_CHANCE) note.classList.add("note--long");
  note.style.setProperty("--fall-duration", `${2200 + Math.random() * 900}ms`);
  note.addEventListener("animationend", () => note.remove());
  track.append(note);
}

function scheduleLane(lane: number): void {
  const nextIn = 900 + Math.random() * 1600;
  setTimeout(() => {
    if (activeLanes.has(lane)) spawnFallingNote(lane);
    scheduleLane(lane);
  }, nextIn);
}

function setDifficulty(mode: Difficulty): void {
  const nextActive = new Set(DIFFICULTY_LANES[mode]);
  for (const lane of activeLanes) {
    if (!nextActive.has(lane)) stopLane(lane);
  }
  activeLanes = nextActive;

  document.querySelectorAll<HTMLElement>(".lane").forEach((laneEl) => {
    const lane = Number(laneEl.dataset.lane);
    const active = activeLanes.has(lane);
    laneEl.classList.toggle("inactive", !active);
    const button = laneEl.querySelector("button");
    if (button) button.disabled = !active;
  });

  document.querySelectorAll<HTMLButtonElement>("[data-difficulty]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.difficulty === mode));
  });
}

document.querySelectorAll<HTMLButtonElement>("[data-lane-button]").forEach((button) => {
  const lane = Number(button.dataset.laneButton);

  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId);
    startLane(lane);
  });
  button.addEventListener("pointerup", () => stopLane(lane));
  button.addEventListener("pointercancel", () => stopLane(lane));

  // Native button activation (Tab + Enter/Space) also sustains for as long as
  // the key is held, and preventDefault suppresses the synthesized click that
  // would otherwise fire alongside our own start/stop.
  button.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    startLane(lane);
  });
  button.addEventListener("keyup", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    stopLane(lane);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-difficulty]").forEach((button) => {
  const mode = button.dataset.difficulty as Difficulty;
  button.addEventListener("click", () => setDifficulty(mode));
});

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const lane = KEY_TO_LANE[event.key.toLowerCase()];
  if (lane === undefined || !activeLanes.has(lane)) return;
  startLane(lane);
});

document.addEventListener("keyup", (event) => {
  const lane = KEY_TO_LANE[event.key.toLowerCase()];
  if (lane !== undefined) stopLane(lane);
});

// A key held through an alt-tab, or a pointer released off-window, would
// otherwise leave a note sounding with no matching keyup/pointerup to end it.
window.addEventListener("blur", releaseAllLanes);

setDifficulty("easy");

for (let lane = 0; lane < NOTE_FREQUENCIES.length; lane++) {
  setTimeout(() => scheduleLane(lane), Math.random() * 1200);
}
