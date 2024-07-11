# Technical support

Avo is designed to be a self-serve product with [comprehensive documentation](https://docs.avohq.io) and [demo apps](#demo-apps) to be used as references.

But, even the best of us get stuck at some point and you might need a nudge in the right direction. There are a few levels of how can get help.

1. [Open Source Software Support Policy](#open-source-software-support-policy)
1. [Self-help](#self-help)
1. [Help from the official team](#official-support)

<!-- 1. [Free support](#free-support)
1. [Free chat support Thursday](#free-chat-support-thursday)
2. [Demo apps](#demo-apps)
3. [Paid support](#paid-support) -->

<!-- :::tip Help levels

::: -->

## Open Source Software Support

Avo's Open Source Software (OSS) support primarily revolves around assisting users with issues related to the Avo and other Avo libraries. This involves troubleshooting and providing solutions for problems originating from Avo or its related subcomponents.

However, it is crucial to understand that the OSS support does not extend to application-specific issues that do not originate from Avo or its related parts.
This includes but is not limited to:

- Incorrect application configurations unrelated to Avo.
- Conflicts with other libraries or frameworks within your application.
- Deployment issues on specific infrastructure or platforms.
- Application-specific runtime errors.
- Problems caused by third-party plugins or extensions.
- Data issues within your application.
- Issues related to application performance optimization.
- Integration problems with other services or databases.
- Design and architecture questions about your specific application.
- Language-specific issues are unrelated to Avo or other Avo libraries.

We acknowledge that understanding your specific applications and their configuration is essential, but due to the time and resource demands, this goes beyond the scope of our OSS support.

:::tip Enhanced support
For users seeking assistance with application-specific issues, we offer a few paid technical support plans. These subscriptions provide comprehensive support, including help with application-specific problems.

1. Priority chat support
2. Advanced hands-on support

For more information about our support plans, please visit [this](https://avohq.io/support) page.
:::

## Self help

This is how you can help yourself.

:::option 1. The docs

We work hard to ensure these documentation pages express everything Avo can do and keep them up to date.

<div class="pl-6">

#### 👈 Left Sidebar

From the sidebar you can check out the major sections where we grouped up similar pieces of information.

#### 🔎 Docs Search

We use Algolia DocSearch so you can quickly find what you're looking for.

#### 📚 Guides and FAQ page

We compiled a list of helpful [guides](./../3.0/guides.html) from ourselves and the community and a few [FAQ](./../3.0/faq.html) items for you to check out.

</div>
:::

::::option 2. GitHub Issues & Discussions

<div class="pl-6">

Avo is [LGPL-licensed](https://opensource.org/license/lgpl-3-0) and available on GitHub. We love to use [GitHub Issues](https://github.com/avo-hq/avo/issues/) to report bugs and [GitHub Discussions](https://github.com/avo-hq/avo/discussions) to receive feedback and suggestions.

There is no guarantee [w.r.t.](https://preply.com/en/question/what-does-wrt-mean-41448) response time to the reports nor is there any guarantee that issues will be resolved (e.g., fixed) within any time frame.

#### 😱 I'm in trouble

So, when you run into troubles, please go on the [issues](https://github.com/avo-hq/avo/issues?q=) section and search to see if anyone else encountered your issue and found a way to fix it.

Try out different queries as each person expresses themselves differently. Even if you don't find the exact same problem, it might give yout starting point.

#### 🐛 I found a bug

This is the perfect oportunity to open a [GitHub issue](https://avo.cool/new-issue). GitHub Issues is the perfect feature where one can ask questions, collaborate, reference other issues or PRs, or present screenshots and videos.

It would be great if you could go through all the information that the issue asks of you (versions and others) as it will help us understand the problem better and shorten the back and forth of us asking that same information.

The second great thing about GitHub Issues is that they are searchable and enables self-help for others.

#### 📣 I have some feedback

The next best way to send us your feedback and ideas si through GitHub Discussions. Think of GitHub Discussions like our forum where folks can share their thoughts.

:::info
We prefer GitHub Issues over any other form of communication.
:::

</div>
::::

:::option 3. Demo apps

These apps have been made to showcase the technical abilities of Avo. You can browse their source-code to uncover many examples of how you can use Avo in many environments and with advanced use-cases.

The [main demo app](https://main.avodemo.com/) is a catch-all all that mimics an internal tool. It has multiple examples about Avo's support to all the edge-cases you might encounter.

The [ticketing demo app](https://ticketing.avodemo.com/) is an example of how you could build a ticketing support app for your customers completely in Avo.
It also features websockets integration for live commenting on tickets alongside a custom tool that serves as a "Settings" page.
:::


:::option 4. Discord chat

Our [Discod Community](https://avo.cool/chat) is fantastic and it's growing everyday. Thank you for being a part of it.

The Discord server is a place where community members can connect, talk to each other, and ask and answer questions.

:::

## Help from the official team

You sometimes need help from the authors. There are a few ways to do that.

:::option 1. "Thursday is community day"

We know that sometimes you just need to ask a quick question and a chat is the best place for that.
From our experience, few quick questions are actually quick. Most of the times the answer is "it depends", and we need more information about the problem.

The Discord server has a few channels marked `#avo-2`, `#avo-3`, `#resources`, `#front-end`, `#fields`, and more to try to narrow down the issues. There's a bot that will open up a thread after each question so please use those threads to make it easier to track the conversation.

Due to the nature of how time-consuming it is, we can't offer free tech support.
We are lucky that other community members have experience and pitch in from time to time.

On Thursday we'll be present on the Discord server where we can answer your questions.

:::

:::option 2. Paid support

<!-- Due to the nature of how time-consuming support is, we can't treat each issue the same or allocate the same amount of time.
The policy is that if it's something simple that we can figure on the spot we will happily answer. If it's something we can reproduce really quick, we will do it and answer the inquiry. -->

<!-- But there are times when we can't reproduce it quickly and more information is needed. That's when we'll ask you to provide a reproduction repository where we can troubleshoot the issue on our local machines quickly by (preferably) just running the app and going through a few provided steps. -->

<!-- When none of the above can be run and the case requires pair programming sessions, we can offer those as a separate paid service. -->

The paid support chat comes in different flavours.

If you'd like to know more about that, see our standard plans [here](https://avohq.io/support) or reach out to us on [email](mailto:adrian@avohq.io?subject=I'd%20like%20to%20know%20more%20about%20your%20Tech%20Support%20plans&body=Hi%2C%0D%0A%0D%0AMy%20name%20is%20...%2C%20I%20represent%20...%2C%20and%20I'd%20like%20to%20know%20...).

:::

## Reproduction repository

The easiest way for us to troubleshoot and check on an issue is to send us a reproduction repository which we can install and run in our local environments.

```bash
# run this command to get a new Rails app with Avo installed
rails new -m https://avo.cool/new.rb AVO_APP
```

<iframe width="100%" height="344" src="https://www.youtube.com/embed/_zC5Ci7t7Lo" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
