// 定义验证策略对象
var regStrategy = (function() {
    // 定义策略对象
    var _S = {
        // 定义验证策略
        notEmpty: function(str) {
            var reg = /^\s*$/;
            return reg.test(str) ? "请输入非空字符串" : "";
        },
        all_En: function(str) {
            var reg = /^[a-zA-Z0-9]{5,12}$/;
            return reg.test(str) ? "" : "请输入5~12位字符";
        },
        password: function(str) {
            var reg = /^\w{6,12}$/;
            return reg.test(str) ? "" : "请输入6~12个字符";
        },
        phone: function(str) {
            var phonereg = /^([[\+]?86|0])?1([3|4|5|8])[0-9]{9}$/;
            return phonereg.test(str) ? "" : "手机号不合法";
        },
        email: function(str) {
            var emailreg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w+)+$/;
            return emailreg.test(str) ? "" : "邮箱不合法";
        },
        birth: function(str) {
            var birthreg = /^(\d{4})([-]{1})(\d{2})([-]{1})(\d{2})$/;
            return birthreg.test(str) ? "" : "出生日期不合法";
        },
        idcard: function(str) {
            var idcardreg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/;
            return idcardreg.test(str) ? "" : "身份证不合法";
        }

    }
    // 返回接口
    return {
        use: function(type, str) {
            return _S[type](str);
        },
        add: function() {

        }
    }
})()