---
name: tailwind-zinc-styling
description: Use when writing or editing Tailwind classes in Devnotes. Enforces the zinc/black/white visual language, warns about non-standard class values, and covers the quiet-UI conventions.
---

# Tailwind zinc styling for Devnotes

Devnotes uses Tailwind CSS 3.4 with the stock config (content globs only — no custom theme). The visual language is **quiet**: zinc / black / white / gray only, no second brand color, no dashboard clutter.

## Palette

Use Tailwind's default `zinc`, `black`, `white`, and `gray` scales. Common patterns already in the codebase:

- Page background: `bg-zinc-50`
- Text hierarchy: `text-zinc-500`, `text-zinc-700`, `text-black`
- Borders: `border-zinc-100`, `border-zinc-200`
- Primary actions: `bg-black text-white`
- Secondary actions: `border border-gray-200 text-gray-700 hover:bg-gray-50`
- Placeholder text: `placeholder-zinc-300`, `placeholder-gray-300`

## WARNING — non-standard classes

The stock Tailwind config does **NOT** generate these utilities. They exist in old code but render nothing. Replace them with valid values when you touch them:

| Bad (no utility) | Good |
|---|---|
| `border-zinc-150` | `border-zinc-100` |
| `bg-zinc-150` | `bg-zinc-100` |
| `border-zinc-250` | `border-zinc-200` |
| `text-zinc-955` | `text-zinc-950` |
| `h-8.5` | `h-[34px]` |
| `w-6.5` | `w-[26px]` |

If in doubt whether a class ships, prefer an arbitrary value (`h-[34px]`) or a standard scale step.

## Rules

1. **Never introduce a second brand color.** No blues, greens, purple accents for the product.
2. **Server components can use Tailwind freely; client components too** — just keep classes literal strings so Tailwind's scanner captures them (no dynamic class-name interpolation that breaks the content globs).
3. Match the rhythm of neighboring components: quiet cards, generous spacing, no chrome.
4. Icons come from `lucide-react` and inherit `currentColor`.
