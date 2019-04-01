<?php
    require "dbconnect.php";

    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $startnum =  mysqli_real_escape_string($db, $_POST['startnum']);
    $sortby = mysqli_real_escape_string($db, $_POST['sortby']);
    $query = "select * from articles where taskid=$tid order by $sortby DESC limit $startnum,20";
    if($result = mysqli_query($db,$query)) {
        echo "<table class=\"gridtable\" id=\"tbb_new\"><tbody><tr><td><a id=\"docid\" href=\"#docid\" class=\"tab\">Document ID</a></td>".
             "<td><a id=\"title\" href=\"#title\" class=\"tab\">Title</a></td>".
            "<td><a id=\"predlab\" href=\"#predlab\" class=\"tab\">Predicted Label</a></td>".
            "<td><a id=\"score\" href=\"#score\" class=\"tab\">Predicted Score</a></td>".
            "<td><a id=\"uncertscore\" href=\"#uncertscore\" class=\"tab\">Uncertainty Score</a></td>".
            "<td>Label</td>";

        $i = 0;
        while ($row = mysqli_fetch_assoc($result))
    {
        echo "
        <tr class=\"res_row_db\" id=$i artid=". $row['artid']. ">
            <td>" . $row['artid'] . "</td>
            <td><a href=https://www.ncbi.nlm.nih.gov/pubmed/". $row['artid'].">" . $row['title'] . "</a></td>
            <td>" . $row['pred_label'] . "</td>
            <td>" . $row['score']. "</td>
            <td>" . $row['uncert_score']. "</td>
            <td ALIGN=\"center\">
              <select id=\"label$i\">
                 <option value=\"0\">Not Specified</option>
                 <option value=\"1\">Yes</option>
                 <option value=\"2\">Maybe</option>
                 <option value=\"3\">No</option>
              </select>
            </td>
        </tr>";
        $i++;
    }
    }//end show the result

    mysqli_close($db);
?>