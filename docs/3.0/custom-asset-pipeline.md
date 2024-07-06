---
feedbackId: 943
demoVideo: https://youtu.be/0NForGDgk50
---

# Custom asset pipeline

Avo plays well with most Rails asset pipelines.

| Asset pipeline | Avo compatibility |
|---------------|------------|
| [importmap](https://github.com/rails/importmap-rails) | ✅ Fully supported |
| [Propshaft](https://github.com/rails/propshaft)       | ✅ Fully supported |
| [Sprockets](https://github.com/rails/sprockets)       | ✅ Fully supported |
| [Webpacker](https://github.com/rails/webpacker)       | 🛻 Only with Sprockets or Propshaft |

There are two things we need to mention when communicating about assets.

1. Avo's assets
2. You custom assets

## Avo's assets

We chose to impact your app, and your deploy processes as little as possible. That's why we bundle up Avo's assets when we publish on [rubygems](https://rubygems.org/gems/avo), so you don't have to do anything else when you deploy your app. Avo doesn't require a NodeJS, or any kind of any other special environment in your deploy process.

Under the hood Avo uses TailwindCSS 3.0 with the JIT engine and bundles the assets using [`jsbundling`](https://github.com/rails/jsbundling-rails) with `esbuild`.

## Exclude servings Avo assets from a CDN?
If you utilize a Content Delivery Network (CDN) for serving assets and you want to exclude Avo paths from the default asset host you may use the following code snippet.

```ruby
config.action_controller.asset_host = Proc.new do |source|
  # Exclude assets under the "/avo" path from CDN
  next nil if source.start_with?("/avo")

  # Set the general asset host (CDN) using an environment variable
  ENV.fetch("ASSET_HOST")
end
```

This configuration ensures that assets are served through the specified CDN, except for those under the `/avo` path. Adjust the paths and environment variable as needed for your application.

## Your custom assets

Avo makes it easy to use your own styles and javascript through your already set up asset pipeline. It just hooks on to it to inject the new assets to be used in Avo.

## Use TailwindCSS utility classes

Please follow the dedicated [TailwindCSS integration guide](./tailwindcss-integration.html).

## Add custom JS code and Stimulus controllers

There are more ways of dealing with JS assets, and Avo handles that well.

## Use Importmap to add your assets

Importmap has become the default way of dealing with assets in Rails 7. For you to start using custom JS assets with Avo and importmap you should run this install command `bin/rails generate avo:js:install`. That will:

- create your `avo.custom.js` file as your JS entrypoint;
- add it to the `app/views/avo/partials/_head.html.erb` partial so Avo knows to load it;
- pin it in your `importmap.rb` file so `importmap-rails` knows to pick it up.

## Use `js-bundling` with `esbuild`

`js-bundling` gives you a bit more flexibility and power when it comes to assets. We use that under the hood and we'll use it to expose your custom JS assets.

When you install `js-bundling` with `esbuild` you get this npm script `"build": esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets`. That script will take all your JS entrypoint files under `app/javascript` and bundle them under `assets/builds`.

```bash
bin/rails generate avo:js:install --bundler esbuild
```

That command will:

- eject the `_head.html.erb` file;
- add the `avo.custom.js` asset to it;
- create the `avo.custom.js` file under `app/javascript` which will be your entrypoint.

That will be picked up by the `build` script and create it's own `assets/builds/avo.custom.js` file that will, in turn, be picked up by sprockets or propshaft and loaded into your app.

## Use `js-bundling` with `rollup` or `webpack`

Avo supports the other bundlers too but we just don't have a generator command to configure them for you. If you use the other bundlers and have configured them to use custom assets, then please [open up a PR](https://github.com/avo-hq/avo) and help the community get started faster.

## Manually add your CSS and JS assets

In order to manually add your assets you have to eject the `_pre_head.html.erb` partial (`bin/rails generate avo:eject --partial :pre_head`), create the asset files (examples below), and add the asset files from your pipeline to the `_pre_head` partial. Then, your asset pipeline will pick up those assets and use add them to your app.

:::warning
You should add your custom styles to `_pre_head.html.erb`, versus `_head.html.erb` to avoid overriding Avo's default styles. This

The order in which Avo loads the partials and asset files is this one:

1. `_pre_head.html.erb`
2. Avo's CSS and JS assets
3. `_head.html.erb`
:::

<Image src="/assets/img/asset-pipeline.jpg" width="2258" height="1874" alt="Avo and the asset pipeline" />

### Sprockets and Propshaft

Create `avo.custom.js` to the `app/javascripts` directory and `avo.custom.css` to `app/assets/stylesheets` with the desired scripts and styles.
Then add them to Avo using the `_pre_head.html.erb` partial (`rails generate avo:eject --partial :pre_head`).

```erb
# app/views/avo/partials/_pre_head.html.erb

<%= javascript_include_tag 'avo.custom', defer: true %>
<%= stylesheet_link_tag 'avo.custom', media: 'all' %>
```

:::warning
Please ensure that when using `javascript_include_tag` you add the `defer: true` option so the browser will use the same loading strategy as Avo's and the javascript files are loaded in the right order.
:::

### Webpacker

:::warning
We removed support for webpacker. In order to use Avo with your assets you must install Sprockets or Propshaft in order to serve assets like SVG, CSS, or JS files.
:::

:::info
Instructions below are for Webpacker version 6. Version 5 has different paths (`app/javascript/packs`).
:::

Create `avo.custom.js` and `avo.custom.css` inside `app/packs/entrypoints` with the desired scripts and styles.
Then add them to Avo using the `_pre_head.html.erb` partial (`rails generate avo:eject --partial :pre_head`).

```erb
# app/views/avo/partials/_pre_head.html.erb

<%= javascript_pack_tag 'avo.custom', defer: true %>
<%= stylesheet_pack_tag 'avo.custom', media: 'all' %>
```
