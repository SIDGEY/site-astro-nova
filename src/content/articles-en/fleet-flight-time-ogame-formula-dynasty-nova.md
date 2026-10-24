---
translationOf: "dynasty-nova-duree-de-vol-des-flottes-la-formule-dogame"
title: "Fleet flight time: Dynasty Nova adopts OGame's formula"
description: "How fleet flight time is calculated in a game like OGame, and why Dynasty Nova fixed an error that made every trip about 10 times too short."
faq:
  - question: "What is the fleet flight time formula in OGame?"
    answer: "Flight time in seconds equals (3,500 / s) × √(10 × d / v) + 10, where s is the chosen speed percentage (1 for 100%), d the distance between the two positions and v the speed of the slowest ship in the fleet. Dynasty Nova now applies exactly this formula."
  - question: "Why do fleet trips take longer in Dynasty Nova?"
    answer: "A scaling error on the speed percentage made every trip about 10 times shorter than in OGame. Since the fix, a one-galaxy jump by small cargo ship in an x1 speed universe takes 6 hours 9 minutes instead of 37 minutes."
  - question: "Were fleets already in flight slowed down?"
    answer: "No. Only new trips follow the corrected formula; fleets already in flight when the change went live kept their arrival time."
  - question: "Did hydrogen consumption change with the new flight time?"
    answer: "No. Hydrogen consumption and the flight time of interplanetary missiles are unchanged: only the duration of fleet trips was corrected."
---

## How is fleet flight time calculated?

In a space strategy game like OGame, **a fleet's flight time depends on three things: the distance, the speed of the slowest ship and the speed percentage chosen at launch**. Dynasty Nova now applies OGame's formula exactly:

- **Flight time (seconds) = (3,500 / s) × √(10 × d / v) + 10**
- **s**: the speed percentage, expressed between 0 and 1 (1 means 100%, 0.5 means 50%)
- **d**: the distance between the departure planet and the target
- **v**: the speed of the slowest ship in the fleet

### Why the slowest ship is what counts

A fleet travels as one group: it moves at the pace of its slowest ship. Sending a small cargo ship along with heavy ships means accepting the heavy ships' pace. It's one of the first trade-offs a commander learns to make.

### Speed percentage, a real lever

Lowering the speed makes the trip longer but saves hydrogen, and above all lets you set a precise arrival time. We had already made this setting adjustable [down to the percent](/en/blog/fleet-speed-arrival-time-dynasty-nova/); the corrected formula gives it its full weight again.

## The error we fixed

Until early October, Dynasty Nova divided by a percentage counted from 1 to 100, where OGame's formula counts it in tenths. The result: **every trip was about 10 times shorter** than in OGame.

### A concrete example

A one-galaxy jump by small cargo ship, in an x1 speed universe, used to take 37 minutes. With the corrected formula, it takes **6 hours 9 minutes**, the duration an OGame veteran expects. On very short trips by fast ships, the gap is a little smaller, because of the formula's fixed 10 seconds.

### A formula checked twice

To avoid trading one error for another, we compared the formula against two independent, public implementations from the genre, then locked it in with tests on absolute durations: small cargo ship, espionage probe, 10% speed and a sped-up universe.

## What it changes for your strategy

Longer trips mean decisions that carry more weight. That is exactly what makes the genre worth playing.

### Spy right before you act

A spy report is a snapshot of a single moment, sent back by a [probe](/en/blog/space-strategy-game-beginners-guide-first-hours/). With flights lasting several hours, the target has time to bring its fleet home or spend its resources. What experienced players do by reflex: send a probe right before the attack leaves, not hours earlier.

### What hasn't changed

Fleets already in flight when the fix went in kept their arrival time. Hydrogen consumption and the flight time of interplanetary missiles are unchanged. AI-controlled players use the same formula as you do.

## For OGame veterans

If you've played OGame, your timing instincts hold up again in Dynasty Nova: same orders of magnitude, same calculations, on an interface designed for the browser and mobile.

### Getting your reflexes back

Planning a raid to land in the middle of the night, syncing two fleets on the same target: it's all a matter of calculation again. Send your fleet on [play.dynastynova.com](https://play.dynastynova.com/?utm_source=blog&utm_medium=article&utm_campaign=formule-vol-ogame).
