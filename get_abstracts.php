<?php
    require "dbconnect.php";
    //sanitize $_POST input videoid
    $artid = mysqli_real_escape_string($db, $_POST['artid']);
    $query = "select abstract from articles where artid=" . $artid;
    $result = mysqli_query($db,$query);
    $row = mysqli_fetch_assoc($result);

    echo "<br><b>Abstract:</b><br>" . $row["abstract"];
?>

