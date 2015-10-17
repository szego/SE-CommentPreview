// ==UserScript==
// @name         SE Comment Preview
// @namespace    http://math.stackexchange.com/users/5531/
// @version      0.3.2
// @description  A userscript for Stack Exchange sites that adds a preview pane beneath comment input boxes
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @exclude      *://*.codereview.stackexchange.com/*
// @exclude      *://*.electronics.stackexchange.com/*
// @require      https://szego.github.io/SE-CommentPreview/MJPDEditing.mini.js
// @require      https://szego.github.io/pagedown/Markdown.Converter.mini.js
// @require      https://pagedown.googlecode.com/hg/Markdown.Editor.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

function addPreview(jNode) {  // jNode is the comment entry text box
    var textAreaParentForm = jNode.parent().parent().parent().parent().parent();
    var commentidNum = textAreaParentForm.parent().parent()[0].id.replace( /^\D+/g, '');  // SE id number of comment being edited,
                                                                                          //  blank if adding new comment
    if (commentidNum.length == 0) {  // a new comment is being added
        commentidNum = textAreaParentForm[0].id.replace( /^\D+/g, '');  // SE id number of question/answer being commented on
    }
    
    setTimeout(function() {
        var previewPane = '<div style="display: none;">                                                                                           \
                               <hr style="margin-bottom:16px;margin-top:10px;background-color:#ccc;border-bottom:1px dotted #fefefe;height:0px">  \
                               <div id="wmd-button-bar-comment-' + commentidNum + '" style="display: none;"></div>                                \
                               <div id="wmd-preview-comment-' + commentidNum + '" class"wmd-panel wmd-preview"></div>                             \
                               <hr style="margin-top:17px;background-color:#ccc;border-bottom:1px dotted #fefefe;height:0px">                     \
                           </div>';

        // insert the preview pane into the page
        textAreaParentForm.children().last().after(previewPane);

        // give the comment entry text box an id starting with "wmd-input"
        //  so that will be recognized by Pagedown
        jNode.attr('id', 'wmd-input-comment-' + commentidNum);

        // create a new Markdown.Converter and Markdown.Editor associated with jNode and the preview pane
        var mdconverter = Markdown.getSanitizingConverter();
        var mdeditor = new Markdown.Editor(mdconverter, '-comment-' + commentidNum);

        // coordinate mdeditor with MathJax rendering via MJPDEditing
        var mjpd = new MJPD();
        mjpd.Editing.prepareWmdForMathJax(mdeditor, '-comment-' + commentidNum, [["$", "$"], ["\\\\(","\\\\)"]]);

        mdeditor.run();

        // reveal the preview pane
        textAreaParentForm.children().last().slideDown('fast');

        var previewDiv = $('#wmd-preview-comment-' + commentidNum);
        
        // remove the preview pane if the comment is submitted or editing is cancelled
        jNode.on('keyup', function(event) {
            if(event.which == 13 && jNode.val().length > 14) {  // comment was submitted via return key
                previewDiv.parent().remove();
                jNode.attr('id', '');

                // remove all the hooks between the converter, editor, and MathJax
                mdconverter.hooks.addNoop('preConversion');
                mdconverter.hooks.addNoop('postConversion');
                mdeditor.hooks.addNoop("onPreviewRefresh");
            }
        });
        textAreaParentForm.find('[value="Add Comment"]').on('click', function() {
            if(jNode.val().length > 14) {
                previewDiv.parent().remove();
                jNode.attr('id', '');

                // remove all the hooks between the converter, editor, and MathJax
                mdconverter.hooks.addNoop('preConversion');
                mdconverter.hooks.addNoop('postConversion');
                mdeditor.hooks.addNoop("onPreviewRefresh");
            }
        });
        textAreaParentForm.find('[class="edit-comment-cancel"]').on('click', function() {
            previewDiv.parent().remove();
            jNode.attr('id', '');

            // remove all the hooks between the converter, editor, and MathJax
            mdconverter.hooks.addNoop('preConversion');
            mdconverter.hooks.addNoop('postConversion');
            mdeditor.hooks.addNoop("onPreviewRefresh");
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
