// ==UserScript==
// @name         Comment Preview
// @namespace    http://math.stackexchange.com/users/5531/
// @version      0.1
// @description  A userscript for Stack Exchange sites that adds a preview pane beneath comment input boxes
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

function addPreview(jNode) { //jNode is the comment entry text box
    var textAreaParentForm = jNode.parent().parent().parent().parent().parent();
    var itemidNum = textAreaParentForm[0].id.replace( /^\D+/g, ''); //SE id number of question/answer being commented on
    var newdivid = "comment-preview-" + itemidNum;

    setTimeout(function() {
        var previewPane = '<div><hr style="margin-bottom:6px;margin-top:10px"><div id="' + newdivid + '">' + (jNode.val().length > 0 ? jNode.val() : '<span style="color: #999999">(comment preview)</span>') + '</div style="margin-top:12px"><hr></div>';
        
        textAreaParentForm.children().last().after(previewPane);
        
        //Tell the preview pane to update with whatever is in the comment entry text box whenever it changes
        jNode.bind('input propertychange', function() {
            $('#' + newdivid).html( $(this).val() );
        });
        
        //Remove the preview pane if the comment is submitted or editing is cancelled.
        textAreaParentForm.find('[value="Add Comment"]').on('click', function() {
            if(jNode.val().length > 14) $('#' + newdivid).parent().remove();
        });
        textAreaParentForm.find('[class="edit-comment-cancel"]').on('click', function() {
            $('#' + newdivid).parent().remove();
        });
    }, 1000)
}

waitForKeyElements('[name="comment"]', addPreview);