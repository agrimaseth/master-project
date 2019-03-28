<?php
    require "dbconnect.php";

    $query = "select max(taskid) as latestid from queries";
    $result = mysqli_query($db,$query);
    $row = mysqli_fetch_assoc($result);

    echo $row["latestid"];
?>