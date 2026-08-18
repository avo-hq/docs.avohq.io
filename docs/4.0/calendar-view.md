---
license: addon
addon_link: https://avohq.io/addons/calendar-view
betaStatus: Beta
outline: [2, 3]
---

# Calendar view

Display a resource's records on a month or week calendar, right on the <Index /> view. Hour-based events show their start time — and stretch to their duration in the week view — all-day events render as filled bars (and land in the week view's all-day lane), and multi-day events span every day they cover. Clicking an event opens a preview popover with the fields marked `show_on: :preview`.

<Image src="/assets/img/4_0/calendar-view/month.webp" dark-src="/assets/img/4_0/calendar-view/month-dark.webp" width="1175" height="771" alt="The month calendar — timed event chips, a month-long all-day bar, a multi-day event spanning three days, and the Month/Week switcher." />

## Requirements

- Avo 4
- `avo-calendar_view` gem (paid add-on)

## Installation

### 1. Install the gem

```ruby
# Gemfile
gem "avo-calendar_view", source: "https://packager.dev/avo-hq/"
```

Then run `bundle install`.

### 2. Enable the view on a resource

Add `:calendar` to the resource's `view_types`:

```ruby
class Avo::Resources::Event < Avo::BaseResource
  self.view_types = [:table, :calendar] # [!code ++]
  self.default_view_type = :calendar # optional # [!code ++]

  def fields
    field :id, as: :id
    field :name, as: :text
    field :starts_at, as: :date_time
    field :ends_at, as: :date_time
  end
end
```

That adds the calendar to the view switcher next to table, grid, and map.

<Image src="/assets/img/4_0/calendar-view/index.webp" dark-src="/assets/img/4_0/calendar-view/index-dark.webp" width="1456" height="830" alt="The Events resource in calendar view — the month grid with timed chips, a multi-day event spanning four days, and the Month/Week switcher." />

## Configuration

Configure which attributes drive the calendar with `calendar_view`:

```ruby
class Avo::Resources::Event < Avo::BaseResource
  self.view_types = [:table, :calendar]
  self.calendar_view = {
    starts_at: :starts_at,       # attribute holding the event date/time
    ends_at: :ends_at,           # optional; enables multi-day events
    title: -> { record.name },   # optional; defaults to the record's title
    week_start: :monday,         # or :sunday (default :monday)
    default_period: :month,        # or :week — which grid opens first
    hide_weekends: false,        # true renders Monday–Friday only
    color: -> { record.status == "urgent" ? :red : :blue }, # optional chip color
    on_click: :preview           # or :show / :edit — what clicking an event opens
  }
end
```

<Option name="`starts_at`">

The attribute holding the event's date or time. This must be an **attribute name, not a proc** — the calendar queries the visible month's date range directly, so every record in the month is shown regardless of index pagination.

- **Type:** Symbol
- **Default:** the resource's first date or date-time field, falling back to `created_at`

</Option>

<Option name="`ends_at`">

The attribute holding the event's end. Setting it enables multi-day events; records whose end is `nil` render as single-day events.

- **Type:** Symbol
- **Default:** `nil` (all events are single-day)

</Option>

<Option name="`title`">

A proc returning the chip label, evaluated with `record` (and `resource`) in scope.

- **Type:** Proc
- **Default:** the record's title (the resource's `title` attribute)

</Option>

<Option name="`week_start`">

Which day the week starts on.

- **Type:** Symbol (`:monday` or `:sunday`)
- **Default:** `:monday`

</Option>

<Option name="`default_period`">

Which grid the calendar opens on. The user can always switch with the Month/Week toggle in the header.

- **Type:** Symbol (`:month` or `:week`)
- **Default:** `:month`

</Option>

<Option name="`hide_weekends`">

Renders Monday–Friday only. Events falling on a weekend are not displayed.

- **Type:** Boolean
- **Default:** `false`

</Option>

<Option name="`color`">

A proc returning the chip's color token, evaluated with `record` in scope. Valid tokens: `:blue`, `:green`, `:red`, `:orange`, `:purple`, `:pink`, `:teal`, `:gray` — anything else renders the default chip.

- **Type:** Proc
- **Default:** `nil` (neutral chips)

</Option>

<Option name="`on_click`">

What clicking an event chip opens:

- `:preview` — a popover with the record's preview fields (see [Event previews](#event-previews))
- `:show` — the record's <Show /> page
- `:edit` — the record's <Edit /> page

- **Type:** Symbol (`:preview`, `:show`, or `:edit`)
- **Default:** `:preview`

</Option>

## All-day and hour-based events

The event kind is inferred from the column type:

- a `date` column renders **all-day** chips
- a `datetime` column renders **hour-based** chips with an `HH:MM` label

```ruby
class Avo::Resources::Holiday < Avo::BaseResource
  self.view_types = [:table, :calendar]
  # No calendar_view needed — the first date field (`date`) is picked up
  # automatically and renders as all-day events.

  def fields
    field :name, as: :text
    field :date, as: :date
  end
end
```

## Month and week views

The header's Month/Week toggle switches between a month grid and a week time grid (carried in the `calendar_period` query param). In the week view, all-day and multi-day events sit in the all-day lane at the top, and hour-based events render as blocks stretched to their duration — an event without an end renders as one hour. Overlapping events share the day column side by side, each block showing its title under the start time. The grid scrolls under the pinned day-header row and all-day lane, and opens with the current time centred. When the week on screen is the current one, a red line runs across the day columns at the current time — a dot marking today's — and keeps itself up to date.

<Image src="/assets/img/4_0/calendar-view/week.webp" dark-src="/assets/img/4_0/calendar-view/week-dark.webp" width="1456" height="806" alt="The week view — event blocks stretched to their duration, three overlapping events sharing a day column side by side." />

### Read a crowded day

A month cell shows as many event lanes as fit its row and collapses the rest behind a **+N more** toggle. Activate it and the week row expands in place to reveal every event it holds — the other rows keep their height and the page scrolls — then **Show less** fits it back. Expansion is view state only: navigating or reloading resets it.

## Event previews

Clicking an event chip opens a popover with the record's preview — the fields marked `show_on: :preview` — and a link to the record. Cmd/Ctrl-click still opens the record directly.

If you'd rather skip the popover, set `on_click: :show` or `on_click: :edit` to navigate straight to the record's <Show /> or <Edit /> page. Without the popover, hovering a chip shows a tooltip with the full title, so truncated chips stay readable.

## Navigation and filtering

- The header's arrows navigate by month or week; the anchor date is carried in the `calendar_date` query param. The **Today** button jumps back to the current date.
- Filters and scopes applied on the index also apply to the calendar. Pagination does not — the calendar always shows the whole visible range (capped at 500 records).

:::info
There is no drag-to-reschedule yet.
:::
