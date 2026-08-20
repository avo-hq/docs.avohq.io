---
license: addon
betaStatus: Beta
outline: [2, 3]
---

# What you can ask

A catalog of what the Avo AI assistant can do, with a prompt for each one. Everything here works in plain language — you never name a tool, and you never have to phrase a request a particular way.

The resource and field names in the examples are placeholders. Substitute your own: the assistant reads your resources, your columns, and your scopes at the moment you ask, so the vocabulary that works is the vocabulary of your admin.

For how a turn actually unfolds — schema, confirmation cards, authorization — see [How the assistant works](./ai.html#how-the-assistant-works). For the tool-by-tool reference, see [Agents and tools](./ai-agents-and-tools.html).

## Find records

| Ask                                              | What you get                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| "Find the user with the email ada@example.com"   | The matching record, named inline as a chip you can click                |
| "Find the user called John Deere"                | The record — found by search, even when the name lives across several columns |
| "Show me the 5 most recent posts"                | A short list, sorted by the timestamp that matches what you asked about  |
| "Which users signed up in the last 7 days?"      | A date-filtered list, resolved against the real current time             |
| "List projects whose name contains 'orbit'"      | A partial-match list                                                     |
| "Show me every column for post 42"               | The full record, not just the common columns                             |
| "Who signed up last?"                            | One record, named inline as a chip                                       |

Ranges, sets, and emptiness all work in the same sentence-shaped way: "orders over $500", "users older than 26", "posts with no author", "projects in draft or review".

**Naming a record in words is enough.** "The user called John Deere", "the post about pricing", "find Acme" — the assistant looks the record up the way your admin does: a resource that [configures search](./search.html) gets that exact search, and one that doesn't is matched across every text column you're allowed to read. A multi-word name still finds the record when its words live in different columns, so a first and last name stored separately aren't a problem. And "no such record" is only ever reported after that search came back empty — never off a guessed column filter.

**Your scopes are part of the vocabulary.** Domain words like "admins", "active", or "published" are usually named scopes on the model rather than columns, and the assistant prefers the scope over guessing at a filter — so "list the published posts" runs `Post.published`, whatever that scope actually does.

**Associations, without SQL.** "Which teams have no members?" and "show me users who have at least one order" are answered by checking whether the association exists, scoped to the child records you're allowed to see.

**Records are named inline.** Any record the assistant mentions is rendered as a chip in the
sentence itself — its picture, its title, and whatever status its resource declares — and clicking
it opens the record. So "who signed up last?" reads as one sentence with the person in it, not as a
paragraph followed by a card.

A chip appears because the assistant named that record in its answer, which is why a count never
brings one along: "how many projects?" names no project, so it shows none.

Ask for several and they come back as a list of rows — "the last three users" is three rows you can
scan and click, not a bulleted paragraph.

What a chip carries beyond the title is up to the resource — see
[Record chips](./ai.html#record-chips).

## Count and break down

Counts come from the real total, never from counting the rows on screen.

| Ask                                          | What you get                                    |
| -------------------------------------------- | ----------------------------------------------- |
| "How many orders do we have?"                | The total, even when only a page of rows was read |
| "How many posts per status?"                 | A count per value                               |
| "Which team has the most members?"           | Grouped counts, highest first                   |
| "Which author has published the fewest posts?" | Grouped counts, lowest first                   |

If a list is longer than one page, the assistant says so — "showing 25 of 54" — instead of quietly presenting a subset as the whole.

## Look around your admin

| Ask                                        | What you get                                                        |
| ------------------------------------------ | ------------------------------------------------------------------- |
| "What can you help me with?"               | A short description of what it does here                            |
| "Which resources are there?"               | Every resource you're allowed to see                                |
| "What fields does the Post resource have?" | Fields with their types, plus associations, scopes, and attachments |
| "What columns are on the users table?"     | Columns, indexes, and foreign keys                                  |
| "Which actions can I run on projects?"     | The actions that resource registers, and the inputs each takes      |

All of it is scoped to what you could already reach in the Avo UI. A resource your policies hide doesn't show up here either.

## Create records

Creates apply immediately — there's nothing to preview for a record that doesn't exist yet.

- **"Create a project called Orbit"** — the assistant asks only for values it genuinely needs, and never for optional fields you didn't mention.
- **"Add a user named Ada with the email ada@example.com and the admin role"** — several fields in one sentence.
- **"Add 15 cities"** — creating is the one write it repeats. It creates all fifteen without stopping to ask between them, filling required fields with sensible values, and closes with one line.

Each created record gets its own card with a link.

## Change and delete records

Both work one record at a time and both end in a card you confirm.

- **"Set the Orbit project's status to active"** — a card shows the record and each field's before → after value, with **Confirm** and **Cancel**.
- **"Rename the post 'Hello' to 'Hello world'"** — same card.
- **"Delete the test project"** — a card names the record and asks you to confirm.

**Your confirmation applies the change, not the model.** Confirm a card by clicking its button or by telling the assistant to go ahead — "do it", "run it", "yes" — which counts the same because the words are yours. Either way the assistant can propose a write but never perform one, and it can't talk its way past a Cancel.

**Ambiguity stops the write.** If "the Orbit project" matches three records, the assistant lists them and asks which one rather than picking. Bulk changes aren't offered at all: ask to update or delete many records and it will say it works one at a time.

## Undo something

Every executed write is recorded, so undo doesn't depend on the change still being visible in the conversation.

| Ask                                     | What happens                                               |
| --------------------------------------- | ---------------------------------------------------------- |
| "What have you changed in this chat?"    | The writes made here, newest first                        |
| "Undo that"                              | A card describing the undo, for you to confirm            |
| "Revert the status change on Orbit"      | The same, for a specific earlier write                    |

Undoing a create deletes the record it made; undoing an update restores the values it overwrote; undoing a delete re-creates the record. A write can only be undone once, and a change that left nothing behind to restore is reported as not undoable rather than attempted.

## Run your actions

The assistant runs the [actions](./actions.html) your resources register, so operations keep their business logic instead of being reconstructed field by field.

- **"Archive the Orbit project"** — finds the matching action, reads its inputs, and shows a confirmation card with the action's own fields rendered on it, prefilled with any values you named ("...reason: budget cut") and editable before you run.
- **"Publish this post"** — runs your publish action, notifications and all, rather than setting `published_at` behind its back.
- **"Export the users as CSV"** — [actions that run without records](./actions.html#run-an-action-without-records) work too.
- **"Which actions does this resource have?"** — lists them with their inputs when you'd rather look first.

Required inputs you didn't mention arrive as empty fields on the card for you to fill; the assistant never invents a value for them. Full detail in [Your actions, from the chat](./ai.html#your-actions-from-the-chat).

## Work with files

| Ask                                     | What you get                                              |
| --------------------------------------- | --------------------------------------------------------- |
| "How much storage are we using?"        | Totals by service, content type, and resource             |
| "Any orphaned uploads?"                 | Blobs attached to nothing                                 |
| "Do we have duplicate files?"           | Files sharing a checksum, and what de-duplicating frees   |
| "Is storage growing?"                   | Uploads per month                                         |
| "What are the biggest files?"           | The largest files and which records they belong to        |
| "Which products have no image?"         | Records missing an attachment                             |
| "Show me this post's cover"             | The file itself — images inline, video and audio with a player |
| "Show me the beach photo"               | A search by filename across everything you can see, Media Library files included |
| "Attach blob 42 to this post's cover"   | The file linked to the record                             |
| "Attach 260 to this post's cover"       | The same, from a [Media Library](./media-library.html) URL — its id is the blob id |
| "Attach the file I just sent to the cover" | A file you uploaded in this chat, linked to the record |
| "Attach https://example.com/logo.png as the cover" | A confirmation card with the URL and a preview — nothing is fetched until you click **Attach** |
| "Take the cover off this post"          | The file unlinked — the blob stays in the Media Library   |

Files are referenced by blob id, and the Media Library URL carries one: `/avo/media-library/260/edit` is blob 260. The assistant never uploads bytes itself — a file gets in either by riding along on your message or through a URL you confirm. Purging a file stays a manual action. See [Files and attachments](./ai.html#files-and-attachments) and [Getting new files in](./ai.html#getting-new-files-in).

## Ask about the page you're on

Start a chat from a page whose subject is one thing and "this" is already resolved — for the whole conversation, not just the first message.

From a record's page:

- **"What is this?"**
- **"Who owns it?"**
- **"Set its status to active"**
- **"Is anything missing here?"**

From one [Media Library](./media-library.html) file's page:

- **"What is this?"**
- **"Where is this used?"** — every record the file is attached to
- **"Attach this to the latest post's cover"**

From a conversation's page, starting a new chat from the bar:

- **"Summarize this"**
- **"What did we decide here?"**

A ribbon above the composer names the subject, and the ✕ at its end — or <kbd>Backspace</kbd> in an empty composer — starts the chat without it. See [What you start the chat from](./ai.html#what-you-start-the-chat-from).

## Ask about a file you sent

Attach files to your message — paperclip, drag, or paste — and ask about them directly:

- **"Summarize the attached CSV"**
- **"What's in this screenshot?"**
- **"Create a project for each row in this spreadsheet"**

The files stay on the message, so you can keep asking about them later in the conversation. Reading an image or a PDF takes a vision-capable model. See [Send files with a message](./ai.html#send-files-with-a-message).

## Manage the conversation

- **"Rename this conversation to 'Q3 invoices'"** — your exact wording, applied everywhere the title shows.
- **"Rename this conversation"** — with no name given, a fresh title is generated from where the conversation actually went.

New conversations title themselves after your first message. See [Renaming conversations](./ai-agents-and-tools.html#renaming-conversations).

You don't have to ask, either. The ⋯ menu next to the title renames the conversation without the assistant — **Rename chat** to type the title yourself, **Rename with AI** to have one generated — and the bar's menu adds **Copy as markdown**, which puts the conversation on your clipboard as plain text. See [The conversation menu](./ai.html#the-conversation-menu).

## What it won't do

Knowing the edges saves a round trip:

| It won't                                  | Because                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Update or delete many records at once     | Writes are one record at a time; it will ask you to pick                |
| Apply its own updates, deletes, or undos  | The card is yours to confirm — a click, or a quick "do it" in your own words |
| Delete a file from storage                | It can detach, never purge                                               |
| Touch anything your policies hide         | Every read and write is authorized for the signed-in user                |
| Take on substantial work unrelated to this app | Writing your blog post, debugging a codebase, a long translation, or a research report is someone else's job — it says so and offers what it can do instead |

Short of that it is good company: small talk, a joke, a quick factual aside, or a question about a file you dropped into the conversation all get a straight answer before it steers back to your data. Anything you put in front of it — an uploaded file, the Media Library file you started the chat from, text you pasted — counts as part of the conversation, so "what does this show?" is answered rather than declined.

A record you can't reach reports as "not found" rather than "not allowed", so the chat can't be used to probe for what exists.
