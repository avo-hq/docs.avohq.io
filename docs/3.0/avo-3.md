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

- Dynamic filters
- Dynamic fields (unreleased yet)
- Nested record creation (unreleased yet)
- Resource tools in fields (unreleased yet)
- New `def fields` API
- Plugins API
- New status page
- Custom controls on everywhere (`Index`, `Show`, `Edit`, `Row`)
- Resource scopes
- Record preview on Index
- Testing helpers

## Feedback

I'd love it if we could have an open forum with this program. I created an `#avo-3-closed-beta` channel where I invited you all to provide feedback. If you haven't received your invite please ping me and I'll add you.

All general updates from our side will be transmitted through this email channel.

All of you who provided the GitHub username will be invited to a private [avo-3](https://github.com/avo-hq/avo-3) repo to post issues.
**This is our preferred method** as we can track issues better and add code snippets more easily.

We appreciate all types of feedback from the API changes, to design work, and any idea you might have.

## Documentation

We haven't gone through all the `3.0` documentation pages. Right now all of them are actually the `2.0` pages duplicated in the `3.0` path.
We'll periodically post here and on the upgrade page when we update them one by one.

#### Pages that are updated for the 3.0 version

 - [installation](./installation)
