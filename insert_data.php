<?php
    require "dbconnect.php";

    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $qid = mysqli_real_escape_string($db, $_POST['queryid']);
    $q = $_POST['query'];
    $ids = $_POST['id_list'];
    $titles = $_POST['title_list'];
    $abstracts = $_POST['abstract_list'];
    $flag = 1;
    $errors = "";
    for($i = 0; $i < sizeof($ids); $i++){
        $query = "insert into articles values ($tid, $qid, " . $ids[$i] .  ",'" .
            mysqli_real_escape_string($db, $titles[$i]) . "','" . mysqli_real_escape_string($db, $abstracts[$i]) . "', 0,0,null,0)";
        if(!mysqli_query($db,$query)) {
            $flag = 0;
            $errors .= $db->error . $query;
        }
    }
    if($flag = 0)
        echo "Error queries: " . $errors;
    else
        echo "Success!";

?>
