# TailwindCSS integration

We use TailwindCSS 3.0 with the JIT engine to style Avo, so on release we only pack the used Tailwind classes in our final css file. That's why, when you want to style your custom content (tools, resource tools, fields, or ejected partials), you won't have access to all of Tailwind's utility classes. It's a feature, not a bug. It's a performance optimization.

But there's an easy way to overcome that. You can add your own TailwindCSS process to watch for your the utility classes you use.

In versions prior to Avo 3, we maintained separate pre-compiled assets and provided a way to inject your Tailwind CSS assets into Avo's application. This often led to stylesheet conflicts. Now, we've improved integration by compiling a single stylesheet during the build process. If you want to add Tailwind configurations to Avo, your application will compile Avo's assets alongside your own in one build.

```bash
bin/rails generate avo:tailwindcss:install
```

That command will:

- install `tailwindcss-rails` gem if you haven't installed it yet;
- generate Avo's tailwind config.js `config/avo/tailwind.config.js`
- generate tailwind `base`, `components` and `utilities` under `app/assets/stylesheets/avo/tailwind` directory (workaround to import avo's base css after tailwind's base)
- create a custom `app/assets/stylesheets/avo/tailwind.css` file where you can further customize your Avo space;
- generate or enhance your `Procfile.dev` with the required compile `yarn avo:tailwindcss --watch` command, as per default `tailwindcss-rails` practices;
- add the build script to your `package.json`. **Ensure a `package.json` file is present;`yarn init` will generate one if your project doesn't have one**.
- add the following code to your `Rakefile`:
```ruby
# When running `rake assets:precompile` this is the order of events:
# 1 - Task `avo:yarn_install`
# 2 - Task `avo:sym_link`
# 3 - Cmd  `yarn avo:tailwindcss`
# 4 - Task `assets:precompile`
Rake::Task["assets:precompile"].enhance(["avo:sym_link"])
Rake::Task["avo:sym_link"].enhance(["avo:yarn_install"])
Rake::Task["avo:sym_link"].enhance do
  `yarn avo:tailwindcss`
end
```

Now, instead of running `bin/rails server`, you can run that Procfile with `bin/dev`.

:::info
You mileage may vary when running these tasks depending with your setup. The gist is that you need to run `yarn avo:tailwindcss` on deploy0time to compile the css file and `yarn avo:tailwindcss --watch` to watch for changes in development.
:::

Inside `app/assets/stylesheets/avo` you'll have a new `tailwind.css` file that's waiting for you to customize. The default `config/avo/tailwind.config.js` file should have the proper paths set up for purging and should be ready to go. Notice that it utilizes an preset that we manage, that preset is essential to build all avo's styles.

```css
@import 'tailwindcss/base';
/* Have all of Avo's custom and plugins styles available. */
@import '../../../../tmp/avo/avo.base.css';
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
