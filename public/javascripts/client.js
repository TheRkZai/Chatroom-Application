/**
 * Created by RkZai on 2017/8/3.
 */
var socket = io.connect();

// Users connected
socket.on("connect",function(){
    var userName = $("#username").html();
    socket.send(userName);
    socket.emit("getChatList");
    var T = setInterval(function(){
        var date = new Date();
        var time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        $(".tip span").html(time);
    },1000);
});

// Users logout
socket.on("useLogout",function(username){
    var contentString="System: ["+username+"] leave the chat room";
    showSystemContent(contentString);
});

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
		var source = $("#username").html();
		socket.emit("PrivateMessage",source,target,contentString);
	}else{
		socket.emit("GroupMessage",content);
	}
	$("#msgIn").val("");
}

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
function editInfo(){
	$("#edit-modal").modal("show");
    $("#username-error").css("display","none");
    $("#username-edit").val("");
}

// Request Edit Information
function setMyInfo(){
	var oldName = $("#username").html();
	var newName = $("#username-edit").val();
	socket.emit("requestSetInfo",oldName,newName);
}

// Name Exists
socket.on("nameExists",function(){
	$("#username-error").css("display","block");
	$("username-edit").val("");
});

// Edit Info Done
socket.on("setInfoDone",function(oldName,newName){
	$("#edit-modal").modal("hide");
    var contentString='System Message: Change username to ['+newName+'] successfully!';
    $('#username').html(newName);
    showSystemContent(contentString);
});

// Broadcast to all users about the new update
socket.on("userChangeInfo",function(oldName,newName){
    var contentString='System Message: ['+oldName+'] change username to ['+newName+']';
    showSystemContent(contentString);
});


// New users alert
socket.on("NewUser",function(username){
    var contentString="System Message: ["+username+"] has enter the chat room!.";
    showSystemContent(contentString);
});


// System message
socket.on("system",function(username){
    var contentString="System Message: ["+username+"] Welcome !";
    showSystemContent(contentString);
});

// Get User List
socket.on("user_list",function(userList){
	$(".user-list").html("");

	for(var i=0;i<userList.length;i++){
		$(".user-list").append("<tr class='row'>" +
			"<td class='col-sm-1'>" +
			"<span class='glyphicon glyphicon-user'></span>" +
			"</td>" +
			"<td class='col-sm-11 user-name' title='Clicking the username can send a private message~' onclick='toUser(this)'>"+userList[i].username+"</td>" +
			"</tr>");
	}
	var listCount = $(".user-list").find("tr").length;
	$("#list-count").text("Online User：" + listCount + " people");
});

// Group message
socket.on("UserToGroup",function(name,time,content){
	showContent(name,time,content);
});

// Private message received
socket.on("ReceivedPrivateMessage",function(source,content){
    var contentString=' '+source+' has sent you private message：'+content;
    showSystemContent(contentString);
});

// Private message sent
socket.on("PrivateMessageSent",function(target,content){
    var contentString='You already send '+target+' the private message ：'+content;
    showSystemContent(contentString);
})

// Private message sent failed
socket.on("PrivateMessageFailed",function(){
    showSystemContent("Private message failed to send, username doesn't exists!");
})

// Show content
function showContent(name,time,content){
    var msg_list = $(".msg-list");
    msg_list.append(
        '<div class="msg-info"><span class="msg-name" title="Clicking the username can send a private message" onclick="toUser(this)">'+name+' </span>'+
        '<span class="msg-time">'+time+' </span></div>'+
        '<div class="msg-content">'+content+'</div>'
    );
    var hei = msg_list[0].scrollHeight;
    msg_list.scrollTop(hei);
}

function showSystemContent(content){
    var msg_list = $(".msg-list");
    msg_list.append('<div class="msg-content msg-system">'+content+'</div>');
    var hei = msg_list[0].scrollHeight;
    msg_list.scrollTop(hei);
}