---
translationOf: "dynasty-nova-le-bouton-accelerer-fonctionne-enfin"
title: "Dynasty Nova: the Speed up button finally works for real"
description: "The button meant to finish a construction for Stellar Points did nothing until recently. Here's how speeding up a queue works now, and what it really costs."
faq:
  - question: "How do you speed up a building, research or ship in progress?"
    answer: "By spending Stellar Points on the running queue with the Speed up button, which only appears if the order can actually be sped up."
  - question: "How is the speed-up cost calculated?"
    answer: "The first 30 seconds remaining are free. Beyond that, each 30-second block costs half a Stellar Point, rounded up."
  - question: "Can you speed up an order that hasn't started yet in the queue?"
    answer: "No. Only the order currently in production can be sped up; the ones still waiting their turn have no defined cost and start normally once their turn comes."
  - question: "Can you speed up a ship's repair after a battle?"
    answer: "No, the repairs started by the orbital shipyard after a defeat are not among the queues that can be sped up."
---

## Introduction

A "Speed up" button already existed in Dynasty Nova's interface, but until recently, clicking it changed nothing. Here's what has changed, and above all, what it really costs.

## The button that did nothing

### A cost on display, never actually charged

The price shown on the button was calculated on the client side, without ever being sent to the server. The construction timer simply ignored that cost, and the server-side function meant to handle the speed-up was empty.

### A quiet but frustrating symptom

The concrete result: clicking "Speed up" charged nothing and finished nothing. The construction went on as normal, as if the button had never existed.

## How speeding up works now

### The server, sole judge of the price

The cost is now calculated and checked by the server alone, based on the time actually remaining on the order. The first 30 seconds of remaining time are free; beyond that, each additional 30-second block costs half a Stellar Point, rounded up. A client can no longer put forward a made-up or outdated price.

### One route for four queues

Buildings, research, ships and defenses now share the same speed-up mechanism. The button only appears if the running order can actually be sped up; otherwise, it simply stays hidden rather than showing an action that would lead nowhere.

## What still can't be sped up

An order still waiting its turn in the queue has no active timer, and therefore no defined cost: it can't be rushed ahead of time. Repairs started automatically by the orbital shipyard after a defeat in combat follow the same rule and can't be sped up either.

## Why it matters for your strategy

This fix turns a cosmetic button into a real strategic lever. Spending Stellar Points to finish a construction early becomes a genuine choice, with a transparent and consistent cost, rather than a promise that never came true.

**Starting research** or **building now**, then speeding up at the right moment, now makes a real difference to your progress.
