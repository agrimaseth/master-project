 $(document).ready(function(){

      var perNum = 20;
      var curPage = 1;
      var total = "";
      var count = 0;
      var totalPages = 0;
      var in_the_task = 0;
      var task_id = 0;
      var query_id = 0;

      // get latest task id
      $.get("getmax_taskid.php", function(data){
        console.log(typeof(data));
        if(parseInt(data)>=0){
        task_id = parseInt(data);}
        else{
          task_id = 0;
        }
      });


      $("#usrInput").keyup(function(){
        curPage = 1;
      });

      // function for search btn clicked
      $("#searchBtn").click(function(){
        var s = document.getElementById("usrInput").value;
        //$url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + s;
        var ids_xml = [];
        var ids = [];
        var abstracts_xml = [];
        var abstracts = [];
        var titles_xml = [];
        var titles = [];

        console.log("curPage:"+ curPage);
        $("#starttask").attr("disabled",false);

        $.ajax({
          method: "GET",
          url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + s + "&retstart=" + (parseInt(curPage)-1)*20,
          success: function(data){
            ids_xml = data.getElementsByTagName("Id");

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
            for (var i = 0; i < ids_xml.length ;i++) {
              ids[i] = ids_xml[i].childNodes[0].nodeValue;
              if (i < ids_xml.length - 1)
                newurl += ids[i] + ",";
              else
                newurl += ids[i];
            }

            // Get the detail info using the id list
            $.ajax({
              method: "GET",
              url: newurl,
              success:function(data){
                var tab = "<table class=\"gridtable\" id=\"tbb\"><tbody><tr><td>Document ID</td><td>Title</td><td>Label</td></tr>";
                //article_data_xml = data.getElementsByTagName("PubmedArticle");
                abstracts_xml = data.getElementsByTagName("Abstract");
                titles_xml = data.getElementsByTagName("ArticleTitle");

                for (var i = 0; i < ids.length; i++) {
                  titles[i] = titles_xml[i].innerHTML.replace(/<[^>]+>/g,"");
                  tab += "<tr class=\"res_row\" artid="+i+" id = "+ids[i]+"><td>" + ids[i] + "</td><td>" + titles[i] + "</td>" +
                      "    <td ALIGN=\"center\">" +
                      "       <select id=\"label"+i+"\">" +
                      "            <option value=\"0\">Not Specified</option>" +
                      "            <option value=\"1\">Yes</option>" +
                      "            <option value=\"2\">Maybe</option>" +
                      "            <option value=\"3\">No</option>" +
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
                  var ab_text = abstracts_xml[artid].getElementsByTagName("AbstractText");
                  var ab_text_total = "";
                  for(var i = 0; i < ab_text.length; i++){
                    if(ab_text[i].getAttribute("Label")!=null)
                      ab_text_total += "<br><span>&#8226;</span><I>" + ab_text[i].getAttribute("Label") + "</I><br>";
                    ab_text_total += ab_text[i].innerHTML.replace(/<[^>]+>/g,"") + "<br>";
                    //abstracts[i] += ab_text[i].innerHTML.replace(/<[^>]+>/g,"");
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

    // insert first 1000 articles into database when getstarted clicked
    $("#starttask").unbind("click").click(function() {
      if(in_the_task == 0) { // start a new task
        task_id += 1;
        query_id = 0;
        in_the_task = 1;
      }else{ // still in the current task
        query_id += 1;
      }

      var s = document.getElementById("usrInput").value;

      $("#starttask").attr("disabled",true);
      $("#submit").attr("disabled",false);
      $("#stoptask").attr("disabled",false);
      $("#usrInput").attr("disabled", true);
      $("#searchBtn").attr("disabled", true);

      // insert query into query table
      $.post("insert_query.php",
          {
            query: s,
            taskid: task_id,
            queryid: query_id
          },
          function (data, status) {
           alert(data);
          }
      );

      for (var i = 0; i < 5; i++) {
        (function (i) {
          setTimeout(function () {
            // insert articles info into article table
            var s = document.getElementById("usrInput").value;
            var ids_xml = [];
            var ids = [];
            var abstracts_xml = [];
            var abstracts = [];
            var titles_xml = [];
            var titles = [];

            console.log("now inserting the " + i + "th 200 results");
            console.log(ids);

            // Get article ids -- ajax 0
            $.ajax({
              method: "GET",
              url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + s + "&retmax=200&retstart=" + i * 200,
              success: function (data) {
                ids_xml = data.getElementsByTagName("Id");
              },
              complete: function () {
                var newurl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id="
                for (var i = 0; i < ids_xml.length; i++) {
                  ids[i] = ids_xml[i].childNodes[0].nodeValue;
                  if (i < ids_xml.length - 1)
                    newurl += ids[i] + ",";
                  else
                    newurl += ids[i];
                }
                // Get articles info -- ajax 1
                $.ajax({
                  method: "GET",
                  url: newurl,
                  success: function (data) {
                    abstracts_xml = data.getElementsByTagName("Abstract");
                    titles_xml = data.getElementsByTagName("ArticleTitle");

                    // prepare data to be sent to database
                    for (var i = 0; i < ids.length; i++) {
                      titles[i] = titles_xml[i].innerHTML.replace(/<[^>]+>/g,"");
                      abstracts[i] = "";
                      if (abstracts_xml[i]) {
                        var ab_text = abstracts_xml[i].getElementsByTagName("AbstractText");
                        for (var j = 0; j < ab_text.length; j++) {
                          if (ab_text[j].childNodes[0])
                            abstracts[i] += ab_text[j].innerHTML.replace(/<[^>]+>/g,"");
                        }
                      }
                    }
                    console.log(abstracts.length);
                  },
                  complete: function () {
                    $.post("insert_data.php",
                        {
                          taskid: task_id,
                          queryid: query_id,
                          query: s,
                          id_list: ids,
                          title_list: titles,
                          abstract_list: abstracts
                        },
                        function (data) {
                         //alert(data);
                         console.log("data:"+data);
                        }
                    );
                  }
                }); // end get articles info -- ajax 1
              } // end complete of ajax 0
            }); // end ajax 0
            if (i == 4)
              alert("Insert data finished!");
          }, 1500 * i);

        })(i);

      } // end for 5

      }); // end getstarted click

    $("#submit").unbind("click").click(function() {
      $("#train").attr("disabled",false);
      $("#stoplabel").attr("disabled",false);

      var labels = [];
      var ids = [];
      for(var i = 0; i < 20; i++) {
        labels[i] = $("#label" + i).val();
        ids[i] = $( "tr[artid='"+i+"']" ).attr("id");
        console.log(ids[i]);
        console.log(labels[i]);
      }

      $.post("update_labels.php",
          {
            ids: ids,
            labels: labels
          },
          function (data) {
            alert(data);
          }
      );
    });

    $("#stoplabel").unbind("click").click(function(){
      $("#starttask").attr("disabled", true);
      $("#submit").attr("disabled", true);
      $("#train").attr("disabled", true);
      $("#stoplabel").attr("disabled", true);
      $("#stoptask").attr("disabled", true);
      $("#usrInput").attr("disabled", false);
      $("#searchBtn").attr("disabled", false);
    });

    $("#stoptask").unbind("click").click(function() {
     // start new task
     in_the_task = 0;
     alert("Already stopped current task!");
     $("#usrInput").val("");
      $("#starttask").attr("disabled", true);
      $("#submit").attr("disabled", true);
      $("#train").attr("disabled", true);
      $("#stoplabel").attr("disabled", true);
      $("#stoptask").attr("disabled", true);
      $("#usrInput").attr("disabled", false);
      $("#searchBtn").attr("disabled", false);
   });

    $("#train").unbind("click").click(function(){
      var curPage = 1;
      var sortBy = "score";


      $.ajax({
        method: "POST",
        url: "start_train.php",
        data:{
                taskid: task_id,
                queryid: query_id
        },
        success: function(data){

          var srch_res = "<span><b>Training Results</b></span><br><br>" +
              "<button type=\"button\" id=\"first\">First</button><br>" +
              "<button type=\"button\" id=\"prev\">Prev</button><br>" +
              "<form name=\"page\">\n" +
              "    <input type=\"text\" id=\"usrpage\">" +
              "    <input type=\"button\" id =\"setpageBtn\" value=\"Go\">" +
              "</form>" +
              "<button type=\"button\" id=\"next\">Next</button><br>" +
              "<button type=\"button\" id=\"last\">Last</button><br>";

          $("#C").html(srch_res);
          $("#C1").html("<br><span>Current Page: "+curPage+"</span>");

          alert("Finished Training!");
          data.replace("\n","");
          data.replace("'","");
          data.replace("[","");
          data.replace("]","");
          data.replace(",","");
          $("#suggest").html(data);
          console.log(data);
        },
        complete: function(){
          $.ajax({
            method: "POST",
            url: "get_update_after_train.php",
            data: {
              taskid: task_id,
              queryid: query_id,
              startnum: (curPage-1)*20,
              sortby: sortBy},
            success: function(data){
              $("#A").html(data);},
            complete: function(){
              function setPage(label){
                if (label == "first")
                  curPage = 1;
                if (label == "last")
                  curPage = 50;
                if (label == "prev" && curPage > 1)
                  curPage = curPage - 1;
                if (label == "next" && curPage < 50)
                  curPage = curPage + 1;
                if (label == "set"){
                  var p = parseInt(document.getElementById("usrpage").value);
                  if(0 < p <= 50){
                    curPage = p;
                  }else{
                    alert("invalid page number!");
                  }
                }
                $.post("get_update_after_train.php",
                    { taskid: task_id,
                      queryid: query_id,
                      startnum: (curPage-1)*20,
                      sortby: sortBy},
                    function(data){
                      $("#A").html(data);
                    }
                );
                $("#C1").html("<br><span>Current Page: "+curPage+"</span>");
                console.log(curPage);
                console.log(sortBy);
              } // end function setPage

              $("#first").unbind("click").click(function(){
                setPage("first");
              });
              $("#prev").unbind("click").click(function(){
                setPage("prev");
              });

              $("#next").unbind("click").click(function(){
                setPage("next");
              });

              $("#last").unbind("click").click(function(){
                setPage("last");
              });
              $("#setpageBtn").unbind("click").click(function(){
                setPage("set");
              });

              $("#A").on("click", "#docid", function(){
                sortBy = "artid";
                setPage("first");
              });

              $("#A").on("click", "#title", function(){
                sortBy = "title";
                setPage("first");
              });

              $("#A").on("click", "#predlab", function(){
                sortBy = "pred_label";
                setPage("first");
              });

              $("#A").on("click", "#score", function(){
                sortBy = "score";
                setPage("first");
              });

              $("#A").on("click", "#uncertscore", function(){
                sortBy = "uncert_score";
                setPage("first");
              });

              $("#A").on("mouseover", ".res_row_db", function(){
                $(this).css("background","yellow");
                var artid = $(this).attr('artid');
                $.post("get_abstracts.php",
                    { artid: artid },
                    function(data,status){
                      $("#D").html(data);
                    }
                );
              });

              $("#A").on("mouseleave", ".res_row_db", function(){
                $(this).css("background","");
                $("#D").html("");
              });

            } // end inside complete
          }); // end inside ajax
        } // end outside complete
      }); // end outside ajax
    }); // end start train button

   $("#copy").click(function(){
       var input = document.getElementById("suggest");
       input.select();
       document.execCommand("copy");
       alert("Copy Query Successfully!");
   });

    }); // end document ready

