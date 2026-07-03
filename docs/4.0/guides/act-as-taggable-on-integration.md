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

<Image src="/assets/img/4_0/guides/act-as-taggable-on-integration/taggable-resources-tour.gif" dark-src="/assets/img/4_0/guides/act-as-taggable-on-integration/taggable-resources-tour-dark.gif" width="1170" height="540" alt="Browsing acts-as-taggable-on data as Avo resources: the Tags index opens a tag's details, the Taggings index lists the underlying tagging records (each linking a tag to the post it tags), and opening that post shows the tags on the record itself." />
