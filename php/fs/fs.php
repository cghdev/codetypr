<?php

require_once("../common/common_fs.php");
require_once("../common/common.php");

function getFolderTree($path,$recursive=false) {
    $nodeId=0;
    echo "[";
    echo "{\"node\":0,\"parent_node\":0,\"node_type\":0,\"name\":\"".$path."\"}";
    readDirectoryRecursive($path,0,0,$recursive,1);
    readDirectoryRecursive($path,0,0,$recursive,0);
    echo "]";
}

function readDirectoryRecursive($path,$parentNode,$nodeId,$recursive=false,$mode=0) {
    $items = scandir($path,SCANDIR_SORT_ASCENDING);
    foreach ($items as $item) {
        
        if (substr($item,0,1) !== "."){
            $itemName=$path."/".$item;
            $nodeId++;
            if (is_dir($itemName)){
                if ($mode!=0){ 
                    echo ",{\"node\":".$nodeId.",\"parent_node\":".$parentNode.",\"node_type\":0,\"name\":\"".$item."\"}";
                    if ($recursive===true){
                        readDirectoryRecursive($itemName,$nodeId,$nodeId++,true);
                    }
                }
            }else{
                if ($mode!=1){
                    echo ",{\"node\":".$nodeId.",\"parent_node\":".$parentNode.",\"node_type\":1,\"name\":\"".$item."\"}";
                }
            }
        }
        
    };
}

function unlinkDirectory($path) {
    if (is_dir($path)){
        $files = glob($path . '*', GLOB_MARK);
        foreach ($files as $file) {
	        unlinkDirectory($file);
        }
        rmdir($path);
    } elseif (is_file($path)){
        unlink($path);
    }
}

$cmd=isset($_GET["cmd"])?$_GET["cmd"]:"";

if ($cmd=="getFolderTree"){
    $path=isset($_GET["path"])?$_GET["path"]:"";
    $recursive=isset($_GET["recursive"])?$_GET["recursive"]:"false";
    getFolderTree($path,$recursive);
}

if ($cmd=="deleteFolder"){
    $path=isset($_GET["basePath"])?$_GET["basePath"]:"";
    $folder=isset($_GET["folder"])?$_GET["folder"]:"";
    
    if (Common::endsWith($path,"/")){
        $tgt=$path.$folder;
    }else{
        $tgt=$path."/".$folder;
    }

    if(unlinkDirectory($tgt)){
        echo "ok";
    }else{
        echo "failed to delete directory ["+$path+"]";
    }
}

if ($cmd=="renameFolder"){
    $path=isset($_GET["basePath"])?$_GET["basePath"]:"";
    $source=isset($_GET["source"])?$_GET["source"]:"";
    $target=isset($_GET["target"])?$_GET["target"]:"";
    
    $src="";
    $tgt="";
    
    if (Common::endsWith($path,"/")){
        $src=$path.$source;
        $tgt=$path.$target;
    }else{
        $src=$path."/".$source;
        $tgt=$path."/".$target;
    }
    
    if (rename($src,$tgt)){
        echo "ok";
    }else{
        echo "failed to rename from ["+$src+"] to ["+$tgt+"]";
    }
}

if ($cmd=="renameFile"){
    $path=isset($_GET["basePath"])?$_GET["basePath"]:"";
    $source=isset($_GET["source"])?$_GET["source"]:"";
    $target=isset($_GET["target"])?$_GET["target"]:"";
    
    $src="";
    $tgt="";
    
    if (Common::endsWith($path,"/")){
        $src=$path.$source;
        $tgt=$path.$target;
    }else{
        $src=$path."/".$source;
        $tgt=$path."/".$target;
    }

    if (rename($src,$tgt)){
        echo "ok";
    }else{
        echo "failed to rename from ["+$src+"] to ["+$tgt+"]";
    }
}

if ($cmd=="createFolder"){
    $path=isset($_GET["basePath"])?$_GET["basePath"]:"";
    $folder=isset($_GET["folder"])?$_GET["folder"]:"";
    
    if (Common::endsWith($path,"/")){
        $tgt=$path.$folder;
    }else{
        $tgt=$path."/".$folder;
    }
    
    if (!file_exists($tgt)) {
        if(mkdir($tgt, 0777, true)){
            echo "ok";
        }else{
            echo "failed to create direcotry ["+$tgt+"]";
        }
    }else{
        echo "Directory already exists!";
    }
}


if ($cmd=="deleteFile"){
    $path=isset($_GET["basePath"])?$_GET["basePath"]:"";
    $folder=isset($_GET["file"])?$_GET["file"]:"";
    
    if (Common::endsWith($path,"/")){
        $tgt=$path.$folder;
    }else{
        $tgt=$path."/".$folder;
    }

    if (unlink($tgt)){
        echo "ok";
    }else{
        echo "failed to delete file ["+$tgt+"]";
    }
}

if ($cmd=="readFile"){
    $path=isset($_GET["path"])?$_GET["path"]:"";
    CommonFs::readFileContents($path);
}

if ($cmd=="saveFile"){
    $path=isset($_GET["path"])?$_GET["path"]:"";
    $data = json_decode(file_get_contents('php://input'), true);
    $file=$data["file"];
    $contents=$data["contents"];
    CommonFs::saveFileContents($file,$contents,false);
}

if ($cmd=="newFile"){
    $path=isset($_GET["path"])?$_GET["path"]:"";
    echo CommonFs::createFile($path);
}
?>
