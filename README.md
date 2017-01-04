# codetypr
Web Editor powered by Monaco Editor

# Caution!!!!!

This editor uses php for read/write files and create/delete directories and it has no implementation of any type of security. this is not intended for production sites.

# Screenshot

![alt tag](https://raw.githubusercontent.com/dlabella/codetypr/master/img/codetypr.jpg)


# Installation on linux:

replace /var/www by the directory where you www root path is.
``` 
cd /var/www  

git clone https://github.com/dlabella/codetypr.git  

cd /var/www/codetypr  

cp -R cdn /var/www  

sudo mkdir /var/www/workspace  

sudo chown www-data:www-data /var/www/workspace  

sudo chmod 775 /var/www/workspace  
```
use the editor of your choice ...  

vi /var/www/codetypr/php/config/config.php  

replace /var/www by /var/www/workspace or any folder you want, the folder must owned by www-data and have read/write privileges.  

save file!!!

Lauch the browser of your choice:  
 http://localhost/codetypr  
 or if you use ssl  
 https://localhost/codetypr  

Good luck!

Note: Backup your data before testing!! still in development!!!
