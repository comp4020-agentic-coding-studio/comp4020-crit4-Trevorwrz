# Process overview

A reading-guide to how the work came together.

## What I built

Falling Notes: a browser instrument, not a game. Notes drift down six lanes
(A S D J K L) as a visual invitation to press along, but pressing a lane
always plays that lane's note live via Web Audio, whether or not a falling
note is anywhere near the line --- so there's no early, late, or miss to
grade, and the pentatonic scale means there's no wrong note either. A
difficulty toggle (Easy: 3 lanes / Hard: 6) changes how much you're juggling,
not whether you can lose.

## The moments that mattered

1. The first shape I considered was a literal rhythm game --- score, combo,
   miss judgement --- because that's what "falling notes" usually means. That
   directly contradicts the brief's no-score, no-fail-state rule, so instead
   of building it and stripping features out afterward, I redesigned before
   writing any code: the fall is a *cue*, not a judge, and every press
   produces sound unconditionally. I wrote that constraint into `CLAUDE.md`
   and into `spec/crit-4.test.ts` (a test that fails on any "score:"/"game
   over"/"you lose" string in the built page) before implementing the
   instrument itself, so the red test was there first and stayed green once
   the mechanic landed
   ([`70c6833`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-Trevorwrz/commit/70c6833),
   [`f9c1ba5`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-Trevorwrz/commit/f9c1ba5)).

2. `spec/crit-4.test.ts` reads the *built* `dist/index.html` with JSDOM, which
   parses markup but never executes the bundled script. When I added the
   Easy/Hard difficulty toggle, the obvious approach --- create the extra
   three lanes with JS only when Hard mode is selected --- would have made
   the keyboard-control test pass or fail depending on which mode happened to
   load, which isn't what the test is supposed to measure. Instead all six
   lanes ship in the static HTML always, and the toggle only flips
   `disabled`/visibility client-side, so the static markup the test reads is
   identical regardless of mode
   ([`ddb3316`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-Trevorwrz/commit/ddb3316)).
   I checked this held by running `pnpm check` after the change (still
   20/20) and by driving both modes in a headless browser at 1920x1080 and
   390x844 to confirm six lanes render without horizontal scroll on the phone
   width.

3. Sound has to be synthesised live, not played back, per the brief. Rather
   than leave that as an unchecked claim, `spec/crit-4.test.ts` asserts there
   is no `<audio src>`/`<video src>` anywhere in the shipped page, which
   would catch a future regression to a pre-recorded sample even though the
   current implementation (`OscillatorNode` + `GainNode` per press) never
   needed one
   ([`70c6833`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-Trevorwrz/commit/70c6833)).

## Before you ship

Not yet shipped: repo is still private, pending the crit-4 cutoff.
