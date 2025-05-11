# Act as taggable on integration

A popular way to implement the tags pattern is to use the [`acts-as-taggable-on`](https://github.com/mbleigh/acts-as-taggable-on) gem.
Avo already supports it in the [`tags`](./../fields/tags) field, but you might also want to browse the tags as resources.

[This template](https://railsbytes.com/templates/VRZskb) will add the necessarry resource and controller files to your app.

Run `rails app:template LOCATION='https://railsbytes.com/script/VRZskb'`

If you're using the menu editor don't forget to add the resources to your menus.

```ruby
resource :taggings
resource :tags
```

<Image src="/assets/img/3_0/guides/act-as-taggable-on-integration/act-as-taggable-on-integration.gif" width="1200" height="750" alt="" />
