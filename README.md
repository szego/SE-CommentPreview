# SE Comment Preview
An attempt to add real-time previewing when composing comments on Stack Exchange sites.

Markdown is processed using [my fork](../../../../szego/marked/tree/disable-elements) of [Marked](../../../../chijj/marked).

#### Screenshot:

![screenshot](../../raw/master/screenshot.png)

#### Installation:

In Chrome, install the Tampermonkey extension then click [here](../../raw/master/comment-preview.user.js).

#### Known issues:
- Does not work on Firefox.
- The preview renders a wider variety of markdown than Stack Exchange allows in comments.
    - Workaround: don't use Markdown in comments that isn't allowed.
- Doesn't use MathJax preferences that have been set from the context menu.

#### To do:
- Change the Markdown renderer to Pagedown.
    - This would allow more finely-tuned Markdown restrictions.
- (tentative) Get it working on Firefox.

#### Wishlist:
- Figure out how to use the MathJax and/or Markdown renderer loaded by the Stack Exchange site.
