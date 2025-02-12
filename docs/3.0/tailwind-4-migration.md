# TailwindCSS 4 Migration

:::info
This guide is a work in progress. Please check in later this week to see how you can help.
Thank you!
:::

## You don't have a TailwindCSS pipeline

:::warning 🚧 This guide is still in progress, but here are the basics in order to test TailwindCSS 4.
:::

To test TailwindCSS 4, ensure you are using the following versions:

If you're utilizing `avo-rhino_field`, you must lock its version to `0.0.12.tw4`.

```ruby
gem "avo-rhino_field", "0.0.12.tw4"
```

Add the appropriate entry to your `Gemfile`, depending on your tier:
```ruby
# Avo Community
gem "avo", "3.17.5.tw4"

# Avo Pro
gem "avo", "3.17.5.tw4"
gem "avo-pro", "3.17.5.tw4", source: "https://packager.dev/avo-hq/"

# Avo Advanced
gem "avo", "3.17.5.tw4"
gem "avo-advanced", "3.17.5.tw4", source: "https://packager.dev/avo-hq/"
```

To report any issue please use [this PR](https://github.com/avo-hq/avo/pull/3632).

## You do have a TailwindCSS pipeline

[WIP]




