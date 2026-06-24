---
license: community
---

# Avatar

The `Avatar` field is a field that displays a user's avatar or initials.

<Image src="/assets/img/4_0/fields/avatar/index.png" dark-src="/assets/img/4_0/fields/avatar/index-dark.png" width="1776" height="758" alt="An Avo index table with three columns — ID, an Avatar column showing each user's square avatar thumbnail, and Name — illustrating the avatar field rendered on the Index view." prompt="index page" />

```ruby
field :avatar, as: :avatar
```

It does not take any option and is visible only on the <Index /> view.
