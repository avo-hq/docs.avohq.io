# Rewrite to-do

 - [x] associations
 - [x] associations/belongs_to.md
 - [x] associations/has_and_belongs_to_many.md
 - [x] associations/has_many.md
 - [x] associations/has_one.md
 - [x] associations/common/scopes_common.md
 - [x] associations/common/show_hide_buttons_common.md
 - [x] recipes
 - [x] actions.md
 - [x] associations.md
 - [x] authentication.md
 - [x] authorization.md
 - [x] cards.md
 - [x] custom-asset-pipeline.md
 - [x] custom-fields.md
 - [x] custom-tools.md
 - [x] customization.md
 - [x] dashboards.md
 - [x] evaluation-hosts.md
 - [x] faq.md
 - [x] field-options.md
 - [  ] fields.md
 - [x] filters.md
 - [x] grid-view.md
 - [] index.md
 - [x] installation.md
 - [x] licensing.md
 - [x] localization.md
 - [x] menu-editor.md
 - [x] recipes.md
 - [x] records-reordering.md
 - [x] resource-tools.md
 - [x] resources.md
 - [x] search.md
 - [x] stimulus-integration.md
 - [x] tabs.md
 - [x] upgrade.md


## Check each field

- grammarly
- options heading
- each option should have `defualt` and `possible values`
- the field should have images from different views
- version and license requirements


### Contributing

#### Field docs structure

We begin the file with the name of the field. Next we write the field declaration and a short description of what the field does. Next we should attach an image or gif with it.

The second section is the `Options` section marked by an `h2` (`##`) paragraph.

We should pass each option following this pattern:

```markdown
:::option `OPTION_NAME_IN_CODE_BLOCK`
Short description of the feature.

Code samples here.

Images here.

##### Default value

`THE_VALUE_IN_CODE_BLOCKS`

#### Possible values

Some possible values if they are known (`true`, `false`, `" "` `"on"`, `"off"`, etc.) or a text description about them.
:::
```

After the options, if the field has a lot of options and permutations and you'd like to show more, we can add an `## Examples` block.

Next are all the other things about the field. Maybe it requires some explanation
