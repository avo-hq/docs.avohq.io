---
version: '2.15'
betaStatus: Open beta
license: pro
---

# Branding

```ruby
Avo.configure do |config|
  config.branding = {
    colors: {
      background: "248 246 242",
      100 => "#C5F1D4",
      400 => "#3CD070",
      500 => "#30A65A",
      600 => "#247D43",
    },
    chart_colors: ['#FFB435', "#FFA102", "#CC8102", '#FFB435', "#FFA102", "#CC8102"],
    logo: "/avo-assets/logo.png",
    logomark: "/avo-assets/logomark.png"
  }
end
```

Using the branding feature, you can easily change the look of your app. You tweak it inside your `avo.rb` initializer in the `branding` attribute. It takes a hash with a few properties.

## Configure brand color

To customize the primary color of Avo, you must configure the `colors` key with four color variants. `100` for color hints, `500` for the base primary color, and `400` and `600` values for highlights.

```ruby{4-8}
Avo.configure do |config|
  config.branding = {
    colors: {
      background: "248 246 242",
      100 => "#C5F1D4",
      400 => "#3CD070",
      500 => "#30A65A",
      600 => "#247D43",
    }
  }
end
```

You may also customize the color of Avo's background using the `background` key.

![](/assets/img/branding/green.jpg)

![](/assets/img/branding/red.jpg)

![](/assets/img/branding/orange.jpg)

:::info
The color format can be hex (starting with `#`) or rgb (three groups split by a space, not a comma).
:::


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

## Customize the chart colors

For your dashboard, you can further customize the colors of the charts. You can do that using the `chart_colors` option. Pass in an array of colors, and Avo will do the rest.

```ruby
Avo.configure do |config|
  config.branding = {
    chart_colors: ['#FFB435', "#FFA102", "#CC8102", '#FFB435', "#FFA102", "#CC8102"],
  }
end
```

![](/assets/img/branding/chart-colors.jpg)

:::warning
The chart colors should be hex colors. They are forwarded to chart.js
:::

## Customize the logo

We want to make it easy to change the logo for your app, so we added the `logo` and `logomark` options to the branding feature.

The `logo` should be the "big" logo you want to display on the desktop version of your app, and `logomark` should be a squared-aspect image that Avo displays on the mobile version.

![](/assets/img/branding/logomark.gif)
