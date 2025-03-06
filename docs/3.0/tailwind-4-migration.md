---
outline: deep
---

# TailwindCSS 4 Migration Guide

## Overview
With the upcoming release of Avo `3.19.0` in 1 April 2025 and no, this is not an April Fools' joke 😄, Avo will fully transition to TailwindCSS 4. To facilitate a smooth migration process, Avo `3.18.x` (which uses TailwindCSS 3) will continue to be maintained alongside a parallel version, `3.18.x.tw4`, which incorporates TailwindCSS 4.

**We strongly encourage you to utilize the `3.18.x.tw4` version as a testing ground for the migration. By doing so, you can identify potential issues, provide feedback, and ensure a seamless transition before the official release of Avo `3.19.0` in 1 April 2025.**

This guide outlines the necessary steps to migrate to TailwindCSS 4, addressing two distinct scenarios:

1. **Projects without a TailwindCSS pipeline**
    - These setups do not have an existing TailwindCSS configuration
    - This is the case for most projects
    - There isn't much action to take
2. **Projects with an existing TailwindCSS pipeline**
    - These projects already utilize TailwindCSS.
    - Will need to adjust their configurations accordingly.

Each of these cases will be discussed in detail in their respective sections.

:::warning
Additionally, a dedicated section highlights [breaking changes](#tailwindcss-4-breaking-changes) that apply universally, regardless of your current TailwindCSS setup. Understanding these changes is crucial to ensure compatibility and avoid disruptions.
:::

Proceed to the following sections to determine the appropriate migration path for your project.

## Use the `3.18.x.tw4` version

:::info
`x` is the patch version, it can be `0`, `1`, `2`, etc., depending on the number of patch releases in the `3.18` minor version.

Each patch release will have both the TailwindCSS 3 and the TailwindCSS 4 versions of the gem.

Example:

```bash
# 3.18.0
# TailwindCSS 3 version
gem "avo", "3.18.0"
# TailwindCSS 4 version
gem "avo", "3.18.0.tw4"

# 3.18.1
# TailwindCSS 3 version
gem "avo", "3.18.1"
# TailwindCSS 4 version
gem "avo", "3.18.1.tw4"
```
:::

To test TailwindCSS 4, ensure you are using the following versions:

```bash
gem "avo", "3.18.x.tw4"
```

If you're utilizing `avo-rhino_field`, you must lock its version to `0.0.12.tw4`.

```ruby
gem "avo-rhino_field", "0.0.12.tw4"
```

Add the appropriate entry to your `Gemfile`, depending on your tier:
```ruby
# Avo Community
gem "avo", "3.18.x.tw4"

# Avo Pro
gem "avo", "3.18.x.tw4"
gem "avo-pro", "3.18.x", source: "https://packager.dev/avo-hq/"

# Avo Advanced
gem "avo", "3.18.x.tw4"
gem "avo-advanced", "3.18.x", source: "https://packager.dev/avo-hq/"
```

To report any issue please leave a comment [here](https://github.com/avo-hq/avo/pull/3632).

## Projects without a TailwindCSS pipeline

If you don't have a TailwindCSS pipeline, which should be the case for most cases, there isn't much to do besides following the steps in the [Use the `3.18.x.tw4` version](#use-the-3-18-x-tw4-version) section and address the [TailwindCSS 4 breaking changes](#tailwindcss-4-breaking-changes) below.

After, you can use the `3.18.x.tw4` version of the gem and it will work just fine and ready for the Avo `3.19.0` release.


## You do have a TailwindCSS pipeline

If you have a TailwindCSS pipeline, the first required step is to update the TailwindCSS version to 4.x.

After that, navigate to `config/avo/tailwind.config.js` and remove the `content` entry:

```ruby
# config/avo/tailwind.config.js
const avoPreset = require('../../tmp/avo/tailwind.preset.js')

module.exports = {
  presets: [avoPreset],
  content: [ # [!code --]
    ...avoPreset.content, # [!code --]
    './app/views/**/*.html.erb', # [!code --]
    './app/helpers/**/*.rb', # [!code --]
    './app/javascript/**/*.js', # [!code --]
    './app/components/avo/**/*.html.erb', # [!code --]
  ], # [!code --]
}
```

Then, update `app/assets/stylesheets/avo/avo.tailwind.css` with the following changes:

```css
/* app/assets/stylesheets/avo/avo.tailwind.css */
@import 'tailwindcss/base'; /* [!code --] */
@import 'tailwindcss'; /* [!code ++] */
/* Have all of Avo's custom and plugins styles available. */
@import '../../../../tmp/avo/avo.base.css';
@import 'tailwindcss/components'; /* [!code --] */
@import 'tailwindcss/utilities'; /* [!code --] */

/*

@layer components {
  .btn-primary {
    @apply py-2 px-4 bg-blue-200;
  }
}

*/
```

Additionally, remove the following files:

- `app/assets/stylesheets/avo/tailwindcss/base.css`
- `app/assets/stylesheets/avo/tailwindcss/components.cs`
- `app/assets/stylesheets/avo/tailwindcss/utilities.css`

Finally, relocate `app/assets/stylesheets/application.tailwind.css` to `app/assets/tailwind/application.css`.

You can accomplish this by executing the following command:

```bash
git mv app/assets/stylesheets/application.tailwind.css app/assets/tailwind/application.css
```

Once these steps are completed, your TailwindCSS pipeline should be fully migrated and ready for Avo `3.19.0`.

Review the complete set of changes we made to upgrade our demo app, which includes a custom TailwindCSS pipeline:

- [Pull Request #3](https://github.com/avo-hq/ticketing.avodemo.com/pull/3)
- [Commit 539c643](https://github.com/avo-hq/ticketing.avodemo.com/commit/539c64322f53fa2070a641303f5d289b7cb2e6a3)

## TailwindCSS 4 breaking changes

TailwindCSS 4 introduces several breaking changes that might affect your application. While we highlight some common changes below, we strongly recommend reviewing the [official TailwindCSS 4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide) for a comprehensive list of changes.

You need to apply this changes on all the Avo related custom components that you have in your application. That includes:

- Custom fields
- Resource tools
- Custom tools
- Custom cards
- Ejected components

### Renamed Utilities

TailwindCSS 4 has renamed several utilities to make them more consistent and predictable.

We'll highlight the most common use-case encountered in the Avo codebase, please refer to the whole [Renamed Utilities list](https://tailwindcss.com/docs/upgrade-guide#renamed-utilities) for more details.

| TailwindCSS 3 Utility | TailwindCSS 4 Utility |
|------------|------------|
| rounded-sm | rounded-xs |
| rounded | rounded-sm |
| ... | ... |

For example, update your code from:

```html
<div class="rounded-sm"> <!-- TailwindCSS 3 -->  // [!code --]
<div class="rounded-xs"> <!-- TailwindCSS 4 --> // [!code ++]
  Content
</div>

<div class="rounded"> <!-- TailwindCSS 3 -->  // [!code --]
<div class="rounded-sm"> <!-- TailwindCSS 4 --> // [!code ++]
  Content
</div>
```

:::tip
If you're applying global search and bulk replace do the `rounded-sm` to `rounded-xs` transition first, then do the `rounded` to `rounded-sm` transition.
:::

### Default Border Color

In TailwindCSS 4, the default border color has changed from `gray-200` to `currentColor`. This affects both `border-*` and `divide-*` utilities. You'll need to explicitly specify border colors where you previously relied on the default.

For example, update your code from:

```html
<div class="border p-4"> <!-- TailwindCSS 3 -->  // [!code --]
<div class="border border-gray-200 p-4"> <!-- TailwindCSS 4 --> // [!code ++]
  Content with default gray border
</div>
```

:::tip
Do a global search for `border` and `divide` and verify where they have any implicit color borders. Add the `border-gray-200` and `divide-gray-200` classes to the elements that don't have an explicit color.
:::


