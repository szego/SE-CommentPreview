## SE Comment Preview - Marked! - v. M0.3.1
An attempt to add real-time previewing when composing comments on Stack Exchange sites using the [Marked](../../../../chjj/marked) Markdown renderer.

This script creates a new live preview directly beneath any comment you compose or edit.

All versions of the script in this branch start with the letter **M**, for **M**arked.

#### Screenshot

![screenshot](../../raw/marked-for-markdown/screenshot.png)

#### Installation

In Chrome, install the Tampermonkey extension then click **[here](../../raw/marked-for-markdown/comment-preview.user.js)**.

#### About

Compared to the [main version of SE Comment Preview](../../), this version offers delayed rendering for the preview. Some users might find this behavior more agreeable, but it won't feel like the other editors with live previews on Stack Exchange sites.

Markdown is processed using [my fork](../../../../szego/marked/tree/disable-elements) of [Marked](../../../../chjj/marked). Math removal/replacement is handled using Stack Exchange's methods. These are coodinated with Marked using [Megh Parikh's implementation](../../../../meghprkh/markdown-mathjax).

See the source for more info.

#### Known issues
- Does not work on Firefox.
- The preview renders a wider variety of markdown than Stack Exchange allows in comments.
    - Workaround: don't use Markdown in comments that isn't allowed.
- Sometimes misses the last character or two when typing.
    - Workaround: type another character and it should catch up.

#### Wishlist
- Figure out how to get it working in Firefox.
