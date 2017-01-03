var CTRecentDocuments = function(appController, tool){
    var instance = this;
    var recentFiles = null;
    var itemSelected = null;
    var discardSelect = false;
    var itemCount=0;

    var controller = appController;
    var toolItem = tool;

    this.initialize = function(){

        var toolSaveAll = $("<span class='tool-title-saveAll glyphicon glyphicon-floppy-disk' style='display:none'></span>");
        var toolCloseAll = $("<span class='tool-title-closeAll glyphicon glyphicon-remove-circle'  style='display:none'></span>");

        toolItem.addTool(toolSaveAll);
        toolItem.addTool(toolCloseAll);
        
        toolItem.onEnter=function(){
            toolSaveAll.show();
            toolCloseAll.show();
        }
        toolItem.onLeave=function(){
            toolSaveAll.hide();
            toolCloseAll.hide();
        }
        recentFiles=$("<ol class='tool-recent-documents'></ol>");
        toolItem.setContent(recentFiles);

        toolSaveAll.on("click",function(){
            event.stopPropagation();
            for (var doc in controller.app.documents) {
                if (controller.app.documents.hasOwnProperty(doc)) {
                    controller.app.saveDocument(doc);
                }
            }
        });

        toolCloseAll.on("click",function(){
            event.stopPropagation();
            for (var doc in controller.app.documents) {
                if (controller.app.documents.hasOwnProperty(doc)) {
                    instance.remove(doc);
                }
            }
        });
    }

    this.load=function(){};

    this.add=function(document){
        var recent=recentFiles.find("#"+document.id);
        if (recent==null || recent.length==0){
            itemCount++;
            $(".tool-recent-item").removeClass("tool-recent-item-active");
            var element="<li id='"+document.id+"' class='tool-recent-item tool-recent-item-active' data-document='"+document.file+"'>"+
                        "<div class='recent-remove' style='display:none'><span class='glyphicon glyphicon-remove'></span></div>"+
                        "<div class='recent-dirty'  style='display:none'><span class='glyphicon glyphicon-edit'></span></div>"+
                        "<div style='display:flex'>"+
                        "<span class='recent-title'>"+document.name+"</span>"+
                        "<div class='recent-title-path'>"+document.location+"</div>"+
                        "</div>";
                        "</li>"
            var item=$(element);

            item.find(".recent-remove").on("click", function(){
                var file=item.data("document");
                instance.remove(file);
            });
            item.on("click",function(){
                var el=$(this);
                doc={
                    id:el.attr("id"),
                    file:el.attr("data-document")
                };
                instance.setItemSelected(doc);
            });
            item.hover(
            function(){
                item.find(".recent-remove").show();
                if (item.data("isDirty")){
                    item.find(".recent-dirty").hide();
                }
            },
            function(){
                item.find(".recent-remove").hide();
                if (item.data("isDirty")){
                    item.find(".recent-dirty").show();
                }
            });
            recentFiles.append(item);
        }else{
            $(".tool-recent-item").removeClass("tool-recent-item-active");
            recent.addClass("tool-recent-item-active");
        }
    };

    this.remove=function(file){
        controller.app.closeDocument(file);
        var id="fs-"+toSafeId(file);
        $.each(recentFiles.find('*[id^="'+id+'"]'), function(){
            var element=$(this);
            if (element){
                element.remove();
                itemCount--;
            }
            if (instance.onItemRemoved)
                instance.onItemRemoved(element.attr("id"));
        });
    };

    this.rename=function(oldItem,newItem){
        if (oldItem.itemType=="file") {
            var item=recentFiles.find("#"+oldItem.id).first();
            if (item){
                item.attr("id",newItem.id);
                item.attr("data-document",newItem.file);
                item.find('.recent-title').first().text(newItem.name);
                item.find('.recent-title-path').first().text(newItem.file);
            }
        } else if (oldItem.itemType=="folder") {
            var items=recentFiles.find('*[data-document^="'+oldItem.file+'"]');
            $.each(items, function(){
                var item=$(this);
                var doclocation=item.attr("data-document");
                doclocation=newItem.file+doclocation.substring(oldItem.file.length);
                var id="fs-"+toSafeId(doclocation);
                item.attr("id",id);
                item.attr("data-document",doclocation);
                var ppath=item.find('.recent-title-path').first();
                item.find('.recent-title-path').text(doclocation);
            })
        }
    };

    this.setDirty=function(file,isDirty){
        var id=toSafeId(file);
        var element = recentFiles.find("#"+id);
        element.data("isDirty",isDirty);
        if (element && isDirty){
            var c = element.find(".recent-dirty");
            if (c)c.show(); 
        }
        else if (element && !isDirty){
            var c = element.find(".recent-dirty");
            if (c)c.hide();
        }
    };
    this.onItemRemoved=function(item){};
    this.onItemSelected=function(item){};
    this.getCount = function(){return itemCount};
    this.setItemSelected=function(item){
        if (instance.setItemActive(item.id)){
            itemSelected=item;
            instance.onItemSelected(item);
        }
    };

    this.setItemActive = function(id){
        var document=recentFiles.find("#"+id);
        if (document && document.length>0){
            $(".tool-recent-item").removeClass("tool-recent-item-active");
            document.addClass("tool-recent-item-active");
            return true;
        }
        return false;
    }
    this.clearActive=function(){
        $(".tool-recent-item").removeClass("tool-recent-item-active");
    }
    this.getItemSelected = function(){
        return itemSelected;
    };

    function getFileName(file){
        if (file){
            return file.split(/(\\|\/)/g).pop();
        }else{
            return ""
        }
    };
    
}
