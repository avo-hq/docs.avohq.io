# Grid view

<br>
<Image src="/assets/img/grid-view.jpg" width="1312" height="1096" alt="Avo grid view" />

Some resources are best displayed in a grid view. We can do that with Avo using a `cover_url`, a `title`, and a `body`.

## Enable grid view

To enable grid view for a resource, you need to configure the `grid_view` class attribute on the resource. That will add the grid view to the view switcher on the <Index /> view.

```ruby{2-13}
class Avo::Resources::Post < Avo::BaseResource
  self.grid_view = {
    card: -> do
      {
        cover_url:
          if record.cover_photo.attached?
            main_app.url_for(record.cover_photo.url)
          end,
        title: record.name,
        body: record.truncated_body
      }
    end
  }
end
```

<Image src="/assets/img/view-switcher.png" width="822" height="153" alt="Avo view switcher" />

## Make default view

To make the grid the default way of viewing a resource **Index**, we have to use the `default_view_type` class attribute.

```ruby{2}
class Avo::Resources::Post < Avo::BaseResource
  self.default_view_type = :grid
end
```

## Custom style

You may want to customize the card a little bit. That's possible using the `html` option.

```ruby{13-37}
class Avo::Resources::Post < Avo::BaseResource
  self.grid_view = {
    card: -> do
      {
        cover_url:
          if record.cover_photo.attached?
            main_app.url_for(record.cover_photo.url)
          end,
        title: record.name,
        body: record.truncated_body
      }
    end,
    html: -> do
      {
        title: {
          index: {
            wrapper: {
              classes: "bg-blue-50 rounded-md p-2"
            }
          }
        },
        body: {
          index: {
            wrapper: {
              classes: "bg-gray-50 rounded-md p-1"
            }
          }
        },
        cover: {
          index: {
            wrapper: {
              classes: "blur-sm"
            }
          }
        }
      }
    end
  }
end
```

<Image src="/assets/img/grid-html-option.png" width="1014" height="637" alt="Grid html option" />

## Grid Item Badge

<Image src="/assets/img/4_0/grid-view/grid-badge.png" size="2080 x910" alt="Avo Grid View Badge Element" />

You can display and customize a badge on top of your grid items. Badges are useful for showing status indicators, labels, or other visual cues that help users quickly identify important information about each item.

### Complete Example
```ruby
# Dynamic badge based on record status
self.grid_view = {
  card: -> do
    {
      cover_url: record.image.attached? ? main_app.url_for(record.image.variant(resize_to_fill: [300, 300])) : nil,
      title: record.title,
      body: simple_format(record.description),
      badge: {
        label: record.new? ? "New" : "Updated",
        color: record.new? ? "green" : "orange",
        style: record.new? ? "solid" : "subtle",
        title: record.new? ? "New product available" : "Recently updated",
        icon: record.new? ? "heroicons/outline/arrow-trending-up" : "heroicons/outline/arrow-path"
      }
    }
  end
}
```

## Options

<Option name="`label`">

The visible text displayed on the badge. This is the primary content that users will see on your grid items.
```ruby
badge: { label: "New" }
```

<Image src="/assets/img/4_0/grid-view/badge-label.png" size="1022 x686" alt="Avo Grid View Badge Label" />

</Option>

<Option name="`color`">

Sets the badge color. Accepts a static value or a proc for dynamic coloring based on the record.

#### Available colors

**Base colors:** `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

**Semantic colors:** `neutral`, `success`, `danger`, `warning`, `info`
```ruby
badge: {
  label: "New",
  color: "green"
}
```

</Option>

<Option name="`style`">

Controls the badge appearance style.

#### Available styles

- `subtle` - Light background with colored text (default)
- `solid` - Solid colored background with white text
```ruby
badge: {
  label: "New",
  color: "green",
  style: "solid"
}
```

</Option>

<Option name="`title`">

The tooltip text that appears when users hover over the badge. Useful for providing additional context or detailed information.
```ruby
badge: {
  label: "New",
  title: "New product available"
}
```

<Image src="/assets/img/4_0/grid-view/badge-title.png" size="1088x 740" alt="Avo Grid View Badge Title" />

</Option>

<Option name="`icon`">

Adds an icon to the badge.
```ruby
badge: {
  label: "New",
  color: "green",
  icon: "heroicons/outline/arrow-trending-up"
}
```

</Option>
