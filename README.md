## SE Comment Preview v0.3.2

An attempt to add real-time previewing when composing comments on Stack Exchange sites.

Markdown is processed using Pagedown, which has been slightly reorganized in [my fork](../../../../szego/pagedown) to work as a @require in Tampermonkey. Coordination of MathJax with Pagedown is based on [Davide Cervone's solution](http://stackoverflow.com/questions/11228558/let-pagedown-and-mathjax-work-together/21563171#comment17371250_11231030).

#### Screenshot:

![screenshot](../../raw/master/screenshot.png)

#### Installation:

In Chrome, install the Tampermonkey extension then click [here](../../raw/master/comment-preview.user.js).

#### Known issues:
- Does not work on Firefox.
- Does not work on [Code Review SE](http://codereview.stackexchange.com/) or [Electrical Engineering SE](http://electronics.stackexchange.com/).
- The preview renders a wider variety of markdown than Stack Exchange allows in comments.
    - Workaround: don't use Markdown in comments that isn't allowed.

#### To do:
- *(tentative)* Get it working on [Code Review SE](http://codereview.stackexchange.com/) and [Electrical Engineering SE](http://electronics.stackexchange.com/) if there is interest. The main problem is that they use different math delimiters, namely `\$` instead of `$` or `$$`.

#### Wishlist:
- Figure out how to use the MathJax and/or Markdown renderer loaded by the Stack Exchange site.
- Figure out how to get this script working on Firefox.
