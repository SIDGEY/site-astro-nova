---
translationOf: "dynasty-nova-des-lunes-en-orbite-de-vos-planetes"
title: "Moons in a space strategy game: formation, buildings and defense"
description: "Dynasty Nova adds moons: a second body born from the debris of a battle in orbit, with its own buildings and garrison, and a dedicated mission to destroy it."
faq:
  - question: "How do you get a moon in Dynasty Nova?"
    answer: "A moon only forms from the debris left by a battle in orbit, with a probability set by each universe: by default the chance tops out at 20%, reached from 2,000,000 units of debris. These settings faithfully reproduce OGame's."
  - question: "How do you destroy an enemy moon?"
    answer: "A dedicated mission, open only to the Colossus stellaire (the planet-sized battle station, OGame's Deathstar), first takes on the garrison defending the moon, then the moon itself, based on two separate probabilities taken from OGame. Sending more Colossi never lowers the risk of losing your own fleet."
  - question: "Does a moon have the same buildings as a planet?"
    answer: "No. A moon can only build a lunar base, a sensor phalanx and a jump gate. Colonization and recycling remain planet-only, while the destruction mission, conversely, only exists against a moon."
  - question: "Can bots use moons?"
    answer: "Not yet. The game's AI plans its economy on planets only and doesn't make use of moons yet."
---

## Introduction

Dynasty Nova is a free, OGame-inspired space strategy game that runs in your browser and plays on mobile: you build an empire of planets, fleets and research. It now adds **moons** to the universe, a second celestial body orbiting your planets that comes from combat rather than from a construction choice. How they form, the buildings that belong to them, how they get destroyed: here's what actually changes for your fleet, your strategy and your battle reports.

## How a moon forms

### A by-product of combat, set by the universe

A moon forms from the debris left by a battle in orbit, and in no other way: no building lets you get one directly. Each universe sets its own formation odds. By default, the chance caps at 20%, and reaching that cap takes 2,000,000 units of debris, values that reproduce OGame's behavior exactly. So no universe already running behaves any differently after this update.

### A size that is calculated, not rolled

A moon's diameter follows OGame's formula to the digit: the eleven sizes measured at the cap, from 8,366 to 8,944 kilometers, are faithfully reproduced, with a floor set at 3,605 kilometers. The size depends on how close the debris generated comes to the universe's formation cap, so adjusting the formation odds never silently changes the sizes you get.

## A base in its own right, with its own buildings

### The same status as a planet, a shared name

A moon shares the name and coordinates of the planet it orbits: only its type sets it apart. It stores its own resources, keeps its own garrison and raises its own buildings, exactly like a planet. A fleet now targets a specific celestial body, planet or moon, rather than just a position on the map, and when it returns, it lands on the body it left from.

### Lunar base, phalanx and jump gate

Three buildings exist only on a moon. Each level of the lunar base opens three fields and takes up one, within the limit set by the moon's diameter. The sensor phalanx sweeps a planet in the same galaxy and reveals the fleets on their way: composition, mission and timings. Each sweep costs hydrogen, taken from the moon. The jump gate moves your fleet instantly between two of your own moons, subject to a recharge time that depends on its level.

## Attacking or defending a moon

### Breaking a moon is a job for the Colossus

Destroying an opponent's moon takes a dedicated mission reserved for the Colossus stellaire (the planet-sized battle station, OGame's Deathstar): no other ship type can take part. The moon's garrison must first be defeated in battle (the [battle simulator](/en/blog/battle-simulator-test-your-fleet-dynasty-nova/) lets you test the fight before sending the fleet), and only then do two separate probabilities, both taken from OGame, decide the moon's fate. A reference case, 100 Colossi against an 8,944-kilometer moon, reproduces the published figures exactly: 54.27% and 47.29%.

### The risk, shown plainly

Sending more Colossi never lowers the risk of losing your own fleet: both probabilities are shown together, without suggesting that numbers alone can make the operation safe. The worst of the four possible outcomes is still fleet lost, moon intact. In battle reports, a dedicated moon formation block always appears, even when the attempt fails: a miss at 19% still tells the story of an attempt, whereas a battle at 0% has none to tell.

## Conclusion

Moons open a second strategic front at every planet: a body to defend, to exploit or to break. The formation and destruction odds come straight from OGame, with nothing reinvented, so the experience stays familiar to anyone who already knows it. Still to come: bots able to make use of moons in turn. For now, the AI plans its economy on planets only.

To get to know the game before your first moon, [our overview](/en/blog/free-space-strategy-browser-game-dynasty-nova/) sums up how it works, and the [guide to your first hours](/en/blog/space-strategy-game-beginners-guide-first-hours/) lays out the steps in order. A moon is only born from a battle in orbit: sending out your fleet starts on [play.dynastynova.com](https://play.dynastynova.com/?utm_source=blog&utm_medium=article&utm_campaign=lunes).
