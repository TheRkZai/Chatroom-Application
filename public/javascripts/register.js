/**
 * Created by RkZai on 2017/8/3.
 */
$(function(){
    $("#login").click(function(){
        location.href = 'login';
    });
    $("#register").click(function(){
        var username = $("#username").val();
        var password = $("#password").val();
        var repassword = $("#repassword").val();
        if(password !== repassword){
            $('#colWarning').html("Two passwords don't match!");
        }else if(password === repassword){
            var data = {"username":username,"password":password};
            $.ajax({
                url: '/register',
                type: 'post',
                data: data,
                success: function(result){
                    $('#colWarning').html(result.message);
                    if (!result.code) {
                        location.href = 'login';
                    }else{
                        setTimeout(function() {
                            location.href = 'register';
                        }, 3000);
                    }
                }
            });
        }
    });
});