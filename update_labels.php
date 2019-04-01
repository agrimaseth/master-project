<?php
    require "dbconnect.php";

    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $ids = $_POST['ids'];
    $labels = $_POST['labels'];

    $flag = 1;
    $errors = "";
    for($i = 0; $i < sizeof($ids); $i++){
        $query = "update articles set label = " . $labels[$i] . " where taskid =" . $tid . " and artid = " . $ids[$i];
        if(!mysqli_query($db,$query)) {
            $flag = 0;
            $errors .= $db->error;
        }
    }

    if ($flag == 1) {
        echo "Update labels successfully";
    } else {
        echo "Error: " . $errors;
    }
?>