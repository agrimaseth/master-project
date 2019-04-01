<?php
    require "dbconnect.php";

    $tid = mysqli_real_escape_string($db, $_POST['taskid']);
    $query = "select * from articles where taskid=$tid";

    $results = mysqli_query($db,$query);

    $res = "TaskId,QueryId,ArticleId,Title,Abstract,UserLabel,PredictScore,PredictLabel,UncertaintScore,PubmedURL,\n";

    while( $row = mysqli_fetch_row( $results ) )
    {
        $url = "https://www.ncbi.nlm.nih.gov/pubmed/" . $row[2];
        $line = "";
        foreach( $row as $value )
        {
            $value = str_replace( '"' , '""' , $value );
            $value = '"' . $value . '"' . ",";
            $line .= $value;
        }
        $line .=  $url . ",";
        $res .= trim( $line ) . "\n";
    }

    $res = str_replace( "\r" , "" , $res );

    echo $res;
    mysqli_close($db);
    ?>
