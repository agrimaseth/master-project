$(document).ready(function(){

      var perNum = 20;
      var curPage = 1;
      var total = "";
      var count = 0;
      var totalPages = 0;
      var in_the_task = 0;
      var task_id = 0;
      var query_id = 0;
      var sortBy = "artid";

      function setPage(label){
        if (label == "first")
          curPage = 1;
        if (label == "last")
          curPage = totalPages;
        if (label == "prev" && curPage > 1)
          curPage = curPage - 1;
        if (label == "next" && curPage < totalPages)
          curPage = curPage + 1;
        if (label == "set"){
          var p = parseInt(document.getElementById("usrpage").value);
          if(0 < p && p <= totalPages){
            curPage = p;
          }else{
            alert("invalid page number!");
            $("#usrpage").val("");
          }
        }
        $("#usrpage").val(curPage);
        $("#C1").html("<br><span>Current Page: "+curPage+"</span>");
      }

      function getUpdate(url) {
        $.post(url,
            {
              taskid: task_id,
              startnum: (curPage - 1) * 20,
              sortby: sortBy
            },
            function (data) {
              $("#A").html(data);
            });
      }

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

              var srch_res =  "<span><b>Search Results</b></span><br><br>" +
                              "<span>Total:" + total + "   Results</span><br>" +
                              "<span>Showing first " + count + "</span><br>";
              $("#C0").html("");
              $("#C0").html(srch_res);

              var buttons = "<button type=\"button\" id=\"first\">First</button><br>" +
                              "<button type=\"button\" id=\"prev\">Prev</button><br>" +
                              "<form name=\"page\">\n" +
                              "    <input type=\"text\" id=\"usrpage\">" +
                              "    <input type=\"button\" id =\"setpageBtn\" value=\"Go\">" +
                              "</form>" +
                              "<button type=\"button\" id=\"next\">Next</button><br>" +
                              "<button type=\"button\" id=\"last\">Last</button><br>";
              $("#C").html("");
              $("#C").html(buttons);

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
                var tab = "<table class=\"gridtable\" id=\"tbb\"><tbody><tr><td>Document ID</td><td>Title</td></tr>";
                //article_data_xml = data.getElementsByTagName("PubmedArticle");
                abstracts_xml = data.getElementsByTagName("Abstract");
                titles_xml = data.getElementsByTagName("ArticleTitle");

                for (var i = 0; i < ids.length; i++) {
                    titles[i] = "";
                    if(titles_xml[i]){
                        titles[i] = titles_xml[i].innerHTML.replace(/<[^>]+>/g,"");}
                    tab += "<tr class=\"res_row\" id="+i+" artid = "+ids[i]+"><td>" + ids[i] + "</td><td><a href=https://www.ncbi.nlm.nih.gov/pubmed/"+ ids[i] +" target=\"_blank\">" + titles[i] + "</a></td>" +
                           "</tr>";
                }
                tab += "</tbody></table>";
                $("#A").html(tab);

                // display the details when user hover the row
                $(".res_row").mouseover(function(){
                  $(this).css("background","yellow");
                  var index = $(this).attr('id');
                  var ab_text = abstracts_xml[index].getElementsByTagName("AbstractText");
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
                  $("#D").html("");
                  $(this).css("background","");
                });

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
                  setPage("set");
                  $("#searchBtn").click();
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

          curPage = 1;

          if(query_id > 0){
              sortBy = "uncert_score";
          }

          var s = document.getElementById("usrInput").value;

          $("#starttask").attr("disabled",true);
          $("#submit").attr("disabled",false);
          $("#stoptask").attr("disabled",false);
          $("#usrInput").attr("disabled", true);
          $("#searchBtn").attr("disabled", true);

          var srch_res = "<span>Showing " + count + " Results</span><br>";
          $("#C0").html("");
          $("#C0").html(srch_res);

          $('body').block( {
            message : 'Inserting Data, Please Wait...',
            css : {
              border : '3px solid khaki'
            }
          });

          // insert query into query table
          $.post("insert_query.php",
              {
                query: s,
                taskid: task_id,
                queryid: query_id
              },
              function (data, status) {
                console.log("Inserted Query!");
              }
          );

          // insert data into article table
          for (var i = 0; i <= Math.ceil(count/200); i++) {
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
                        var newurl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id="

                        if(i == Math.ceil(count/200)){
                            $.unblockUI();
                            alert("Insert data finished!");
                            getUpdate("show_after_insert.php");
                        }else {
                            console.log("now inserting the " + i + "th 200 results");
                            // Get article ids -- ajax 0
                            $.ajax({
                                method: "GET",
                                url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + s + "&retmax=200&retstart=" + i * 200,
                                success: function (data) {
                                    ids_xml = data.getElementsByTagName("Id");
                                    for (var i = 0; i < ids_xml.length; i++) {
                                        ids[i] = ids_xml[i].childNodes[0].nodeValue;
                                        if (i < ids_xml.length - 1)
                                            newurl += ids[i] + ",";
                                        else
                                            newurl += ids[i];
                                    }
                                },
                                complete: function () {
                                    // Get articles info -- ajax 1
                                    $.ajax({
                                        method: "GET",
                                        url: newurl,
                                        success: function (data) {

                                            abstracts_xml = data.getElementsByTagName("Abstract");
                                            titles_xml = data.getElementsByTagName("ArticleTitle");

                                            // prepare data to be sent to database
                                            for (var i = 0; i < ids.length; i++) {
                                                titles[i] = "";
                                                if(titles_xml[i]){
                                                    titles[i] = titles_xml[i].innerHTML.replace(/<[^>]+>/g, "");
                                                }
                                                abstracts[i] = "";
                                                if (abstracts_xml[i]) {
                                                    var ab_text = abstracts_xml[i].getElementsByTagName("AbstractText");
                                                    for (var j = 0; j < ab_text.length; j++) {
                                                        if (ab_text[j].childNodes[0])
                                                            abstracts[i] += ab_text[j].innerHTML.replace(/<[^>]+>/g, "");
                                                    }
                                                }
                                            }
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
                        }
                    }, 1500 * i);

                })(i);

            } // end for 5

          $("#first").unbind("click").click(function(){
            setPage("first");
            getUpdate("show_after_insert.php");
          });
          $("#prev").unbind("click").click(function(){
            setPage("prev");
            getUpdate("show_after_insert.php");
          });
          $("#next").unbind("click").click(function(){
            setPage("next");
            getUpdate("show_after_insert.php");
          });
          $("#last").unbind("click").click(function(){
            setPage("last");
            getUpdate("show_after_insert.php");
          });
          $("#setpageBtn").unbind("click").click(function(){
            setPage("set");
            getUpdate("show_after_insert.php");
          });

      }); // end getstarted click

      // update user labels
      $("#submit").unbind("click").click(function() {
          $("#train").attr("disabled",false);
          $("#stoplabel").attr("disabled",false);

          var labels = [];
          var labeled_ids = [];
          var j = 0;
          for(var i = 0; i < 20; i++) {
              if($("#label" + i).val()!=0){
                labels[j] = $("#label" + i).val();
                labeled_ids[j] = $( "tr[id='"+i+"']" ).attr("artid");
                j++;
              }
          }
          console.log(labeled_ids);
          console.log(labels);

          $.post("update_labels.php",
              {
                taskid: task_id,
                ids: labeled_ids,
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

      // stop task and export results
      $("#stoptask").unbind("click").click(function() {
         // start new task
         in_the_task = 0;
         curPage = 1;
         var curquery = document.getElementById("usrInput").value;

         // export search results into csv and download
          $.ajax({
            url: "stop_and_export.php",
            data: {
              taskid: task_id
            },
            type: "POST",
            success: function (data)
            {
              var csvContent = "Last Query:," + curquery + ",\n" + data;
              var link = document.createElement("a");
              var blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;\uFEFF"});
              link.setAttribute("href", URL.createObjectURL(blob));
              var date = new Date();
              var fulldate = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate();
              var filename = "results_task" + task_id +"_"+ fulldate;
              link.setAttribute("download", filename + ".csv");
              link.click();
              alert("Stopped current task and downloaded results!");
            }
          });

          $("#usrInput").val("");
          $("#suggest").val("");
          $("#C").html("");
          $("#C0").html("");
          $("#C1").html("");
          $("#A").html("");
          $("#D").html("");
          $("#starttask").attr("disabled", true);
          $("#submit").attr("disabled", true);
          $("#train").attr("disabled", true);
          $("#stoplabel").attr("disabled", true);
          $("#stoptask").attr("disabled", true);
          $("#usrInput").attr("disabled", false);
          $("#searchBtn").attr("disabled", false);
   });

      // start train data
      $("#train").unbind("click").click(function(){
          curPage = 1;
          sortBy = "score";
          $('body').block( {
            message : 'Training Data, Please Wait...',
            css : {
              border : '3px solid khaki'
            }
          });
          $("#usrpage").val(curPage);

          $.ajax({
            method: "POST",
            url: "start_train.php",
            data:{
                    taskid: task_id,
            },
            success: function(data){
              var srch_res = "<span>Training Results</span><br>";
              $("#C0").html("");
              $("#C0").html(srch_res);
              $("#C1").html("<br><span>Current Page: "+curPage+"</span>");

              $.unblockUI();
              alert("Finished Training!");
              console.log(data);
              $("#suggest").html(data);
            },
            complete: function(){
              getUpdate("get_update_after_train.php");

              $("#first").unbind("click").click(function(){
                    setPage("first");
                    getUpdate("get_update_after_train.php");
                  });
              $("#prev").unbind("click").click(function(){
                    setPage("prev");
                    getUpdate("get_update_after_train.php");
                  });
              $("#next").unbind("click").click(function(){
                    setPage("next");
                    getUpdate("get_update_after_train.php");
                  });
              $("#last").unbind("click").click(function(){
                    setPage("last");
                    getUpdate("get_update_after_train.php");
                  });
              $("#setpageBtn").unbind("click").click(function(){
                    setPage("set");
                    getUpdate("get_update_after_train.php");
                  });

              $("#A").on("click", "#docid", function(){
                    sortBy = "artid";
                    setPage("first");
                    getUpdate("get_update_after_train.php");
                  });

              $("#A").on("click", "#title", function(){
                    sortBy = "title";
                    setPage("first");
                    getUpdate("get_update_after_train.php");
                  });

              $("#A").on("click", "#predlab", function(){
                    sortBy = "pred_label";
                    setPage("first");
                    getUpdate("get_update_after_train.php");
                  });

              $("#A").on("click", "#score", function(){
                    sortBy = "score";
                    setPage("first");
                    getUpdate("get_update_after_train.php");
                  });

              $("#A").on("click", "#uncertscore", function(){
                    sortBy = "uncert_score";
                    setPage("first");
                    getUpdate("get_update_after_train.php");
                  });
            } // end inside complete
          }); // end inside ajax
    }); // end start train button

      // copy suggested query
      $("#copy").click(function(){
       var input = document.getElementById("suggest");
       input.select();
       document.execCommand("copy");
       alert("Copy Query Successfully!");
   });

      $("#A").on("mouseover", ".res_row_db", function(){
        $(this).css("background","yellow");
        var artid = $(this).attr('artid');
        $.ajax({
            method: "POST",
            url: "get_abstracts.php",
            data:{ artid: artid },
            success: function(data, status) {
                    $("#D").html(data);
            }
            });
    });

      $("#A").on("mouseleave", ".res_row_db", function(){
        $(this).css("background","");
        $("#D").html("");
    });

    }); // end document ready

