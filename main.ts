// Falling Notes: a browser instrument. Notes fall down lanes as a visual
// invitation to press along, but every press makes that lane's sound
// immediately — there is no timing to grade, so there's no way to miss.

// C major pentatonic plus the octave root: any combination sounds musical
// together, so there's no wrong note either, not just no wrong timing.
const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
const KEY_TO_LANE: Record<string, number> = { a: 0, s: 1, d: 2, j: 3, k: 4, l: 5 };

type Difficulty = "easy" | "hard";
const DIFFICULTY_LANES: Record<Difficulty, number[]> = {
  easy: [0, 1, 2],
  hard: [0, 1, 2, 3, 4, 5],
};

let activeLanes = new Set<number>(DIFFICULTY_LANES.easy);
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  audioCtx ??= new AudioContext();
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function playLaneSound(lane: number): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = NOTE_FREQUENCIES[lane];

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.9);
}

function pulseLane(lane: number): void {
  const laneEl = document.querySelector<HTMLElement>(`.lane[data-lane="${lane}"]`);
  laneEl?.classList.remove("pulse");
  // restart the animation even if it's already playing
  void laneEl?.offsetWidth;
  laneEl?.classList.add("pulse");
}

function playLane(lane: number): void {
  playLaneSound(lane);
  pulseLane(lane);
}

function spawnFallingNote(lane: number): void {
  const track = document.querySelector<HTMLElement>(`.track[data-track="${lane}"]`);
  if (!track) return;

  const note = document.createElement("div");
  note.className = "note";
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
  activeLanes = new Set(DIFFICULTY_LANES[mode]);

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
  button.addEventListener("click", () => playLane(lane));
});

document.querySelectorAll<HTMLButtonElement>("[data-difficulty]").forEach((button) => {
  const mode = button.dataset.difficulty as Difficulty;
  button.addEventListener("click", () => setDifficulty(mode));
});

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const lane = KEY_TO_LANE[event.key.toLowerCase()];
  if (lane === undefined || !activeLanes.has(lane)) return;
  playLane(lane);
});

setDifficulty("easy");

for (let lane = 0; lane < NOTE_FREQUENCIES.length; lane++) {
  setTimeout(() => scheduleLane(lane), Math.random() * 1200);
}
