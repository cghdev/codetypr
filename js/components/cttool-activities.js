var CTActivities = function(appController, tool, tools){
    var instance = this;
    var activities=null;
    var activities=$("<div id='ct-toolbox-activities'></div>");
    var controller = appController;
    var toolbox = tool;
    var toolstack = tools

    toolbox.append(activities);

    this.initialize = function(){
        var explorer=$("<span class='activities-icon glyphicon glyphicon-duplicate'></span>");
        var saveCurrent=$("<span class='activities-icon glyphicon glyphicon-floppy-disk'></span>");
        
        activities.append(explorer);
        activities.append(saveCurrent);
        
        saveCurrent.on("click",function(){

            controller.app.saveCurrentDocument();
        });

        explorer.on("click",function(){
            var mainWidth=window.innerWidth-5;

            toolstack.toggle();

            if (!toolstack.is(":visible")){
                widthBuff = toolbox.width();
                var p=activities.width();
                controller.layout.toolbox.style.width=p+"px";
                controller.layout.editor.style.width=(mainWidth-p)+"px";
                controller.layout.set();
            }else{
                controller.layout.toolbox.style.width=widthBuff+"px";
                controller.layout.editor.style.width=(mainWidth-widthBuff)+"px";
                controller.layout.set();
            }
            controller.layout.toggleToolbox();
        });
    }
};