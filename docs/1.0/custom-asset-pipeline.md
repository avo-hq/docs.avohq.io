# Custom asset pipeline

[[toc]]

Because there isn't just one standardized way of handling assets in Rails we took a different approach. We abstracted away our asset pipeline and made it so you can bring in your assets (javascript and css files) using your own pipeline (webpacker, sprockets or a different one).

<img :src="$withBase('/assets/img/asset-pipeline.jpg')" alt="Avo and the asset pipeline" class="border mb-4" />

To do that you have eject the `_head.html.erb` partial (`bin/rails generate avo:eject :head`), create the asset files (examples below) and add the asset files from your pipeline to the `_head` partial.

## Webpacker

*Instructions below are for Webpacker version 6. Version 5 has different paths (`app/javacript/packs`).*

Create `avo_application.js` and `avo_application.css` inside `app/packs/entrypoints` with the desired scripts and styles.
Then add them to Avo using the `_head.html.erb` partial.

```erb
# app/views/avo/partials/_head.html.erb

<%= javascript_pack_tag 'avo_application' %>
<%= stylesheet_pack_tag 'avo_application', media: 'all' %>
```

## Sprockets

Create `avo_application.js` and `avo_application.css` inside `app/assets/javascripts` and `app/assets/stylesheets` with the desired scripts and styles.
Then add them to Avo using the `_head.html.erb` partial.

```erb
# app/views/avo/partials/_head.html.erb

<%= javascript_include_tag 'avo_application' %>
<%= stylesheet_link_tag 'avo_application', media: 'all' %>
```
