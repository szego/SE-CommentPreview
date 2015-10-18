## SE Comment Preview v0.4.0

An attempt to add real-time previewing when composing comments on Stack Exchange sites.

This script creates a new live preview directly beneath any comment you compose or edit.

#### Screenshot:

![screenshot](../../raw/master/screenshot.png)

#### Installation:

In Chrome, install the Tampermonkey extension then click [here](../../raw/master/comment-preview.user.js).

#### About

This script should make editing a comment feel almost exactly like editing an answer.

Markdown is processed using Stack Exchange's version of Pagedown. Coordination of MathJax with Pagedown is based on Stack Exchange's implementation.

See [the source](MJPDEditing.js) for more info.

#### Alternate version

If the preview pane seems too flickery you might prefer...

##### [SE Comment Preview - Marked!](../../tree/marked-for-markdown)

The Marked! version uses [Marked](../../../../chjj/marked) to process Markdown instead of Pagedown and waits for you to stop typing before updating the preview.

#### Known issues:
- Does not work on Firefox.
- The preview renders a wider variety of markdown than Stack Exchange allows in comments.
    - Workaround: don't use Markdown in comments that isn't allowed.

#### Wishlist:
- Figure out how to get this script working on Firefox.
