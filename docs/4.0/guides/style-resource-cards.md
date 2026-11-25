---
license: community
outline: [2, 3]
---

# Give each resource its own card colors

Use Avo's `data-resource-name` attributes to give a resource's cards their own palette without changing views or components. Define the colors on the resource wrapper, then let every card inside it inherit the same styling, including sidebar cards.

## Add a resource-scoped stylesheet

[Eject the no-build override stylesheet](../tailwindcss-integration.html#override-styles-and-scripts-avo-overrides-css-avo-overrides-js) if your app does not already have it:

```bash
bin/rails generate avo:eject --partial :avo_overrides_css
```

Add this example to `app/assets/stylesheets/avo-overrides.css`. It gives Projects a blue palette and Teams an emerald palette, with separate shades for dark mode:

```css
/* app/assets/stylesheets/avo-overrides.css */
[data-resource-name="Avo::Resources::Project"] {
  --card-background: var(--color-blue-50);
  --card-border: var(--color-blue-200);
}

.dark [data-resource-name="Avo::Resources::Project"] {
  --card-background: var(--color-blue-950);
  --card-border: var(--color-blue-800);
}

[data-resource-name="Avo::Resources::Team"] {
  --card-background: var(--color-emerald-100);
  --card-border: var(--color-emerald-300);
}

.dark [data-resource-name="Avo::Resources::Team"] {
  --card-background: var(--color-emerald-950);
  --card-border: var(--color-emerald-700);
}

:is([data-resource-name="Avo::Resources::Project"], [data-resource-name="Avo::Resources::Team"]) .card {
  --card-inner-border: color-mix(in oklab, var(--card-background) 80%, var(--card-border));

  background-color: var(--card-background);
  border-color: var(--card-border);

  & > .card__wrapper {
    --color-tertiary: var(--card-inner-border);
  }
}
```

Without these overrides, cards keep Avo's standard neutral styling. Avo loads `avo-overrides.css` after its bundled stylesheet; this example needs no Tailwind build and no Ruby resource changes.

<Image src="/assets/img/4_0/guides/style-resource-cards/projects.webp" dark-src="/assets/img/4_0/guides/style-resource-cards/projects-dark.webp" width="1440" height="1000" alt="The Projects index with a blue card surface and a subtly tinted inner table border." />

## Target your resource, not its layout

Replace `Avo::Resources::Project` and `Avo::Resources::Team` with your resource class names, including any namespace. Inspect a rendered resource wrapper to confirm its `data-resource-name` value.

The descendant `.card` selector covers cards in the resource's index, show, edit, and new views. It does not depend on whether a card sits in the main panel, a sidebar, or another container. If you add another resource, give its wrapper a palette and include its selector in the shared `:is(...)` rule.

Cards nested inside the selected resource also inherit the styling, including association cards. A standalone page for a different resource is unaffected unless you include it in the selectors.

<Image src="/assets/img/4_0/guides/style-resource-cards/team-sidebar.webp" dark-src="/assets/img/4_0/guides/style-resource-cards/team-sidebar-dark.webp" width="1152" height="305" alt="The Team show view with matching emerald main and sidebar cards, including their inner borders and dividers." />

## Keep palette choices separate from card styling

`--card-background`, `--card-border`, and `--card-inner-border` are custom properties defined by this example, not built-in Avo configuration options. The resource rules choose colors from Avo's existing palette variables; the shared card rule applies them.

Only the background and outer border need per-resource choices. To choose another palette, use color variables present in your app's loaded stylesheet. Not every Tailwind shade is necessarily included in the precompiled bundle; an undefined variable will not supply a usable color.

For colors that follow the user's neutral palette instead of staying blue or emerald, use Avo's semantic variables such as `--color-secondary` for the surface and `--color-tertiary` for the border. See the [appearance CSS variables reference](../appearance-api.html#css-variables).

## Derive a subtle inner border

The shared `color-mix()` expression combines 80% of the card's background with 20% of its outer-border color. The inner border picks up the same tint without requiring a third palette choice for every resource or mode. Increase the outer-border share for a stronger inner border.

Avo uses `--color-tertiary` for card-body borders and table-cell borders. Overriding it inside `.card__wrapper` tints those borders and field dividers without changing the whole admin's neutral palette. Other elements inside that wrapper that use the same variable inherit the tint too.

The white or dark inner content surface stays unchanged; this example recolors the card surround and borders, not every field background.

## Check both color schemes

Use Avo's appearance switcher to check light and dark mode, then reload to confirm the saved scheme still renders correctly. Avo adds `.dark` when dark mode is active, including when the automatic scheme follows a dark system preference.

Check an index table and a record with a sidebar, plus its edit and new forms. Confirm that text stays readable and inner dividers remain more subtle than the outer border. Recheck the `.card` and `.card__wrapper` selectors when upgrading Avo, since this customization depends on the rendered markup.

This example uses native CSS nesting and `color-mix()`, so it needs a browser that supports both. For a whole-admin palette change instead, use [Appearance](../appearance.html); for more component-level changes, see [Theming](../theming.html).
