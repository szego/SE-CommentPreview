// ==UserScript==
// @name         SE Comment Preview
// @namespace    http://math.stackexchange.com/users/5531/
// @version      0.2
// @description  A userscript for Stack Exchange sites that adds a preview pane beneath comment input boxes
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @require      https://rawgit.com/szego/marked/disable-elements/lib/marked.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * The following is based on code written by Sergey Kirgizov for
 * a markdown+mathjax live preview example. It has been modified
 * to use jQuery and a custom fork of Marked.
 *
 * See: https://github.com/kerzol/markdown-mathjax
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

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

/**
 * Preview object, to be associated with each textarea + preview div.
 *
 * @param {jQuery} inputBox   - A jQuery object pointing to the
 *                               textarea element from which to create
 *                               the live preview.
 * @param {jQuery} previewBox - A jQuery object pointing to the div
 *                               element which will contain the live
 *                               preview.
 */
function Preview(inputBox, previewBox) {
    this.delay = 300;         // delay after keystroke before updating

    this.preview = previewBox;
    this.textarea = inputBox;

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
    text = this.Escape(text);  //Escape tags before doing stuff
    this.preview.html(text);
    this.oldtext = text;
    this.mjRunning = true;
    MathJax.Hub.Queue(
        ["Typeset",MathJax.Hub,this.preview[0].id],
        ["PreviewDone",this],
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
    text = this.preview.html();
    // replace occurrences of &gt; at the beginning of a new line
    // with > again, so Markdown blockquotes are handled correctly
    text = text.replace(/^&gt;/mg, '>');
    this.preview.html(marked(text));
};

Preview.prototype.Escape = function (html, encode) {
    return html
        .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * END code based on Sergey Kirgizov's markdown+mathjax example.
 *
 * See: https://github.com/kerzol/markdown-mathjax
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function addPreview(jNode) {  //jNode is the comment entry text box
    var textAreaParentForm = jNode.parent().parent().parent().parent().parent();
    var commentidNum = textAreaParentForm.parent().parent()[0].id.replace( /^\D+/g, '');  // SE id number of comment being edited,
                                                                                          //  blank if adding new comment
    if (commentidNum.length == 0) {  //a new comment is being added
        commentidNum = textAreaParentForm[0].id.replace( /^\D+/g, '');  // SE id number of question/answer being commented on
    }
    
    var newdivid = "comment-preview-" + commentidNum;

    setTimeout(function() {
        var previewPane = '<div style="display: none;"><hr style="margin-bottom:16px;margin-top:10px;"> \
                           <div id="' + newdivid + '"><span style="color: #999999">(comment preview)    \
                           </span></div><hr style="margin-top:17px;"></div>';

        textAreaParentForm.children().last().after(previewPane);

        var previewDiv = $('#' + newdivid);
        var prev = new Preview(jNode, previewDiv);
        prev.callback = MathJax.Callback(["CreatePreview",prev]);
        prev.callback.autoReset = true;  // make sure it can run more than once
        
        jNode.on('input propertychange', function() {
            prev.Update();
        });

        if(jNode.val().length > 0) {
            prev.Update();
        }

        // reveal the hidden preview pane
        textAreaParentForm.children().last().slideDown('fast');
        
        // remove the preview pane if the comment is submitted or editing is cancelled
        jNode.on('keyup', function(event) {
            if(event.which == 13 && jNode.val().length > 14) previewDiv.parent().remove();  // comment was submitted via return key
        });
        textAreaParentForm.find('[value="Add Comment"]').on('click', function() {
            if(jNode.val().length > 14) previewDiv.parent().remove();
        });
        textAreaParentForm.find('[class="edit-comment-cancel"]').on('click', function() {
            previewDiv.parent().remove();
        });
    }, 500)
}

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
