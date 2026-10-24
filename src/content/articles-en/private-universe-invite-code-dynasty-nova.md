---
translationOf: "dynasty-nova-rejoindre-un-univers-prive-par-code-dinvitation"
title: "Play a space strategy game with friends in a private universe"
description: "Dynasty Nova opens up private universes: a badge flags them, a copyable invitation code lets players in, and transport reports finally show the right side."
faq:
  - question: "How do I join a private universe in Dynasty Nova?"
    answer: "Enter its invitation code in the dedicated field, available from any screen. The code takes you straight to the matching universe, without the universe ever needing to appear in a public list."
  - question: "Where do I find a private universe's invitation code?"
    answer: "On the universe's details page, once you're already a member: the code is displayed there and can be copied in one click. It's the only way into a private universe, since the universe doesn't appear in any list."
  - question: "What happens if the invitation code is invalid?"
    answer: "Dynasty Nova shows a dedicated screen: “Invitation not found” if the code doesn't exist, or “That code does not open this universe” if access is denied, without ever revealing the exact reason for the refusal."
  - question: "How can I tell a private universe apart in the universe list?"
    answer: "A “Private” badge shows on its card, both in the universe picker and on the universe-switching screen, to set it apart from a public universe that anyone can join."
---

## Introduction

Dynasty Nova makes private universes both recognizable and reachable: a badge now sets them apart in every list, and a copyable invitation code lets you bring in whoever you want, without any outside player stumbling on them by chance.

## A private universe, visible only to those who already know it

### The missing badge

Before this update, nothing set a private universe apart from a public one in the game's lists: not on its card, not on its details page. A “Private” badge now shows wherever a universe appears, on its card as well as on the universe-switching screen.

### The code as the only way in

A private universe doesn't appear in any list that a player who isn't yet a member can browse. The invitation code, displayed and copyable from the universe's details page once you've joined, is therefore the only way to lead someone else there: without it, the universe stays invisible.

## Join by code, from any screen

### A field that actually queries the server

The “Invitation code” field takes you straight to the matching universe instead of searching a list already loaded on your device, which could never have worked anyway: by definition, a private universe isn't in that list. The code you type is cleaned up and converted to uppercase before the request, to forgive sloppy typing.

### Three refusals, three distinct messages

A code that doesn't exist brings up the “Invitation not found” screen. A code that doesn't match the universe you're trying to reach gets “That code does not open this universe”, without ever saying why, so that nothing is revealed about a universe you're not allowed to see. A third, rarer case gets its own message when the request itself is malformed.

## A transport report that finally switches sides

### The same shipment, two different readings

Until now, a received transport report showed the same labels as a sent one, with resources counted as positive in both cases. Now the label, the outcome and the sign of the resources flip depending on who's reading the report: “Resources delivered” for the sender, “Resources received” for the recipient, a minus sign when the cargo leaves your hands, a plus sign when it arrives in them.

### An origin that wasn't yours

On a received transport, the departure base doesn't belong to the person reading the report but to the sender. Yet it was displayed as if it were theirs, to the point of revealing the name of a base they had never scouted. It now appears on the card reserved for the other party, like any base identified through espionage.

## Conclusion

With a badge that identifies a private universe at a glance and a code that opens its door, Dynasty Nova finally gives closed communities the same at-a-glance clarity as public universes. All that's left is choosing who to share yours with.
