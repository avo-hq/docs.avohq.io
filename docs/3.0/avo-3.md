# Avo 3 open beta

First of all, I would like to thank you for being an awesome community member and for your help with this launch.

## Avo 3

Avo 3 is not finished yet. I think I got carried away when I promised a launch in March. We timidly started by refactoring some of our internals in order to have a lighter maintenance load in the future.
We've also done a lot of work around our public APIs and added a few new features.

## Big Changes

You'll find all the new changes in the [Avo 2 to Avo 3 upgrade section](./avo-2-avo-3-upgrade.html).

## Releases

For **Avo** we'll have version `3.0.0.betaX`.
For all the other gems we'll have `0.x` versions until we launch publicly.

## Repos and packages

Avo 3 has been divided into various repositories and packages, organized by the specific feature or tier they are intended for. Within this structure, there are three main packages available: `avo`, `avo-pro`, and `avo-advanced`. Depending on your license, you need to manually include one of these packages in your `Gemfile`. Note that both `avo-pro` and `avo-advanced` come with additional packages that serve as their dependencies.

## New features & big changes

- [Dynamic filters](./dynamic-filters)
- [Custom controls on everywhere](./customizable-controls) (<Index />, <Show />, <Edit />,and `Row`)
- [Resource scopes](./scopes)
- [Custom fields from template](./eject-views.html#field_components)
- [Custom resource view components](./resources.html#self_components) for <Index />, <Show />, and <Edit />
- [Custom components for fields](./field-options.html#customizing-field-components-using-components-option)
- [Intelligent `view` object](./views.html#checking-the-current-view) and new `display` view option
- [Better TailwindCSS integration](./tailwindcss-integration.html)
- [Cards on resources](./resources.html#cards)
- [New `def fields` API](./fields)
- [Plugins API](./plugins)
- [Record preview on Index](./record-previews)
- [Testing helpers](./testing#testing-helpers)
- [Eject command improvements](./eject-views.html)
- Intelligent resource title
- License checking mechanism improvements
- Dynamic fields (coming soon)
- Nested record creation (coming soon)
- Resource tools in fields (coming soon)

## Feedback

I'd love it if we could have an open forum with the open beta program. I created an `#avo-3` channel on Discord where I invite you all to provide feedback and ask for support.
We appreciate all types of feedback from the API changes, to design work, and any idea you might have.

## Documentation

We started the process to redo and reorganize the 3.0 docs, so if we missed anything, please let us know.

## What next?

1. [Install Avo 3](./installation)
1. [Follow the upgrade guide](./avo-2-avo-3-upgrade.html)
1. [Experience the new features](#new-features)
1. [Provide feedback and ask for support](https://github.com/avo-hq/avo/issues/new?assignees=&labels=Avo%203)
