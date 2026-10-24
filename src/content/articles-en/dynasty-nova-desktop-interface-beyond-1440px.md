---
translationOf: "dynasty-nova-une-interface-desktop-au-dela-de-1440px"
title: "Dynasty Nova: a widescreen desktop interface beyond 1440px"
description: "Above 1440px, Dynasty Nova gets a true desktop interface: four fixed columns, a persistent planet panel, and battle reports split by side on their own page."
faq:
  - question: "Does Dynasty Nova have a different interface on large screens?"
    answer: "Yes. Above 1440px wide, Dynasty Nova shows a desktop interface with four fixed columns: the navigation rail, a contextual submenu, the page content and a permanent planet panel. Below that width, the usual mobile interface stays exactly the same."
  - question: "Why doesn't the planet panel reload anymore when I resize the window?"
    answer: "On the desktop interface, the planet's 3D scene is mounted only once for the whole session. Before this change, every resize of the panel completely rebuilt the graphics context, the textures and the starfield, which made every window adjustment visible and costly."
  - question: "How do you read a battle report on the desktop interface?"
    answer: "A battle report opens on its own page rather than in an overlay window, and it reads one side at a time: each side lists its units in a table, with its total losses summed up just below."
  - question: "Is Dynasty Nova's mobile interface going away?"
    answer: "No. The two interfaces coexist depending on screen width: below 1440px, the mobile-first interface is still the only one used, with no change in behavior."
---

## Introduction

Dynasty Nova is adding a true desktop interface above 1440px wide, designed to make the most of a large screen rather than simply stretching the mobile interface. Four fixed columns, a planet panel that no longer reloads its 3D scene on every resize, and reports redesigned to be read at a glance: here's what changes for players on a computer.

## Four columns, one screen

### A shell designed never to scroll as a single block

Above 1440px, the screen splits into four columns locked to the height of the window: the navigation rail, a contextual submenu, the content of the current page, and the planet panel. Only the content column scrolls, so you never lose sight of your navigation or your planet while going through a long list of buildings or reports.

### A submenu that opens on hover, without navigating

Hovering over a rail icon opens that section's submenu without leaving the current page, after a short delay that keeps it from opening by accident when the mouse merely passes over it. Page filters, such as the report type or the quest category, now live in this submenu and in the page URL rather than in local state, which makes them shareable and consistent with the browser's back button.

## A planet panel that finally stays put

### The 3D scene no longer rebuilds at every pixel

Before this interface, the planet panel completely rebuilt its 3D scene, textures and starfield included, with every pixel the window was resized. On the desktop interface, the scene is mounted only once for the whole session: resizing or moving between pages never makes it recompute from scratch again.

### A resource bar that lines up with the rail

The planet panel's resource bar moves away from its top edge to line up with the logo on the navigation rail, which visually ties the interface's two fixed columns together instead of treating them as two separate blocks.

## Reports redesigned for wide screens

### A dedicated page instead of an overlay

A mission report now opens on its own page rather than in a window layered over the rest of the screen, and a battle report reads one side at a time: who was there, where, with what equipment, each side showing its units in a table and its total losses just below.

### Actions grouped in a single block

A report's actions (simulate again, share with the alliance, or delete) are gathered in a single block of icons next to the page title instead of being scattered across separate buttons. The report's conclusion, such as a defeat or a scouted position, becomes the heading of the report body instead of a lone line under the page title, and the unit list no longer hides behind a "Show all" button.

## Conclusion

This desktop interface does more than widen the mobile layout: it rethinks navigation, report reading and the 3D scene for a large screen, while leaving the mobile-first experience completely untouched below 1440px. Two interfaces, with the same strategy behind both.
