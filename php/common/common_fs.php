<?php
class CommonFs {
    
    public static function readFileContents($path){
        if(is_file($path)){
            $output = file_get_contents($path);
            
            if(extension_loaded('mbstring')) {
              if(!mb_check_encoding($output, 'UTF-8')) {
                  if(mb_check_encoding($output, 'ISO-8859-1')) {
                      $output = utf8_encode($output);
                  } else {
                      $output = mb_convert_encoding($content, 'UTF-8');
                  }
              }
            }
            
            echo $output;
        }else{
            echo "";
        }
    }
    
    public static function createFile($path){
        $done=false;
        $stage=0;
        if(!is_file($path)){
            $folder=dirname($path);
            if (!file_exists($folder)) {
                $done=mkdir($folder, 0777, true);
                $stage=1;
            }else{
                $done=true;
                $stage=1;
            }
            if ($done){
                $done=touch($path);
                $stage=2;
            }
        }else{
            $done=true;
            $stage=3;
        }
        if ($done){
            return "ok";
        }else{
            if($stage==1){
                return "error, creating directory ["+$path+"]";
            }else if($stage==2){
                return "error, creating file ["+$path+"]";
            }else if($stage==3){
                return "error, file already exists ["+$path+"]";
            }else if($stage==0){
                return "error, Stage 0";
            }else{
                return "error, unknown!";
            }
        }
    }
    
    public static function saveFileContents($dir,$contents,$append){
	$parts = explode('/', $dir);
        $file = array_pop($parts);
        $dir = '';
        foreach($parts as $part)
            if(!is_dir($dir .= "/$part")) mkdir($dir);
        
	$retval=file_put_contents("$dir/$file", $contents);

        if ($retval>0){
            echo "ok";
        }else{
            echo "error, writing file contents!, contentLength:".strlen($contents)." err: ".$retval;
        }
    }
}
?>