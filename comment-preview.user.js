// ==UserScript==
// @name         SE Comment Preview
// @namespace    https://github.com/szego/SE-CommentPreview/
// @version      0.3.3
// @description  A userscript for Stack Exchange sites that adds a preview pane beneath comment input boxes
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @require      https://szego.github.io/marked/lib/marked.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * The following is based on Megh Parikh's fork of Sergey Kirgizov's
 * markdown+mathjax live preview example, which are in turn based
 * on the "second dynamic example" written by the MathJax team.
 * 
 * It has been modified to use jQuery and a custom fork of Marked. The
 * contents of processMarkdownAndTeX are taken from Stack Exchange's current
 * version of mathjax-editing.js.
 *
 * See: http://github.com/meghprkh/markdown-mathjax
 *      http://cdn.mathjax.org/mathjax/latest/test/sample-dynamic-2.html
 *      http://github.com/szego/marked/tree/disable-elements
 *      http://dev.stackoverflow.com/content/js/mathjax-editing.js
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

 marked.setOptions({
    gfm: false,
    pedantic: false,
    sanitize: false,  // IMPORTANT, because we do MathJax before markdown,
                      //  however we do escaping in 'CreatePreview'.
    smartLists: true,
    smartypants: false,

    disabledElements: [ 'newline',
                        'hr',
                        'heading',
                        'lheading',
                        'blockquote',
                        'list',
                        'html',
                        'def',
                        'paragraph',
                        'bullet',
                        'item',
                        'br' ]
});

function processMarkdownAndTeX(text, delim) {
    var ready = false; // true after initial typeset is complete
    var pending = false; // true when MathJax has been requested
    var preview = null; // the preview container
    var inline = delim; // the inline math delimiter
    var blocks, start, end, last, braces; // used in searching for math
    var math; // stores math until markdone is done
    var HUB = MathJax.Hub;

    //
    //  Runs after initial typeset
    // 
    HUB.Queue(function () {
        ready = true;
        HUB.processUpdateTime = 50; // reduce update time so that we can cancel easier
        HUB.Config({
            "HTML-CSS": {
                EqnChunk: 10,
                EqnChunkFactor: 1
            },
            // reduce chunk for more frequent updates
            SVG: {
                EqnChunk: 10,
                EqnChunkFactor: 1
            }
        });
    });

    //
    //  The pattern for math delimiters and special symbols
    //    needed for searching for math in the page.
    //
    var SPLIT = /(\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;

    //
    //  The math is in blocks i through j, so 
    //    collect it into one block and clear the others.
    //  Replace &, <, and > by named entities.
    //  For IE, put <br> at the ends of comments since IE removes \n.
    //  Clear the current math positions and store the index of the
    //    math, then push the math string onto the storage array.
    //
    function processMath(i, j, preProcess) {
        var block = blocks.slice(i, j + 1).join("").replace(/&/g, "&amp;")  // use HTML entity for &
                                                   .replace(/</g, "&lt;")   // use HTML entity for <
                                                   .replace(/>/g, "&gt;");  // use HTML entity for >
        if (HUB.Browser.isMSIE) {
            block = block.replace(/(%[^\n]*)\n/g, "$1<br/>\n")
        }
        while (j > i) {
            blocks[j] = "";
            j--;
        }
        blocks[i] = "@@" + math.length + "@@";
        if (preProcess)
            block = preProcess(block);
        math.push(block);
        start = end = last = null;
    }


    var capturingStringSplit;
    if ("aba".split(/(b)/).length === 3) {
        capturingStringSplit = function (str, regex) { return str.split(regex) }
    }
    else { // IE8
        capturingStringSplit = function (str, regex) {
            var result = [], match;
            if (!regex.global) {
                var source = regex.toString(),
                    flags = "";
                source = source.replace(/^\/(.*)\/([im]*)$/, function (wholematch, re, fl) { flags = fl; return re; });
                regex = new RegExp(source, flags + "g");
            }
            regex.lastIndex = 0;
            var lastPos = 0;
            while (match = regex.exec(str))
            {
                result.push(str.substring(lastPos, match.index));
                result.push.apply(result, match.slice(1));
                lastPos = match.index + match[0].length;
            }
            result.push(str.substring(lastPos));
            return result;
        }
    }
    

    //
    //  Break up the text into its component parts and search
    //    through them for math delimiters, braces, linebreaks, etc.
    //  Math delimiters must match and braces must balance.
    //  Don't allow math to pass through a double linebreak
    //    (which will be a paragraph).
    //
    function removeMath(text) {
        start = end = last = null; // for tracking math delimiters
        math = []; // stores math strings for latter
        
        // Except for extreme edge cases, this should catch precisely those pieces of the markdown
        // source that will later be turned into code spans. While MathJax will not TeXify code spans,
        // we still have to consider them at this point; the following issue has happened several times:
        //
        //     `$foo` and `$bar` are varibales.  -->  <code>$foo ` and `$bar</code> are variables.

        var hasCodeSpans = /`/.test(text),
            deTilde;
        if (hasCodeSpans) {
            text = text.replace(/~/g, "~T").replace(/(^|[^\\`])(`+)(?!`)([^\n]*?[^`\n])\2(?!`)/gm, function (wholematch) {
                return wholematch.replace(/\$/g, "~D");
            });
            deTilde = function (text) { return text.replace(/~([TD])/g, function (wholematch, character) { return { T: "~", D: "$" }[character]; }) };
        } else {
            deTilde = function (text) { return text; };
        }
        
        
        blocks = capturingStringSplit(text.replace(/\r\n?/g, "\n"), SPLIT);
        
        for (var i = 1, m = blocks.length; i < m; i += 2) {
            var block = blocks[i];
            if (block.charAt(0) === "@") {
                //
                //  Things that look like our math markers will get
                //  stored and then retrieved along with the math.
                //
                blocks[i] = "@@" + math.length + "@@";
                math.push(block);
            }
            else if (start) {
                //
                //  If we are in math, look for the end delimiter,
                //    but don't go past double line breaks, and
                //    and balance braces within the math.
                //
                if (block === end) {
                    if (braces) {
                        last = i
                    }
                    else {
                        processMath(start, i, deTilde)
                    }
                }
                else if (block.match(/\n.*\n/)) {
                    if (last) {
                        i = last;
                        processMath(start, i, deTilde)
                    }
                    start = end = last = null;
                    braces = 0;
                }
                else if (block === "{") {
                    braces++
                }
                else if (block === "}" && braces) {
                    braces--
                }
            }
            else {
                //
                //  Look for math start delimiters and when
                //    found, set up the end delimiter.
                //
                if (block === inline || block === "$$") {
                    start = i;
                    end = block;
                    braces = 0;
                }
                else if (block.substr(1, 5) === "begin") {
                    start = i;
                    end = "\\end" + block.substr(6);
                    braces = 0;
                }
            }
        }
        if (last) {
            processMath(start, last, deTilde)
        }
        return deTilde(blocks.join(""));
    }

    //
    //  Put back the math strings that were saved,
    //    and clear the math array (no need to keep it around).
    //  
    function replaceMath(text) {
        text = text.replace(/@@(\d+)@@/g, function (match, n) {
            return math[n]
        });
        math = null;
        return text;
    }

    // Remove math then neuter HTML tags since they do nothing in Stack Exchange
    //  comments anyway, run marked, then put the math back into the text.
    text = removeMath(text).replace(/&/g, "&amp;")  // use HTML entity for &
                           .replace(/</g, "&lt;")   // use HTML entity for <
                           .replace(/>/g, "&gt;");  // use HTML entity for >;
    text = marked(text);
    text = replaceMath(text);
    return text; 
}

/**
 * Preview object, to be associated with each textarea + preview div.
 *
 * @param {jQuery} input  - A jQuery object pointing to the
 *                           textarea element from which to create
 *                           the live preview.
 * @param {jQuery} output - A jQuery object pointing to the div
 *                           element which will contain the live
 *                           preview.
 */
function Preview(input, output) {
    this.delay = 300;         // delay after keystroke before updating

    this.textarea = input;
    this.preview = output;

    this.timeout = null;     // store setTimout id
    this.mjRunning = false;  // true when MathJax is processing
    this.oldText = null;     // used to check if an update is needed  
}

//
//  This gets called when a key is pressed in the textarea.
//  We check if there is already a pending update and clear it if so.
//  Then set up an update to occur after a small delay (so if more keys
//    are pressed, the update won't occur until after there has been 
//    a pause in the typing).
//  The callback function is set up below, after the Preview object is set up.
//
Preview.prototype.Update = function () {
    if (this.timeout) {clearTimeout(this.timeout)}
    this.timeout = setTimeout(this.callback,this.delay);
};

//
//  Creates the preview and runs MathJax on it.
//  If MathJax is already trying to render the code, return
//  If the text hasn't changed, return
//  Otherwise, indicate that MathJax is running, and start the
//    typesetting.  After it is done, call PreviewDone.
//  
Preview.prototype.CreatePreview = function () {
    this.timeout = null;
    if (this.mjRunning) return;
    var text = this.textarea.val();
    if (text === this.oldtext) return;
    this.oldtext = text;
    text = processMarkdownAndTeX(text, inlineDelimiter);
    this.preview.html(text);
    this.mjRunning = true;
    MathJax.Hub.Queue(
        ["Typeset", MathJax.Hub,this.preview[0].id],
        ["PreviewDone", this],
        ["resetEquationNumbers", MathJax.InputJax.TeX]
    );
};

//
//  Indicate that MathJax is no longer running,
//  do markdown over MathJax's result, 
//  and swap the buffers to show the results.
//
Preview.prototype.PreviewDone = function () {
    this.mjRunning = false;
};

/**
 * PreviewWithoutJax object, to be associated with each textarea + preview div.
 *
 * @param {jQuery} input  - A jQuery object pointing to the
 *                           textarea element from which to create
 *                           the live preview.
 * @param {jQuery} output - A jQuery object pointing to the div
 *                           element which will contain the live
 *                           preview.
 */
function PreviewWithoutJax(input, output) {
    this.textarea = input;
    this.preview = output;
}

PreviewWithoutJax.prototype.Update = function () {
    // Remove math then neuter HTML tags since they do nothing in Stack Exchange
    //  comments anyway, run marked, then insert the result into the preview pane.
    this.preview.html(marked(
        this.textarea.val().replace(/&/g, "&amp;") // use HTML entity for &
                           .replace(/</g, "&lt;")  // use HTML entity for <
                           .replace(/>/g, "&gt;")  // use HTML entity for >
    ));
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * END code based on Megh Parikh's fork of Sergey Kirgizov's
 * markdown+mathjax example.
 *
 * See: https://github.com/meghprkh/markdown-mathjax
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function addPreview(jNode) {  // jNode is the comment entry text box
    var textAreaParentForm = jNode.parent().parent().parent().parent().parent();
    var commentidNum = textAreaParentForm.parent().parent()[0].id.replace( /^\D+/g, '');  // SE id number of comment being edited,
                                                                                          //  blank if adding new comment
    if (commentidNum.length == 0) {  // a new comment is being added
        commentidNum = textAreaParentForm[0].id.replace( /^\D+/g, '');  // SE id number of question/answer being commented on
    }
    
    var newdivid = "comment-preview-" + commentidNum;

    setTimeout(function() {
        var previewPane = '<div style="display: none;">                                                                                                 \
                               <hr style="margin-bottom:16px;margin-top:10px;background-color:rgba(0,0,0,0);border-bottom:1px dotted #ccc;height:0px;"> \
                               <div id="' + newdivid + '">                                                                                              \
                                   <span style="color: #999999">(comment preview)</span>                                                                \
                               </div>                                                                                                                   \
                               <hr style="margin-top:17px;background-color:rgba(0,0,0,0);border-bottom:1px dotted #ccc;height:0px;">                    \
                           </div>';

        textAreaParentForm.children().last().after(previewPane);

        // check if the current page has MathJax and instantiate the
        //  appropriate kind of Preview object
        var previewDiv = $('#' + newdivid);
        var prev;
        if(typeof MathJax != 'undefined') {
            prev = new Preview(jNode, previewDiv);
            prev.callback = MathJax.Callback(["CreatePreview", prev]);
            prev.callback.autoReset = true;  // make sure it can run more than once
        } else {
            prev = new PreviewWithoutJax(jNode, previewDiv);
        }
        
        jNode.on('input propertychange', function() {
            prev.Update();
        });

        if(jNode.val().length > 0)
            prev.Update();

        // reveal the hidden preview pane
        textAreaParentForm.children().last().slideDown('fast');
        
        // remove the preview pane if the comment is submitted or editing is cancelled
        var previewDivParent = previewDiv.parent();
        jNode.on('keyup', function(event) {
            if(event.which == 13 && jNode.val().length > 14) {  // comment was submitted via return key
                previewDivParent.remove();
                prev.Update = $.noop;
            }
        });
        textAreaParentForm.find('[value="Add Comment"]').on('click', function() {
            if(jNode.val().length > 14) {
                previewDivParent.remove();
                prev.Update = $.noop;
            }
        });
        textAreaParentForm.find('[class="edit-comment-cancel"]').on('click', function() {
            previewDivParent.remove();
            prev.Update = $.noop;
        });
    }, 500)
}

// set the inline math delimiter (site-specific)
var inlineDelimiter;
if (window.location.pathname.indexOf('electronics.stackexchange') < 0 && window.location.pathname.indexOf('codereview.stackexchange') < 0)
    inlineDelimiter = '$';
else
    inlineDelimiter = '\\$';

waitForKeyElements('[name="comment"]', addPreview);

// When a new comment on a question/answer is being composed for the
//  first time on a page the waitForKeyElements() listener above adds
//  a preview pane.
//
//  After the comment is submitted the textarea isn't deleted---
//  instead, one of its ancestors is hidden. If the user starts
//  composing another new comment on the same question/answer the
//  ancestor is unhidden, so waitForKeyElements() doesn't notice.
//
//  Below we set up the listeners for these unhide events.

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutationRecord) {
        if(mutationRecord.oldValue === 'display: none;') {
            addPreview( $(mutationRecord.target).find('textarea') );
        }
    });
});

var targets = $('[id^="add-comment-"]');
for(i = 0; i < targets.length; i++) {
    observer.observe(targets.eq(i)[0], { attributes : true, attributeOldValue : true, target : true, attributeFilter : ['style'] });
}
