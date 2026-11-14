---
license: community
outline: [2, 3]
---

# Rename a resource

Avo names a resource after its class: `Avo::Resources::Person` reads "Person" and "People". That name shows up in the sidebar, the page and browser tab titles, the breadcrumbs, the search result headers, the "Create new person" button, the row controls on the <Index /> view and the flash message after a save.

You can change that name without renaming the class. The URL (`/avo/resources/people`), the controller and the model stay as they are.

```yaml
# config/locales/avo.en.yml
en:
  avo:
    resource_translations:
      person:
        one: "Activity"
        other: "Activities"
```

If you don't change anything, Avo humanizes the class name for the singular and pluralizes it for the plural.

## Rename it in a locale file

A locale file is the simplest way, even if your app speaks only one language. One key renames the resource everywhere Avo shows its name. Put it under `avo.resource_translations.<resource>`, the resource's class name underscored without the `Avo::Resources::` prefix, as in the example above.

Avo uses the values as written, inside sentences too. So the button reads "Create new Activity" with the capital you typed. Write `one: "activity"` if you want it lowercase there, though then the flash message after a save starts lowercase too ("activity was successfully created.").

To point the resource at a key of your own, or to translate it into other languages, see [Localizing resources](../i18n.html#localizing-resources).

## Compute the name in Ruby

If the name isn't fixed, for example because it comes from a setting in your database, override the name methods on the resource:

```ruby
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  def self.name = "Activity"
  def self.singular_name = name
  def self.plural_name = "Activities"
  def self.sentence_name = "activity"
end
```

Each method names the resource in a different part of the UI:

| Method | Where it shows |
| --- | --- |
| `name` | The flash message after a create or update ("Activity was successfully created."), the flash after attaching a record, and the initials next to the resource in the breadcrumbs. |
| `singular_name` | The tooltips of the row controls on the <Index /> view ("View activity", "Edit activity", "Delete activity"). |
| `plural_name` | The sidebar link, the <Index /> title and browser tab title, the breadcrumbs, and the search result headers. |
| `sentence_name` | The "Create new activity" button on the <Index /> view and the title of the <New /> page. |

Override `singular_name` and `sentence_name` along with `name`. They don't follow it, so with only `self.name` the button still reads "Create new person". `plural_name` does follow it: without a plural in the locale file, it pluralizes `name`, so you can leave it out when Rails pluralizes your word correctly.

Call `super` to fall back to the default name when your lookup comes back empty:

```ruby
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  def self.name
    Setting.find_by(key: "person_label")&.value.presence || super
  end

  def self.singular_name = name

  def self.plural_name
    Setting.find_by(key: "people_label")&.value.presence || super
  end

  def self.sentence_name = name.downcase
end
```

Avo calls these methods every time it shows the name, several times on each page. Keep the lookup cheap, or cache it.

A name returned by these methods beats the locale file.

:::warning Define class methods
Write `def self.plural_name`, not `def plural_name`. Avo reads the name from the resource class in some places and from a resource instance in others. An instance method only reaches the second group, so the sidebar and the search result headers keep the old name.
:::

## Rename other parts of the UI

Some labels near the resource's name are set somewhere else:

- **A single sidebar link.** If you build the sidebar with the [menu editor](../menu-editor.html), give the item a `label`: `resource :people, label: "Activities"`. It changes only that link. See [`resource`](../menu-editor-api.html#resource).
- **An association panel.** A `has_many` panel takes its title from the field, so `field :people, as: :has_many` reads "People". Set [`name`](../associations/has_many-api.html#name) on the field to change it. A field that sets `use_resource` reads that resource's `name` instead.
- **A record's title.** The name of a single record, such as "Jane Doe", comes from [`self.title`](../resources-api.html#self.title). See [Name and describe records](../resources.html#name-and-describe-records).
