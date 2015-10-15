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
// @require      https://rawgit.com/szego/SE-CommentPreview/master/MJPDEditing.js
// @require      https://rawgit.com/szego/pagedown/master/Markdown.Converter.js
// @require      https://pagedown.googlecode.com/hg/Markdown.Editor.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

function addPreview(jNode) {  //jNode is the comment entry text box
    var textAreaParentForm = jNode.parent().parent().parent().parent().parent();
    var commentidNum = textAreaParentForm.parent().parent()[0].id.replace( /^\D+/g, '');  // SE id number of comment being edited,
                                                                                          //  blank if adding new comment
    if (commentidNum.length == 0) {  // a new comment is being added
        commentidNum = textAreaParentForm[0].id.replace( /^\D+/g, '');  // SE id number of question/answer being commented on
    }
    
    setTimeout(function() {
        var previewPane = '<div style="display: none;">                                                                \
                               <hr style="margin-bottom:16px;margin-top:10px;">                                        \
                               <div id="wmd-button-bar-comment-' + commentidNum + '" style="display: none;"></div>     \
                               <div id="wmd-preview-comment-' + commentidNum + '" class"wmd-panel wmd-preview"></div>  \
                               <hr style="margin-top:17px;">                                                           \
                           </div>';

        textAreaParentForm.children().last().after(previewPane);

        jNode.attr('id', 'wmd-input-comment-' + commentidNum);

        var mdeditor = new Markdown.Editor(mdconverter, '-comment-' + commentidNum);
        mdeditor.run();

        MJPDEditing.prepareWmdForMathJax(mdeditor, '-comment-' + commentidNum, [["$", "$"], ["\\\\(","\\\\)"]]);

        var previewDiv = $('#wmd-preview-comment-' + commentidNum);

        /*

        var prev = new Preview(jNode, previewDiv);
        prev.callback = MathJax.Callback(["CreatePreview",prev]);
        prev.callback.autoReset = true;  // make sure it can run more than once
        
        jNode.on('input propertychange', function() {
            prev.Update();
        });

        if(jNode.val().length > 0) {
            prev.Update();
        }

        */

        // reveal the hidden preview pane
        textAreaParentForm.children().last().slideDown('fast');
        
        // remove the preview pane if the comment is submitted or editing is cancelled
        jNode.on('keyup', function(event) {
            if(event.which == 13 && jNode.val().length > 14) {  // comment was submitted via return key
                previewDiv.parent().remove();
                jNode.attr('id', '');
            }
        });
        textAreaParentForm.find('[value="Add Comment"]').on('click', function() {
            if(jNode.val().length > 14) {
                previewDiv.parent().remove();
                jNode.attr('id', '');
            }
        });
        textAreaParentForm.find('[class="edit-comment-cancel"]').on('click', function() {
            previewDiv.parent().remove();
            jNode.attr('id', '');
        });
    }, 500)
}

var mdconverter = Markdown.getSanitizingConverter();

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
