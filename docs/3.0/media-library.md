---
version: "3.17.0"
betaStatus: Alpha
demoVideo: https://youtu.be/wnWvzQyyo6A?t=1698
---

# Media Library

<Image src="/assets/img/3_0/media-library/media-library.webm" alt="Media Library" size="800x453" />

If you run an asset-intensive, having a place to view all those asses would be great. It's becoming easier with Avo and it's Media Library feature.

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
When disabled, the Media Library will not be available to anyone. It will hide the menu item, block the all the routes, and hide media the library icons from the editors.

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
Before Avo 3.32.4, `visible` hid the menu item but left the routes reachable by URL, so any authenticated Avo user could browse, rename and delete every asset. See [GHSA-cff8-4h3c-9r4q](https://github.com/avo-hq/avo/security/advisories/GHSA-cff8-4h3c-9r4q).
:::

## Add it to the menu editor

The Media Library is a menu item in the sidebar. You can add it to the menu editor by using the `media_library` helper.

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

<Image src="/assets/img/3_0/media-library/media-library-rhino.webm" alt="Media Library with Rhino field" size="800x453" />

```ruby
field :body, as: :trix
field :body, as: :rhino
field :body, as: :markdown
```

The editors will each have a button to open the Media Library modal.
Once open, after the user selects the asset, it will be injected into the editor.

The button follows `visible` too, so a user the Media Library is not visible to won't see it.
