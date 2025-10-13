---
license: add_on
add_on: collaboration_feature
betaStatus: Beta
outline: [2,3]
---

# Authorization

Control who can view, create, and manage collaboration timeline entries using Avo's authorization system. The collaboration feature provides specific authorization methods to fine-tune access to different aspects of the collaboration timeline.

## Authorization Methods

<Option name="`collaboration_view_timeline?`">

Controls whether a user can view the collaboration timeline on a resource.

```ruby{3-6}
# app/policies/project_policy.rb
class ProjectPolicy < ApplicationPolicy
  def collaboration_view_timeline?
    # Only allow users who can view the record to see the timeline
    show?
  end
end
```
</Option>

<Option name="`collaboration_create_entry?`">

Controls whether a user can create new timeline entries (write messages and comments).

```ruby{3-6}
# app/policies/project_policy.rb
class ProjectPolicy < ApplicationPolicy
  def collaboration_create_entry?
    # Only allow team members to create timeline entries
    current_user.team_member? && show?
  end
end
```
</Option>

<Option name="`collaboration_destroy_entry?`">

Controls whether a user can destroy timeline entries. The `record` parameter can be either an action entry (automatically generated when watched attributes change) or a message entry (manually created by users).

```ruby{3-10}
# app/policies/project_policy.rb
class ProjectPolicy < ApplicationPolicy
  def collaboration_destroy_entry?
    # Users can only destroy their own message entries
    # Admins can destroy any entry
    return true if current_user.admin?

    # Only allow destroying message entries, not action entries
    record.is_a?(Avo::Collaborate::Comment) && record.author == current_user
  end
end
```
</Option>
