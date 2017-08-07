/**
 * Created by RkZai on 2017/8/3.
 */
$(function(){
    $("#register0").click(function(){
        location.href = 'register';
    });
    $("#login0").click(function(){
        var username = $("#username").val();
        var password = $("#password").val();
        var data = {"username":username,"password":password};
        $.ajax({
            url:'/login',
            type:'post',
            data: data,
            success: function(data,status){
                if(status == 'success'){
                    location.href = 'home';
                }
            },
            error: function(data,status){
                if(status == 'error'){
                    location.href = 'login';
                }
            }
        });
    });
});