## SE Comment Preview v0.3.2
An attempt to add real-time previewing when composing comments on Stack Exchange sites using the [marked](../../../../chjj/marked) Markdown renderer.

This script creates a new live preview directly beneath any comment you compose or edit.

#### Screenshot

![screenshot](../../raw/master/screenshot.png)

#### Installation

In Chrome, install the Tampermonkey extension then click **[here](../../raw/master/comment-preview.user.js)**.

#### About

Markdown is processed using [my fork](../../../../szego/marked/tree/disable-elements) of [marked](../../../../chjj/marked). Math removal/replacement is handled using Stack Exchange's methods. These are coodinated with marked using [Megh Parikh's implementation](../../../../meghprkh/markdown-mathjax).

See the source for more info.

#### Known issues
- Does not work on Firefox.
- The preview renders a wider variety of markdown than Stack Exchange allows in comments.
    - *Workaround:* Don't use Markdown in comments that isn't allowed.
- Sometimes misses the last character or two when typing.
    - *Workaround:* Type another character and it should catch up.

#### Wishlist
- Figure out how to get it working in Firefox.

#### Alternate version

If you're curious (like me) you might be interested in...

##### [SE Comment Preview - Paged!](../../tree/pagedown-for-markdown)

The Paged! version uses Stack Exchange's version of Pagedown instead of marked to process Markdown. The previews in that version are much more responsive but break other things on the page.
