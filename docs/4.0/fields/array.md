---
license: community
demoVideo: "https://youtu.be/wnWvzQyyo6A?t=1030"
description: "The Array field allows you to display and manage structured array data."
fieldTags: [structured]
outline: [2, 3]
---

# Array

The `Array` field displays structured data in a paginated panel inside another resource. Use it for data supplied by a block or a model method, with an [Array Resource](../array-resource) defining the fields shown for each entry.

```ruby{4-9}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :attendees, as: :array do
      [
        { id: 1, name: "John Doe", role: "Software Developer", organization: "TechCorp" },
        { id: 2, name: "Jane Smith", role: "Data Scientist", organization: "DataPros" }
      ]
    end
  end
end
```

Without a block, Avo calls the model method matching the field name, then falls back to the Array Resource's `records` method if no data is returned. The Array Resource returns an empty array by default and is read-only unless configured otherwise.

## Set up the resource that renders each entry

Generate an Array Resource for the field. For `field :attendees, as: :array`, use:

```bash
bin/rails generate avo:resource Attendee --array
```

Define the entry's fields in that resource:

```ruby
# app/avo/resources/attendee.rb
class Avo::Resources::Attendee < Avo::Resources::ArrayResource
  def fields
    field :id, as: :id
    field :name, as: :text
    field :role, as: :text
    field :organization, as: :text
  end
end
```

Avo looks up the resource by the field name. If it has a different name, pass `use_resource: Avo::Resources::Attendee` in the field declaration. See the [Array Resource documentation](../array-resource) for configuring the resource and enabling writes.

## Supply data in a block {#example-1-array-field-with-a-block}

Return an array of hashes from the field's block, as in the opening example, to supply static or computed data. The block can read `record` to access the parent record. The Array Resource also accepts Active Record objects, an `ActiveRecord::Relation`, or `StoreModel` instances.

## Allow access to the panel

:::warning Authorization
The Array field uses association-style authorization. If authorization is enabled and the panel is missing, check the parent resource's policy.

To explicitly authorize the attendees panel, define:

```ruby{3}
# app/policies/course_policy.rb
class CoursePolicy < ApplicationPolicy
  def view_attendees? = true
end
```

For more details, refer to the [view\_{association}?](./../authorization-api.html#view_association) documentation.
:::

## Read data from the model {#example-2-array-field-fetching-data-from-the-models-method}

Declare `field :attendees, as: :array` without a block to read the data from `Course#attendees`:

```ruby
# app/models/course.rb
class Course < ApplicationRecord
  def attendees
    User.first(6)
  end
end
```

Use an Array Resource whose fields match the objects returned by the method. For this example, define fields for the `User` attributes you want to display.

## Provide a fallback dataset {#example-3-fallback-to-the-records-method}

If the field's block and the model method do not supply data, return a fallback dataset from the Array Resource's `records` method. Add this method to the resource that defines the entry's fields:

```ruby
# app/avo/resources/attendee.rb
class Avo::Resources::Attendee < Avo::Resources::ArrayResource
  def records
    [
      { id: 1, name: "Default Attendee", role: "Guest", organization: "DefaultOrg" }
    ]
  end
end
```

## Paginate at the source

<VersionReq package="avo" version="4.3.6" />

The block can read `page` and `per_page`, the page the panel is showing and its size. Return that page's records with the total to fetch one page at a time, as an [Array Resource's `records`](./../array-resource.html#paginate-at-the-source) does:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :bookmarks, as: :array do
      {
        records: BookmarkStore.page(page, per: per_page, user_id: record.id),
        count: BookmarkStore.count(user_id: record.id)
      }
    end
  end
end
```

Give the resource that renders the field a `find_record_method` too, so a record's show page finds it outside the page the panel fetched.

`count` is the total number of matching records across all pages, not just the number returned for this page. `BookmarkStore` stands in for your data source; implement its `page` and `count` methods to match your storage.

## Choose which data source wins {#summary-of-data-fetching-hierarchy}

When using the `Array` field, Avo will fetch data in the following order:

1. Use data returned by the **block** provided in the field.
2. Fetch data from the **associated model method** (e.g., `Course#attendees`).
3. Fall back to the **`records` method** defined in the resource.

Returning `nil` or `false` moves to the next source. Returning `[]` displays an empty panel instead of using the fallback.

## Customize shared field behavior

See [shared field options](../field-options.html) for common configuration. The Array field has no options of its own; it uses the association panel renderer and inherits its panel behavior.
