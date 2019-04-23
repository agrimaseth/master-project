# master-project
My master project  

This project-based study implements a high recall and high precision interactive literature retrieval system based on the ReQuery-ReClassify (ReQ-ReC) framework proposed by Wang et al. in 2014. The study summarizes the challenges and difficulties of current methods of literature retrieval and review in achieving high recall in addition to high precision. Following the double-loop mechanism of the ReQ-ReC framework, the project applies the methodology of system design, database design and user interface design to turn the framework into a real-world web application.  

*System Workflow*
![System Workflow](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/System%20Workflow.png)

*Activity Diagram*
![Activity Diagram](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/Activity%20Diagram.png)


## Development Environment
•	Windows 10  
•	XAMPP (Apache + MySQL)  
•	Python 3.7  

## Technology Stack
•	Client Side: JavaScript, JQuery, HTML, CSS  
•	Server Side: PHP, MySQL Database, Python (document classifier) scikit learn library  

## Online Demo and Screenshots
http://152.19.196.228:8080/HRSearch/  

*Home Page*
![Home Page](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/UI-HomePage.png)

*Label Search Results*
![Label](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/UI-Label%20Data.png)

*Training Results*
![Training](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/UI-Training.png)

*Result after training*
![Results](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/UI-Results.png)


## Extra Requirements:
Assume you have Python environment  
Extra Requirements saved in `requirements.txt` 
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
  Click "admin" button in xampp under MySQL service which will redirect you to phpMyAdmin
  ![xampp mysql](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/xampp1.png)  
  Under "test" database which was already given, create table "articles" and "queries" using below scripts:  
  ![phpmyadmin](https://github.com/yiwen9586/master-project/blob/master/screen%20shots/phpmyadmin.png)
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

  
  
