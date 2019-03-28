<html>
<head>
    <h1>Simple Search on PubMed</h1>
    <h2>by yiwen Jan 2019</h2>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js">
</script>
<script type="text/javascript">
    $(document).ready(function(){

        var perNum = 20;
        var curPage = 1;
        var total = "";
        var count = 0;
        var totalPages = 0;

        $("#usrInput").keyup(function(){
            curPage = 1;
        });

        // function for search btn clicked
        $("#searchBtn").click(function(){
            var s = document.getElementById("usrInput").value;
            //$url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + s;
            var ids = [];
            var article_data = [];
            var abstracts = [];


            console.log("curPage:"+ curPage);

            $.ajax({
                method: "GET",
                url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + s + "&retstart=" + (parseInt(curPage)-1)*20,
                success: function(data){
                    ids = data.getElementsByTagName("Id");

                    if(curPage == 1){
                        total = data.getElementsByTagName("Count")[0].childNodes[0].nodeValue;
                        count = Math.min(1000, parseInt(total));
                        totalPages = Math.ceil(count/perNum);

                       var srch_res = "<span><b>Search Results</b></span><br><br>" +
                           "<span>Total:" + total + "   Results</span><br>" +
                           "<span>Showing first 1000</span><br>" +
                           "<button type=\"button\" id=\"first\">First</button><br>" +
                           "<button type=\"button\" id=\"prev\">Prev</button><br>" +
                           "<form name=\"page\">\n" +
                           "    <input type=\"text\" id=\"usrpage\">" +
                           "    <input type=\"button\" id =\"setpageBtn\" value=\"Go\">" +
                           "</form>" +
                           "<button type=\"button\" id=\"next\">Next</button><br>" +
                           "<button type=\"button\" id=\"last\">Last</button><br>";
                       $("#C").html(srch_res);

                    } // end if curPage is 1

                },
                complete: function(){
                    var newurl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id="
                    for (var i = 0; i < ids.length ;i++) {
                        if (i < ids.length - 1)
                            newurl += ids[i].childNodes[0].nodeValue + ",";
                        else
                            newurl += ids[i].childNodes[0].nodeValue;
                    }

                    // Get the detail info using the id list
                    $.ajax({
                        method: "GET",
                        url: newurl,
                        success:function(data){
                            var tab = "<table class=\"gridtable\" id=\"tbb\"><tbody><tr><td>Document ID</td><td>Title</td><td>Label</td></tr>";
                            article_data = data.getElementsByTagName("PubmedArticle");
                            abstracts = data.getElementsByTagName("Abstract");
                            var titles = data.getElementsByTagName("ArticleTitle");

                            for (var i = 0; i < ids.length; i++) {
                                var title = titles[i].childNodes[0].nodeValue;
                                var id = ids[i].childNodes[0].nodeValue;
                                tab += "<tr class=\"res_row\" artid="+i+"><td>" + id + "</td><td>" + title + "</td>" +
                                    "    <td ALIGN=\"center\">" +
                                    "       <select>" +
                                    "            <option value=\"notsepecified\">Not Specified</option>" +
                                    "            <option value=\"yes\">Yes</option>" +
                                    "            <option value=\"Maybe\">Maybe</option>" +
                                    "            <option value=\"No\">No</option>" +
                                    "       </select>" +
                                    "    </td>   " +
                                    "</tr>";
                            }
                            tab += "</tbody></table>";
                            $("#A").html(tab);

                            // display the details when user hover the row
                            $(".res_row").mouseover(function(){
                                $(this).css("background","yellow");
                                var artid = $(this).attr('artid');
                                var ab_text = abstracts[artid].getElementsByTagName("AbstractText");
                                var ab_text_total = "";
                                for(var i = 0; i < ab_text.length; i++){
                                    if(ab_text[i].getAttribute("Label")!=null)
                                        ab_text_total += "<br><span>&#8226;</span><I>" + ab_text[i].getAttribute("Label") + "</I><br>";
                                    ab_text_total += ab_text[i].childNodes[0].nodeValue + "<br>";
                                }

                                var details = "<br><b>Abstract:</b><br>" + ab_text_total;

                                $("#D").html(details);

                            })

                            $(".res_row").mouseleave(function(){
                                $(this).css("background","");
                            });

                            function setPage(label){
                                if (label == "first")
                                    curPage = 1;
                                if (label == "last")
                                    curPage = totalPages;
                                if (label == "prev" && curPage > 1)
                                    curPage = curPage - 1;
                                if (label == "next" && curPage < totalPages)
                                    curPage = curPage + 1;
                            }

                            $("#first").unbind("click").click(function(){
                                setPage("first");
                                $("#searchBtn").click();
                            });
                            $("#prev").unbind("click").click(function(){
                                setPage("prev");
                                $("#searchBtn").click();
                            });

                            $("#next").unbind("click").click(function(){
                                setPage("next");
                                $("#searchBtn").click();
                            });

                            $("#last").unbind("click").click(function(){
                                setPage("last");
                                $("#searchBtn").click();
                            });
                            $("#setpageBtn").unbind("click").click(function(){
                                var p = parseInt(document.getElementById("usrpage").value);
                                if(0 < p < totalPages){
                                    curPage = p;
                                    $("#searchBtn").click();
                                }else{
                                    alert("invalid page number!");
                                }
                            });
                        }, // end complete for detail
                        complete:function(){
                            $("#C1").html("<br><span>Current Page: "+curPage+"</span>");
                        }

                    }); // end ajax for detail

                }  // end complete for first ajax
                }); // end first ajax

        }); // end click search button function

    }); // end document ready


</script>


        <body>
        <div class="grid-container">
            <div id="BC"><br>
                <form name="B">
                    <input type="text" id="usrInput" >
                    <input type="button" id ="searchBtn" value="search">
                </form>
                <div id="C">
                </div>
                <div id="C1">
                </div>
            </div>
            <div id="A">
            </div>
            <div id="D"><br></div>
        </div>

        </body>


</html>



