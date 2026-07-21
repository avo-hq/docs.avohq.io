# Getting started

Avo turns your Rails app into something your whole team can operate. You describe your data in small Ruby configuration files, and Avo builds the interface around it: the screens to browse and edit records, the actions that run your business logic, the dashboards, the search. It's the layer your team logs into every day to run the product, whether you use it as an admin panel, an internal tool, or the app itself.

Everything in these docs fits into three rings:

1. **[The core](#the-core)**. Describe your data once and Avo generates the full interface around it.
2. **[Add-ons](#add-ons)**. Optional gems that extend the core with new capabilities as your needs grow.
3. **[Your code](#your-code)**. Escape hatches at every level, so configuration never boxes you in.

## The core

You don't build screens with Avo. You tell it what data you have, and it builds the screens.

A [resource](./resources.html) maps to one of your models and declares its [fields](./fields.html): `first_name` as `text`, `birthday` as `date`, `cover_photo` as `file`, and so on. From that, Avo renders the [views](./views.html) to list, show, create, and edit records, complete with [associations](./associations.html), validations surfaced from your models, and file uploads through Active Storage.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id
    field :first_name, as: :text
    field :birthday, as: :date
    field :cover_photo, as: :file
    field :projects, as: :has_many
  end
end
```

Around resources sit the tools your team works with every day: [actions](./actions.html) to run business logic on one or many records, [filters](./filters.html) to slice lists, and [search](./search.html) to get to any record fast.

## Add-ons

The core covers managing records. Add-ons extend it toward whatever job your app or your internal tools have to do. Each one is a separate gem you install when the need shows up, and it slots into the same configuration style as everything else.

**Find and organize records**

- [Global Search](./search.html#global-search): search every resource from one box.
- [Dynamic Filters](./dynamic-filters.html): let users stack their own filter combinations without you writing each one.
- [Resource Scopes](./scopes.html): reuse the model scopes you already trust as one-click segments.
- [Searchable Associations](./associations/searchable.html): type-to-search when attaching related records, even in huge tables.
- [Record Reordering](./record-reordering.html): drag-and-drop ordering for lists where position matters.
- [Menu Editor](./menu-editor.html): shape the sidebar into a navigation that makes sense for your team.

**Capture and edit data**

- [Forms](./forms-and-pages/overview.html): standalone forms and pages beyond your resources, for surveys, settings, and bespoke flows.
- [Nested Records](./associations/has_one.html#nested-in-forms): create and edit associated records inside the parent form.
- [Reactive Fields](./field-options.html#react-to-changes-in-other-fields): fields that show, hide, or update based on what the user picks.
- [Media Library](./media-library.html): manage every uploaded asset in one place.

**Run day-to-day operations**

- [Dashboards](./dashboards.html) and [cards](./cards.html): metrics and charts at a glance.
- [Kanban](./kanban-boards.html): drag-and-drop boards for pipelines and workflows.
- [Notifications](./notifications.html): in-app notifications for the events that matter.
- [Collaboration](./collaboration/overview.html): comments and status updates on records, so context stays with the data.
- [Audit Logging](./audit-logging/): who did what, and when.

**Control who can do what**

- [Authorization](./authorization.html): granular permissions using Pundit policies.
- [Custom Controls](./custom-controls.html): decide exactly which buttons and actions each user sees.

**Connect other systems**

- [JSON API](./rest-api/): expose your resources as a JSON API for integrations and mobile apps.
- [HTTP Resource](./http-resource.html): manage data from an external API as if it were local.

## Your code

When configuration isn't enough, you drop down to plain Rails. Avo is built to be extended, not worked around:

- [Custom fields](./custom-fields.html) slot into panels and views just like built-in ones.
- [Resource tools](./resource-tools.html) embed your own partials inside a resource's pages.
- [Custom tools](./custom-tools.html) give you entire pages built from partials or View Components.
- [Eject views](./eject-views.html) copies any of Avo's own templates into your app for full control.
- [Stimulus integration](./stimulus-integration.html) is baked in for sprinkling interactivity anywhere.
- [Plugins](./plugins.html) package your extensions for reuse across apps.

## Security

Avo runs entirely inside your Rails app. It ships as a gem, reads and writes through your own models, and your data stays on your servers; there's no external dashboard or third-party service between your team and your database.

On top of that, you control access at every level: [authentication](./authentication.html) plugs into whatever you already use (Devise, the Rails 8 scaffold, or anything that gives you a current user), [authorization](./authorization.html) enforces granular permissions through Pundit policies, [Custom Controls](./custom-controls.html) decide which buttons each user even sees, and [Audit Logging](./audit-logging/) keeps a record of who did what.

## Build it with AI agents

The same thing that makes Avo fast for you makes it fast for AI agents: features are small, declarative Ruby files, so agents like Claude Code or Cursor generate resources, actions, and filters that work on the first try instead of hallucinating view code.

We lean into it. Point your agent at the [docs map](https://docs.avohq.io/4.0/docs-map.md) so it pulls accurate, current docs, and install the official [Avo skills](https://github.com/avo-hq/skills), pre-built workflows for building resources, writing tests, creating field types, and more. The [Agentic engineering](./agentic-engineering.html) page walks through the full setup for every editor.

## Seamless upgrades

Avo ships as a [gem](https://rubygems.org/gems/avo), so none of its internals live in your app. Upgrading is `bundle update avo`: no file conflicts, no generated code drifting out of date.

## Start here

1. [Install Avo in your app](./installation.html)
2. [Hook up the current user](./authentication.html#customize-the-current-user-method)
3. [Create your first resource](./resources.html)
4. [Set up authorization](./authorization.html)
5. [Explore the live demo app](https://main.avodemo.com/)

## Where to go next

- [Best practices](./guides/best-practices.html) for structuring a real-world Avo app.
- [Guides](./guides.html) with worked examples and recipes.
- [FAQ](./faq.html) for common setup questions.
- [Avo 3 to Avo 4 upgrade](./avo-3-avo-4-upgrade.html) if you're coming from an existing app.
- [Technical support](./technical-support.html) when you get stuck.
