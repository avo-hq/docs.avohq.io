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
2. Use it to inject assets in Avo's rich text editors ([trix](./fields/trix), [rhino](./fields/rhino), [markdown](./fields/markdown), and [lexxy](./fields/lexxy)).

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

## Control who can use it

`visible` decides who may use the Media Library. It gates the sidebar item, the Media Library button in the rich text editors, and the Media Library routes themselves — a user it returns `false` for gets a 404 on every one of them.

Turn it off for everyone with a Boolean:

```ruby
# config/initializers/avo.rb
if defined?(Avo::MediaLibrary)
  Avo::MediaLibrary.configure do |config|
    config.visible = false
  end
end
```

Or restrict it per user with a [block](./execution-context), which has access to the `Avo::Current` object:

```ruby
# config/initializers/avo.rb
if defined?(Avo::MediaLibrary)
  Avo::MediaLibrary.configure do |config|
    config.visible = -> { Avo::Current.user.is_developer? }
  end
end
```

Anyone who isn't a developer then has no Media Library at all — no menu item, no button in the editors, and a 404 on every Media Library URL.

`visible` defaults to `true`, so an enabled Media Library is available to everyone who can sign in to Avo. Leave it there only if every Avo user may browse, rename and delete every uploaded asset.

:::warning
Before Avo 4.1.7, `visible` hid the menu item but left the routes reachable by URL, so any authenticated Avo user could browse, rename and delete every asset. See [GHSA-cff8-4h3c-9r4q](https://github.com/avo-hq/avo/security/advisories/GHSA-cff8-4h3c-9r4q).
:::

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
field :body, as: :lexxy
```

The editors will each have a button to open the Media Library modal.
Once open, after the user selects the asset, it will be injected into the editor.

The button follows `visible` too, so a user the Media Library is not visible to won't see it.

### Disable it on a single markdown field

The [`markdown`](./fields/markdown) field accepts a `media_library` option (defaults to `true`). Set it to `false` to hide the gallery button on that field while keeping the Media Library enabled everywhere else.

```ruby
field :body, as: :markdown, media_library: false
```

This is a `markdown`-only option; the `trix` and `rhino` fields don't support per-field toggling. The [`lexxy`](./fields/lexxy) field hides the button when its attachments are disabled (`attachments_disabled: true`).
