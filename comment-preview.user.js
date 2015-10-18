// ==UserScript==
// @name         SE Comment Preview
// @namespace    https://github.com/szego/SE-CommentPreview
// @version      0.4.0
// @description  A userscript for Stack Exchange sites that adds a preview pane beneath comment input boxes
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @require      https://cdn.sstatic.net/Js/wmd.en.js
// @require      https://szego.github.io/SE-CommentPreview/MJPDEditing.mini.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

function addPreview(jNode) {  // jNode is the comment entry text box
    var textAreaParentForm = jNode.parent().parent().parent().parent().parent();
    var commentidNum = textAreaParentForm.parent().parent()[0].id.replace( /^\D+/g, '');  // SE id number of comment being edited,
                                                                                          //  blank if adding new comment
    if (commentidNum.length == 0) {  // a new comment is being added
        commentidNum = textAreaParentForm[0].id.replace( /^\D+/g, '');  // SE id number of question/answer being commented on
    }
    
    setTimeout(function() {
        // options for the Markdown editor below
        var options = {
            postfix: '-comment-' + commentidNum,
            heartbeatType: 'answer',
            convertImagesToLinks: false,
            reputationToPostImages: null,
            bindNavPrevention: true,
            noCode: true,
            onDemand: false
        };
        var postfix = options.postfix;

        // elements in the preview pane are given unique IDs that will be recognized by Pagedown
        var previewPane = '<div style="display: none;">                                                                                           \
                               <hr style="margin-bottom:16px;margin-top:10px;background-color:#ccc;border-bottom:1px dotted #fefefe;height:0px">  \
                               <div id="wmd-button-bar' + postfix + '" style="display: none;"></div>                                \
                               <div id="wmd-preview' + postfix + '" class"wmd-panel wmd-preview"></div>                             \
                               <hr style="margin-top:17px;background-color:#ccc;border-bottom:1px dotted #fefefe;height:0px">                     \
                           </div>';

        // insert the preview pane into the page
        textAreaParentForm.children().last().after(previewPane);

        // give the comment entry text box an id that it will be recognized by Pagedown
        jNode.attr('id', 'wmd-input' + postfix);

        // create a new Markdown editor associated with jNode and the preview pane
        var mdeditor = new StackExchange.MarkdownEditor(options);

        // coordinate mdeditor with MathJax rendering via MJPDEditing
        var mjpd = new MJPD();
        if (window.location.pathname.indexOf('electronics.stackexchange') < 0 && window.location.pathname.indexOf('codereview.stackexchange') < 0)
            mjpd.Editing.prepareWmdForMathJax(mdeditor, postfix, [["$", "$"]]);
        else
            mjpd.Editing.prepareWmdForMathJax(mdeditor, postfix, [["\\$", "\\$"]]);
        mdeditor.run();
        mdeditor.refreshPreview();

        // reveal the preview pane
        textAreaParentForm.children().last().slideDown('fast');
        
        // remove the preview pane if the comment is submitted or editing is cancelled
        var previewDivParent = $('#wmd-preview' + postfix).parent();
        var mdconverter = mdeditor.getConverter();
        jNode.on('keyup', function(event) {
            if(event.which == 13 && jNode.val().length > 14) {  // comment was submitted via return key
                previewDivParent.remove();
                jNode.attr('id', '');

                // remove all the hooks between the converter, editor, and MathJax
                mdconverter.hooks.addNoop('preConversion');
                mdconverter.hooks.addNoop('postConversion');
                mdeditor.hooks.addNoop("onPreviewRefresh");
            }
        });
        textAreaParentForm.find('[value="Add Comment"]').on('click', function() {
            if(jNode.val().length > 14) {
                previewDivParent.remove();
                jNode.attr('id', '');

                // remove all the hooks between the converter, editor, and MathJax
                mdconverter.hooks.addNoop('preConversion');
                mdconverter.hooks.addNoop('postConversion');
                mdeditor.hooks.addNoop("onPreviewRefresh");
            }
        });
        textAreaParentForm.find('[class="edit-comment-cancel"]').on('click', function() {
            previewDivParent.remove();
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
