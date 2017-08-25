/**
 * Created by RkZai on 2017/8/3.
 */
$(function(){
    $("#register").click(function(){
        location.href = 'register';
    });
    $("#login").click(function(){
        var username = $("#username").val();
        var password = $("#password").val();
        var data = {"username":username,"password":password};
        $.ajax({
            url:'/login',
            type:'post',
            data: data,
            success: function(result){
                $('#colWarning').html(result.message);
                if (!result.code) {
                    location.href = 'home';
                }else{
                    $("#password").val("");
                }
            }
        });
    });
});