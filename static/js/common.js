(function() {

    var $username = $("#username");
    var $password = $("#password");
    var $repassword = $("#repassword");
    var $email = $("#email");
    var $phone = $("#phone");
    var $vcode = $("#vcode");
    var $agree = $("#agree");
    var $registerBtn = $("#registerBtn");
    var $loginBtn = $("#loginBtn");


    // 给必填项加上锁，只能所有锁都是true的时候才能提交表单
    var username_lock = false;
    var password_lock = false;
    var repassword_lock = false;
    var email_lock = true;
    var phone_lock = true;
    var vcode_lock = true;
    var argee_lock = true;

    // 点击注册
    $registerBtn.click(function(e) {
        if(!username_lock || !password_lock || !repassword_lock || !email_lock || !phone_lock || !vcode_lock || !argee_lock) {
            e.preventDefault();
        }
    })

    // 点击登录
    $loginBtn.click(function(e) {
        if(!username_lock || !password_lock) {
            e.preventDefault();
        }
    })


    // 验证用户名
    $username.focus(function(){
        $(this).parent().siblings(".tip").children().html("").parent().hide();
        username_lock = false;
    }).blur(function() {
        var value = $(this).val();
        var isEmpty = regStrategy.use("notEmpty", value);
        if(isEmpty) {
            $(this).parent().siblings(".tip").children().html(isEmpty).parent().show();
            return;
        }
        var isRight = regStrategy.use("all_En", value);
        if(isRight) {
            $(this).parent().siblings(".tip").children().html(isRight).parent().show();
            return;
        }
        // 注册
        if(type === 'register') {
            var param = {type: "register"};
        // 登录
        }else if (type === 'login') {
            var param = {type: "login"};
        }
        $.ajax({
            url: "/checkName?username="+value,
            data: param,
            type: "get",
            dataType: "json",
            success: function(data) {
                console.log(data);
                if(!data.error) {
                    $username.parent().siblings(".tip").children().html("√").parent().show();
                    username_lock = true;
                }else if(data.error === 3){
                    $username.parent().siblings(".tip").children().html(data.msg).parent().show();
                }else {
                    console.error(data.msg);
                    // new Error(data.msg);
                }
                if(type === "login") {
                    // 修改头像
                    console.log(data.fileName);
                    $("#pic").attr("src", data.fileName);
                }
            }
        })
        
    })

    // 验证密码
    $password.focus(function() {
        $(this).parent().siblings(".tip").children().html("").parent().hide();
        password_lock = false;
    }).blur(function() {
        var value = $(this).val();
        var isEmpty = regStrategy.use("notEmpty", value);
        if(isEmpty) {
            $(this).parent().siblings(".tip").children().html(isEmpty).parent().show();
            return;
        }
        var isRight = regStrategy.use("password", value);
        if(isRight) {
            $(this).parent().siblings(".tip").children().html(isRight).parent().show();
            return;
        }
        $(this).parent().siblings(".tip").children().html("√").parent().show();
        password_lock = true;
    })

    // 重复密码
    $repassword.focus(function() {
        $(this).parent().siblings(".tip").children().html("").parent().hide();
        repassword_lock = false;
    }).blur(function() {
        var value = $(this).val();
        var password = $password.val();
        var isEmpty = regStrategy.use("notEmpty", value);
        if(isEmpty) {
            $(this).parent().siblings(".tip").children().html(isEmpty).parent().show();
            return;
        }
        if(value !== password) {
            $(this).parent().siblings(".tip").children().html("两次密码不一致").parent().show();
            return;
        }
        $(this).parent().siblings(".tip").children().html("√").parent().show();
        repassword_lock = true;
    })

    // 验证邮箱
    $email.focus(function() {
        $(this).parent().siblings(".tip").children().html("").parent().hide();
        email_lock = true;
    }).blur(function() {
        var value = $(this).val().trim();
        if(value) {
            var isEmail = regStrategy.use("email", value);
            if(isEmail) {
                $(this).parent().siblings(".tip").children().html(isEmail).parent().show();
                email_lock = false;
                return;
            }
            $(this).parent().siblings(".tip").children().html("√").parent().show();
            email_lock = true;
        }
    })

    // 验证手机号码
    $phone.focus(function() {
        $(this).parent().siblings(".tip").children().html("").parent().hide();
        phone_lock = true;
    }).blur(function() {
        var value = $(this).val().trim();
        if(value) {
            var isPhone = regStrategy.use("phone", value);
            if(isPhone) {
                $(this).parent().siblings(".tip").children().html(isPhone).parent().show();
                phone_lock = false;
                return;
            }
            $(this).parent().siblings(".tip").children().html("√").parent().show();
            phone_lock = true;
        }
    })

    // 验证验证码
    $vcode.focus(function() {
        $(this).parent().siblings(".tip").children().html("").parent().hide();
        vcode_lock = true;
    }).blur(function() {
        var value = $(this).val();
        var vcode = $vcode.val();
        var isEmpty = regStrategy.use("notEmpty", value);
        if(isEmpty) {
            $(this).parent().siblings(".tip").children().html(isEmpty).parent().show();
            return;
        }
        $.ajax({
            url: "checkVcode?vcode="+vcode,
            type: "get",
            dataType: "json",
            success: function(data) {
                console.log(data);
                if(!data.error) {
                    $vcode.parent().siblings(".tip").children().html("√").parent().show();
                    vcode_lock = true;
                }else {
                    $vcode.parent().siblings(".tip").children().html(data.msg).parent().show();
                    vcode_lock = false;
                }
            }
        })
    })

    // 验证勾选服务条款
    $agree.change(function() {
        if(!$agree[0].checked) {
            $(this).siblings("span").show();
            argee_lock = false;
        }else {
            $(this).siblings("span").hide();
            argee_lock = true;
        }

    })
    

})()
   