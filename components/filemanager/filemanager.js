var FileManager=function(containerId){
    var fm="components/filemanager/filemanager.php";
    
    var container=$(containerId);
    var rootListContainer=null;
    var listContainer=null;
    var filemanager=this;
    var selectedItem=null;
    
    if (!container) return;
    var instance=this;

    listContainer=$("<ol class='filemanager-root-folder'></ol>");
    rootListContainer=listContainer;
    
    container.on('click','span.filemanager-item', function(e){
	    if ($(this)){
            selectedItem=$(this).parent();
	        var data=selectedItem[0].dataset;

            if (selectedItem.hasClass('filemanager-item')){
				
                selectElement($(this));
                
                if (selectedItem.hasClass('filemanager-folder')){
                    var path=data.folder;
					
                    if (data.collapsed==="true"){
                        data.collapsed="false";
                        filemanager.loadFolderTree(path);
                        return false;
                    }else{
                        data.collapsed="true";
                        var id="#group-"+toSafeId(path);
                        $(id).empty();
                    }
                }else{
                    if (filemanager.onFileClick){
                        filemanager.onFileClick(data.folder);
                    }
                }
            }
        }
    });

    this.readFile=function(path,callback){
        fetch(fm+"?cmd=readFile&path="+path,{credentials: 'include'}).then(function(response) {
            return response.text();
        }).then(function(data){
            if (callback){
                callback(data);
            }
        });
    }

    this.getSelectedItem = function(){
	return selectedItem;
    }

    this.saveFile=function(path,text,okCallback,errorCallback){
	
	var payload = {
	    file:path,
	    contents:text
	}

        fetch(fm+"?cmd=saveFile", {
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
	    instance.notify("File save: "+data);
	});
    }

    //TODO: Reimplement
    /*
    this.saveFile=function(path,text,okCallback,errorCallback){
        $.ajax({
            type: "POST",
            timeout: 50000,
            url: fm+"?cmd=saveFile&path="+path,
            data: {"contents":text},
            success: function (data) {
                if (data==="ok"){
                    if (okCallback){
                        okCallback();
                    }
                }else{
                    if (errorCallback){
                        errorCallback();
                    }
                }
                return false;
            }
        });

    }
    
    this.newFile=function(file,okCallback,errorCallback){
        jQuery.ajax(fm+"?cmd=newFile&path="+file).done(function(data) {
            if (data=="ok"){
                var dname=file.substring(0,file.lastIndexOf('/'));
                var fname=file.substring(file.lastIndexOf('/')+1);
                
                var folderId="#group-"+toSafeId(dname);

                $(folderId).append(buildFileNode(dname,fname));
                
                if (okCallback){
                   if (filemanager.onItemCreated){
                       filemanager.onItemCreated(file);
                   }
                   okCallback();
                }
            }else {
               if (errorCallback){
                   errorCallback(data);
               }
            }
        });
    }
    
    this.deleteFile=function(file,okCallback,errorCallback){
        jQuery.ajax(fm+"?cmd=deleteFile&path="+file).done(function(data) {
            if (data=="ok"){
                if (selectedItem!==null){
                    selectedItem.remove();
                    clearSelection();
                }
                if (okCallback){
                   if (filemanager.onItemDeleted){
                       filemanager.onItemDeleted(file);
                   }
                   okCallback();
                }
            }else {
               if (errorCallback){
                   errorCallback(data);
               }
            }
        });
    }
    
    this.renameFile=function(path,source,target,okCallback,errorCallback){
        jQuery.ajax(fm+"?cmd=renameFile&basePath="+path+"&source="+source+"&target="+target).done(function(data) {
            if (data=="ok"){
                var item=selectedItem.find('span')[0];
                if (item!==null){
                    filemanager.onItemRenamed(path+"/"+source,path+"/"+target);
                    item.text(target);
                }
               if (okCallback){
                   okCallback();
               }
            }else {
               if (errorCallback){
                   errorCallback(data);
               }
            }
	 
        });
    }
    
    this.newDirectory=function(path,folder,okCallback,errorCallback){
        jQuery.ajax(fm+"?cmd=createDir&basePath="+path+"&folder="+folder).done(function(data) {
            if (data=="ok"){
                var directory=path+"/"+folder;
                var id=toSafeId(directory);
                var group=$("#group-"+toSafeId(path));
                
                if (group !== null){

                    group.append(buildFolderNode(path,folder));
                    
                    filemanager.onItemCreated(path+"/"+folder);
                }
                if (okCallback){
                   okCallback();
                }
            }else {
               if (errorCallback){
                   errorCallback(data);
               }
            }
        });
    }
    
    this.deleteDirectory=function(path,okCallback,errorCallback){
        jQuery.ajax(fm+"?cmd=deleteDir&path="+path).done(function(data) {
            if (data=="ok"){
                if (selectedItem!==null){
                    selectedItem.remove();
                    clearSelection();
                }
                if (okCallback){
                    okCallback();
                }
            }else {
                if (errorCallback){
                    errorCallback(data);
                }
            }
        });
    }
    
    this.renameDirectory=function(path,source,target,okCallback,errorCallback){
        jQuery.ajax(fm+"?cmd=renameDir&basePath="+path+"&source="+source+"&target="+target).done(function(data) {
            if (data=="ok"){
                var item=selectedItem.find('span')[0];
                if (item!==null){
                    item.text(target);
                }
                filemanager.onItemRenamed(path+"/"+source,path+"/"+target);
                if (okCallback){
                   okCallback();
               }
            }else {
               if (errorCallback){
                   errorCallback(data);
               }
            }
        });
    }*/

    this.notify={}
    
    this.getSelectedItem=function() {
        return selectedItem;
    }
    
    this.loadFolderTree=function(rootDir,init){
        if (init===true){
            selectedItem=null;
            liItemSelected=null;
            if (rootListContainer!==null){
                rootListContainer.empty();
                container.empty();
                var id=toSafeId(rootDir);
                rootListContainer.append("<li id='root-"+id+"' class='filemanager-root-folder' data-collapsed='false' data-folder='"+rootDir+"'><ol id='group-"+id+"' class='filemanager-folder-list'></ol></li>");
                container.append(rootListContainer);
                listContainer=$("#"+id);


            }
        }

        fetch(fm+"?cmd=getDirTree&path="+rootDir,{credentials: 'include'}).then(function(response) {
            return response.json();
        }).then(function(items){
            var containerId="#group-"+toSafeId(rootDir);
            
            listContainer=$(containerId);
            listContainer.empty();
            $.each(items, function(index, value) {
                if (value.node===0 && value.parent_node===0){

                }else{
					var folder=rootDir+"/"+value.name;
					var id=toSafeId(folder);
					
                    if (value.node_type===0){
                        listContainer.append(buildFolderNode(rootDir,value.name));
                    }else{
                        listContainer.append(buildFileNode(rootDir,value.name));
                    }
                }
            });
        });
    }
    
    function buildFolderNode(parentFolderPath,newFolderName){
        var folder=parentFolderPath+"/"+newFolderName;
        var id=toSafeId(folder);
        var item="<li id='folder-"+id+"' class='filemanager-item filemanager-folder' data-collapsed='true' data-folder='"+folder+"'>";
        item+="<span class='filemanager-item folder-context-menu'>"+newFolderName+"</span></li><ol id='group-"+id+"' class='filemanager-folder-list'></ol>";
        return item;
    }
    
    function buildFileNode(parentFolderPath,newFileName){
        var folder=parentFolderPath+"/"+newFileName;
        var id=toSafeId(folder);
        var item="<li id='file-"+id+"' class='filemanager-item filemanager-file' data-collapsed='true' data-folder='"+folder+"'>"
        item+="<span class='filemanager-item file-context-menu'>"+newFileName+"</span></li>"
	return  item;
    }
    
    function selectElement(selectedItem){
        var itemSelected=$(".filemanager-item.active");
        if (itemSelected){
            itemSelected.removeClass("active");
        }
        selectedItem.addClass("active");
    }
    
    function clearSelection(){
        var itemSelected=$(".filemanager-item.active");
        if (itemSelected){
            itemSelected.removeClass("active");
        }
        selectedItem=null;
    }
    function toSafeId(id) {
	return id.replace(/\//g,"_");
    }
}


