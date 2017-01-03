var CTToolbox = function(){
    var toolbox;
    var activities;
    var splitter;
    var toolstack;
    var instance = this;

    var projects;
    var documents;
    var recentDocuments;

    var selectedProject;
    var selectedFile;

    this.initialize=function(controller, toolboxContainer){

        console.log("Initialitzing Toolbox ....");
        toolbox=$(toolboxContainer);
        widthBuff=toolbox.width();

        toolstack=$("<div id='ct-toolbox-toolstack'></div>");
        var toolstackTitle=$("<div class='toolstack-title'>"+lang.tools.explorer+"</div>");

        var activities = new CTActivities(controller,toolbox, toolstack);
        activities.initialize();

        var toolRecentDocuments = new toolItem("recent-files", lang.tools.recentDocuments);
        var toolDocuments = new toolItem("project-files", lang.tools.documents);
        var toolProjects = new toolItem("user-projects", lang.tools.projects);

        toolbox.append(toolstack);

        toolstack.append(toolstackTitle);
        toolstack.append(toolRecentDocuments.getTool());
        toolstack.append(toolDocuments.getTool());
        toolstack.append(toolProjects.getTool());

        projects = new CTProjects(controller, toolProjects);
        documents = new CTDocuments(controller, toolDocuments);
        recentDocuments = new CTRecentDocuments(controller, toolRecentDocuments);

        recentDocuments.onItemSelected = function(item){
            controller.app.openDocument(item.file);
            documents.setItemActive(item.id);
        };

        recentDocuments.onItemRemoved = function(item){
            recentDocuments.clearActive();
            documents.clearActive();
            if (recentDocuments.getCount() == 0){
                toolRecentDocuments.collapse();
            }
        };

        projects.onItemSelected = function(item){
            selectedProject=item;
            documents.load(item);
        };

        documents.onItemSelected = function(item){
            selectedFile=item;
            recentDocuments.add(item);
            controller.app.openDocument(item.file);
            if (recentDocuments.getCount() > 0){
                toolRecentDocuments.expand();
            }
        };

        documents.onRenameItem = function(itemType, rootPath, oldValue, newValue, callback){
            if       (itemType=='file'){
                controller.api.fs.renameFile(rootPath, oldValue.name, newValue.name,  callback);
                var docData = controller.app.documents[oldValue.location];
                if (docData){
                    controller.app.documents[newValue.location]=docData;
                }
                delete controller.app.documents[oldValue.location];
                
                recentDocuments.rename(oldValue,newValue);
                
            }else if (itemType=='folder'){

                controller.api.fs.renameFolder(rootPath, oldValue.name, newValue.name, callback);
                oldPath=rootPath + pathSeparator + oldValue.name;
                newPath=rootPath + pathSeparator + newValue.name
                for(key in controller.app.documents){
                    
                    if (key.startsWith(oldPath)){
                        var newKey = newPath + key.substring(oldPath.length);
                        var data = controller.app.documents[key];
                        recentDocuments.rename(oldValue,newValue);
                        controller.app.documents[newKey] = data;
                        delete controller.app.documents[key];
                    }

                }
            }
        };

        documents.onNewItem = function(itemType, rootPath, itemName, callback){
            if       (itemType=='file'){
                controller.api.fs.newFile(rootPath, itemName,  callback);
            }else if (itemType=='folder'){  
                controller.api.fs.newFolder(rootPath, itemName, callback);
            }
        };

        documents.onDeleteItem = function(itemType, rootPath, item, callback){
            if       (itemType=='file'){
                controller.api.fs.deleteFile(rootPath, item,  callback);
            }else if (itemType=='folder'){  
                controller.api.fs.deleteFolder(rootPath, item, callback);
            }
            recentDocuments.remove(rootPath + pathSeparator + item);
        };

        documents.onItemChanged = function(element,oldValue,newValue){
            alert(oldValue,newValue);
        };

        recentDocuments.initialize();
        projects.initialize();
        documents.initialize();

        this.tools.activities=activities;
        this.tools.projects=projects;
        this.tools.documents=documents;
        this.tools.recentDocuments=recentDocuments;
        
    }

    this.tools = {
        activities: {},
        projects : {},
        documents :  {},
        recentDocuments: {}
    }

    this.appController = function(){
        return controller;
    };

    
}

var toolItem = function(toolId,title){
    var instance = this;
    var selectedItem = null;

    var tool = $("<div class='tool-item-container'></div>");
    var toolTitle = $("<div class='tool-item tool-item-title'></div>");
    var toolTitleContent = $("<span class='tool-glyph glyphicon glyphicon-triangle-bottom'></span><span class='tool-title'>"+title+"</span>");
    var toolTitleItems = $("<div class='tool-title-items'></div>");
    var progressBar = $("<div class='tool-progressbar'></div>");
    toolTitle.append(toolTitleContent);
    
    toolTitle.append(progressBar);
    toolTitle.append(toolTitleItems);
    var toolContent = $("<div class='tool-item-content'></div>");

    tool.append(toolTitle);
    tool.append(toolContent);

    toolTitle.on("click",function(){
        console.log("Tool item ["+title+"] click")
        toolContent.toggle();
        var glyph=toolTitle.find(".tool-glyph");
        if (glyph.hasClass("glyphicon-triangle-right")){
            if (instance.expanded)
                instance.onExpanded();
            glyph.removeClass("glyphicon-triangle-right");
            glyph.addClass("glyphicon-triangle-bottom");
       }else{
            if (instance.collapsed)
                instance.onCollapsed();
            glyph.removeClass("glyphicon-triangle-bottom");
            glyph.addClass("glyphicon-triangle-right");
        }
    });
    toolTitle.hover(
        function(){
            instance.onEnter();
        },
        function(){
            instance.onLeave();
        }
    );
    this.expand=function(){
        toolContent.show();
        var glyph=toolTitle.find(".tool-glyph");
        glyph.removeClass("glyphicon-triangle-right");
        glyph.addClass("glyphicon-triangle-bottom");
        if (instance.onExpanded)
                instance.onExpanded();
    }
    this.collapse=function(){
        toolContent.hide();
        var glyph=toolTitle.find(".tool-glyph");
        glyph.removeClass("glyphicon-triangle-bottom");
        glyph.addClass("glyphicon-triangle-right");
        if (instance.onCollapsed)
                instance.onCollapsed();
    }
    this.addTool=function(element){
        toolTitleItems.append(element);
    };
    this.setContextMenu = function(contextMenu){
	tool.append(contextMenu);
    };
    this.removeTool=function(toolClass){
        toolTitleItems.find(toolClass).remove();
    };
    this.setLoading=function(loading){
        if (loading && !progressBar.hasClass('tool-loading')){
            progressBar.addClass('tool-loading');
        }else{
            progressBar.removeClass('tool-loading');
        }
    };
    this.onEnter=function(){};
    this.onLeave=function(){};
    this.onAdd={};
    this.onRemove={};
    this.onExpanded=function(){};
    this.onCollapsed=function(){};
    this.onSelectedItem={};
    this.setTitle=function(title){
        var title = toolTitle.find(".tool-title");
        if (title)
            title.text(title);
    };
    this.setContent=function(content){
        toolContent.html(content);
    };
    this.getTool=function(){
        return tool;
    }; 
}
