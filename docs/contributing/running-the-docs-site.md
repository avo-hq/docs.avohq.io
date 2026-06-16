---
title: Running the docs site
outline: [2, 3]
---

# Running the docs site

Practical notes for working on the Avo docs locally — running the site, the components you can use in Markdown, and a couple of frontmatter helpers.

## Run the docs site locally

Avo uses [VitePress](https://vitepress.dev/guide/getting-started) to generate the docs site.

To spin up a local server, run:

```bash
yarn install && yarn dev
```

The site will be available on `http://localhost:3011/`.

## Components

These components are available inside any Markdown page.

### `Demo`

`label` is optional.

```html
<Demo link="https://avodemo.com" label="See the demo" />
```

### `Option`

The per-option reference block used on API pages. See [Writing Avo docs](./writing-docs.html) for the full format.

```html
<Option name="`option_name`">…</Option>
```

## Show deeper links in the "On this page" section

Set `outline` in the page frontmatter:

```yaml
outline: [2,3] # shows the h2's and h3's
outline: deep  # shows the h2's all the way to h6
```

## Field docs structure

We begin the file with the name of the field. Next we write the field declaration and a short description of what the field does. Next we should attach an image or gif with it.

The second section is the `Options` section marked by an `h2` (`##`) paragraph.

We should pass each option following this pattern:

```markdown
<Option name="`OPTION_NAME_IN_CODE_BLOCK`">

Short description of the feature.

Code samples here.

Images here.

##### Default value

`THE_VALUE_IN_CODE_BLOCKS`

#### Possible values

Some possible values if they are known (`true`, `false`, `" "` `"on"`, `"off"`, etc.) or a text description about them.

</Option>
```

After the options, if the field has a lot of options and permutations and you'd like to show more, we can add an `## Examples` block.

Next are all the other things about the field. Maybe it requires some explanation.
