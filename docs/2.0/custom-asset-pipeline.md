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

## Your custom assets

Avo makes it easy to use your own styles and javascript through your already set up asset pipeline. It just hooks on to it to inject the new assets to be used in Avo.

## Use TailwindCSS utility classes

We use TailwindCSS 3.0 with the JIT engine to style Avo, so on release we only pack the used Tailwind classes in our final css file. That's why, when you want to style your custom content (tools, resource tools, fields, or ejected partials), you won't have access to all of Tailwind's utility classes. It's a performance optimization.

But there's an easy way to overcome that limitation. You can add your own TailwindCSS process to watch for your the utility classes you use.

To do that, you need to run the `bin/rails generate avo:tailwindcss:install` command. That will:

- install `tailwindcss-rails` gem if you haven't installed it yet;
- create a custom `avo.tailwind.css` file where you can further customize your Avo space;
- generate or enhance your `Procfile.dev` with the required tailwind compile command, as per default `tailwindcss-rails` practices;
- add the resulting file in your `_pre_head.html.erb` file.

Now, instead of running `bin/rails server`, you can run that Procfile with `bin/dev` or `foreman start -f Procfile.dev`.

:::info
You mileage may vary when running these tasks depending with your setup. The gist is that you need to run `avo:tailwindcss:build` to compile the css file and `avo:tailwindcss:watch` to watch for changes in development.
:::

Inside `app/assets/stylesheets` you'll have a new `avo.tailwind.css` file that's waiting for you to customize. The default `tailwind.config.js` file should have the proper paths set up for purging and should be ready to go.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/*

@layer components {
  .btn-primary {
    @apply py-2 px-4 bg-blue-200;
  }
}

*/
```

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

To take advantage of that you can run `bin/rails generate avo:js:install --bundler esbuild`. That will:

- eject the `_head.html.erb` file;
- add the `avo.custom.js` asset to it;
- create the `avo.custom.js` file under `app/javascript` which will be your entrypoint.

That will be picked up by the `build` script and create it's own `assets/builds/avo.custom.js` file that will, in turn, be picked up by sprockets or propshaft and loaded into your app.

## Use `js-bundling` with `rollup` or `webpack`

Avo supports the other bundlers too but we just don't have a generator command to configure them for you. If you use the other bundlers and have configured them to use custom assets, then please [open up a PR](https://github.com/avo-hq/avo) and help the community get started faster.

## Manually add your CSS and JS assets

In order to manually add your assets you have to eject the `_pre_head.html.erb` partial (`bin/rails generate avo:eject :pre_head`), create the asset files (examples below), and add the asset files from your pipeline to the `_pre_head` partial. Then, your asset pipeline will pick up those assets and use add them to your app.

:::warning
You should add your custom styles to `_pre_head.html.erb`, versus `_head.html.erb` to avoid overriding Avo's default styles. This

The order in which Avo loads the partials and asset files is this one:

1. `_pre_head.html.erb`
2. Avo's CSS and JS assets
3. `_head.html.erb`
:::

![Avo and the asset pipeline](/assets/img/asset-pipeline.jpg)

### Sprockets and Propshaft

Create `avo.custom.js` and `avo.custom.css` inside `app/assets/javascripts` and `app/assets/stylesheets` with the desired scripts and styles.
Then add them to Avo using the `_pre_head.html.erb` partial (`rails generate avo:eject :pre_head`).

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
Then add them to Avo using the `_pre_head.html.erb` partial (`rails generate avo:eject :pre_head`).

```erb
# app/views/avo/partials/_pre_head.html.erb

<%= javascript_pack_tag 'avo.custom', defer: true %>
<%= stylesheet_pack_tag 'avo.custom', media: 'all' %>
```
