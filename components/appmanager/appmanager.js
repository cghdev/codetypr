
var AppManager = function(){
    var splitting=false;
    /*var wbWidth;
    var mainWidth;*/
    var selectedFile;

    var data ={
        workspace : "",
        parts:{
            window:{},
            document:{},
            editor:{},
            managers:{
                files:{},
                projects:{},
                documents:{}
            }
        },
        elements:{
            editor:{},
            workbench:{},
            toolbox:{},
            splitter:{},
            managers:{
                files:{},
                projects:{},
                documents:{}
            },
        },
        compactMode:false
    };
    this.toggleWorkbenchMode = function(){
        toggleViewWorkbench();
    }
    this.setEditor = function(editor){
        data.parts.editor=editor;
        editor.onDidChangeContent(function(){
            console.log("Content changed!");
        })
    }
    this.updateEditorLayout = function(){
        if (data.parts.editor)
            data.parts.editor.layout();
    }
    this.createAppManagerConfig = function(){
        return {
            workspace : "",
            parts:{
                window:{},
                document:{},
                editor:{}
            },
            elements:{
                editor:{},
                workbench:{},
                splitter:{},
                managers:{
                    files:{},
                    projects:{},
                    group:{}
                },

            },
            compactMode:false
        }
    }
    
    this.initialize = function(appConfig){

        data.compactMode                 = appConfig.compactMode;
        data.workspace                   = appConfig.workspace;

        data.parts.window                = appConfig.parts.window;
        data.parts.document              = appConfig.parts.document;
        data.parts.editor                = appConfig.parts.editor;
        data.parts.managers.files        = new FileManager(appConfig.elements.managers.files);
        data.parts.managers.projects     = new ProjectManager(appConfig.elements.managers.projects);

        data.elements.editor             = appConfig.elements.editor;
        data.elements.workbench          = appConfig.elements.workbench;
        data.elements.toolbox            = appConfig.elements.toolbox;
        data.elements.splitter           = appConfig.elements.splitter;
        data.elements.managers.files     = appConfig.elements.managers.files;
        data.elements.managers.projects  = appConfig.elements.managers.projects;
        data.elements.managers.documents = appConfig.elements.managers.documents;
        data.elements.managers.group     = appConfig.elements.managers.group;

        $(data.elements.splitter).mousedown(function(e){
            splitting=true;
            mainWidth=window.innerWidth-5;
        });

        $(data.parts.document).mouseup(function(e){
            splitting=false;
        });

        $(data.parts.document).mousemove(function(e){
            if (splitting){
                var p=e.clientX;
                data.elements.workbench.style.width=p+"px";
                data.elements.editor.style.width=(mainWidth-p)+"px";
                if (data.parts.editor)
                    data.parts.editor.layout();
                event.stopPropagation();
            }
        });
        data.parts.managers.files.notify=function(caption){
            if (Notification.permission === "granted") {
                var notification = new Notification(caption);
            }
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    if (permission === "granted") {
                    var notification = new Notification(caption);
                    }
                });
            }
            if (notification){
                setTimeout(function(){notification.close()},2000);
            }
        }
        data.parts.managers.projects.loadProjects(data.workspace);
        attachEvents();
    }
    function setCurrentFile(file){
        selectedFile=file;
        $("#editor-file").text(file);
    }
    function toggleViewWorkbench(){
        if (!data.compactMode){
            wbWidth = data.elements.workbench.clientWidth;
            data.elements.managers.group.style.display="none";
            data.elements.workbench.style.width='0px';
            if (data.parts.editor)
                data.parts.editor.layout();

            data.compactMode = true;
        }else{
            data.elements.workbench.style.width=wbWidth+'px';
            data.elements.managers.group.style.display='block';
            
            if (data.parts.editor)
                data.parts.editor.layout();

            data.compactMode = false;
        }
    }

    function buildFileId(file){
        return file.replace(/\//g, "-");
    }

    function addDocument(file){
        var id=buildFileId(file);
        $(".wb-opened-editor").removeClass('wb-opened-editor-active');
        var element = buildDocumentElement(id, file);
        var closeElement=buildCloseElement(id, file);

        closeElement.click(function(){
            var file=$(this).data("file");
            var id=$(this).data("id");

            delete data.parts.managers.documents[file];

            var element=data.parts.document.getElementById("wb-opened-"+id);
            var wasActive=$(element).hasClass("wb-opened-editor-active");

            if (element)
                $(element).remove();

            if (wasActive){
                var newOpenedEditor=$(".wb-opened-editor").first();
                if (newOpenedEditor.length>0){
                    var file = newOpenedEditor.data("file");
                    $(".wb-opened-editor").removeClass("wb-opened-editor-active");
                    newOpenedEditor.addClass("wb-opened-editor-active");
                    if (file){
                        setCurrentFile(file);
                        data.parts.editor.setModel(parts.managers.documents[file].model);
                    }
                }else{
                    setCurrentFile(null);
                    data.parts.editor.setModel(null);
                }
            }else{
                if ($(".wb-opened-editor").length==0){
                    setCurrentFile(null);
                    data.parts.editor.setModel(null);
                }
            }
        });

        element.append(closeElement);

        element.click(function(){
            $(".wb-opened-editor").removeClass('wb-opened-editor-active');
            $(this).addClass('wb-opened-editor-active');
            var file = $(this).data("file");
            if (data.parts.managers.documents && file && data.parts.managers.documents[file]){
                data.parts.editor.setModel(data.parts.managers.documents[file].model);
            }
        });
        element.hover(
            function(){
                $(this).find('.wb-close-opened-editor').css("display","block");
            },
            function(){
                $(this).find('.wb-close-opened-editor').css("display","none");
            }
        );

        $(data.elements.managers.documents).append(element);
    }

    function buildCloseElement(id,file){
        return  $("<div class='wb-close-opened-editor' data-id='"+id+"'data-file='"+file+"' style='display:none'><span class='glyphicon glyphicon-remove'></span></div>");
    }

    function buildDocumentElement(id,file){
        var elementDef = "<div id='wb-opened-"+id+"' class='wb-opened-editor wb-opened-editor-active' data-file='"+file+"'>";
        elementDef    += "<div>";
        elementDef    += "<span class='wb-opened-editor-name'>"+getFileName(file)+"</span>&nbsp;";
        elementDef    += "<span class='wb-opened-editor-path'>"+file+"</span>";
        elementDef    += "</div>";
        elementDef    += "</div>";
        return $(elementDef);
    }

    function attachEvents(){
        data.parts.document.addEventListener("keydown", function(e) {
            if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))
            {
                e.preventDefault();
                saveFile();
            }
        }, false);

        data.parts.managers.projects.onProjectClick=function(name,path){
            $("#wb-item-project").text(name.toUpperCase());
            data.parts.managers.files.loadFolderTree(path,true);
        }
        data.parts.managers.files.onFileClick=function(file){
            if (!editor) return;
            
            var id=buildFileId(file);
            if (!data.parts.managers.documents[file]){
                data.parts.managers.files.readFile(file,function(data){
                    loadDocument(file,data);
                    addDocument(file);
                    setCurrentFile(file);
                });
            }else{
                $(".wb-opened-editor").removeClass('wb-opened-editor-active');
                $("#wb-opened-"+id).addClass('wb-opened-editor-active');
                data.parts.editor.setModel(data.parts.managers.documents[file].model);
                setCurrentFile(file);
            }
        }

        $(data.elements.splitter).mousedown(function(e){
            splitting=true;
            //mainWidth=data.parts.window.innerWidth-5;
        });

        $(data.parts.document).mouseup(function(e){
            splitting=false;
        });

        $(data.parts.document).mousemove(function(e){
            if (splitting){
                var p=e.clientX;
                data.elements.workbench.style.width=p+"px";
                //data.elements.editor.style.width=(mainWidth-p)+"px";
                if(data.parts.editor)
                    data.parts.editor.layout();
                event.stopPropagation();
            }
        });
    }

    function loadDocument(file,contents){
        var lang = getLangFromFile(file);
        var model=monaco.editor.createModel(contents,lang);
        data.parts.managers.documents[file] = {
            model:model,
            dirty:false
        };
        data.parts.editor.setModel(model);
        
    }

    function getFileName(path){
        if (path)
            return path.split(/(\\|\/)/g).pop();
        return "";
    }

    function saveFile(){
        if (selectedFile){
            var contents=data.parts.editor.getValue();
            if (contents)
                data.parts.managers.files.saveFile(selectedFile, contents);
        } 
    }

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
}

