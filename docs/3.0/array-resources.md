---
version: '3.16.2'
license: community
demoVideo: https://youtu.be/wnWvzQyyo6A?t=1030
betaStatus: beta
---

# Array Resources

## Overview

An **Array Resource** is a flexible resource that can be backed by an **array of hashes** or an **array of Active Record objects**. It is not constrained to an Active Record model and allows dynamic data handling.

:::info Related field
The Array Resource can be used in conjunction with the `Array` field to manage structured array data in your resources.

For more details on using the `Array` field, including examples and hierarchy of data fetching, check out the [Array Field documentation](./fields/array).

This integration allows for seamless configuration of dynamic or predefined array-based data within your application.
:::

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/wnWvzQyyo6A?start=1030" title="Avo 3.17 - Media Library, new Markdown field &amp; the Array Adapter" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Creating an Array Resource

Generate an **Array Resource** using the `--array` flag:

```bash
bin/rails generate avo:resource Movie --array
```

This sets up a resource designed to work with an array of data.

## Defining the `records` Method

The `records` method serves as the fallback source for data in the resource. It returns an array of hashes or Active Record objects.

### Example

```ruby
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
```

## Defining Fields

Array Resources use fields like any other Avo resource. Here’s an example for a `Movie` resource:

```ruby
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
