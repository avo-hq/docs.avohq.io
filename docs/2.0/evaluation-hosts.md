# Evaluation hosts

[[toc]]

Avo is a package that does a lot of meta-programming. This means we have a lot of custom functionality passed from the host app to Avo to be executed in different points in time. That functionality can't always be performed in void but requires some pieces of state. We're going to talk all about them below.
You'll probably never going to implement the hosts yourself, but you'll want to know what they contain and how they work.

Usually, this happens using lambdas. That's why we created the concept of a `Host`.

## What's a host?

A `Host` is an object that holds some pieces of state on which we execute a lambda function.

## `BaseHost`

The `BaseHost` holds some of the most basic pieces of state like the request `params`, Avo's [`context`](customization.html#context) object, the [`view_context`](https://apidock.com/rails/AbstractController/Rendering/view_context) object, and the `current_user`.

As the name states, this is the base host. All other hosts are inherited from it.

### `params`

The `params` object is the regular [`params`](https://guides.rubyonrails.org/action_controller_overview.html#parameters) object you are used to.

### Avo's `context` object

As you progress throughout building your app, you'll probably configure a [`context`](customization.html#context) object to hold some custom state you need. In `BaseHost` you have access to this object.

### The `view_context` object

The [`view_context`](https://apidock.com/rails/AbstractController/Rendering/view_context) object can be used to create the route helpers you are used to (EX: `posts_path`, `new_comment_path`, etc.).

When dealing with the `view_context` you have to lean on the object to get those paths. Also, because we are operating under an engine (Avo) the paths must be prefixed with the engine name. Rails' is `main_app`. So if you'd like to output a route to your app `/comments/5/edit`, instead of writing `edit_comment_path 5`, you'd write `view_context.main_app.edit_comment_path 5`.

### The current user

Provided that you set up the [`:current_user_method`](authentication.html#customize-the-current-user-method), you'll have access to that output using `current_user` in this block.

## Evaluating the block

We talked about the host and the pieces of state it holds; now let's talk about how we can use it.

You're not going to use it when building with Avo. It is used internally when you pass in a block to customize the behavior. For example, it's being used when declaring the `visibility` block on [`dashboards`](dashboards.html#dashboards-visibility) or when you try to pre-fill the suggestions for the `tags` field.

Not all blocks you declare in Avo will be executed in a `Host`. We started implementing `Host`s since v2.0 after the experience gained with v1.0. We plan on refactoring the old block to hosts at some point, but that's going to be a breaking change, so probably in v3.0.
You'll probably be prompted in the docs on each block if it's a `Host` or not.

Different hosts have different pieces of state.

## `RecordHost`

The `RecordHost` inherits from `BaseHost` and has the `record` available. The `record` is the actual model class instantiated with the DB information (like doing `User.find 1`) in that context.
