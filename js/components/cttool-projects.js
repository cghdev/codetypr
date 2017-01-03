var CTProjects = function(appController, tool){
    var instance = this;
    var projects = null;
    var itemSelected = null;
    var controller = appController;
    var toolItem = tool;


    this.initialize = function(){

        projects=$("<ol class='tool-projects'></ol>");
        var toolAdd = $("<span class='tool-title-add glyphicon glyphicon-plus' style='display:none'></span>");
        var toolRemove = $("<span class='tool-title-remove glyphicon glyphicon-remove'  style='display:none'></span>");

        //toolItem.setLoading(true);
        toolItem.addTool(toolAdd);
        toolItem.addTool(toolRemove);
        
        toolItem.onEnter=function(){
            toolAdd.show();
            toolRemove.show();
        }
        toolItem.onLeave=function(){
            toolAdd.hide();
            toolRemove.hide();
        }
        //toolItem.setLoading(false);
        toolItem.setContent(projects);
        instance.load();
    };

    this.load=function(){
        toolItem.setLoading(true);
        projects.empty();
        controller.api.projects.getUserProjects(function(items){
            $.each(items,function(index,value){
                var item=$("<li id='ct-project-"+value.id+"' class='tool-project-item' data-name='"+value.name+"' data-path='"+value.path+"'><span>"+value.name+"</span></li>");
                item.on("click",function(){
                    itemSelected=value;
                    instance.setItemSelected(value);
                });
                projects.append(item);        
            });
            toolItem.setLoading(false);
        });
    };

    this.add=function(name,folder){};

    this.remove=function(name){};

    this.onItemSelected=function(item){};

    this.setItemSelected=function(item){
        var project=$("#ct-project-"+item.id);

        if (project && project.length>0){

            itemSelected = item;
            $(".tool-project-item").removeClass("tool-project-item-active");
            project.addClass("tool-project-item-active");
            instance.onItemSelected(item);
        }

    };

    this.getItemSelected = function(){
        return itemSelected;
    };
}