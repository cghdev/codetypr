
var pathSeparator="/";

var controller = new CTController();
controller.initialize();


$(document).ready(function(){
    
    requestNotificationPermission();

    require.config({ paths: { 'vs': 'js/components/vs' }});
    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(document.getElementById('editor'), {
            model: null,
        scrollBeyondLastLine: false,
            theme:'vs-dark',
            fontSize:12
        });
        controller.editor=editor;
        controller.initializeEditor();
    });

    $(window).resize(function(){
        controller.layout.set();
    });

});

function requestNotificationPermission(){
    if (Notification.permission === "granted") {
        controller.app.allowNotifications = true;
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                controller.app.allowNotifications = true;
            }
        });
    }
}

function placeCaretAtEnd(el) {
    el.focus();
    try{
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }catch(err){
        console.log(err);
    }
}

function toSafeId(item){
    if (item){
        return item.replace(/[^a-z0-9]/g, function(s) {
            var c = s.charCodeAt(0);
            if (c == 32) return '-';
            if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
            return '__' + ('000' + c.toString(16)).slice(-4);
        });
    }else{
        return "";
    }
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function getLangFromFile(file){
    var idx=file.lastIndexOf(".");
    if (idx>0){
        var ext=file.substring(idx+1).toLowerCase();
        if (ext=='js'){
            return 'javascript';
        }
        if (ext=='ts'){
            return 'typescript';
        }
        if (ext=='cs'){
            return 'csharp';
        }
        if (ext=='json'){
            return 'json';
        }
        if (ext=='html' || ext=='htm'){
            return 'html';
        }
        if (ext=='py'){
            return 'python';
        }
        if (ext=='php'){
            return 'php';
        }
        if (ext=='css'){
            return 'css';
        }
        if (ext=='sh'){
            return 'bash';
        }
        if (ext=='txt'){
            return 'text';
        }
        if (ext=='sql'){
            return 'sql';
        }
        if (ext=='py'){
            return 'python';
        }
        return 'text';
    }
}

$(function(){
    $.contextMenu({
            selector: '.fs-context-menu',
            animation: {duration: 500, show: function(){}, hide: function(){}},
            items: {
                "newFile":  {name: "New File"},
                "newFolder":{name: "New Folder"},
                "sep1":     "---------",
                "rename":   {name: "Rename"},
                "remove":   {name: "Remove"},
                "sep2":     "---------",
                "quit":     {name: "Quit"}
            },
            callback: function(key, options) {
                var m = "clicked: " + key;
                window.console && console.log(m) || alert(m); 
            }
        });
});