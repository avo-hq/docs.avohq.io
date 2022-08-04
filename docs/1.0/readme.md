---
next: ./installation
---

# Get Started

Avo is a beautiful next-generation framework that empowers developers and teams to deliver fast and in a uniform way beautiful admin panels for your Ruby on Rails apps.

It's built with Hotwire so it speaks your favorite language, <span class="text-red-700">Ruby on Rails</span>.

Avo is a Ruby on Rails engine that runs isolated side by side with your app. It knows how to read and write the data you want to access.

<img :src="$withBase('/assets/img/avo-engine.jpg')" alt="Avo is a separate Rails engine" class="border mb-4" />

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
