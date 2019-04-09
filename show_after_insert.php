<?php
    require "dbconnect.php";

    function islabel($label_db, $label){
        if($label_db == $label)
            return "selected=\"selected\"";
        else
            return "";
    }

    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $startnum =  mysqli_real_escape_string($db, $_POST['startnum']);
    $sortby = mysqli_real_escape_string($db, $_POST['sortby']);
    $query = "select * from articles where taskid=$tid order by $sortby DESC limit $startnum,20";
    $usrLabel = ["Not Specified","Yes","Maybe","No"];

    if($result = mysqli_query($db,$query)) {
        echo "<table class=\"gridtable\" id=\"tbb_new\"><tbody><tr><td>Document ID</td>".
            "<td>Title</td>".
            "<td>User Last Label</td>".
            "<td>Predicted Label</td>".
            "<td>Uncertainty Score</td>".
            "<td>New Label</td>";

        $i = 0;
        while ($row = mysqli_fetch_assoc($result))
        {
            echo "
            <tr class=\"res_row_db\" id=$i artid=". $row['artid']. ">
                <td>" . $row['artid'] . "</td>
                <td><a href=https://www.ncbi.nlm.nih.gov/pubmed/". $row['artid']." target=\"_blank\">" . $row['title'] . "</a></td>
                <td>" . $usrLabel[$row['label']] . "</td>
                <td>" . $row['pred_label'] . "</td>
                <td>" . $row['uncert_score']. "</td>
                <td ALIGN=\"center\">
                  <select id=\"label$i\">
                     <option value=\"0\" " . islabel($row['label'], 0) . ">Not Specified</option>
                     <option value=\"1\" " . islabel($row['label'], 1) . ">Yes</option>
                     <option value=\"2\" " . islabel($row['label'], 2) . ">Maybe</option>
                     <option value=\"3\" " . islabel($row['label'], 3) . ">No</option>
                  </select>
                </td>
            </tr>";
            $i++;
        }
    }//end show the result

    mysqli_close($db);
?>