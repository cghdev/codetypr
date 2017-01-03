
var config               = new codrConfig();
var appmanager           = new AppManager();





$( document ).ready(function() {

    var cfg = appmanager.createAppManagerConfig();

    cfg.workspace=config.workspaceFolder;
    cfg.elements.editor=document.getElementById("editor-container");
    cfg.elements.splitter=document.getElementById("main-splitter");
    cfg.elements.managers.group=document.getElementById("wb-ctls");
    cfg.elements.managers.documents=document.getElementById("tabs-manager");
    cfg.elements.managers.files=document.getElementById("file-manager");
    cfg.elements.managers.projects=document.getElementById("project-manager");
    cfg.elements.workbench=document.getElementById("workbench");

    cfg.parts.window=window;
    cfg.parts.document=document;
    
    
    require.config({ paths: { 'vs': 'components/vs' }});
    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(document.getElementById('editor'), {
            model: null,
        scrollBeyondLastLine: false,
            theme:'vs-dark',
            fontSize:12
        });
        appmanager.setEditor(editor);
    });

    $(window).resize(function(){
        appmanager.updateEditorLayout();
    });
    $("#wb-tool-folder").on("click",function(){
        appmanager.toggleWorkbenchMode();
    });
    appmanager.initialize(cfg);
    
});






