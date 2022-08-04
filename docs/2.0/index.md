---
next: ./installation
---

# Get Started

Avo is a beautiful next-generation framework that empowers developers and teams to deliver fast and in a uniform way beautiful admin panels for your Ruby on Rails apps.

It's built with Hotwire so it speaks your favorite language, <span class="text-red-700">Ruby on Rails</span>.

Avo is a Ruby on Rails engine that runs isolated side by side with your app. It knows how to read and write the data you want to access.

![Avo is a separate Rails engine](/assets/img/avo-engine.jpg)
<!-- <img :src="('/assets/img/avo-engine.jpg')" alt="Avo is a separate Rails engine" class="border mb-4" /> -->

## Overview of Avo

In the future we want Avo to be the central place where you do your work like manage resources, update app settings, view stats and dashboards and, bring your own functionality. At the moment, the primary goal of Avo is to administer your database records. To do that, it uses the concept of a [**Resource**](./resources.html). Each Avo `Resource` corresponds to a Rails `Model`.

The next step after you define your `Resource` is to map the database fields, so Avo knows what data to display from the database and how to display it. Each field declaration adds a column of data into the **Index** view and, a row in the **Show**, **Edit**, and **Create** views.

There are the basic fields like [text](./fields.html#text), [textarea](./fields.html#textarea), [select](./fields.html#select) and [boolean](./fields.html#boolean), and the more complex ones like [trix](./fields.html#trix), [markdown](./fields.html#markdown), [gravatar](./fields.html#gravatar), and [boolean_group](./fields.html#boolean_group). There's even an amazing [file](./fields.html#file) field that's tightly integrated with `Active Storage`. **You've never added files integration as easy as this before.**

After you've set up your resources with the desired fields, you may want to filter them based on certain conditions. You can easily do that with Avo filters. You just generate the filter, set up the desired options and, add it to one or more resources.

Similarly, Avo makes it easy to apply transformations to one or more resources using [Actions](./actions.html). Actions can run by themselves or have configured fields that take your input before they run.

## Seamless upgrades

Avo comes packaged as a gem. It does not pollute your app with its internal files. Instead, everything is tucked away neatly in the package.

That makes for a wonderful upgrade experience. You hit `bundle update avo`, and you get the newest and best of Avo without any file conflicts.

## Next up

Now that you know the basics, you can:

1. [Install Avo in your app](./installation.html)
1. [Set up the current user](authentication.html#customize-the-current-user-method)
1. [Create a Resource](./resources.html#defining-resources)
1. [Set up authorization](authorization.html)
1. [Set up licensing](licensing)
1. [Explore the live demo app](https://avodemo.herokuapp.com)
1. Explore these docs
1. Enjoy building your app without ever worrying about the admin again
1. Explore the [FAQ](faq) pages for guides on how to set up your Avo instance.

## Walkthrough videos

### Build a blog admin panel

<br/>

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/WgNK-oINFww" title="Build a production-ready blog admin panel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

### Build a booking app

<br/>

<div class="aspect-video">
  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/BK47E7TMXn0" title="Build a booking app in less than an hour" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>


## Sponsors

<div class="bg-white">
  <div class="w-full mx-auto py-12">
    <p class="text-center text-base font-semibold uppercase text-gray-600 tracking-wider">Business Sponsors</p>
    <div class="mt-6 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-8">
      <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
        <a href="https://github.com/sponsors/adrianthedev"
          target="_blank"
          title="Sponsor Avo"
        >
          <img class="max-h-12 opacity-30" src="/img/sponsors/your-logo-here.png" alt="Sponsor Avo">
        </a>
      </div>
      <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
        <a href="https://www.equipetechnique.com?ref=avo"
          target="_blank"
          title="Equipe Technique – 10+ years seniority in software services ready to serve"
        >
          <img class="max-h-12" src="/img/sponsors/ET-dark.jpeg" alt="Equipe Technique">
        </a>
      </div>
      <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
        <a href="https://github.com/sponsors/adrianthedev"
          target="_blank"
          title="Sponsor Avo"
        >
          <img class="max-h-12 opacity-30" src="/img/sponsors/sponsor.png" alt="Sponsor Avo">
        </a>
      </div>
    </div>
  </div>

  <div class="w-full mx-auto py-12">
    <p class="text-center text-base font-semibold uppercase text-gray-600 tracking-wider">Startup Sponsors</p>
    <div class="mt-6 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-8">
      <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
        <a href="https://github.com/sponsors/adrianthedev"
          target="_blank"
          title="Sponsor Avo"
        >
          <img class="max-h-12 opacity-30" src="/img/sponsors/your-logo-here.png" alt="Sponsor Avo">
        </a>
      </div>
      <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
        <a href="https://www.wyndy.com/?ref=avo"
          target="_blank"
          title="Wyndy – Get a sitter in seconds. Post any job for free."
        >
          <img class="max-h-12" src="/img/sponsors/wyndy.png" alt="Wyndy">
        </a>
      </div>
      <div class="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
        <a href="https://github.com/sponsors/adrianthedev"
          target="_blank"
          title="Sponsor Avo"
        >
          <img class="max-h-12 opacity-30" src="/img/sponsors/sponsor.png" alt="Sponsor Avo">
        </a>
      </div>
    </div>
  </div>
</div>
