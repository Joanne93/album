// 引入相关模块
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");

// 相关配置信息
var app = express();
app.use(express.static("static"));
app.use(express.static("albums"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: "aihfoihweoifhoiwahfoieahfio",
    resave: false,
    saveUninitialized: true
}));


function start(router) {

    // ajax检查用户名是否存在
    app.get("/checkName", function(req, res) {
        router("/checkName", req, res);
    })

    // 获取验证码
    app.get("/verifycode", function(req, res) {
        router("/verifycode", req, res);
    })

    // 校验验证码
    app.get("/checkVcode", function(req, res) {
        router("/checkVcode", req, res);
    })
    // form表单post提交,文件上传，注册
    app.post("/register", function(req, res) {
        router("/register", req, res);
    })

    // form表单post提交，登录
    app.post("/login", function(req, res) {
        router("/login", req, res);
    })

    // 登录成功跳转main.ejs,main作为中转路由
    app.get("/main", function(req, res) {
        router("/main", req, res);
    })

    // 创建相册
    app.get("/createAlbum", function(req, res) {
        router("/createAlbum", req, res);
    })

    // 删除相册
    app.get("/delAlbum", function(req, res) {
        router("/delAlbum", req, res);
    })

    // 我的相册
    app.get("/myAlbum", function(req, res) {
        router("/myAlbum", req, res);
    })

    // 全部用户
    app.get("/allUser", function(req, res) {
        router("/allUser", req, res);
    })

    // 显示某个用户的全部相册
    app.get("/showImages", function(req, res) {
        router("/showImages", req, res);
    })

    app.get("/cutPic", function(req, res) {
        router("/cutPic", req, res);
    })

    // 登出
    app.get("/exit", function(req, res) {
        router("/exit", req, res);
    })





    // 监听端口
    app.listen(3000, function() {
        console.log("server has started...3000");
    })

}

// 暴露start方法
exports.start = start;

