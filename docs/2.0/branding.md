---
version: '2.14'
license: pro
---

# Branding

Using the branding feature you can easily change the look of your app. You tweak it inside your `avo.rb` initializer in the `branding` attribute. It takes a hash with a few properties.

## Configure the colors

In order to customize the primary color of Avo you must configure the `colors` key with four color variants. `100` for color hints, `500` for the base primary color and `400` and `600` values for highlights.

```ruby
Avo.configure do |config|
  config.branding = {
    colors: {
      100 => "#C5F1D4",
      400 => "#3CD070",
      500 => "#30A65A",
      600 => "#247D43",
    }
  }
end
```

![](/assets/img/branding/green.jpg)


Avo uses [Tailwinds color system](https://tailwindcss.com/docs/customizing-colors). You can generate your own using the tools below.

 - [Palettte](https://palettte.app/)
 - [ColorBox](https://colorbox.io/)
 - [TailwindInk](https://tailwind.ink/)

Here are a few for you to choose from.

```ruby
config.branding = {
  colors: {
    # BLUE
    100 => "#CEE7F8",
    400 => "#399EE5",
    500 => "#0886DE",
    600 => "#066BB2",
    # RED
    100 => "#FACDD4",
    400 => "#F06A7D",
    500 => "#EB3851",
    600 => "#E60626",
    # GREEN
    100 => "#C5F1D4",
    400 => "#3CD070",
    500 => "#30A65A",
    600 => "#247D43",
    # ORANGE
    100 => "#FFECCC",
    400 => "#FFB435",
    500 => "#FFA102",
    600 => "#CC8102",
  }
}
```

## Customize the logo

We want to make it easy to change the logo for your app, so we added the `logo` and `logomark` options to the branding feature.

The `logo` should be the "big" logo you want to display on the desktop version of your app and `logomark` should be a squared-aspect image that Avo displays on the mobile version.

![](/assets/img/branding/logomark.gif)
