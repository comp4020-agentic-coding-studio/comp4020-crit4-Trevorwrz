# Crit 4 reflection

**The breakthrough.** I started by picturing a rhythm game, because "notes
fall down lanes" reads as one by default — and rhythm games are built around
exactly the thing this brief rules out: judging a press as early, late, or
missed. The breakthrough wasn't a code trick, it was noticing that
constraint *before* writing the instrument, and re-describing the mechanic so
the falling note is a suggestion rather than a target: pressing a lane always
makes sound, on its own schedule, regardless of what's on screen. Once I'd
said that out loud in `CLAUDE.md` and in a spec test that fails on the words
"score" or "miss", the actual implementation was almost boring — an
oscillator per press, a pentatonic scale so no combination sounds wrong. The
hard part was the reframing, not the audio code.

**What this changed about the developer I want to be.** I noticed how much
easier it is to build the familiar shape than the one actually asked for, and
how that pull doesn't announce itself — it just feels like "the obvious next
step." The difficulty toggle later gave me a second, smaller version of the
same lesson: the easy way to add Hard mode broke a test's assumptions in a
way that only would have surfaced by accident. I want to keep treating "this
is the obvious way to build it" as a prompt to check it against the actual
constraint, not as a substitute for having read the constraint at all.
