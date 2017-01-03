<?php
require_once("../common/common_fs.php");

function getProjects($workspace) {


    $items = scandir($workspace,SCANDIR_SORT_ASCENDING);
    $first=true;
    echo "[";
    foreach ($items as $item) {
        if (substr($item,0,1) !== "."){
            $itemName=$workspace."/".$item;
            if (is_dir($itemName)){
                if (!$first){
                    echo ",";
                }
                echo "{\"name\":\"".$item."\",\"path\":\"".$itemName."\"}";
                if ($first){
                    $first=false;
                }
            }
        }
        
    };
    echo "]";
}

function addProject($name,$basePath) {
    $path="projects.json";
    $pdata="{\"name\":\""+$name+"\",\"path\":\""+$basePath+"\"}";
    $result="error";
    if (file_exists($path)){
        $data=CommonFs::readFileContents($path);
        $data=trim($data);
        if (strpos($data, $pdata) == FALSE){
            $data=substr($data,0,strlen($data)-1);
            $data=$data.",".$pdata."]";
            $result = "ok";
        }else{
            $result = "error, Project already exists!";
        }
    }else{
        $data="[".$pdata."]";
        $result = "ok";
    }
    if ($result=="ok"){
        $fdata = file_put_contents ($path, $data);
        if ($fadata>0){
            $result="ok";
        }else{
            $result="error, Error saving file projects.json";
        }
    }
    echo $result;
}

function removeProject($name,$basePath) {
    $path="projects.json";
    $pdata="{\"name\":\""+$name+"\",\"path\":\""+$basePath+"\"}";
    $result="ok";
    if (file_exists($path)){
        $data=CommonFs::readFileContents($path);
        $data=trim($data);
        $data=str_replace($pdata,"",$data);
        $fdata=file_put_contents ($path, $data);
        if ($fdata>0){
            $result="ok";
        }else{
            $result="error, Error saving file projects.json";
        }
    }else{
        $result="error, file projects.json not exists!";
    }
    echo $result;
}

$cmd=isset($_GET["cmd"])?$_GET["cmd"]:"";

if      ($cmd=="getProjects"){
    $workspace=isset($_GET["workspace"])?$_GET["workspace"]:"";
    getProjects($workspace);
}
else if ($cmd=="addProject"){
    $name=isset($_GET["name"])?$_GET["name"]:"";
    $folder=isset($_GET["folder"])?$_GET["folder"]:"";
    addProject($name,$folder);
}
else if ($cmd=="removeProject"){
    $name=isset($_GET["name"])?$_GET["name"]:"";
    $folder=isset($_GET["folder"])?$_GET["folder"]:"";
    removeProject($name,$folder);
}
?>
