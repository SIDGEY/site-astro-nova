---
title: "Dynasty Nova : le chat d'univers arrive en jeu"
date: 2026-08-27
description: "Dynasty Nova lance un chat en direct avec trois canaux (général, alliance, messages privés), des mentions ciblées et une modération qui explique ses refus au lieu de faire disparaître les messages dans le vide."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Chat", "Communauté", "Multijoueur", "Annonce"]
draft: false
image: "/uploads/blog/covers/dynasty-nova-le-chat-duniverse-arrive-en-jeu.webp"
faq:
  - question: "Comment fonctionne le chat de Dynasty Nova ?"
    answer: "Il réunit trois canaux sur un même écran à onglets : un chat général par univers, un chat d'alliance (verrouillé pour l'instant) et des conversations privées entre joueurs, tous mis à jour en direct."
  - question: "Comment mentionner un autre joueur dans le chat ?"
    answer: "En tapant @ suivi de son pseudo, une autocomplétion propose les correspondances. Seules les mentions réellement reconnues par le serveur sont mises en évidence et déclenchent une notification."
  - question: "Que se passe-t-il si mon message est refusé par la modération ?"
    answer: "Il s'affiche au-dessus de la zone de saisie avec la raison du refus (longueur excessive, lien externe, terme interdit), sans effacer le reste de la conversation."
  - question: "Peut-on bloquer un autre joueur dans le chat ?"
    answer: "Oui, pour les messages privés uniquement. Le blocage s'applique dans les deux sens et n'affecte pas le chat général."
coverPrompt: "a soft field of electric blue light"
---

## Introduction

Dynasty Nova intègre désormais un chat en direct, accessible depuis le menu latéral via l'écran des messages. Trois canaux cohabitent sur un même écran à onglets : le chat général d'univers, le chat d'alliance et les conversations privées entre joueurs.

## Un écran à onglets pour trois formes d'échange

### Chat général, alliance verrouillée, messages privés

Le chat général regroupe tous les joueurs d'un même univers. Le canal d'alliance existe déjà dans l'interface mais reste verrouillé côté serveur, faute de structure d'alliance à laquelle le rattacher pour l'instant. Les conversations privées, elles, regroupent l'historique par interlocuteur, avec un badge de messages non lus dans le menu latéral.

### Live, pas rafraîchi toutes les x secondes

Chaque message arrive par un flux temps réel : aucun écran du chat ne se recharge à intervalle régulier. Un message général ne recharge que les canaux concernés, une conversation privée ne recharge que les fils concernés, ce qui garde l'interface réactive même sous forte activité.

## Interpeller un joueur avec @

### Une autocomplétion qui ne promet rien à tort

Taper @ ouvre une autocomplétion de pseudos, navigable au clavier. Seules les mentions effectivement reconnues par le serveur sont mises en évidence dans le message affiché : une mention mal orthographiée reste du texte simple plutôt que de laisser croire à une notification qui n'arrivera jamais. La mention qui désigne le joueur lui-même ressort plus fortement que les autres, car c'est la seule qui déclenche réellement une alerte.

## Une modération qui explique son refus

### Un message refusé s'affiche, il ne disparaît pas dans le vide

Un message rejeté par la modération, longueur excessive, lien externe, terme interdit, s'affiche au-dessus de la zone de saisie avec la raison du refus, sans vider le reste de la conversation. Les liens externes sont refusés systématiquement, plutôt que vérifiés au cas par cas contre une liste noire.

### Bloquer un joueur, dans les deux sens

Chaque joueur peut bloquer un autre joueur pour les messages privés uniquement, le chat général restant inaffecté. Le blocage s'applique dans les deux sens : qu'on ait bloqué quelqu'un ou qu'on ait été bloqué par lui, l'envoi d'un message privé échoue.

## Conclusion

Le chat d'univers ouvre un canal social que Dynasty Nova n'avait pas encore : parler à d'autres commandants en direct, sans quitter la galaxie ni attendre un rafraîchissement de page. L'alliance rejoindra la conversation dès que sa structure existera en jeu.
