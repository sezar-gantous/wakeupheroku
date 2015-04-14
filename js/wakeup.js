var sites;
var db = new Firebase("https://wakeupheroku.firebaseio.com/sites");
var empty = '<li class="list-group-item" id="empty">No apps to wake up...</li>';


    $(document).ready(function() {
      loadFromJson();
    });




/*when user firt adds a site*/
    function startTimer() {
       $("#info").show();

        var url = $("#url").val();
        var name = $("#name").val();
        var intravel = ($("#intravel").val() * 60000);
       

       db.child(name).set({
        name: name,
        url: url,
        intravel: intravel,
        stat:"play"
       });


      $("#info").hide('fast');

    }



    function pause(id,name) {

       // change the button to play(hide pause button show play button..)
         $('#buttonPause-'+ name).hide(); 
         $('#buttonPlay-'+ name).show();
          
          //clear the intravel
        clearInterval(id);

        db.child(name).update({
          stat: "pause"
        });
    }

    function removeSite (id,url,name) {
      // CSS STUFF..
     
     //clear the whole li anf children fron DOM
     //$("li-"+url).remove();

      //if id is null that mean it was paused... 
      if (id !== null) {
         clearInterval(id);
      }
       console.log("removing");
       //remove from firebase
      db.child(name).remove();

    }

    function editing (url,intravel,name,status) {
      //preparing modal
      $("#modalLabel").html('Edite'+name);
      $("#editName").val(name);
      $("#editUrl").val(url);
      $("#editIntravel").val((intravel/60000));

      //add click event for save button
      $("#editSave").click(function(){
        
        //remove current 
           db.child(name).remove();
        //creat a new one....
        db.child($("#editName").val()).set({
          name: $("#editName").val()+'',
          url: $("#editUrl").val()+'',
          intravel: ($("#editIntravel").val()*60000)+'',
          stat: status
        });

        $('#editModal').modal('hide');

      });

      $('#editModal').modal('show')
    }

    function play(url,intravel,name) {
      // change the button to pause(hide play button show pause button..)
         $('#buttonPlay-'+ name).hide();
         $('#buttonPause-'+ name).show(); 

   //no need to update since its already playing
     if(name !== null){
      db.child(name).update({
               stat: "play"
             });
     }
        console.log("timer stated");

        //make a wake up call first
         wakeUp(url,name);
         //then make an intreval
        return setInterval(function(){ wakeUp(url,name) }, intravel)
    }


/*make a fake ajax call to the url; which will wake up the dyno */
    function wakeUp (url,name) {
     console.log(url);
      // an indecations to the use the server is still waking up
        $("#li-"+name).css({"z-index":"-1"}).addClass("disabled");
      $.ajax(url+'')
      .fail(function( jqXHR, textStatus){
       /* It's not really working...???*/
         console.dir("faild: "+jqXHR.status + "  "+ textStatus);
        if(jqXHR.status === 200)
        {
          console.log("status:200");
        }
        // an indecations to the use the server is done waking up
        $("#li-"+name).css({"z-index":"1"}).removeClass("disabled");
      })
      .done(function(){
        // an indecations to the use the server is done waking up
        $("#li-"+name).css({"z-index":"1"}).removeClass("disabled");
      })
      .always(function(){
       
      });
    }


    function print (site,id) {
     var str = '';
     var url = site.url;
     var name = site.name;
     var intravel = site.intravel;


     str+= '<li id="li-'+ name +'" class="list-group-item">';
     str+= '<a href="'+url+'" target="_blank" title="'+url+'">';
     str+= name;
     str+= '</a>'
     str+= 'The intravel is every '+(intravel/60000) + " mins"
     
     str+= '<button id="remove-'+ name +'" class="alert alert-danger remove" onClick="removeSite('+id+','+"'"+url+"'"+','+"'"+name+"'"+');" title="delete app">'+
               '<span id="spanRemove-'+ name +'" class="glyphicon glyphicon-remove"></span> </button>';
     str+= '<button id="edit-'+ name +'" class="alert alert-info edit" onClick="editing('+"'"+url+"'"+','+intravel+','+"'"+name+"'"+','+"'"+site.stat+"'"+');" title="edit app">'+
               '<span id="spanEdit-'+ name +'" class="glyphicon glyphicon-pencil"></span> </button>';
     str+= '<button id="buttonPause-'+ name +'" class="alert alert-warning pause" onClick="pause('+id+','+"'"+name+"'"+');" title="pause app">'+ 
              '<span id="spanPause-'+ name +'" class="glyphicon glyphicon glyphicon-pause"></span> </button>';
     str+= '<button id="buttonPlay-'+ name +'" class="alert alert-success play" onClick="play('+"'"+url+"'"+','+intravel+','+"'"+name+"'"+');" title="resume app">'+ 
              '<span id="spanPlay-'+ name +'" class="glyphicon glyphicon glyphicon-play"></span> </button>';
     str += '</li>';
      $("#sites").append(str);
    
     if(site.stat === 'pause'){
       // change the button to play(hide pause button show play button..)
       
         $('#buttonPause-'+ name).hide(); 
         $('#buttonPlay-'+ name).show(); 
     }


    }


/*load all data from firebase*/
function loadFromJson () {
  

  // Attach an asynchronous callback to read data
  db.on("value", function(snapshot) {
   
     if(snapshot.val() !== null){
            // iterate through data
        //clear the list first
          $("#sites").empty();
        snapshot.forEach(function(s) {
          //console.log(s.val().stat);
            var site = s.val();
          if(site.stat === 'pause'){
              id =  null;
          }
          else
          {
              //play will return the id of the setIntravel()
              id = play(site.url,site.intravel,null);      
          }  
           //print out html with data
           print(site,id);
        });
    }
    else{
         //empty is defined top of the file
       $("#sites").html(empty);
    } 
      console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
    
    $("#theError").html(errorObject.code);
    $("#err").show();

  });

   

}

//everytime a site is deleted this will be called
db.on("child_removed", function(snapshot) {
  var deletedPost = snapshot.val();
  console.log("removed");
});

//everytime a site is deleted this will be called
db.on("child_changed", function(snapshot) {
  var changedPost = snapshot.val();
  console.log("updated");
});