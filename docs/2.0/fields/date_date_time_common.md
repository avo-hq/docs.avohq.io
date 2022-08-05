### `first_day_of_week`

Set which should be the first dat of the week in the picker calendar. Flatpickr [documentation](https://flatpickr.js.org/localization/) on that. 1 is Monday, and 7 is Sunday.

#### Default value

`1`

#### Possible values

`1`, `2`, `3`, `4`, `5`, `6`, and `7`


### `disable_mobile`

By default, flatpickr is [disabled on mobile](https://flatpickr.js.org/mobile-support/) because the mobile date pickers tend to give a better experience, but you can override that using `disable_mobile: true` (misleading to set it to `true`, I know. We're just fowarding the option). That will override that behavior and display flatpickr on mobile devices too.

#### Default value

`false`

#### Possible values

`true`, `false`