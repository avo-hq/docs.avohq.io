---
version: '2.18'
license: community
---

# Time

<!-- Replace this image with one of the Time field -->
<Image src="/assets/img/fields/time.png" width="1674" height="402" alt="" />

The `Time` field is similar to the [DateTime](./date_time) field and uses the time picker of flatpickr (without the calendar). You can use the `time_24hr` option for flatpickr to use the 24-hour format. Add the option `relative: false` if you want the time to stay absolute and not change based on the browser's timezone.

```ruby
field :starting_at,
  as: :time,
  picker_format: 'H:i',
  format: "HH:mm",
  relative: true,
  picker_options: {
    time_24hr: true
  }
```


<Option name="`format`">

Format the date shown to the user on the `Index` and `Show` views.

#### Default

`TT`

#### Possible values

Use [`luxon`](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) formatting tokens.
</Option>

<Option name="`picker_format`">

Format the date shown to the user on the `Edit` and `New` views.

#### Default

`H:i:S`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/formatting) formatting tokens.
</Option>

<Option name="`picker_options`">

Passes the options here to [flatpickr](https://flatpickr.js.org/).

#### Default

`{}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/options) options.

:::warning
These options may override other options like `picker_options`.
:::

</Option>
