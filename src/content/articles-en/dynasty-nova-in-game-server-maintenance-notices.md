---
translationOf: "dynasty-nova-annonce-ses-maintenances-serveur-en-jeu"
title: "Dynasty Nova now announces server maintenance in-game"
description: "A banner now announces and counts down each server maintenance window. During the truce, only hostile fleet departures pause; the rest of the game runs on."
faq:
  - question: "What happens during server maintenance in Dynasty Nova?"
    answer: "Four kinds of departure are refused while the maintenance lasts: espionage, attacks and moon destruction, missile strikes, and alliance war declarations by vote. Construction, research, transport, deployment, recycling and colonization carry on as usual."
  - question: "How do I know when server maintenance starts or ends?"
    answer: "An amber banner appears at the top of the screen and counts down to the deadline to the second, based on the server's clock rather than the player's device. It switches its message on its own between an announced window and one in progress."
  - question: "Is a fleet already in flight canceled during maintenance?"
    answer: "No: only the departure of a new mission is refused. A fleet already in flight lands normally, and a strike already launched hits its target as planned."
  - question: "Does server maintenance affect bots?"
    answer: "Yes: bots go through the same commands as players, so they observe the truce automatically, with no special handling in their artificial intelligence."
---

## Introduction

Dynasty Nova now displays its server maintenance windows directly in the game: a banner announces the deadline and counts it down to the second, and for the length of the window a truce suspends any fleet departure aimed at another player. Here's what that changes, and what keeps running without interruption.

## A banner that changes its message on its own

### Two states, one source of truth

The banner has two distinct messages. An announced window warns you without blocking anything and counts down to its start; a window in progress announces the suspension and counts down to its end. The server never signals the switch from one to the other: the client keeps recalculating which of the two messages to show, to the second, with no extra round trip.

### A countdown based on the server's clock

The countdown is measured against the server's clock, corrected for any difference with the clock on the player's device. Without that correction, a browser running a few minutes fast would lift the banner before the server had actually ended the maintenance, and would offer buttons the API would still refuse.

## A truce that blocks four departures, nothing more

### Espionage, attacks, missiles and war declarations on hold

During maintenance, four departures are refused: espionage, attacks and moon destruction, missile strikes, and an alliance's war declaration at the moment of the vote. Construction, research, transport, deployment, recycling and colonization carry on as usual: the truce stops you from reaching another player, but it doesn't freeze the game.

### What has already left never turns back

The refusal only applies to the departure of a new mission. A fleet already in flight lands on schedule, a strike already launched hits its target, and a war question an alliance has already adopted still goes on to declare that war. Bots, which go through the same commands as players, observe this truce without their artificial intelligence needing any special handling.

## A banner designed to stay readable everywhere

### In the page flow, never on top of it

The banner pushes the game content down rather than sitting on top of it: maintenance can last several hours, and a floating banner would have hidden the resource bar the whole time. The color chosen is amber, reserved for states that lift on their own, rather than the red used for irreversible situations.

### The same banner on mobile, desktop and the universe selection screen

The banner sits at the top of the mobile version as well as the desktop shell, and even the universe selection screen, the very place where a player picks a server before logging in to it. On phones, the details fold away to keep only the title and the countdown on two lines when there isn't room to show everything.

## Conclusion

Server maintenance becomes information rather than a silent outage: a banner that warns, counts down, then closes on its own, while a targeted truce protects every player without putting the rest of the game on pause.
