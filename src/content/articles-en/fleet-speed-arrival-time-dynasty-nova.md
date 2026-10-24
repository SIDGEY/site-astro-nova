---
translationOf: "dynasty-nova-regler-la-vitesse-de-sa-flotte-au-pourcent-pres"
title: "Fleet speed: tune your arrival time 1% at a time in Dynasty Nova"
description: "Fleet speed now goes from 1% to 100% in 1% steps instead of 10% steps. Drag, type or use the keyboard: three ways to time a fleet's arrival exactly."
faq:
  - question: "What speed range can a fleet mission use in Dynasty Nova?"
    answer: "From 1% to 100%, adjustable 1% at a time, instead of the 10% steps used before."
  - question: "How do you set a fleet's speed precisely?"
    answer: "Drag the slider for a rough setting, type a percentage straight into the dedicated field, or use the keyboard, with the +/- keys and the arrow keys, to adjust one step at a time."
  - question: "Does changing the speed by 1% run a new simulation every time?"
    answer: "No. All the speed steps come back from the server in a single call, and the slider simply picks the right value on the client side, with no extra request."
  - question: "What happens if I clear the speed field by mistake?"
    answer: "The current speed is restored automatically instead of dropping to the minimum, so the mission's fuel load and arrival time don't change without you meaning them to."
---

## Introduction

Dynasty Nova now lets you set a mission's speed to the nearest percent, from 1% to 100%, instead of in 10% steps.

## A slider that needed to be finer

### The trouble with 10% steps

Before this update, a fleet could only leave at one of ten speeds, in 10% increments. Yet the bottom of the scale is exactly where a trip's duration varies the most, since it is inversely proportional to the chosen speed.

### A hundred steps, a single network call

The trip simulator already returns every speed step in a single request; the slider just picks the right value on the client side. Going from 10 to 100 steps therefore costs no extra network round trip, and adds no delay when you drag the slider.

## Three ways to choose your speed

### Drag for a rough setting

The slider keeps its familiar visual scale, graduated from 0 to 120%, with a marker at 100%. Dragging is still the fastest way to aim for a broad range.

### Type the exact value you want

The displayed percentage is now an editable field: typing 37% or 3% directly gets you an exact value without having to aim pixel by pixel on the slider, since one percent is only about 3 pixels on the bar.

### Adjust with the keyboard, one step at a time

The + and - keys, as well as the arrow keys, allow fine adjustments: one step per press, ten steps with Page Up/Page Down, or a jump straight to either end with Home/End.

## Why this level of precision matters

### Getting several fleets to land in the same second

Coordinating a grouped attack means getting several fleets, launched from different planets, to reach a common target at the same moment. A 10% step only let you move an arrival time in big jumps; 1% steps give you the leeway to line up that kind of convergence with no margin for error.

### Weighing speed against fuel with all the facts

The simulation shown before sending lets you compare travel time and fuel consumption, step by step. With a hundred values available instead of ten, the trade-off between arriving fast and arriving cheaply can be tuned far more finely than before.

## What changed behind the scenes

### Colors that follow ranges, not exact matches

The slider's warning colors, orange as you approach overspeed and red beyond it, used to be tested by strict equality against the 10% steps. With 1% steps, that logic would have left every value from 91% to 99% in the wrong color: the calculation now relies on ranges rather than exact matches.

### A cleared field restores the current speed, never a minimum

Clearing the speed field and then leaving it restores the previous value instead of falling back to 1%, so a mission's fuel load and arrival time never change silently without the player asking for it.

## Conclusion

This 1% setting gives players the last degree of precision they were missing to land a fleet at exactly the time they want, without changing any of the existing travel time or fuel consumption formulas.
