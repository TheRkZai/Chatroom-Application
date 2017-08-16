
var socket = io.connect();
// Short Cut Key ( Send Message )
function keySend(event){
	if(event.ctrlKey && event.keyCode == 13){ 
		sendMyMessage();
	}
}
// Send Message
function sendMyMessage(){
	var content = $("#msgIn").val();
	
	if(content == ""){ 
		return;
	}
	if(content.substring(0,1) == '@' && content.indexOf(':') != -1){
		var index = content.indexOf(':');
		var target = content.substring(1,index);
		var contentString = content.substr(index+1);
		var source = $("#nickname").html();
		socket.emit("PrivateMessage",source,target,contentString);
	}else{
		socket.emit("GroupMessage",content);
	}
	$("#msgIn").val("");
}

$(function(){
    var T = setInterval(function(){
        var date = new Date();
        var time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        $(".tip span").html(time);
    },1000);
});

// Clicking user to send private message
function toUser(user){
	var target = "@"+user.innerHTML +": ";
	document.getElementById("msgIn").value = target;
}

// Chat Log Received
socket.on("getChatListDone",function(content){
	for(var i= 0;i<content.length;i++){
		showContent(content[i].name,content[i].time,content[i].data);
	}
});
// Show Edit Info Window
function changeInfo(){
	$("#change-modal").modal("show");
    $("#nickname-error").css("display","none");
    $("nickname-edit").text("");
}
// Request Edit Information
function setMyInfo(){
	var oldName = $("#nickname").html();
	var newName = $("#nickname-edit").val();
	socket.emit("requestSetInfo",oldName,newName);
}

socket.on("nameExists",function(){
	$("#nickname-error").css("display","block");
});
// Edit Info Done
socket.on("setInfoDone",function(oldName,newName){
	$("#change-modal").modal("hide");
	var msg_list = $(".msg-list");
	if(oldName !== newName){
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+
		'system@:  changes name to ['+newName+']：success'+'</div></div>'
	);
	}else{ 
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+
		'system@:  update info：success'+'</div></div>'
	);
	}
	$("#nickname").html(newName);
});

socket.on("userChangeInfo",function(oldName,newName){
	var msg_list = $(".msg-list");
	if(oldName !== newName){
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+
		'system@:  ['+oldName+'] changes name to ['+newName+']</div></div>'
	);
	}
});

socket.on("connect",function(){
	var userName = $("#nickname").html();
	socket.send(userName);
	socket.emit("getChatList",$("#nickname").html());
});

socket.on("NewUser",function(data){
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+data+'</div></div>'
	);
    var hei = msg_list[0].scrollHeight;
    msg_list.scrollTop(hei);
});
socket.on("useLogout",function(data){
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+data+'</div></div>'
	);
    var hei = msg_list[0].scrollHeight;
    msg_list.scrollTop(hei);
});

socket.on("system",function(data){ 
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+data+'</div></div>'
	);
    var hei = msg_list[0].scrollHeight;
    msg_list.scrollTop(hei);
});
// Get User List
socket.on("user_list",function(userList){
	$(".user-list").html("");

	for(var i=0;i<userList.length;i++){
		$(".user-list").append("<tr class='row'><td class='col-sm-1'><span class='glyphicon glyphicon-user'></span></td><td class='col-sm-11 user-name' title='Clicking the username can send a private message~' onclick='toUser(this)'>"+userList[i].username+"</td></tr>");
	}
	var listCount = $(".user-list").find("tr").length;
	$("#list-count").text("Online User：" + listCount + " people");
});

function showContent(name,time,content){
	var msg_list = $(".msg-list");
	msg_list.append(
		'<div class="msg-wrap"><div class="msg-info"><span class="msg-name" title="Clicking the username can send a private message" onclick="toUser(this)">'+name+' </span>'+
		'<span class="msg-time">'+time+' </span></div>'+
		'<div class="msg-content">'+content+'</div></div>'
	);
	var hei = msg_list[0].scrollHeight;
	msg_list.scrollTop(hei);
}

socket.on("UserToGroup",function(name,time,content){
	showContent(name,time,content);
});

socket.on("ReceivedPrivateMessage",function(source,content){
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+
		' '+source+' has sent you private message：'+content+'</div></div>'
	);
	var hei = msg_list[0].scrollHeight;
	msg_list.scrollTop(hei);
});
socket.on("PrivateMessageSent",function(target,content){
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+
		'You already send '+target+' the private message ：'+content+'</div></div>'
	);
    var hei = msg_list[0].scrollHeight;
    msg_list.scrollTop(hei);
})