# Avo 3

Avo 3 is the version of Avo we always wanted to build. It condenses all the learnings we had for the past three years into a few cool packages.

We would like to thank our community for all the support they've given and all the feedback and contributions!

## Changes

You'll find all the new changes in the [Avo 2 to Avo 3 upgrade section](./avo-2-avo-3-upgrade.html).

## New features & big changes

##### Advanced license features
<LicenseReq license="advanced" size="xs" />

- [Dynamic filters](./dynamic-filters)
- [Custom controls on everywhere](./customizable-controls) (<Index />, <Show />, <Edit />,and `Row`)
- [Resource scopes](./scopes)

##### Pro license features
<LicenseReq license="pro" size="xs" />

- [Resource Cards](./resources.html#cards)
- [Record preview on Index](./record-previews)

##### Community license features
<LicenseReq license="community" size="xs" />

- [Custom fields from template](./eject-views.html#field_components)
- [Custom resource view components](./resources.html#self_components) for <Index />, <Show />, and <Edit />
- [Custom components for fields](./field-options.html#customizing-field-components-using-components-option)
- [Intelligent `view` object](./views.html#checking-the-current-view) and new `display` view option
- [Better TailwindCSS integration](./tailwindcss-integration.html)
- [New `def fields` API](./fields)
- [New `def index|show|edit_fields` API](./fields.html#specific-methods-for-each-view)
- [Plugins API](./plugins)
- [Testing helpers](./testing#testing-helpers)
- [Eject command improvements](./eject-views.html)
- [Panel layout improvements](./resource-panels.html)
- [Action link generator](./actions.html#action-link)
- [StimulusJS in actions](./actions.html#stimulusjs)
- Multiple actions flows
- Intelligent resource title

##### Coming soon

- Theming
- Audit logs (Enterprise feature)
- Developer experience improvements
  - linter
  - VSCode extension
  - improved error messaging
- Resource adapters
- Customizable dynamic filters
- Custom resource adapters
- Dynamic fields
- Nested record creation
- Resource tools in fields

Avo 3 is not finished yet. We will continue to provide the same cadence of one release every ~~two~~ four weeks you are used to. Some the things we want to focus on in the near future are:

Please follow our [Roadmap](https://avohq.io/roadmap) for more information about that.

## Features moved from one tier to another

### Features moved from Pro to Advanced
<LicenseReq license="pro" size="xs" /> -> <LicenseReq license="advanced" size="xs" />

- [`show_controls`](./customizable-controls)

### Features moved from Pro to Community
<LicenseReq license="pro" size="xs" /> -> <LicenseReq license="community" size="xs" />

- Custom fields
- Custom tools
- Resource tools
- Tags field
- Localization
- Stimulus JS integration
- Branding

## Repos and packages

Avo 3 has been divided into various repositories and packages, organized by the specific feature or tier they are intended for. Within this structure, there are three main packages available: `avo`, `avo-pro`, and `avo-advanced`. Depending on your license, you need to manually include one of these packages in your `Gemfile`. Note that both `avo-pro` and `avo-advanced` come with additional packages that serve as their dependencies.

## Feedback

I'd love it if we could have an open forum with the open beta program. Please use the [GitHub Discussions](https://avo.cool/chat) forum for that

## Documentation

We started the process to redo and reorganize the 3.0 docs, so if we missed anything, please let us know.

## What next?

1. [Install Avo 3](./installation)
1. [Follow the upgrade guide](./avo-2-avo-3-upgrade.html) if you're upgrading from Avo 2
1. [Experience the new features](#new-features)
1. [Provide feedback and ask for support](https://github.com/avo-hq/avo/issues/new?assignees=&labels=Avo%203)
