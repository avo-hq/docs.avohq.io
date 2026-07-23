---
license: community
outline: [2, 3]
---

# Tooltips

Avo ships with [tippy.js](https://atomiks.github.io/tippyjs/) and wires it up for you, so you rarely instantiate a tooltip by hand. Any element that carries a `data-tippy="tooltip"` attribute and a `title` becomes a hover tooltip — the `title` is used as the content, and Avo hides the native browser tooltip so you don't get both.

```erb
<button data-tippy="tooltip" title="Copy to clipboard">
  <%= svg "tabler/outline/clipboard" %>
</button>
```

Tooltips are hover-triggered, initialized automatically on every page load and Turbo navigation, and appended into the nearest modal when the trigger lives inside one (so they never paint underneath it). If the `title` is empty, nothing is shown.

This is the same primitive Avo uses internally for action buttons, index row controls, the view switcher, and [discreet information](./discreet-information.html) — so tooltips you add look and behave exactly like the built-in ones.

## Add a tooltip to any element

Anywhere you write your own markup — a [custom tool](./custom-tools.html), a [resource tool](./resource-tools.html), a [custom field](./custom-fields.html), or an ejected partial — add the two attributes:

```erb
<span data-tippy="tooltip" title="This value is read-only">
  <%= record.status %>
</span>
```

That's the whole setup. Avo's global initializer picks the element up on the next render; you don't register a Stimulus controller or call any JavaScript.

## Use it with Avo's buttons and links

Avo's [`a_button` and `a_link`](./native-components/avo-button-component.html) helpers take `title:` and `data:` like any tag helper, so the same pattern works:

```erb
<%= a_button title: "Refresh the data", data: { tippy: "tooltip" }, icon: "tabler/outline/refresh" %>
```

## Show rich, HTML tooltips

When you need more than a line of text — a formatted list, checkboxes, multiple lines — use the `tippy` Stimulus controller instead. Mark the trigger with `tippy-target="source"` and put the tooltip body in a hidden `tippy-target="content"` element; its `innerHTML` becomes the tooltip (HTML is allowed).

```erb
<div data-controller="tippy">
  <%= link_to "Included permissions", "javascript:void(0);", data: { tippy_target: :source } %>

  <div class="hidden" data-tippy-target="content">
    <div class="p-1 space-y-1">
      <div>✓ Read records</div>
      <div>✓ Export to CSV</div>
    </div>
  </div>
</div>
```

## Re-initialize after injecting markup

The initializer runs on load, on Turbo navigations, and after Turbo Stream renders — so markup that arrives through those paths is covered. If you inject elements some other way (e.g. your own JavaScript building DOM on the fly), call `window.initTippy()` afterward to attach tooltips to the new nodes.

```js
container.insertAdjacentHTML("beforeend", myHtml)
window.initTippy()
```

## Built-in tooltips

Some Avo features render tooltips for you through configuration rather than raw HTML — reach for those instead of hand-rolling markup when they fit:

- [Discreet information](./discreet-information.html) — icons and timestamps that reveal detail on hover next to the record title.
- Card [`discreet_description`](./cards.html) — a small info icon at the bottom-right of a card with the text in a tooltip.
- [Field layout](./fields-layout.html) tab `description` — shown as a tooltip on the tab switcher.
