<?php
    set_time_limit(0);
    require "dbconnect.php";
    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $qid = mysqli_real_escape_string($db, $_POST['queryid']);
    $output = exec("python training.py {$tid} {$qid}");
    echo $output;

?>