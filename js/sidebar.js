var socket = io.connect('http://sociamvm-app-001.ecs.soton.ac.uk:9003');

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires;
    document.cookie.Domain=null;
    console.log("Domain: " +document.cookie.Domain);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user=getCookie("username");
    if (user != "" && user != null) {
        alert("Welcome again " + user);
    } else {
       user = prompt("Please enter your name:","");
       if (user != "" && user != null) {
    	   console.log("inside if");
           setCookie("username", user, 30);
           var u= getCookie("username");
           console.log(u);
       }
    }
}

function eraseCookie(name) {
    setCookie(name,"",-1);
    console.log("cookie erased");
}

function initialize(){
	//eraseCookie("username");
	checkCookie();
	socket.emit("getActiveRooms", "");
}

//function initialize(){
//	
//	socket.emit("getActiveRooms", "");
//}


var dta_name = "";
var dta_desc = "";
var vizs=[];
var linkArray = ["http://www.java2s.com/", "http://www.java2s.com/"];


	socket.on("returnedRoomID", function(data){
		var newID=data;
		var date= new Date();
		var newRoom = {
				"roomID":newID,
				"roomName" : dta_name,
				"roomDesc" : dta_desc,
				"currentDate" : date,
				"attached_vizs" : vizs,
				"active" : true
			}
		// let the server know it can now create the room obj and add it to the
		// db
		socket.emit("newRoom", newRoom);
	});
	
	socket.on("roomCreated", function(data){
		// updata the active room panel :D
		socket.emit("getActiveRooms", "");
// $('a[href="#tab1"]').click();
// uncheckCheckBoxes();
	});
	
	socket.on('activeRooms', function(data){
		if(data.length>0){
			displayNewRooms(data);
			$('a[href="#tab1"]').click();
			uncheckCheckBoxes();
		}else{
			console.log("data received is empty");
		}
				
	});
	
	socket.on('roomDetails', function(data){
		console.log("roomDetails received roomName is: "+ data.roomName);
		updateModalContent(data);
		$("#roomModal").modal();
		
	})
	
	socket.on('vizsURLS', function(data){
		linkArray=[];
		
		for(i=0; i<data.vizDocs.length; i++){
			var url=data.vizDocs[i].URL + "?room=" + data.roomID + "&vizName=" + data.vizDocs[i].vizName;
			linkArray[i]=url;
		}
		
		open_win();
	});
// -----------------------------------------------------------------
// THINGS TO DO WITH THE INTERFACE!

// menu toggle button
$("#menu-toggle").click(function(e) {
	e.preventDefault();
	$("#wrapper").toggleClass("toggled");
});

//get room's details from server when room is clicked
function myFunction(elem){
	console.log("myFunction is working");
	// var id=elem.attr('id');
	try{
		var str = elem;
		socket.emit("getRoomDetails", elem);
		console.log(str);
	}catch(e){
		console.log("myFunction is not displaying the roomName");
	}
}

$('#createRoom').on('click', function(event) {
	event.preventDefault();

	dta_name = $("input#roomName").val();
	dta_desc = $("textarea#roomDesc").val();
	if ((dta_name.length > 0) & (dta_desc.length > 0)) {
		// socket.emit('filter_keyword', {"room":$.urlParam('room'),
		// "newFilter": $("input#filter_keyword").val()});
		console.log("Sent Data: " + dta_name + " " + dta_desc);
		$("input#roomName").val(null);
		$("textarea#roomDesc").val(null);
		// pop up the modal
		$("#myModal").modal();

		

	} else {

	}
});

$("#addVizsBtn").off('click').on('click', function(e) {
	e.preventDefault();
	// redirected to the the 'active rooms' panel where the new room
	// should be displayed

	// update vizs for the current room
	vizs = getAllCheckedVizs();


	socket.emit("updateRoom", "");
});


function getVizURLs(roomID){
	console.log("inside getVizURLS()");
	
	try{
		socket.emit("getURLS", roomID);
	}catch(e){
		console.log("getVizURLS not working");
	}
	
}




// open new tabs with the vizs
function open_win() {
        linkArray=['http://sociamvm-app-001.ecs.soton.ac.uk/twitterGraph/', 'http://sociamvm-app-001.ecs.soton.ac.uk/deletedTweets/', 'http://sociamvm-app-001.ecs.soton.ac.uk/msFilter/'];	
	for (var i = 0; i < linkArray.length; i++) {
	    // will open each link in the current window
		window.open(linkArray[i]);
	}

}



// receives an array of active rooms??
function displayNewRooms(data){
	   
	var html ='';
	console.log("function hereeeeeeeeeeeeee");
	$("#rooms div").empty();

	   for(i =0; i <data.length; i++){
			
			html = html
					
					+'<div class=\"col-md-4\">'
						+'<a href="#" class="roomLayout" onclick="myFunction('+data[i].roomID+')">'
						+'<p style="text-align: center">'+ data[i].roomName +'</p>' 
						+ '<img src=\"roomimg.png\" style="width: 180px; height: 150px">'
						+ '</a>'
					+ '</div>' ;
		
	    }
	    $('#rooms div:first').after(html);
	    console.log("inside function");
	    
 }

// should receive a Room object with room name, id etc etc
function updateModalContent(data){
	var title=''; 
	var desc='';
	var htmlRooms='';
	var footer='';
	// header with the roomName
	$("#roomModalH h3").empty();
	// body paragraph w description
	$("#roomModalB p").empty();
	// div for pictures of the current vizs
	//$("#roomModalB div").empty();
	$('#vizDiv div').empty();
	// footer with JoinRoom button/modify or delete room button depending on the
	// user?
	$( "#joinBtn" ).remove();
	
	title= title + '<h3 class="modal-title text-center">'+data.roomName+'</h3>';
	desc= desc + '<p class="description">'+ data.description + '</p>';
	
	
	for (i =0; i<data.attached_vizs.length; i++){
		htmlRooms = htmlRooms
		+'<div class=\"col-md-4\">'
			+'<a href="#" class="img">'
			+'<p class="center">'+  data.attached_vizs[i] +'</p>' 
			+ '<img src=\"http://sociamvm-app-001.ecs.soton.ac.uk:9002/'+data.attached_vizs[i]+'\" style="width: 160px; height: 120px">'
			+ '</a>'
		+ '</div>' ;
	}
	
	// <!-- don't forget to add later : data-dismiss="modal" -->
	var obj={};
	obj.vizs=[];
	obj.vizs=data.attached_vizs;
	obj.roomID=data.roomID;
	console.log(obj);
	footer ='<button type="button" class="btn btn-default" id="joinBtn" data-dismiss="modal" onclick="getVizURLs('+data.roomID+')">Join Room</button>';
	//'+ {"vizs": data.attached_vizs, "roomID": data.roomID}+'
	// + ',\"roomID\":'+  data.roomID
	$('#roomModalH button').after(title);
	$('#roomModalB #descDiv:first').after(desc);
	$('#vizDiv div:first').after(htmlRooms);
			//#vizDiv:first'
	$("#footerDiv").after(footer);
	
}

// colour check boxes for visualizations(see addViz modal)
$(function() {
	$('input.pack_item').click(function(e) {
		if (this.checked) {
			$(this).parent().parent().addClass("border-box-blue");
			$(this).parent().parent().removeClass("border-box-black");
			$(this).siblings('.img-radio').css('opacity', '1.0');
		} else {
			$(this).parent().parent().addClass("border-box-black");
			$(this).parent().parent().removeClass("border-box-blue");
			$(this).siblings('.img-radio').css('opacity', '0.5');
		}
	});
});

function getAllCheckedVizs() {
	var vizs = [];
	$('input:checkbox[class="pack_item pull-right"]:checked').each(function() {

		vizs.push(this.value);

	});
	//push the filter anyway
	vizs.push("Filter");
	return vizs;
	console.log(vizs);

}


// uncheck checkboxes
function uncheckCheckBoxes() {
	$('input:checkbox[class="pack_item pull-right"]').attr('checked', false);
	$("input:checkbox").parent().parent().addClass("border-box-black");
	$("input:checkbox").parent().parent().removeClass("border-box-blue");
	$("input:checkbox").siblings('.img-radio').css('opacity', '0.5');
	
}
