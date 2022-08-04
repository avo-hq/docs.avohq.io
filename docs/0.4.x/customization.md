# Customize Avo

[[toc]]

## Change the app name

On the main navbar next to the logo Avo generates a link to the homepage of your app. The label for the link is usually computed from your Rails app name. You can customize that however you want using `config.app_name = 'Avocadelicious'`.

## Timezone and currency

In your data-rich app you might have a few fields where you reference `date`, `datetime` and `currency` fields. You may customize the global timezone and currency with `config.timezone = 'UTC'` and `config.currency = 'USD'` config options.

## Views

You can customize some layout partials. Run `bin/rails generate avo:views` to create the default partials.

### Logo

In the `app/views/vendor/avo/partials` directory you will find the `_logo.html.erb` partial which you may customize however you want. It will be displayed in place of Avo's logo.

<img :src="$withBase('/assets/img/customization/logo.jpg')" alt="Avo logo customization" class="border mb-4" />

### Header

The `_header.html.erb` partial enables you to customize the name and link of your app.

<img :src="$withBase('/assets/img/customization/header.jpg')" alt="Avo header customization" class="border mb-4" />

### Footer

The `_footer.html.erb` partial enables you to customize the footer of your admin.

<img :src="$withBase('/assets/img/customization/footer.jpg')" alt="Avo footer customization" class="border mb-4" />

### Scripts

The `_scripts.html.erb` partial enables you to insert scripts in the footer of your admin.

### Resource Index view

There are a few customization options to change the ways resources are displayed in the `Index` view.

#### Resources per page

You my customize how many resources you can view per page with `config.per_page = 24`.

<img :src="$withBase('/assets/img/resource-index/per-page-config.jpg')" alt="Per page config" class="border mb-4" />

#### Per page steps

Similarly customize the per-page steps in the per-page picker with `config.per_page_steps = [12, 24, 48, 72]`.

<img :src="$withBase('/assets/img/resource-index/per-page-steps.jpg')" alt="Per page config" class="border mb-4" />

#### Resources via per page

For `has_many` associations you can control how many resources are visible in their `Index view` with `config.via_per_page = 8`.

#### Default view type

The `ResourceIndex` component supports two view types `:table` and `:grid`. You can change that by `config.default_view_type = :table`. Read more on the [grid view configuration page](./grid-view.html).

<div class="grid grid-flow-row sm:grid-flow-col sm:grid-cols-2 gap-2 w-full">
  <div class="w-full">
    <strong>Table view</strong>
    <img :src="$withBase('/assets/img/customization/table-view.png')" alt="Table view" class="border mb-4" />
  </div>
  <div class="w-full">
    <strong>Grid view</strong>
    <img :src="$withBase('/assets/img/customization/grid-view.png')" alt="Grid view" class="border mb-4" />
  </div>
</div>

<!-- @todo: add docs for this ### ID links to resource -->
<!-- @todo: add docs for use_partials custom functionality -->