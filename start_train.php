<?php
    set_time_limit(0);
    require "dbconnect.php";
    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $output = exec("python training.py {$tid}");
    echo $output;
?>
