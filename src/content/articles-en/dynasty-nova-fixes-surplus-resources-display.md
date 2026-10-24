---
translationOf: "dynasty-nova-corrige-lecran-des-ressources-en-surplus"
title: "Dynasty Nova fixes how surplus resources are displayed"
description: "A recent fix ends a frustrating bug: resources received beyond your storage capacity were invisible and impossible to spend. Here's what changes."
faq:
  - question: "Why can't my resources go over my storage capacity?"
    answer: "Now they can. A recent fix lets your metal, crystal and hydrogen exceed the capacity of your warehouses when a surplus arrives all at once, for example from a fleet transport."
  - question: "What happens if I receive more resources than my storage capacity?"
    answer: "The surplus stays visible and available: you can still start a construction or a research with it. Only the local production of that resource pauses until the surplus has been used up."
  - question: "How can I tell if my resource production has stopped?"
    answer: "The matching gauge turns red and shows the actual surplus value (for example 250k/100k), along with a banner explaining why production is temporarily frozen."
  - question: "Will the resource surplus end up being lost?"
    answer: "No. It only goes down if you spend it or if your net consumption is negative, never through an artificial cap on the stock itself."
---

## Introduction

Running a space empire is first and foremost about managing a flow: metal, crystal and hydrogen pile up, get spent and move between planets. A recent bug broke that flow in one specific and particularly unfair case: the surplus.

## The problem: an invisible, locked surplus

### A planet that refuses to use its surplus

When a planet suddenly received more resources than its storage capacity could hold, typically after a fleet transport between two colonies, the surplus simply vanished from the display. Worse, it couldn't be spent. There was no way to launch the construction or research it would easily have paid for.

### One cause, effects everywhere

The cause came down to a single line of logic, but it ran through the entire game. The resource bar, the detail modals, buildings, research, the shipyard and even defenses all read the same value, artificially capped at storage capacity, whatever the amount actually held.

## The fix: cap production, not stock

### The new rule

The fix reverses the logic. From now on, it's **production** that is capped by storage capacity, not the stock itself:

- If your stock stays below capacity, nothing changes: resources keep accumulating as usual.
- If a surplus arrives (transport, reward, pack), it's kept as is and stays fully spendable; only the local production of that resource pauses until the surplus has been used up.
- If your net consumption turns negative again, the stock goes down as usual, even in surplus: the cap only works upward.

### What changes on screen

The most visible change is on the resource gauge: it now shows the real value without truncating it, maxes out at 100% and turns red when there's a surplus. In the details window, the header clearly shows the surplus against capacity (for example 250k/100k), with a banner explaining that production is paused, without ever blocking spending.

## Why it matters for your strategy

This kind of fix is low-key, but it concretely changes how you approach certain decisions. A player planning a big resource transport between two planets no longer needs to expect a loss along the way: everything that arrives stays usable, even well beyond storage capacity. It's a detail that counts when every unit of metal or crystal can make the difference in a tech race or a fleet race.

## Conclusion

Dynasty Nova keeps refining these mechanics based on feedback from the beta community. The best way to build a reliable empire is to start with foundations that never cheat you out of your resources.

**Exploring the galaxy** and trying this fix in the game itself is still the best way to see the difference.
