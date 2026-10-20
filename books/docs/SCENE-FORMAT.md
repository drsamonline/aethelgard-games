# The scene format

A chapter is a plain text file. You can write one in a notebook. Nothing here
needs a compiler or a build step.

## The basics

One instruction per line. Blank lines are ignored. `#` starts a comment.

```
@bg mire
@mood uneasy

narrate The fire had been out for an hour, and Corin was still pretending it hadn't.
narrate He had built it himself, badly.

marek warm "You're doing it again."
corin neutral "Doing what."
```

- `narrate <text>` — narration, no portrait
- `<character> <expression> <text>` — spoken line, with a portrait
- `@bg <name>` — set the background (a region from the art pack)
- `@mood <name>` — set the music mood (`calm`, `uneasy`, `combat`, `boss`, `grief`)

The text after the instruction is taken literally, so punctuation and quotes are
yours to use or leave out.

## Choices

```
choice
* "Tell him he's right"            => truth+1
* "Say nothing"                    => conviction+1
* [Finesse 2] "Ask about Dane"     => lore:dane
end
```

- `*` starts an option. The text is what the player reads.
- `[Finesse 2]` at the front is a **requirement**. If the player does not meet it,
  the option is shown greyed out with the reason — it is never hidden. This is the
  Magium rule: you should always be able to see what you missed.
- `=>` introduces the effects, separated by commas.

### Effects

| effect | meaning |
|---|---|
| `mercy+1` `truth-2` `bonds+1` `conviction+2` | move an axis |
| `flag:stepped_over_rope` | set a flag (the story remembers) |
| `lore:dane_whistle` | add a Diary entry under Lore |
| `ach:the_one_who_got_up` | unlock an achievement |
| `goto label_name` | jump to `@label label_name` |
| `end` | end the scene |

## Labels and branching

```
@label after_the_choice

... the canonical path continues here ...

@label stayed_down

... the other path ...

@goto after_the_choice
```

Labels are how a fork rejoins the spine. Most branches are short — three or four
lines — and then `@goto` back.

## Conditions

```
@if flag:stepped_over_rope
  narrate He remembered the rope, and the rain, and the boy holding his mother's coat.
@endif

@if mercy>=6
  narrate Somewhere in the last three years he had stopped being able to do the arithmetic.
@endif
```

Conditions read: `flag:<name>`, `mercy>=6`, `truth<3`, `bonds>mercy`, `chapter>=4`.

## Meta instructions

| instruction | meaning |
|---|---|
| `@card <character>` | show the intro card — first time only, tracked automatically |
| `@diary people <text>` | add a Diary entry |
| `@ach <id>` | unlock an achievement |
| `@title <text>` | set the chapter title |
| `@scene <id>` | the scene's id (used for saves and jump-back) |
| `@requires <flag>` | skip the whole scene if the flag is absent |
| `@ending <id>` | mark this as an ending scene |

## Scene files

```
scenes/
  book-1/
    01-the-last-watch.scene
    02-the-man-in-the-mire.scene
  book-2/
  book-3/
```

The engine reads them in filename order. `book.json` in each folder lists the
chapters and their titles, so the contents screen has something to show.

## The four axes

Every choice moves one or more. They are hidden during play and revealed in the
epilogue. The ending is a *shape*, not a score:

| axis | | |
|---|---|---|
| **Mercy** | spare, forgive, listen | kill, punish, close off |
| **Truth** | tell, admit, ask | conceal, deflect, pretend |
| **Bonds** | lean on others, trust | stand alone, push away |
| **Conviction** | believe in something | doubt, hedge, give up |

## Mods

A mod is a folder in `mods/` with a `mod.js` that can add scenes, characters,
backgrounds or whole books. It is loaded at boot, and a mod that declares a
`requiresMods` is not loaded without them.

## Why plain text

Because the writing is the expensive part, and the writing should not be locked
inside a format that only one program can read. Every chapter in this game is a
text file you can open, edit, diff, translate, or hand to somebody else.
