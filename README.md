# Todo Card — Stage 1a

A responsive, accessible, interactive Todo Card built with vanilla HTML, CSS, and JavaScript.  
Submitted for the **Frontend Wizards Stage 1a** challenge (upgraded from Stage 0).

## Getting Started

No build step required. Open `index.html` directly in a browser, or serve it with any static file server:

```bash
# Using Node.js http-server (optional)
npx http-server .
```

## What Changed from Stage 0

Stage 0 was a static card with a checkbox and a fixed status badge. Stage 1a adds full interactivity and state management:

| Feature | Stage 0 | Stage 1a |
|---|---|---|
| Edit mode | `console.log` stub | Full form with save / cancel |
| Status | Static badge | Interactive `<select>` control |
| Priority indicator | Wrapper gradient only | + Colored strip inside the card |
| Description | Always visible | Collapsible with Show more / less |
| Time display | 1-minute interval | 30-second interval, granular labels |
| Overdue | Red time text | + Pulsing "Overdue" badge |
| Done state | Time kept ticking | Time stops; shows "Completed" |

## New Design Decisions

- **Status control placement** — the status `<select>` sits between the title row and the description. This naturally satisfies the required keyboard tab order (Checkbox → Status → Expand toggle → Edit → Delete) without needing artificial `tabindex` values.
- **Priority indicator** — a thin colored strip at the top of the white card (below the wrapper gradient) gives an immediate, accessible visual cue. Classes `priority-indicator--high/medium/low` drive the color.
- **`test-todo-status` preserved** — the Stage 0 badge `<span>` is kept in the DOM as a `sr-only` element so Stage 0 testids continue to pass. The interactive `<select>` (`test-todo-status-control`) is the visible control.
- **Expand/collapse via CSS line-clamp** — collapsed descriptions are truncated at 3 lines using `-webkit-line-clamp`. The toggle is only rendered when the description exceeds 120 characters.
- **Edit cancel restores a snapshot** — state is shallow-copied before the form opens so Cancel reverts every field exactly, including the due date.
- **Esc key** closes the edit form and returns focus to the Edit button.

## All `data-testid` Attributes

### Stage 0 (all preserved)
`test-todo-card`, `test-todo-priority`, `test-todo-complete-toggle`, `test-todo-title`, `test-todo-description`, `test-todo-tags`, `test-todo-tag-work`, `test-todo-tag-urgent`, `test-todo-tag-design`, `test-todo-status`, `test-todo-edit-button`, `test-todo-delete-button`, `test-todo-time-remaining`, `test-todo-due-date`

### Stage 1a (new)
`test-todo-edit-form`, `test-todo-edit-title-input`, `test-todo-edit-description-input`, `test-todo-edit-priority-select`, `test-todo-edit-due-date-input`, `test-todo-save-button`, `test-todo-cancel-button`, `test-todo-status-control`, `test-todo-priority-indicator`, `test-todo-expand-toggle`, `test-todo-collapsible-section`, `test-todo-overdue-indicator`

## Accessibility Notes

- All edit form fields have a `<label for="…">` association.
- The status `<select>` has both a visually hidden `<label>` and an `aria-label`.
- The expand toggle uses `aria-expanded` and `aria-controls` pointing to the collapsible section's `id`.
- Live time updates use `aria-live="polite" aria-atomic="true"`.
- The overdue indicator uses `aria-live="polite"`.
- Focus is returned to the Edit button when the edit form closes (save or cancel).
- All interactive elements have visible `:focus-visible` outlines.

## Known Limitations

- Tags are static (editing tags is out of scope for Stage 1a).
- Delete shows a native `confirm()` dialog; a custom modal would be more accessible.
- Focus trap inside the edit form is not implemented (listed as optional bonus in the spec).
- The date input uses the browser's native date picker, which varies in appearance across browsers/OS.

## Project Structure

```
todo-card/
├── index.html   # Markup & all data-testid attributes
├── style.css    # All styles (no framework)
└── script.js    # State management & event handling
```
