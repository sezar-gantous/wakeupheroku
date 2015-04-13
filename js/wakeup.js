var sites;
var db = new Firebase("https://wakeupheroku.firebaseio.com/sites");
var empty = '<li id="empty">No apps to wake up...</li>';


    $(document).ready(function() {
      loadFromJson();
    });




/*when user firt adds a site*/
    function startTimer() {
       $("#info").show('fast');

        var url = $("#url").val();
        var name = $("#name").val();
        var intravel = $("#intravel").val();
        var intervalID = play(url,intravel); //starts intravel and returns the id
        
    //printing
      print(url,name,intravel);


      $("#info").hide('fast');

    }



    function pause(id) {
        clearInterval(id);
    }

    function play(url,intravel) {
        return setInterval(function(){ wakeUp(url) }, intravel)
    }


/*make a fake ajax call to the url; which will wake up the dyno */
    function wakeUp (url) {

      $.ajax(url)
      .fail(function( jqXHR, textStatus){
       /* It's not really working...???*/
         console.dir("faild: "+jqXHR.status + "  "+ textStatus);
        if(jqXHR.status === 200)
        {
          console.log("status:200");
        }
      })
      .done(function(){

      })
      .always(function(){
        
      });
    }


    function print (url,name,intravel,id) {
     var str = '';

     str+= '<li id="li-'+ url +'" class="list-group-item">';
     str+= '<a href="'+url+'" title="'+url+'">';
     str+= name;
     str+= '</a>'
     str+= 'Will wake up every '+(intravel/60000) + " mins"
     str+= '<button id="pause-'+ url +'" class="alert alert-warning pause" title="pause app">'+ 
              '<span id="spanPause-'+ url +'" class="glyphicon glyphicon glyphicon-pause"></span> </button>';
     str+= '<button id="play-'+ url +'" class="alert alert-success play" title="resume app">'+ 
              '<span id="spanPlay-'+ url +'" class="glyphicon glyphicon glyphicon-play"></span> </button>';
     str+= '<button id="edit-'+ url +'" class="alert alert-info edit" title="edit app">'+
               '<span id="spanEdit-'+ url +'" class="glyphicon glyphicon-pencil"></span> </button>';
     str+= '<button id="remove-'+ url +'" class="alert alert-danger remove" title="delete app">'+
               '<span id="spanRemove-'+ url +'" class="glyphicon glyphicon-remove"></span> </button>';
     str += '</li>';

    /*register click events*/

      $('#pause-'+ url).on('click',function(){

         // change the button to play(hide pause button show play button..)
         $('spanPause-'+ url).hide(); 
         $('spanPlay-'+ url).show();
          
          //clear the intravel
          pause(intervalID);

      }); 
      $('#edit-'+ url).on('click',function(){

       });    
      $('#remove-'+ url).on('click',function(){

       });
      $('#play-'+ url).on('click',function(){
         
         // change the button to pause(hide play button show pause button..)
         $('spanPlay-'+ url).hide();
         $('spanPause-'+ url).show(); 
          
          //start the intravel
          play(url,intravel);

       });
      

      $("#sites").append(str);
    }


/*load all data from firebase*/
function loadFromJson () {
  

  // Attach an asynchronous callback to read data
  db.on("value", function(snapshot) {
   
     if(snapshot.val() !== null){
            // iterate through data
        snapshot.forEach(function(site) {
           //print out html with data
           print(site.url,site.name,site.intravel);
        });
    }
    else{
         //empty is defined top of the file
       $("#sites").html(empty);
    } 
      console.log(sites);
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
    
    $("#theError").html(errorObject.code);
    $("#err").show();

  });

   

}