# SE Comment Preview - Marked! ver. M0.3
An attempt to add real-time previewing when composing comments on Stack Exchange sites using the [Marked](../../../../chijj/marked) Markdown renderer.

All versions of the script in this branch start with the letter **M**, for **M**arked.

#### Screenshot:

![screenshot](../../raw/master/screenshot.png)

#### Installation:

In Chrome, install the Tampermonkey extension then click **[here](../../raw/master/comment-preview.user.js)**.

#### Notes on the implementation:

Markdown is processed using [my fork](../../../../szego/marked/tree/disable-elements) of [Marked](../../../../chijj/marked).

Math removal/replacement is handled using Stack Exchange's methods. These are coodinated with Marked using [Megh Parikh's implementation](../../../../meghprkh/markdown-mathjax).

See the source for more info.

#### Known issues:
- Does not work on Firefox.
- The preview renders a wider variety of markdown than Stack Exchange allows in comments.
    - Workaround: don't use Markdown in comments that isn't allowed.
- Doesn't use MathJax preferences that have been set from the context menu.

#### To do:
- Implement some of the nice features from the [main branch](../master).

#### Wishlist:
- Figure out how to use the MathJax and/or Markdown renderer loaded by the Stack Exchange site.
- Figure out how to get it working in Firefox.
