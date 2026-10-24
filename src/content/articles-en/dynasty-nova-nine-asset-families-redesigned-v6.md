---
translationOf: "dynasty-nova-neuf-familles-dassets-repensees-pour-la-v6"
title: "Dynasty Nova: nine asset families redesigned for v6"
description: "Buildings, installations, research, defense, ships, avatars, heroes, help illustrations and shop packs all move to one v6 visual recipe. What changes and why."
faq:
  - question: "Which parts of the game change with the v6 visual overhaul?"
    answer: "Nine asset families move to the v6 recipe: buildings, installations, research, defense, ships, avatars, heroes, help illustrations, shop packs and resource icons. Planet textures aren't affected: they're handled separately."
  - question: "Does the galaxy page banner behave differently now?"
    answer: "Yes. It used to show the current universe's illustration, with a fallback illustration that in practice never appeared. It now shows a single galaxy illustration, the same whichever universe you play in."
  - question: "Why does the galaxy illustration look different from the other banners?"
    answer: "Running it through the color grade darkened and cooled the render too much, wiping out the warm core and cream-colored dust trails of the original illustration. So it keeps its ungraded render, and the other fifteen banners keep theirs."
  - question: "Is the work on planets part of this update?"
    answer: "No. Planet textures (spheres, albedo, normal and specular maps, horizon and full-view renders) are handled in a separate pass."
---

## One visual recipe for nine asset families

Dynasty Nova is regenerating nine asset families on a shared v6 recipe, built from two reference images per family and then run through the same color grade. The goal: for the shop, the research tree and the defense screen to read as one coherent universe, rather than as layers added over time.

### The families involved

Nine families get the v6 pass: buildings, installations, research, defense, ships, avatars, page hero images, help illustrations and shop packs. The resource bar icons follow the same recipe to stay visually in line with the rest.

### What's left for a separate pass

Planet textures (sphere render, albedo, normal and specular maps, horizon views and full views) are not part of this update. They follow their own workstream, with its own technical constraints, so as not to hold up the release of everything else.

## A behavior change on the galaxy page

The galaxy page's hero banner doesn't just get a new visual: the logic behind what it displays changes too.

### Before: a fallback illustration nobody ever saw

The banner followed the player's current universe, with the generic galaxy illustration planned as a fallback while the universe loaded. In practice, loading is too fast for that fallback ever to show: the fallback illustration was visual dead code, invisible to every player.

### Now: a single illustration, in every universe

The galaxy page now shows a single illustration, the same whichever universe you've joined. The universe selection cards keep their own per-universe illustration logic: nothing is lost, only the banner's rule changes.

## A deliberate detail rather than a silent fix

Of the sixteen hero banners run back through the v6 color grade, only one deliberately keeps its original render.

### Why the galaxy illustration is the exception

The grade darkened and cooled the galaxy illustration to the point of losing its warm core and its cream-colored dust trails, the two elements that gave the image its identity. Rather than ship a degraded render for the sake of a uniform rule, the illustration keeps its original grade.

### A documented exception, not an oversight

Left unexplained, this kind of choice looks like a production error that an attentive player might wrongly report. By documenting it explicitly, the team keeps a deliberate exception from being picked up as a bug to fix.

## Exploring the galaxy with its new look

This visual pass changes no game mechanics. It makes what already existed easier to read: buildings, fleet, research and shop finally speak the same visual language. Joining a universe now means growing an empire where every screen was designed together rather than stacked up update after update.
