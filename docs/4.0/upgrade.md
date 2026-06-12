# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

## Avo 4: `avo-advanced` split into feature gems

`avo-advanced` is being phased out. Advanced features now ship as standalone gems you add to your `Gemfile`. See [`avo-advanced` split into feature gems](./avo-3-avo-4-upgrade#avo-advanced-split-into-feature-gems) in the upgrade guide for the full checklist:

- **`avo-scopes`** — add the gem and change scope classes to inherit from `Avo::Scopes::BaseScope`
- **`avo-custom_controls`** — add the gem; update `Avo::Advanced::Resources::Controls::*` references if you use control classes directly
- **`avo-dynamic_filters`** — add the gem if you use dynamic filters
- **`avo-nested`** — add the gem if you use nested association forms on fields
