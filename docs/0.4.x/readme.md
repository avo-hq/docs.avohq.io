---
next: ./installation
---

# Get Started

Avo is a beautiful next-generation framework that empowers you, the developer, to create fantastic admin panels for your Ruby on Rails apps with the flexibility to fit your needs as you grow.

## Overview of Avo

The primary goal of Avo is to administer your database records. To do that Avo, uses the concept of a [**Resource**](./resources.html). Each Avo `Resource` corresponds to a Rails `Model`.

The next step after you define your `Resource` is to map the database fields, so Avo knows what data to display from the database and how to display it. Each field declaration adds a column of data into the `Index` view or a row in the `Show`, `Edit`, and `Create` views.

There are the basic fields like [text](./fields.html#text), [textarea](./fields.html#textarea), [select](./fields.html#select) and [boolean](./fields.html#boolean), and the more complex ones like [trix](./fields.html#trix), [markdown](./fields.html#markdown), [gravatar](./fields.html#gravatar), [boolean_group](./fields.html#boolean_group), and [key_value](./fields.html#key_value). There's even an amazing [file](./fields.html#file) field that's tightly integrated with `Active Storage`. **You've never added files integration as easy as this before.**

After you've set up your resources with the desired fields, you may want to filter them based on certain conditions. You can easily do that with Avo filters. You just generate the filter, set up the desired options and, add it to one or more resources.

Similarly, Avo makes it easy to apply transformations to one or more resources using [Actions](./actions.html). Actions can run by themselves or have configured fields that take your input before they run.

## Next up

Now that you know the basics, you can:

1. [Install Avo in your app](./installation.html).
1. [Create a Resource](./resources.html#defining-resources).
1. [Explore the live demo app](https://avodemo.herokuapp.com).
1. Explore these docs.
1. Enjoy building your app without ever worrying about the admin again.
