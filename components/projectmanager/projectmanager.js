var ProjectManager=function(containerId){
    var pm="components/projectmanager/projectmanager.php";
    var container=$(containerId);
    var projectmanager=this;
    var workspace="";
    
    if (!container) return;
    
    var listContainer=$("<ol class='projectmanager-list'><ol>");
    container.append(listContainer);
    
    listContainer.on('click','span', function(){
        if ($(this)){
            selectedItem=$(this).parent();
            var data=selectedItem[0].dataset;
            projectmanager.onProjectClick(data.name,data.path);
            
            itemSelected=$(".project-item.active");
            if (itemSelected){
                itemSelected.removeClass("active");
            }
            selectedItem.addClass("active");
        }
        return false;    
    });

    this.loadProjects=function(rootDir){
        workspace=rootDir;
        
        fetch(pm+"?cmd=getProjects&workspace="+workspace,{credentials: 'include'}).then(function(response) {
            return response.json();
        }).then(function(items){
            $.each(items,function(index,value){
                var id="prj-"+toSafeId(value.name+value.path);
                listContainer.append("<li id='"+id+"' class='projectmanager-item' data-name='"+value.name+"' data-path='"+value.path+"'><span>"+value.name+"</span></li>");        
            });
        });
    };
    
    this.addProject=function(name, path){
        jQuery.ajax(pm+"?cmd=addProject&name="+name+"&path="+path).done(function(result) {
            if (result==="ok"){
                var id="prj-"+toSafeId(name+path);
                listContainer.append("<li id='"+id+"' class='projectmanager-item' data-name='"+name+"' data-path='"+path+"'><span>"+name+"</span></li>");        
            }
        });
    };
    
    this.removeProject=function(name, path){
        jQuery.ajax(pm+"?cmd=removeProject&name="+name+"&path="+path).done(function(result) {
            if (result==="ok"){
                var id="prj-"+toSafeId(name+path);
                var element=$("#"+id);
                if (element){
                    element.remove();
                }
            }
        });
    };
    
    this.onProjectClick=function(name,path){
        
    };
    
    function toSafeId(id){
        return id.replace(/\//g,"_");
    };
}
