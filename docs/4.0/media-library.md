---
license: community
betaStatus: Alpha
demoVideo: "https://youtu.be/wnWvzQyyo6A?t=1698"
outline: [2, 3]
---

# Media Library

<Image src="/assets/img/4_0/media-library/media-library.webm" dark-src="/assets/img/4_0/media-library/media-library-dark.webm" alt="Media Library" size="800x402" />

If you run an asset-intensive app, having one place to view and manage all those assets is invaluable. Avo's Media Library feature makes that easier.

The Media Library has two goals in mind.

1. Browse and manage all your assets
2. Use it to inject assets in all three of Avo's rich text editors ([trix](./fields/trix), [rhino](./fields/rhino), and [markdown](./fields/markdown)).

:::warning
The Media Library feature is still in alpha and future releases might contain breaking changes so keep an eye out for the upgrade guide.

This is just the initial version and we'll be adding more features as we progress and get more feedback on usage.
:::

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/wnWvzQyyo6A?start=1698" title="Avo 3.17 - Media Library, new Markdown field &amp; the Array Adapter" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## How to enable it

The Media Library feature is disabled by default (until we release the stable version). To enable it, you need to do the following:

```ruby{4}
# config/initializers/avo.rb
if defined?(Avo::MediaLibrary)
  Avo::MediaLibrary.configure do |config|
    config.enabled = true
  end
end
```

This is the killswitch of the whole feature.
When disabled, the Media Library will not be available to anyone. It will hide the menu item, block all the routes, and hide the Media Library icons from the editors.

## Hide menu item

You can hide the menu item from the sidebar by setting the `visible` option to `false`.

```ruby
# config/initializers/avo.rb
if defined?(Avo::MediaLibrary)
  Avo::MediaLibrary.configure do |config|
    config.visible = false
  end
end
```

You may also use a [block](./execution-context) to conditionally show the menu item. You'll have access to the `Avo::Current` object and you can use it to show the menu item based on the current user.

```ruby
# config/initializers/avo.rb
if defined?(Avo::MediaLibrary)
  Avo::MediaLibrary.configure do |config|
    config.visible = -> { Avo::Current.user.is_developer? }
  end
end
```

This will hide the menu item from the sidebar if the current user is not a developer.

## Add it to the menu editor

If you [customize the menu](./menu-editor), the Media Library won't appear automatically. Add it back with a `link_to` (or `link`) item pointing at `avo.media_library_index_path`.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.main_menu = lambda {
    link_to 'Media Library', avo.media_library_index_path
  }
end
```

## Use it with the rich text editors

The Media Library will seamlessly integrate with all the rich text editors.

<Image src="/assets/img/4_0/media-library/media-library-rhino.webm" dark-src="/assets/img/4_0/media-library/media-library-rhino-dark.webm" alt="Media Library with Rhino field" size="800x373" />

```ruby
field :body, as: :trix
field :body, as: :rhino
field :body, as: :markdown
```

The editors will each have a button to open the Media Library modal.
Once open, after the user selects the asset, it will be injected into the editor.

### Disable it on a single markdown field

The [`markdown`](./fields/markdown) field accepts a `media_library` option (defaults to `true`). Set it to `false` to hide the gallery button on that field while keeping the Media Library enabled everywhere else.

```ruby
field :body, as: :markdown, media_library: false
```

This is a `markdown`-only option; the `trix` and `rhino` fields don't support per-field toggling.
