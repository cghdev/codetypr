var CTDocuments = function(appController, tool){

    var instance = this;
    var documents = null;
    var listContainer;
    var currentProject=null;
    var contextMenu=null;
    var contextMenuTarget=null;
    var itemContent={
        element:{},
        $node:{},
        editing:false,
        action:"",
        oldValue:"",
        newValue:"",
        oldItem:{},
        newItem:{}

    };
    var controller = appController;
    var toolItem = tool;

    this.initialize  = function(){
        documents=$("<ol id='fs-documents' class='tool-files'></ol>");

        var toolNewFile = $("<span class='tool-title-newFile glyphicon glyphicon-file' style='display:none'></span>");
        var toolNewFolder = $("<span class='tool-title-newFolder glyphicon glyphicon-folder-open'  style='display:none'></span>");

        toolItem.addTool(toolNewFile);
        toolItem.addTool(toolNewFolder);

        toolNewFolder.on("click",function(e){
            event.stopPropagation();
            alert("new folder");
        });

        toolNewFile.on("click",function(e){
            event.stopPropagation();
            alert("new file");
        });

        toolItem.onEnter=function(){
            if (currentProject!=null){
                toolNewFile.show();
                toolNewFolder.show();
            }
        }

        toolItem.onLeave=function(){
            if (currentProject!=null){
                toolNewFile.hide();
                toolNewFolder.hide();
            }
        }

        toolItem.setContent(documents);

        $.contextMenu({
            selector: '.fs-item',
            items: {
                "newFile":  {name: "New File", icon:'iconAdd'},
                "newFolder":{name: "New Folder", icon:'iconAdd'},
                "sep1":     "---------",
                "rename":   {name: "Rename", icon:'iconEdit'},
                "remove":   {name: "Remove", icon:'iconDelete'},
                "sep2":     "---------",
                "quit":     {name: "Quit"}
            },
            callback: function(key, opt) {
                
                var item=opt.$trigger;
                if (item.prop("tagName")=='SPAN'){
                    item=item.parent();
                }

                if (key=='rename'){
                    processRename(item);
                 } else if (key=='newFile'){
                     processNewFile(item);
                 } else if (key=='newFolder'){
                     processNewFolder(item);
                 } else if (key=='remove'){
                     processRemove(item);
                 }

            }
        });
    };

    this.load=function(project){
        currentProject=project;
        loadFolderTree(documents, project.path, true);
    };

    this.onNewItem=function(element, itemType, rootPath, itemName){};

    this.onDeleteItem=function(element, itemType, rootPath, itemName){};

    this.onRenameItem=function(element, itemType, rootPath, oldValue, newValue){};

    this.onItemSelected=function(item){};

    this.setItemSelected=function(item){
        if (instance.setItemActive(item.id)){
            itemSelected = item;
            if (instance.onItemSelected)
                instance.onItemSelected(item);
        }
    };

    this.setItemActive=function(id){
        var document = documents.find("#"+id);
        if (document && document.length>0){
            $(".fs-item").removeClass("tool-file-item-active");
            document.addClass("tool-file-item-active");
            return true;
        }
        return false;
    };

    this.clearActive=function(){
        $(".fs-item").removeClass("tool-file-item-active");
    };

    this.selectDocument=function(file){
        var item=buildFsItem(item);
	    var edting=$("#"+item.id).attr("data-editing");
        if (!editing || editing != "true")
            setItemSelected(item);
    };

    this.getItemSelected = function(){
        return itemSelected;
    };

    function processRename(item){
        var itemEdit=beginEdit('rename',item[0]);
        itemEdit.off('focusout').on('focusout', function(){
            endEdit();
            event.stopPropagation();
        });
        itemEdit.off('keypress').on('keypress', function(e) {
            if(e.which == 13) {                              
                endEdit();
                event.stopPropagation();
            }
        });
    };

    function processNewFile(item){
        var itemEdit=beginEdit('newFile',item[0]);
        itemEdit.off('focusout').on('focusout', function(){
            endEdit();
            event.stopPropagation();
        });
        itemEdit.off('keypress').on('keypress', function(e) {
            if(e.which == 13) {                              
                endEdit();
                event.stopPropagation();
            }
        });
    };

    function processNewFolder(item){
        var itemEdit=beginEdit('newFolder',item[0]);
        itemEdit.off('focusout').on('focusout', function(){
            event.stopPropagation();
            endEdit();
        });
        itemEdit.off('keydown').on('keydown', function(e) {
            itemEdit.removeClass("bad-fs-item-name");
            if(e.which == 13) {
                event.stopPropagation();                              
                endEdit();
            }
        });
    };

    function processRemove(item){
        var folder=item.attr("data-folder");

        var itemName=item.text();
        var itemType=getItemType(item);
        
        if (instance.onDeleteItem){
            instance.onDeleteItem(itemType, folder, itemName, function(){
                if (itemType=="folder"){
                    var id=toSafeId(folder + pathSeparator + itemName);
                    $("#fs-folder-"+id).remove();
                }
                item.remove();
            });
        }
    };

    function buildFsItem(file){
        var ppath=file.substring(currentProject.path.length+1);
        ppath=ppath.substring(0,(ppath.length-fname.length)-1);

        var item={
            id:"fs-"+toSafeId(file),
            location:file.split(/(\\|\/)/g).pop(),
            name: fname,
            partialpath: ppath
        }

        return item;
    };

    function beginEdit(action,el){

        $el=$(el);
        $el.attr("data-editing","true");

        itemContent.action=action;
        itemContent.editing=true;
        itemContent.newValue=$el.text();
        itemContent.oldValue=$el.text();

        itemContent.oldItem = buildFsItem(getItemType($el), $el.attr("id"),$el.attr("data-folder"),$el.text());
        itemContent.newItem = itemContent.oldItem; 
        
        if (action=="rename"){
            itemContent.element=el;
            itemContent.$node=$el;
            $el.attr("contenteditable", "true");
            
            placeCaretAtEnd(el);
            return $el;

        } else if(action=="newFile") {
            
            var path = $el.attr("data-folder");
            
            if (getItemType($el) == "folder"){
                path+=pathSeparator+$el.text();
            }

            var node=buildFileNode(path,"New File");
            var id=toSafeId(path);
            node.attr("data-editing","true");

            if ($el.attr("data-collapsed")=="true"){
                $el.attr("data-collapsed",false);
                $("#fs-folder-"+id).show();
            }
            $("#fs-folder-"+id).prepend(node);

            itemContent.element=node[0];
            itemContent.$node=node;
            node.attr("contenteditable", "true");
            placeCaretAtEnd(node);
            return node;

        } else if(action=="newFolder") {
            
            var path = $el.attr("data-folder");

            if ( getItemType($el) == "folder"){
                path+=pathSeparator+$el.text();
            }
            
            var id=toSafeId(path);
            
            if ($el.attr("data-collapsed")=="true"){
                $el.attr("data-collapsed",false);
                $("#fs-folder-"+id).show();
            }
            var node=buildFolderNode(path,"New Folder");
            node.attr("data-editing","true");

            $("#fs-folder-"+id).append(node);
            itemContent.element=node[0];
            itemContent.$node=node;
            $(node[0]).attr("contenteditable", "true");
            placeCaretAtEnd(node[0]);
            return node;

        }
    };

    function endEdit(){
        if (!itemContent.editing) return;

        var el = itemContent.element;
        var $el = $(itemContent.element);
        itemContent.newValue=$el.text();

        itemContent.newItem = buildFsItem(getItemType($el), $el.attr("id"),$el.attr("data-folder"),$el.text());

        var itemType=getItemType($el);
        var rootPath=$el.attr("data-folder");

        var id=toSafeId(rootPath + pathSeparator + itemContent.newValue);

        if ($("#fs-"+id).length > 0) {
            $el.addClass("bad-fs-item-name");
            return;
        }

        itemContent.editing=false;
        $el.attr("contenteditable", "false");

        if (!itemContent.newValue || itemContent.newValue==""){
            $el.text(itemContent.oldValue);
            return;
        }

        if (itemContent.action=="newFile" || itemContent.action=="newFolder"){
            if (instance.onNewItem){

                instance.onNewItem(itemType, rootPath, itemContent.newValue, function(){

                    

                    $el.attr("data-folder",rootPath);
                    $el.attr("id","fs-"+id);

                    if (itemContent.action=="newFolder"){

                        $(itemContent.$node[1]).attr("id","fs-folder-"+id);
                        
                    }
                });
                
            }
        } if (itemContent.action=="rename" && itemContent.oldValue!=itemContent.newValue){

            itemContent.newItem.id="fs-"+toSafeId(itemContent.newItem.file);
            $el.attr("id", itemContent.newItem.id);

            if (itemType=="folder"){
                var l=rootPath + pathSeparator + itemContent.oldValue;
                var items = documents.find("*[data-folder^='"+l+"']");
                $.each(items, function(index){
                    var newPath=rootPath + pathSeparator + itemContent.newValue + $(this).attr("data-folder").substring(l.length);
                    var id=toSafeId(newPath + pathSeparator + $(this).text()); 
                    $(this).attr("data-folder",newPath);
                    $(this).attr("id","fs-"+id);
                });
                var container = $el.next("ol");
                if (container){
                    container.attr("id","fs-folder-"+id);
                }
            }
            if (instance.onRenameItem){

                instance.onRenameItem(itemType, rootPath, itemContent.oldItem,itemContent.newItem, function(){});
                
            }
        }
        $el.attr("data-editing","false");
        itemContent.$node.attr("data-editing","false");
    };
    
    function loadFolderTree($container, rootDir){
        
        if (!$container || $container.length==0) return;

        toolItem.setLoading(true);

        controller.api.fs.getFolder(rootDir,function(items){
	    $container.empty();
            $.each(items, function(index, value) {
                if (value.node!=0 || value.parent_node!=0){
                    if (value.node_type===0){
                        $container.append(buildFolderNode(rootDir,value.name));
                    }else{
                        $container.append(buildFileNode(rootDir,value.name));
                    }
                }
            });
            toolItem.setLoading(false);
        });
    };
    
    function buildFolderNode(parentFolderPath,newFolderName){
        var id=toSafeId(parentFolderPath + pathSeparator + newFolderName);
        var item="<li id='fs-"+id+"'  class='fs-item documents-folder' data-collapsed='true' data-folder='"+parentFolderPath+"' data-editing='false' data-loaded='false'>";
        item+="<span class='fs-item folder-context-menu'>"+newFolderName+"</span></li><ol id='fs-folder-"+id+"' class='fs-folder-list'></ol>";
        var folder=$(item);
        folder.click(function(){
            var parentPath=$(this).attr("data-folder");
            if (!parentPath) return;

            var localFolder = parentPath + pathSeparator + $(this).text();

            var loaded=($(this).attr("data-loaded")=="true");
            var collapsed=($(this).attr("data-collapsed")=="true");
            var container=$("#fs-folder-"+toSafeId(localFolder));
            
            if (collapsed){
                $(this).attr("data-collapsed",false);
                container.show();
                if (!loaded){
                    $(this).attr("data-loaded",true);
                    loadFolderTree(container, localFolder, false);
                }
            }else{
                $(this).attr("data-collapsed",true);
                container.hide();
            }
        });
        return folder;
    };
    
    function buildFileNode(parentFolderPath,newFileName){
        var folder=parentFolderPath+"/"+newFileName;
        var id=toSafeId(folder);
        var item="<li class='fs-item documents-file' id='fs-"+id+"' data-collapsed='true' data-loaded='false' data-folder='"+parentFolderPath+"' data-editing='false'>";
        item+="<span class='fs-item file-context-menu'>"+newFileName+"</span></li>";
        var file=$(item);
        file.click(function() {                   
            var el=$(this);
            var folder=el.attr("data-folder");

            var item = buildFsItem("file", this.id, folder,el.text());

            if (el.attr("data-editing")!="true"){
                instance.setItemSelected(item);
	        }
        });
	return  file;
    };
    
    function buildFsItem(fsItemType, fsId, folder, fileName){
        //var file=folder+pathSeparator+fileName;
        if (currentProject)
            var ppath=folder.substring(currentProject.path.length+1);

        ppath=ppath.substring(0,(ppath.length-fileName.length)-1);
        var item={
            itemType: fsItemType,
            id:fsId,
            location:folder,
            name: fileName,
            partialpath: ppath,
	    file: folder + pathSeparator + fileName
        }
	    return item;
    };

    function getItemType(item){
        if (item.hasClass("documents-folder")){
            return "folder";
        }else{
            return "file";
        }
    };
}
