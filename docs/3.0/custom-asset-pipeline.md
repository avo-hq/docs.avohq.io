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

In versions prior to Avo 3, we maintained separate pre-compiled assets and provided a way to inject your Tailwind CSS assets into Avo's application. This often led to stylesheet conflicts. Now, we've improved integration by compiling a single stylesheet during the build process. If you want to add Tailwind configurations to Avo, your application will compile Avo's assets alongside your own in one build.

```bash
bin/rails generate avo:tailwindcss:install
```

That command will:

- install `tailwindcss-rails` gem if you haven't installed it yet;
- generate Avo's tailwind config.js `config/avo/tailwind.config.js`
- generate tailwind `base`, `components` and `utilities` under `app/assets/stylesheets/avo/tailwind` directory (workaround to import avo's base css after tailwind's base)
- create a custom `app/assets/stylesheets/avo/tailwind.css` file where you can further customize your Avo space;
- generate or enhance your `Procfile.dev` with the required compile `yarn avo:tailwind:css --watch` command, as per default `tailwindcss-rails` practices;
- enhance your `package.json` file with the build script. **Make sure `package.json` is present, `npm init` will generate one if your project does'n have it**.
- enhance your `Rake` file with the following code:
```ruby
# When running `rake assets:precompile` this is the order of events:
# 1 - Task `avo:yarn_install`
# 2 - Task `avo:sym_link`
# 3 - Cmd  `yarn avo:tailwind:css`
# 4 - Task `assets:precompile`
Rake::Task["assets:precompile"].enhance(["avo:sym_link"])
Rake::Task["avo:sym_link"].enhance(["avo:yarn_install"])
Rake::Task["avo:sym_link"].enhance do
  `yarn avo:tailwind:css`
end
```

Now, instead of running `bin/rails server`, you can run that Procfile with `bin/dev`.

:::info
You mileage may vary when running these tasks depending with your setup. The gist is that you need to run `yarn avo:tailwind:css` on deploy0time to compile the css file and `yarn avo:tailwind:css --watch` to watch for changes in development.
:::

Inside `app/assets/stylesheets/avo` you'll have a new `tailwind.css` file that's waiting for you to customize. The default `config/avo/tailwind.config.js` file should have the proper paths set up for purging and should be ready to go. Notice that it utilizes an preset that we manage, that preset is essential to build all avo's styles.

```css
@import 'tailwindcss/base';
/* Have all of Avo's custom and plugins styles available. */
@import '../../../../tmp/avo/base.css';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/*

@layer components {
  .btn-primary {
    @apply py-2 px-4 bg-blue-200;
  }
}

*/
```

:::warning Avo Task Dependencies
You must ensure that the `avo:sym_link` and `avo:yarn_install` tasks are executed before building the Avo assets.

These tasks are responsible for creating various symbolic links within the `tmp/avo` directory and installing necessary Node modules within Avo's path. These modules are essential for utilizing the Avo Tailwind preset. And the symbolic links are essentials for purging all Avo's tailwind classes.
:::

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

![Avo and the asset pipeline](/assets/img/asset-pipeline.jpg)

### Sprockets and Propshaft

Create `avo.custom.js` and `avo.custom.css` inside `app/assets/javascripts` and `app/assets/stylesheets` with the desired scripts and styles.
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
