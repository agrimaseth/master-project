<?php
    require "dbconnect.php";

    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $qid = mysqli_real_escape_string($db, $_POST['queryid']);
    $startnum =  mysqli_real_escape_string($db, $_POST['startnum']);
    $sortby = mysqli_real_escape_string($db, $_POST['sortby']);
    $query = "select * from articles where taskid=$tid and queryid=$qid order by $sortby DESC limit $startnum,20";
    if($result = mysqli_query($db,$query)) {
        echo "<table class=\"gridtable\" id=\"tbb_new\"><tbody><tr><td><a id=\"docid\" href=\"#docid\" class=\"tab\">Document ID</a></td>".
             "<td><a id=\"title\" href=\"#title\" class=\"tab\">Title</a></td>".
            "<td><a id=\"predlab\" href=\"#predlab\" class=\"tab\">Predicted Label</a></td>".
            "<td><a id=\"score\" href=\"#score\" class=\"tab\">Predicted Score</a></td>".
            "<td><a id=\"uncertscore\" href=\"#uncertscore\" class=\"tab\">Uncertainty Score</a></td>";
    while ($row = mysqli_fetch_assoc($result))
    {
        echo "
        <tr class=\"res_row_db\" artid=". $row['artid']. ">
            <td>" . $row['artid'] . "</td>
            <td>" . $row['title'] . "</td>
            <td>" . $row['pred_label'] . "</td>
            <td>" . $row['score']. "</td>
            <td>" . $row['uncert_score']. "</td>
            
        </tr>";
    }
    }//end show the result

    mysqli_close($db);
?>