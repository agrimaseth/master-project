# master-project
My master project


## Online Demo
http://152.19.196.228:8080/HRSearch/


## Requirements:
Requirements saved in `requirements.txt`  
(You need to download [mysqlclient-1.4.2-cp37-cp37m-win32.whl](mysqlclient-1.4.2-cp37-cp37m-win32.whl) first)

> pip install -r requirements.txt

## Deployment Instruction:
1. Download [xampp](https://www.apachefriends.org/index.html)    
2. Install xampp    
3. Download the repo and unzip all files into the "htdoc" folder under the path you installed xampp   
(Default path would be: C:\xampp\htdocs)  
(You can create a folder for this repo to hold these scripts: e.g. C:\xampp\htdocs\HRSearch\index.html)   
After deployment you can use "localhost:(your port)/HRSearch" to access the home page
4. Start Apache and MySQL service in xampp    
5. Create tables using phpadmin:  
  Click "admin" button in xampp under MySQL service  
  Under "test" database which was already given, create table "articles" and "queries" using below scripts:  
  ```sql  
  create table articles
(
    taskid       int   not null,
    queryid      int   null,
    artid        int   not null,
    title        text  null,
    abstract     text  null,
    label        int   null,
    score        float null,
    pred_label   text  null,
    uncert_score float null,
    constraint articles_pk
      unique (taskid, artid)
);  
```

```sql 
create table queries
(
    taskid   int  null,
    queryid  int  not null,
    querystr text not null
);
```

  
  
