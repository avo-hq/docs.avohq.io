---
license: community
demoVideo: "https://youtu.be/wnWvzQyyo6A?t=1030"
betaStatus: Beta
outline: [2, 3]
---

# Array Resource

An Array Resource is a resource backed by in-memory data instead of a database table. Use it to let Avo display and manage structured data that doesn't come from a model. The `records` method can return an array of hashes, an array of Active Record objects, an `ActiveRecord::Relation`, or an array of `StoreModel` instances.

Generate one with the `--array` flag:

```bash
bin/rails generate avo:resource Movie --array
```

The generated class extends `Avo::Resources::ArrayResource`. Return the data from the `records` method and describe it with fields, like any other resource:

```ruby
# app/avo/resources/movie.rb
class Avo::Resources::Movie < Avo::Resources::ArrayResource
  def records
    [
      {
        id: 1,
        name: "The Shawshank Redemption",
        release_date: "1994-09-23"
      },
      {
        id: 2,
        name: "The Godfather",
        release_date: "1972-03-24",
        fun_fact: "The iconic cat in the opening scene was a stray found by director Francis Ford Coppola on the studio lot."
      },
      {
        id: 3,
        name: "Pulp Fiction",
        release_date: "1994-10-14"
      }
    ]
  end

  def fields
    main_panel do
      field :id, as: :id
      field :name, as: :text
      field :release_date, as: :date
      field :fun_fact, only_on: :index, visible: -> { resource.record.fun_fact.present? } do
        record.fun_fact.truncate_words(10)
      end

      sidebar do
        field :fun_fact do
          record.fun_fact || "There is no register of a fun fact for #{record.name}"
        end
      end
    end
  end
end
```

Each hash becomes a record, so `field :name` reads the `name:` key and computed fields can call `record.fun_fact` directly. If you return Active Record objects or a relation instead, Avo uses their real model class and fields behave as they do on a regular resource. Pagination works out of the box.

## Create, edit and delete

<VersionReq version="4.2.10" />

Array resources are read-only by default. Set `self.writable = true` to show the Create, Edit and Delete controls, then tell the resource how to write. Avo fills the record from the form, but it can't save an array record by itself, so you define `save_record` and `destroy_record`:

```ruby
# app/avo/resources/bookmark.rb
class Avo::Resources::Bookmark < Avo::Resources::ArrayResource
  self.writable = true # [!code focus]

  def records = BookmarkStore.all

  def fields
    field :id, as: :id
    field :title, as: :text
    field :url, as: :text
  end

  def save_record(record) # [!code focus]
    record.id = BookmarkStore.save(id: record.id, title: record.title, url: record.url) # [!code focus]
  end # [!code focus]

  def destroy_record(record) # [!code focus]
    BookmarkStore.destroy(record.id) # [!code focus]
  end # [!code focus]
end
```

`BookmarkStore` stands in for wherever the data lives: a JSON file, a cache, or an external API. `save_record` handles both create and update. A new record has a `nil` id, so set it after saving: Avo uses it to redirect to the record's page. Both methods report success through their return value, so return something truthy, or raise to fail. The resource's policy still decides who can create, edit and delete.

:::info
Avo calls `save_record` and `destroy_record` on the resource. <VersionReq version="4.2.12" /> On earlier versions, override [`save_record_action`](./controllers-api.html#save_record_action) and [`destroy_record_action`](./controllers-api.html#destroy_record_action) in the resource's controller instead, where the record is `@record`.
:::

## Render it inside another resource

The Array Resource pairs with the [`Array` field](./fields/array.html) to display array data on another resource — `field :attendees, as: :array` on a `Course`, for example. When rendered through the field, `records` is the last fallback in the data-fetching hierarchy; the field's block and the model's method take precedence. See the [Array field documentation](./fields/array.html) for the full hierarchy.

:::warning Limitations
- Sorting is not supported.
- Large datasets can be slow — the array is rebuilt on every request. If that becomes a bottleneck, cache the data inside `records`.
:::

:::info Heavier workloads
If your data comes from an external API or the array approach starts to feel limiting, consider an [HTTP Resource](./http-resource.html) instead — it's backed by an endpoint and built for that kind of work.
:::
