# Getting Started

Avo is a tool that helps developers and teams build apps 10x faster. It takes the things we always build for every app and abstracts them in familiar configuration files.

It has three main parts:

1. [The CRUD UI](#_1-the-crud-ui)
2. [Dashboards](#_2-dashboards)
3. [The custom content](#_3-the-custom-content)

## 1. The CRUD UI

If before, we built apps by creating layouts, adding controller methods to extract _data_ from the database, display it on the screen, worrying how we present it to the user, capture the users input as best we can and writing logic to send that data back to the database, Avo takes a different approach.

It only needs to know what kind of data you need to expose and what type it is. After that, it takes care of the rest.
You **tell it** you need to manage Users, Projects, Products, or any other types of data and what properties they have; `first_name` as `text`, `birthday` as `date`, `cover_photo` as `file` and so on.

There are the basic fields like [text](./fields/text), [textarea](./fields/textarea), [select](./fields/select) and [boolean](./fields/boolean), and the more complex ones like [trix](./fields/trix), [markdown](./fields/markdown), [gravatar](./fields/gravatar), and [boolean_group](./fields/boolean_group). There's even an amazing [file](./fields/file) field that's tightly integrated with `Active Storage`. **You've never added files integration as easy as this before.**

## 2. Dashboards

Most apps need a way of displaying the stats in an aggregated form. Using the same configuration-based approach, Avo makes it so easy to display data in metric cards, charts, and even lets you take over using partial cards.

## 3. Custom content
Avo is a shell in which you develop your app. It offers a familiar DSL to configure the app you're building, but sometimes you might have custom needs. That's where the custom content comes in.

You can extend Avo in different layers. For example, in the CRUD UI, you may add [Custom fields](./custom-fields) that slot in perfectly in the current panels and in each view. You can also add [Resource tools](./resource-tools) to control the experience using standard Rails partials completely.

You can even create [Custom tools](./custom-tools) where you can add all the content you need using Rails partials or View Components.

Most of the places where records are listed like [Has many associations](./associations/has_many), [attach modals](./associations/belongs_to.html#belongs-to-attach-scope), [search](./search), and more are scopable to meet your multi-tenancy scenarios.

Most of the views you see are exportable using the [`eject` command](./customization#eject-views).

StimulusJS is deeply baked into the CRUD UI and helps you extend the UI and make a complete experience for your users.

## Seamless upgrades

Avo comes packaged as a [gem](https://rubygems.org/gems/avo). Therefore, it does not pollute your app with its internal files. Instead, everything is tucked away neatly in the package.

That makes for a beautiful upgrade experience. You hit `bundle update avo` and get the newest and best of Avo without any file conflicts.

## Next up

Please take your time and read the documentation pages to see how Avo interacts with your app and how one should use it.

<!-- 1. [Rails and Hotwire](./rails-and-hotwire)
1. [Installation](./installation)
1. [Authentication](./authentication)
1. [Authorization](./authorization) -->
1. [Install Avo in your app](./installation.html)
1. [Set up the current user](authentication.html#customize-the-current-user-method)
1. [Create a Resource](./resources.html#defining-resources)
1. [Set up authorization](authorization.html)
1. [Set up licensing](licensing)
1. [Explore the live demo app](https://main.avodemo.com/)
1. Explore these docs
1. Enjoy building your app without ever worrying about the admin layer ever again
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
