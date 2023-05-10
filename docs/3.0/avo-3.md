# Avo 3 closed beta

First of all, I would like to thank you for helping us out with this new launch.

## Purpose

The purpose of this program is to figure out if the new APIs are up to standards, check out the new features, and to flush out potential bugs and edge-cases.

## Avo 3

Avo 3 is not finished yet. I think I got carried away when I promised a launch in March. We timidly started by refactoring some of our internals in order to have a lighter maintenance load in the future.
We've also done a lot of work around our public APIs and added a few new features.

## Big Changes

You'll find all the new changes in the [upgrade section](./upgrade). The entries on that page  are chronologically inversed (on the bottom are the oldest, and top are the newest).

## Releases

For **Avo** we'll have version `3.0.0.pre.X`. We'll post updates for each `pre` version we release.
For all the other packages we'll have `0.x` versions until we launch publicly.

## Repos and packages

Avo 3 has been broken up into multiple repos and packages based on the feature or tier they will be assigned to. You must manually add them all to the `Gemfile`.
Until we finish up with the setup on all the repos, you'll have access to the [avo-3](https://github.com/avo-hq/avo-3) repo.

## New features

- [Dynamic filters](./dynamic-filters)
- Dynamic fields (unreleased yet)
- Nested record creation (unreleased yet)
- Resource tools in fields (unreleased yet)
- [New `def fields` API](./fields)
- [Plugins API](./plugins)
- New status page
- [Custom controls on everywhere](./customizable-controls) (<Index />, <Show />, <Edit />,and `Row`)
- [Resource scopes](./scopes)
- [Record preview on Index](./record-previews)
- [Testing helpers](./testing#testing-helpers)

## Feedback

I'd love it if we could have an open forum with this program. I created an `#avo-3-closed-beta` channel where I invited you all to provide feedback. If you haven't received your invite please ping me and I'll add you.

All general updates from our side will be transmitted through this email channel.

All of you who provided the GitHub username will be invited to a private [avo-3](https://github.com/avo-hq/avo-3) repo to post issues.
**This is our preferred method** as we can track issues better and add code snippets more easily.

We appreciate all types of feedback from the API changes, to design work, and any idea you might have.

## Documentation

We started the process to redo and reorganize the 3.0 docs. You might have noticed that some pages have dissappeared from the sidebar. That's because they haven't been updated for version 3.
We'll periodically enable the old pages as we give them a proper read.

## What next?

1. [Install Avo 3](./installation)
1. [Follow the upgrade guide](./upgrade)
1. [Experience the new features](#new-features)
1. [Provide feedback and ask for support](https://github.com/avo-hq/avo-3/issues/new/choose)
