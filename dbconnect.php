<?php
    $h = '127.0.0.1:3306';
    $u = 'root';
    $p = '';
    $dbname = 'test';
    $db = mysqli_connect($h,$u,$p,$dbname);
    if (mysqli_connect_errno()) {
        echo "Connect failed" . mysqli_connect_error(); exit();}
?>