# Accordion

Composite content element that groups ordered collapsible panels.

**Type:** `ACCORDION`

## Data

| Field | Type | Description |
|-------|------|-------------|
| `items` | `Record<string, AccordionItem>` | Accordion panels keyed by id |
| `embeds` | `Record<string, any>` | Embedded content elements referenced from panel bodies |

`AccordionItem` fields: `id`, `header`, `body` (map of embed ids), `position`.

## Edit

- List of expandable panels with drag-to-reorder handle
- Per-panel inline title editor with validation
- Add, delete, expand/collapse panels
- Each panel hosts embedded content elements via `TailorEmbeddedContainer`

## Display

- Renders panels sorted by position with expand/collapse animation
- Empty panels show an info alert; otherwise embedded elements are rendered

## Development

```sh
pnpm dev     # Preview :8080 | Edit :8010 | Display :8020 | Server :8030
pnpm build
pnpm lint
pnpm test
```

## Run with Docker

```sh
docker compose up
```
