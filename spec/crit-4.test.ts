import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Mechanically checkable lines from the crit-4 spec ("An instrument"):
// https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/04-instrument/
//
// Judged-by-a-person lines live at the crit, not here: whether it's
// expressive, whether two players sound different, whether a stranger
// actually finds music in it uninstructed. No test asserts those.
const DIST = resolve("dist");

function bundledText(): string {
  const assetsDir = join(DIST, "assets");
  return readdirSync(assetsDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => readFileSync(join(assetsDir, name), "utf8"))
    .join("\n");
}

const html = readFileSync(join(DIST, "index.html"), "utf8");
const doc = new JSDOM(html).window.document;

describe("crit-4: An instrument", () => {
  it("makes sound live in the page, not by playing back a recording", () => {
    // "the browser is the instrument ... sound is made live in the page by
    // the player, not played back" — no baked audio/video source.
    const bakedSources = doc.querySelectorAll("audio[src], video[src], audio source[src], video source[src]");
    expect(
      bakedSources.length,
      "found a baked-in audio/video source — sound should come from the Web Audio API at play time, not a recorded file",
    ).toBe(0);
  });

  it("has a native, keyboard-reachable control to make the first sound", () => {
    // "playable with whatever is at hand — mouse, keyboard or touch" and
    // "a stranger can play it uninstructed — the opening screen invites the
    // first sound": there must be a real control on the opening screen, not
    // just a canvas that only responds to a mouse.
    const controls = [...doc.querySelectorAll("main button, main [role='button']")].filter(
      (el) => !el.hasAttribute("disabled") && !el.hasAttribute("hidden"),
    );
    expect(
      controls.length,
      "no visible button (or role=\"button\") in <main> — a native control is keyboard-operable by default, a bare canvas/div with only a click handler isn't",
    ).toBeGreaterThan(0);
  });

  it("has no score or fail state", () => {
    // "there is no way to play it wrong — no score, no fail state"
    const haystack = `${html}\n${bundledText()}`.toLowerCase();
    const forbidden = ["game over", "you lose", "you lost", "high score", "score:", "fail state"];
    for (const phrase of forbidden) {
      expect(haystack.includes(phrase), `found "${phrase}" — the brief rules out scores and fail states`).toBe(
        false,
      );
    }
  });
});
