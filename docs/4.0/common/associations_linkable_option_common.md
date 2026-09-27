<Option name="`linkable`">

Adds an "open in a new tab" icon next to the association's panel title.

- On `has_many` and `has_and_belongs_to_many`, the icon opens the association table on its own page.
- On `has_one`, the icon opens the associated record's show page.

```ruby
field :admin, as: :has_one, linkable: true
```

This feature doesn't go deeper than this. It just helps you get to the association in a separate page.

<!-- TODO(screenshot→gif): Replace the static PNG below with an animated GIF once the flow (Team show → red highlight on link icon → dedicated Memberships page) reads clearly in motion. Image: docs/public/assets/img/4_0/associations/has-many-linkable.webp → has-many-linkable.gif (+ -dark.gif). Spec: tools/screenshots/specs.mjs → GIF_SPECS `has-many-linkable-gif`. -->

<Image src="/assets/img/4_0/associations/has-many-linkable.webp" dark-src="/assets/img/4_0/associations/has-many-linkable-dark.webp" width="1107" height="1003" alt="An Avo Team show page with the Memberships has_many association panel embedded below the record fields; the linkable open-in-new-tab icon beside the panel title is highlighted." />
</Option>
