var socket = io.connect('http://localhost:9001');

function initialize(){
	
	socket.emit("getActiveRooms", "");
}


var dta_name = "";
var dta_desc = "";
var vizs=[];


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
		//let the server know it can now create the room obj and add it to the db
		socket.emit("newRoom", newRoom);
	});
	
	socket.on("roomCreated", function(data){
		//updata the active room panel :D
		socket.emit("getActiveRooms", "");
//		$('a[href="#tab1"]').click();
//		uncheckCheckBoxes();
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
// -----------------------------------------------------------------
// THINGS TO DO WITH THE INTERFACE!

// menu toggle button
$("#menu-toggle").click(function(e) {
	e.preventDefault();
	$("#wrapper").toggleClass("toggled");
});

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

		$("#addVizsBtn").off('click').on('click', function(e) {
			e.preventDefault();
			// redirected to the the 'active rooms' panel where the new room should be displayed

			
			vizs = getAllCheckedVizs();

//			var newRoom = {
//				"roomName" : dta_name,
//				"roomDesc" : dta_desc,
//				"currentDate" : new Date(),
//				"attached_vizs" : vizs,
//				"active" : true
//			}

			socket.emit("updateRoom", "");
			// socket.emit("newRoom", newRoom);

//			$('a[href="#tab1"]').click();
//			uncheckCheckBoxes();

		});

	} else {

	}
});



//receives an array of active rooms??
function displayNewRooms(data){
	   
	var html ='';
	console.log("function hereeeeeeeeeeeeee");
	$("#rooms div").empty();

	   for(i =0; i <data.length; i++){
			
			html = html
					+'<div class=\"col-md-4\">'
						+'<a href="#">'
						+'<p>'+ "Room_" + data[i].roomID +'</p>' 
						+ '<img src=\"http://placehold.it/160x100\" style="width: 150px; height: 150px">'
						+ '</a>'
					+ '</div>' ;
		
	    }
	    $('#rooms div:first').after(html);
	    console.log("inside function");
	    
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
	return vizs;
	console.log(vizs);

}

// uncheck checkboxes
function uncheckCheckBoxes() {
	$("input:checkbox").attr('checked', false);
	$("input:checkbox").parent().parent().addClass("border-box-black");
	$("input:checkbox").parent().parent().removeClass("border-box-blue");
	$("input:checkbox").siblings('.img-radio').css('opacity', '0.5');
}
