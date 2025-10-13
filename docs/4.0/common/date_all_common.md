<Option name="`format`">

Format the date shown to the user on the `Index` and `Show` views.

#### Default

`{{ $frontmatter.default_format }}`

#### Possible values

Use [`luxon`](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) formatting tokens.
</Option>

<Option name="`picker_format`">

Format the date shown to the user on the `Edit` and `New` views.

#### Default

`{{ $frontmatter.default_picker_format }}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/formatting) formatting tokens.
</Option>


<Option name="`picker_options`">

Passes the options here to [flatpickr](https://flatpickr.js.org/).

#### Default

`{}`

#### Possible values

Use [`flatpickr`](https://flatpickr.js.org/options) options.
</Option>

<Option name="`disable_mobile`">

By default, flatpickr is [disabled on mobile](https://flatpickr.js.org/mobile-support/) because the mobile date pickers tend to give a better experience, but you can override that using `disable_mobile: true` (misleading to set it to `true`, I know. We're just forwarding the option). So that will override that behavior and display flatpickr on mobile devices too.

<!-- @include: ./../common/default_boolean_false.md -->

</Option>
