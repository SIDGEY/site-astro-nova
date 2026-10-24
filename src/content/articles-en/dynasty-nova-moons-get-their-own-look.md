---
translationOf: "dynasty-nova-les-lunes-ont-enfin-leur-propre-visage"
title: "Dynasty Nova: moons finally get their own look"
description: "Dynasty Nova gives moons their own texture set: no more carbon copy of their planet, but a gray, cratered surface with no sky and no atmospheric halo."
faq:
  - question: "Why did a moon look like its planet in Dynasty Nova?"
    answer: "Because the game's data contract copied the planet's type and biome onto its moon. The 3D scene derived its textures from that pair, so a moon displayed as a second copy of its planet: same name, same coordinates, same face."
  - question: "Do moons have an atmosphere in Dynasty Nova?"
    answer: "No. A moon is now flagged as an airless body: the additive atmosphere shell that dresses a planet disappears, and the bright fringe at the limb becomes a simple grazing glow rather than a halo."
  - question: "Do all moons look the same in Dynasty Nova?"
    answer: "For now, yes: a first shared texture set covers every moon. The system is built to diversify easily later on, since the selection already goes through a simple folder index."
---

## Introduction

Dynasty Nova gives moons a face of their own. Until now, a moon displayed the same texture as its planet, atmospheric halo included. It now gets its own set of maps, made for an airless body.

## The problem of a moon that didn't really exist

### A texture copied from the planet

The game's data contract gave a moon neither a type nor a biome of its own: both came from the position its planet occupied. So the 3D scene derived its texture set from that inherited pair, and a moon displayed as a second copy of its planet: same name, same coordinates, same face.

### A halo that made no sense

That copied face included a planet's additive atmosphere shell, a layer designed for a body that breathes. A moon showed it anyway, even though it never had any air to show.

## A texture set designed for an airless body

### A gray, cratered surface

Moons now get their own texture set, in the same format as the planets': equirectangular albedo, relief and reflection maps. The selection explicitly recognizes a moon-type body, which never again takes the type/biome pair inherited from its planet.

### A fringe of light rather than a halo

An airless body gets a dedicated flag that hides the atmosphere shell and tones the bright fringe at the limb down to a simple grazing glow. The intensity of that fringe, once hard-coded in the renderer, can now be tuned independently for each body.

### A side-by-side check

With no logged-in game session available to compare under real conditions, the difference was checked on a dedicated test page, since removed, that showed the actual 3D planet scene: the jungle planet with its green halo on one side, the gray, cratered moon with no halo on the other.

### A loading message that no longer lies

A moon no longer announces that it's stabilizing a desert atmosphere while it loads. The message shown now matches what the body really is: a mineral satellite, not a miniature planet.

## What this change sets up

### A system ready to diversify

The current texture set is still the same for every moon, but the selection already goes through a simple folder index. Adding a variant will be enough to vary their appearance, without touching the rest of the system.

### A moon base preloaded like the others

Texture preloading for a moon base now follows the same logic as for a planet, deduplicated on the albedo map so that the available slots aren't wasted on a single moon visited twice.

## Conclusion

A Dynasty Nova moon no longer just borrows its planet's face: it now has its own, free of the sky and halo that never belonged to it. What remains to be seen is which variants will build on this first lunar face.
