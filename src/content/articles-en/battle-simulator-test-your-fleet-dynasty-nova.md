---
translationOf: "dynasty-nova-simuler-un-combat-avant-denvoyer-sa-flotte"
title: "Battle simulator: test your fleet before you attack"
description: "Dynasty Nova's new battle simulator tests an attack before you send it: prefilled from a spy report, a win rate over 50 runs, same engine as real battles."
faq:
  - question: "How does Dynasty Nova's battle simulator work?"
    answer: "You put together an attacking fleet and pair it with a defender (from a spy report or by manual entry), then the simulator replays the battle 50 times to show a win rate, average losses and a round-by-round breakdown."
  - question: "Does the simulator use the same rules as real battles?"
    answer: "Yes. It runs on the game's actual combat resolution engine, never a simplified version, so the win rate it shows is reliable enough to size a raid."
  - question: "What happens if my spy report didn't reveal everything?"
    answer: "Unobserved categories (fleet, defenses or research) show in amber rather than as zero, and enemy research that wasn't seen is simulated at the attacker's levels to avoid an overly optimistic forecast."
  - question: "Does the simulator account for interplanetary missiles?"
    answer: "No. Interplanetary missiles don't fire in any regular combat round, so they're left out of the catalog of defenses you can simulate."
---

## Introduction

Dynasty Nova is launching a battle simulator, available from the side menu and from every spy report. Before sending a fleet against a target, a player can now test the outcome of the battle several times in a row, with the same engine used for real battles.

## Put together an attack you won't regret sending

### Two ways to define your target

The simulator accepts two sources for the defender: an existing spy report, or manual entry. A report automatically prefills the enemy's known fleet, defenses and research, while leaving every field editable so you can test variants, for example twice as many laser defenses as the report observed.

### A submission mode that's always shown, never guessed

As long as the prefilled values aren't changed, the simulation sends the spy report's ID to the server, which preserves the research assumptions computed server-side. From the first manual edit, it switches to an explicit defending fleet, flagged by a banner that lets you revert. The results panel always shows the mode that was actually sent.

## What each simulation reveals

### A win rate over 50 runs, not a roll of the dice

A battle relies on random rolls: a single fight doesn't tell you much. The simulator replays the battle 50 times and returns a win rate, average losses and average survivors, along with the round-by-round breakdown of one actual run, kept in full.

### What wasn't seen stays uncertain, never zero

A spy report only reveals what its level reached: the fleet from tier 3, defenses from tier 5, research from tier 9. An unobserved category shows in amber, never as a zero, and enemy research that wasn't seen is simulated at the attacker's levels rather than at zero, to avoid an overly optimistic forecast.

## Under the hood, an engine that doesn't cheat

### The same engine as real combat

The simulator runs on Dynasty Nova's actual combat resolution engine, the one that settles battles in the game, never a stripped-down version. That's what makes every win rate directly usable for sizing a raid.

### Interplanetary missiles, left out of the calculation

Interplanetary missiles don't fire in any regular combat round, so they're excluded from the catalog of defenses you can simulate, even when an old spy report lists them alongside the usual defenses.

## Conclusion

The battle simulator turns a question that used to go unanswered before sending a fleet, namely “do I stand a chance?”, into a concrete number built on 50 real runs. Enough to launch an attack like a strategist, not a gambler.
