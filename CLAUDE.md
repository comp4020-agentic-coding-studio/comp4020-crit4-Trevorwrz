# COMP4020 prototype

Your starter repo for a COMP4020 prototype: a static site in HTML/CSS/TypeScript
that builds to plain HTML/CSS/JS and deploys to GitHub Pages. The deployed site
is what gets marked, not this repo.

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Run `pnpm check` before you push.
- Open the page in a browser and look at it. The rendered page is the truth;
  your mental model of it isn't.
- When a check fails, read its output before you change anything.
- Never commit a red state.

## The link-preview card

`public/card.png` (1200x630) is the image a shared link shows; `index.html`'s
head points at it. Replace it and the `description` meta, and copy the head
block into any new page. The card URL resolves against the page that names it,
like any link --- `./card.png` is wrong one directory down, and nothing in CI
checks it, so look at the deployed head when you add pages.

## The checks

`pnpm check` runs them (`pnpm check:evidence` is the extra gate before you
ship); CI runs the same plus links, secrets and the deploy. Read the failure.

`spec/README.md`, `PROCESS.md` and `reflections/README.md` are in this repo and
say what they are for.

## This file is yours

A starting point, not a rulebook. As you learn what your prototype needs --- a
convention the work has to hold to, a sensor that keeps catching you out (a
linter, say), a fact about the stack that is easy to get wrong --- write it down
here and wire it into `check`. Growing this file is the work.

## Crit 4: An instrument — falling notes, no judgement

**The idea, one sentence:** a rhythm-game-shaped instrument with the scoring
ripped out — notes fall down lanes toward a hit-line as a visual invitation to
press along, but pressing a lane always makes that lane's sound, whenever you
press it, so there is no early/late/miss to get wrong.

**The one mechanic:**

- A handful of lanes (keyboard keys, and a matching on-screen button per lane
  for touch/mouse), each tuned to a note in a pentatonic scale so any
  combination of presses sounds musical together --- no wrong notes, not just
  no wrong timing.
- Notes spawn automatically and fall down their lane toward a hit-line, purely
  as a visual cue for *when* a stranger might want to press --- not a judge.
  Pressing a lane triggers a real Web Audio oscillator for that lane's note
  immediately, regardless of whether a note is anywhere near the line.
- No score, no combo, no miss, no game-over: the falling notes suggest a
  rhythm: they don't grade one.
- A difficulty toggle (Easy/Hard) changes how many lanes are live --- 3 keys
  (A S D) vs. 6 (A S D J K L) --- so it's about how much you're juggling, not
  about winning or losing. All 6 lanes ship in the markup always; the toggle
  only hides/disables the inactive ones, so the spec's keyboard-control check
  still holds regardless of which mode loads.

Hard rules:

- **Sound is synthesised live** (Web Audio `OscillatorNode`/`GainNode`) on
  every press, never a pre-recorded/played-back sample --- see
  `spec/crit-4.test.ts`.
- **Every lane has a real `<button>`** so it's reachable by keyboard, mouse, or
  touch, not just a `<canvas>` click target.
- **No text or state anywhere implies success or failure** --- that's the
  whole point of the brief this week.
