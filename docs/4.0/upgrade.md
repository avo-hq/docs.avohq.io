# Upgrade guide

We'll update this page when we release new Avo 4 versions.

If you're looking for the Avo 3 to Avo 4 upgrade guide, please visit [the dedicated page](./avo-3-avo-4-upgrade).

## Avo 4 beta: resource scopes gem rename

Resource scopes now ship in the standalone **`avo-scopes`** gem. `avo-advanced` no longer provides them. If you use scopes, see [Resource scopes (`avo-scopes`)](./avo-3-avo-4-upgrade#resource-scopes-avo-scopes) in the upgrade guide for the full checklist:

- Add `avo-scopes` to your `Gemfile` (or rename `avo-resource_scopes` → `avo-scopes` if you added it during beta)
- Change every scope class to inherit from `Avo::Scopes::BaseScope` (replacing `Avo::Advanced::Scopes::BaseScope` or `Avo::ResourceScopes::Scopes::BaseScope`)
- Update any custom license checks from `"avo-resource_scopes"` to `"avo-scopes"`
