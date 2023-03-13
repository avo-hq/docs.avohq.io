# Upgrade guide

We generally push changes behind the scenes, so you don't have to update your code, but sometimes the public API is updated too.

Follow these guides to make sure your configuration files are up to date.

:::warning
The 2.x to 3.0 Upgrade is a work in progress
:::

## Upgrade from 2.x to 3.0

### Moved some globals to Avo::Current

Rename the follwing
- `Avo::App.context`      -> `Avo::Current.context`
- `Avo::App.current_user` -> `Avo::Current.current_user`
- `Avo::App.params`       -> `Avo::Current.params`
- `Avo::App.request`      -> `Avo::Current.request`
- `Avo::App.view_context` -> `Avo::Current.view_context`
- `Avo::Dashboards` -> `AvoDashboards`

- reverse disabled and readonly
