---
translationOf: "dynasty-nova-la-vue-orbitale-arrive-en-jeu"
title: "Dynasty Nova: the orbital view of star systems arrives in-game"
description: "Dynasty Nova finally shows a system as a system: central star, orbiting bodies, spinning textures. A hover card gives each body's owner, status and resources."
faq:
  - question: "What is the orbital view in Dynasty Nova?"
    answer: "A new way to display a star system: a star in the center, its bodies orbiting at the distance of their actual position, each one spinning on its axis. It replaces the usual list on screens 768px wide and up, in universes where it's enabled."
  - question: "How do you turn on the orbital view in Dynasty Nova?"
    answer: "An Orbits / List toggle appears right in the galaxy view in universes where the feature is open, and your choice is remembered from one visit to the next. Below 768px wide, only the list is available."
  - question: "What does the hover card show in the orbital view?"
    answer: "The body's position, its name, its owner tinted according to whether they're an ally or an enemy, its status (you, abandoned, uninhabited), and, for a position you already know, its points, size, temperature range and debris."
  - question: "Is the orbital view available in every Dynasty Nova universe?"
    answer: "No. It sits behind a feature flag specific to each universe, off by default: until it's switched on, only the list is shown, and the toggle itself doesn't appear."
---

## Introduction

Dynasty Nova no longer just describes a star system as a list: it can now show it. A star in the center, bodies circling on their orbits at the right distance, and a detailed card that appears when you hover over each one.

## A system you see rather than read

### The star in the center, the bodies in their true place

The scene places a star in the center and lays out the orbiting bodies at the distance of their actual position in the system: the first position orbits close to the star, the last one far from it. The number of orbits drawn adapts to how many positions the system has, without ever crowding two neighboring orbits on top of each other.

### Three layers that turn differently

Each body shows three elements that don't move together: its texture slowly scrolls around itself, the line between its day side and night side stays turned toward the star instead of rotating with the body, and its corner icons never turn, fixed in place on the circle.

### A layout unique to each system

The starting angle of each orbit is computed from the system's coordinates, not from a random roll: two neighboring systems never open on the same layout, and a given system always shows the same one from one visit to the next.

## A detailed card on hover

### What it reveals for a known body

Hovering over a body opens a card showing its position, its name, the crown that marks an important body, and its owner, tinted according to whether they're an ally, a pact partner or an enemy. For a position you've already probed, it adds the owner's points, the body's size, its temperature range and its metal and crystal debris.

### The same discretion as the list

A position that has never been probed reveals neither its owner nor its biome in this card, exactly as in the classic list: the orbital view leaks no information that list mode didn't already let through.

## A view that respects the player who clicks

### Slow revolutions rather than distracting motion

Bodies move slowly along their orbits, with the orbit closest to the star moving fastest. The whole system freezes as soon as a body is hovered over or receives keyboard focus, and resumes its motion without a jump the moment your attention moves elsewhere.

### Still reserved for universes that open it

The orbital view stays off by default in every universe, hidden behind a feature setting the team turns on universe by universe. Until it's on, the toggle itself appears nowhere: offering a display choice with only one option would make no sense.

### A switch managed from the admin side

Each universe has its own feature panel in the back office, with a checkbox to open each feature to everyone or reserve it for a list of testers. Turning the orbital view off in a universe doesn't erase that list: it takes effect again as soon as the feature reopens.

## Conclusion

The orbital view changes how you read a star system without taking anything away from what the list already offered. It remains to be seen which universes Dynasty Nova will open it on first.
