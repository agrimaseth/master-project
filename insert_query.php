<?php
    require "dbconnect.php";

    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $qid = mysqli_real_escape_string($db, $_POST['queryid']);
    $q = mysqli_real_escape_string($db, $_POST['query']);

    $query = "insert into queries values (" . $tid . "," . $qid . ",'" . $q .  "')";
    if(!mysqli_query($db,$query))
        echo "Error in inserting query to the database! " . $query;
    else
        echo "Insert query successfully!";

?>