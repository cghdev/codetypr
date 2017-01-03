var fileManager="php/fs/fs.php";
var projectManager="php/projects/projects.php";

var CTController = function(){

    var splitting=false;
    var mainWidth=0;
    var minWidth=200;
    var widthBuff=0;

    var instance=this;
    var toolbox=new CTToolbox();
    var splitter;
 
    var currentDoc={
        lang:"",
        file:"",
        model:"",
        isDirty:false
    };
 
    this.initialize=function(){

        instance.layout.toolbox=document.getElementById("toolbox-container");
        instance.layout.editor=document.getElementById("editor-container");
        instance.layout.editorTop.container=document.getElementById("editor-top");

        console.log("Initialitzing Controller ....");
        toolbox.initialize(instance, "#toolbox-container");
        console.log("Initialitzing Monaco ....");

        splitter=$("<div id='main-splitter'></div>");
        $("#editor-container").append(splitter);
        addSplitterHandler();

        instance.layout.editorTop.lang=$("<span class='ct-editor-lang'></span>");
        instance.layout.editorTop.document=$("<span class='ct-editor-document'></span>");

        $(instance.layout.editorTop.container).append(instance.layout.editorTop.lang);
        $(instance.layout.editorTop.container).append(instance.layout.editorTop.document);

        addEventListener("keydown", function(e) {
            if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))
            {
                e.preventDefault();
                instance.app.saveCurrentDocument();
            }
        }, false);
    }
    this.layout={
        toolbox:{},
        editor:{},
        editorTop:{
            container:{},
            lang:{},
            document:{}
        },
        set: function(){
            if (instance.editor){
                instance.editor.layout();
            }
        },
        toggleToolbox : function(){
            splitter.toggle();
        } 
    };
    this.editor = null;
    this.toolbox = toolbox;
    //ToDo: change default workspace!!!!
    

    this.initializeEditor=function(){
        if (editor){
            editor.onDidChangeModelContent(function(e){
                if (!currentDoc.isDirty){
                    currentDoc.isDirty=true;
                    instance.app.documents[currentDoc.file].isDirty=true;
                    updateDirtyDocuments();
                }
            });
        }
    }
    this.app = {
        workspace : "",
        documents : {},
        saveCurrentDocument: function(){
            if (currentDoc.file && currentDoc.file!=""){
                instance.api.fs.saveFile(currentDoc.file, currentDoc.model.getValue(), function(){
                    currentDoc.isDirty=false;
                    instance.app.documents[currentDoc.file].isDirty=false;
                    updateDirtyDocuments();
                });
            }
        },
        saveDocument: function(file){
            var doc=instance.app.documents[file];
            if (doc){
                instance.api.fs.saveFile(file, doc.model.getValue(), function(){
                     if (currentDoc.file==file){
                         currentDoc.isDirty=false;
                     }
                    instance.app.documents[file].isDirty=false;
                    updateDirtyDocuments();
                });
            }
        },
        closeDocument :  function(file){
            if (currentDoc.file==file){

                instance.layout.editorTop.lang.text("");
                instance.layout.editorTop.document.text("");

                instance.editor.setModel(null);
            }
            if (instance.app.documents[file]){   
                delete instance.app.documents[file];
            }
        },
        loadProject: function(project){

        },
        openDocument :  function(file){
            if (instance.app.documents[file]){

                currentDoc.isDirty=instance.app.documents[file].isDirty;
                currentDoc.file=file;
                currentDoc.model=instance.app.documents[file].model;

                instance.layout.editorTop.lang.text(instance.app.documents[file].lang);
                instance.layout.editorTop.document.text(file);

                if (instance.editor){
                    instance.editor.setModel(instance.app.documents[file].model);
                }
            }else{

                instance.api.fs.getFile(file, function(path, data){
                    var lang = getLangFromFile(file);
                    var doc = monaco.editor.createModel(data,lang);
                    
                    instance.app.documents[file]={
                        lang: lang,
                        isDirty : false,
                        model : doc
                    };
                    currentDoc.isDirty=false;
                    currentDoc.lang=lang;
                    currentDoc.file=file;
                    currentDoc.model=doc;

                    instance.layout.editorTop.lang.text(lang);
                    instance.layout.editorTop.document.text(path);

                    if (instance.editor){
                        instance.editor.setModel(doc);
                    }
                });

            }
        },
        allowNotifications:false,
        notify : function(caption){
            if (!instance.app.allowNotifications) return;

            var notification = new Notification(caption);
            if (notification){
                setTimeout(function(){notification.close()},2000);
            }
        }
    }

    this.api = {
        projects : {
            getUserProjects:function(callback){

                fetch(projectManager+"?cmd=getUserProjects",{credentials: 'include'}).then(function(response) {
                    instance.app.workspace=response;
                    return response.json();
                }).then(callback);

            }
        },
        fs : {
            getFolder:function(rootDir,callback){

                fetch(fileManager+"?cmd=getFolderTree&path="+rootDir,{credentials: 'include'}).then(function(response) {
                    return response.json();
                }).then(callback);

            },
            getFile:function(file, callback){

                fetch(fileManager+"?cmd=readFile&path="+file,{credentials: 'include'}).then(function(response) {
                    return response.text();
                }).then(function(data){
                    if (callback){
                        callback(file, data);
                    }
                });

            },
            renameFile: function(rootPath, oldFile, newFile, callback){
                var query="&basePath="+rootPath+"&source="+oldFile+"&target="+newFile;
                fetch(fileManager+"?cmd=renameFile"+query, {
                        method: "POST",
                        credentials: "include"
                }).then(function(response){
                    return response.text()
                }).then(function(data){
                    console.log(data);
                    if (callback)
                        callback(rootPath, newFile);
                });
            },
            renameFolder: function(rootPath, oldFolder, newFolder, callback){
                var query="&basePath="+rootPath+"&source="+oldFolder+"&target="+newFolder;
                fetch(fileManager+"?cmd=renameFolder"+query, {
                        method: "POST",
                        credentials: "include"
                }).then(function(response){
                    return response.text()
                }).then(function(data){
                    console.log(data);
                    if (callback)
                        callback(rootPath, newFolder);
                });
            },
            deleteFile: function(rootPath, fileName, callback){
                var query="&basePath="+rootPath+"&file="+fileName;
                fetch(fileManager+"?cmd=deleteFile"+query, {
                        method: "POST",
                        credentials: "include"
                }).then(function(response){
                    return response.text()
                }).then(function(data){
                    console.log(data);
                    if (callback)
                        callback(rootPath, fileName);
                });
            },
            deleteFolder: function(rootPath, folderName, callback){
                var query="&basePath="+rootPath+"&folder="+folderName;
                fetch(fileManager+"?cmd=deleteFolder"+query, {
                        method: "POST",
                        credentials: "include"
                }).then(function(response){
                    return response.text()
                }).then(function(data){
                    console.log(data);
                    if (callback)
                        callback(rootPath, folderName);
                });
            },
            newFile: function(rootPath, fileName, callback){
                var query="&basePath="+rootPath+"&file="+fileName;
                fetch(fileManager+"?cmd=createFile"+query, {
                        method: "POST",
                        credentials: "include"
                }).then(function(response){
                    return response.text()
                }).then(function(data){
                    console.log(data);
                    if (callback)
                        callback(rootPath, fileName);
                });
            },
            newFolder: function(rootPath, folderName, callback){
                var query="&basePath="+rootPath+"&folder="+folderName;
                fetch(fileManager+"?cmd=createFolder"+query, {
                        method: "POST",
                        credentials: "include"
                }).then(function(response){
                    return response.text()
                }).then(function(data){
                    console.log(data);
                    if (callback)
                        callback(rootPath, folderName);
                });
            },
            saveFile:function(file, text, callback){

                var payload = {
                    file:file,
                    contents:text
                }

                fetch(fileManager+"?cmd=saveFile", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).then(function(response){
                    return response.text()
                }).then(function(data){
                    console.log(data);
                    instance.app.notify("File save: "+data);
                    if (callback)
                        callback(file);
                });
            }
        }
    }
    function updateDirtyDocuments(){
        for (var doc in instance.documents) {
            if (instance.documents.hasOwnProperty(doc)) {
                instance.toolbox.tools.recentDocuments.setDirty(doc,instance.documents[doc].isDirty);
            }
        }
    }
    function addSplitterHandler(){
        splitter.mousedown(function(e){
            splitting=true;
            mainWidth=window.innerWidth;
        });

        $(document).mouseup(function(e){
            splitting=false;
        });

        $(document).mousemove(function(e){
            if (splitting){
                var p=e.clientX;
                if (p<minWidth) return;
                controller.layout.toolbox.style.width=(p)+"px";
                controller.layout.editor.style.width=(mainWidth-p)+"px";
                controller.layout.set();
                event.stopPropagation();
            }
        });
    } 
}
