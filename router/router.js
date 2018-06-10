var fs = require("fs");
var mongodb = require("mongodb");
var formidable = require("formidable");
var svgCaptcha = require('svg-captcha');

// 数据库连接信息
var mongoClient =  mongodb.MongoClient;
var url = "mongodb://localhost:27017/";
var mydb = "joanne";


function route(path, req, res) {
    if(path === "/checkName") {
        // ajax检查用户名是否存在
        console.log(req.query);
        if(req.query && req.query.username) {
            var username = req.query.username;
            var type = req.query.type;
        } else {
            res.json({error: 1, msg: "获取数据失败"});
            return;
        }
        mongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
            if(err) {
                res.json({error:2, msg:"数据库连接失败"});
                console.log(err);
                return;
            }
            var dbase = db.db(mydb);
            var collection = dbase.collection("users");
            collection.findOne({username: username}, function(err, result) {
                if(err) {
                    res.json({error: 4, msg: "数据查询失败"});
                    db.close();
                    return;
                }
                db.close();
                if(result) {
                    if(type === "register") {
                        res.json({error:3, msg:"用户名已存在", type: type});
                        return;
                    } else if(type === "login") {
                        // 把图爿地址传回去
                        res.json({error:0, msg: "用户名存在可以登录", type: type, fileName: result.fileName});
                    }
                }else {
                    if(type === "register") {
                        res.json({error: 0, msg:"用户名可以使用", type: type});
                    } else if (type === "login") {
                        res.json({error: 3, msg: "用户名不存在", type: type});
                    }
                }
            })
        })

    }else if(path === "/verifycode") {
        var code = svgCaptcha.create({  
            size: 4, //验证码长度
            ignoreChars: '0o1i', //验证码字符中排除 0o1i
            inverse: false,  // 翻转颜色  
            fontSize: 36,  // 字体大小  
            noise: 3,   // 噪声线条数  
            width: 100,  // 宽度  
            height: 40,  // 高度  
        });  
        // 保存到session,忽略大小写  
        req.session["verifycode"] = code.text.toLowerCase();  
        // console.log(code.text);
        // 返回数据直接放入页面元素展示即可  
        res.json({error:0, msg:"验证码获取成功", img: code.data});
    }else if(path === "/checkVcode") {
        var vcode = req.query.vcode;
        var verifycode = req.session["verifycode"];
        console.log(verifycode);
        if(!vcode || (vcode.toLowerCase() !== verifycode)) {
            res.json({error: 1, msg: "验证码填写错误"});
            return;
        }else {
            res.json({error: 0, msg: "验证码正确"});
        }
    }else if(path === "/register") {
        var form = new formidable();
        // 临时路径
        form.uploadDir = "./uploadDir";
        // 1、解析表单数据
        form.parse(req, function(err, fields, files){
            if(err){
                res.render("error.ejs",{msg: "数据解析失败"});
                return;
            }
            console.log(fields);
            var username = fields.username;
            var password = fields.password;
            // 2、创建文件夹 ***  如果文件夹存在会报错，应该判断一下
            fs.mkdir("albums/" + username, function(err) {
                if(err) {
                    res.render("error.ejs",{msg:"创建一级文件夹失败"});
                    console.error(err);
                    return;
                }
                fs.mkdir("albums/"+username+"/head_pic", function(err) {
                    if(err) {
                        res.render("error.ejs", {msg: "创建二级文件夹失败"});
                        return;
                    }
                    // 3、判断是否上传了图片
                    if(files.file.name) {
                        var oldPath = files.file.path;
                        var newPath = username + "/head_pic/head_pic." + files.file.name.split(".").pop();
                        console.log("文件格式为："+files.file.type);
                        // console.log(newPath);
                        if(!files.file.type === "image/jpeg") {
                            res.render("error.ejs", {msg: "图片格式错误"});
                            return;
                        }
                        // console.log(files);
                        ///4、重命名 上传了图片就重命名，否则就默认图片
                        fs.rename(oldPath, "albums" + "/" + newPath, function(err) {
                            if(err) {
                                res.render("error.ejs", {msg: "文件重命名失败"});
                                console.log(err);
                                return;
                            }
                            // 连接数据库插入数据
                            fields.fileName = newPath;
                            console.log(fields);
                            connectMongo(req, res, fields);
                        })
                    } else {
                        ///4、复制一个默认图片给用户  ***
                        var defaultFile = "./defaultDir/default0.jpg";
                        if(fields.gender === "M") {
                            defaultFile = "./defaultDir/default2.jpg";
                        } else if (fields.gender === "F") {
                            defaultFile = "./defaultDir/default1.jpg";
                        }
                        var newPath = username + "/head_pic/head_pic.jpg";
                        fs.readFile(defaultFile, function(err, data) {
                            if(err) {
                                res.render("error.ejs", {msg:"读取默认头像失败"});
                                return;
                            }
                            // 创建文件
                            fs.appendFile("albums/"+username+"/head_pic/head_pic.jpg", data, function(err) {
                                if(err) {
                                    res.render("error.ejs", {msg: "创建文件失败"});
                                }
                                // 5、连接数据库并插入数据
                                fields.fileName = newPath;
                                console.log(fields);
                                connectMongo(req, res, fields);
                            })
                        })
                    }
                })
            })
        })
    }else if(path === "/login") {
        console.log(req.body);
        if(!req.body || !req.body.username || !req.body.password) {
            res.render("error.ejs", {msg:"数据获取失败"});
            return;
        }
        var username = req.body.username;
        var password = req.body.password;
        // 连接数据库
        mongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
            if(err) {
                res.render("error.ejs", {msg: "数据库连接失败"});
                return;
            }
            var dbase = db.db(mydb);
            var collection = dbase.collection("users");
            // 查询用户
            collection.findOne({username: username, password: password}, function(err, result) {
                if(err) {
                    res.render("error.ejs", {msg: "数据查询失败"});
                    db.close();
                    return;
                }
                db.close();
                if(result) {
                    req.session.username = result.username;
                    req.session.fileName = result.fileName;
                    // 
                    // 先跳转其他路由，在其他路由里单独写
                    res.redirect("/main");
                } else {
                    res.render("error.ejs", {msg:"用户名或密码错误"});
                    return;
                }

            })
        })
    }else if(path === "/main") {
        if(req.session && req.session.username) {
            var username = req.session.username;
            var currentname = req.query.username;
            console.log("currentname:"+currentname);
            if(currentname) {
                var queryName = currentname;
            }else {
                var queryName = username;
            }
            var fileName = req.session.fileName;
            // var fileName = username + "/head_pic/head_pic.jpg";
            // console.log(fileName);
            // 读取文件目录
            fs.readdir("albums/"+queryName, function(err, arr) {
                if(err) {
                    res.render("error.js", {msg: "读取文件夹失败"});
                    return;
                }
                console.log(arr);
                // 渲染页面
                res.render("main.ejs", {username: username, currentname:queryName, fileName: fileName, arr: arr});
            })
        }else {
            res.redirect("/login.html");
        }
    }else if(path === "/myAlbum") {
        var username = req.session.username;
        if(!username) {
            res.json({error:1, msg: "用户没有登录，请登录"});
            return;
        }
        res.redirect("/main");

    }else if(path === "/allUser") {
        if(req.session && req.session.username) {
            var username = req.session.username;
            if(username) {
                // 获取所有用户相册名称
                fs.readdir("albums", function(err, arr){
                    if(err) {
                        res.json({error: 2, msg: "读取文件夹失败"});
                        console.log(err);
                        return;
                    }
                    // fs.readdir("albums/"+username+"/head_pic", function(err, arr1) {
                    //     if(err) {
                    //         res.json({error: 2, msg: "读取文件夹失败"});
                    //         console.log(err);
                    //         return;
                    //     }
                    //     console.log(arr1);
                    res.json({error:0, msg: "操作成功", arr: arr});
                    // })
                })
            }else {
                res.redirect("/html/login.html");
            }
        }else {
            res.json({error:1, msg: "用户没有登录，请登录"});
            return;
        }
    }else if(path === "/createAlbum") {
        var username = req.session.username;
        if(!username) {
            res.json({error:1, msg: "用户没有登录，请登录"});
            return;
        }
        var dirName = req.query.dirName;
        fs.mkdir("albums/"+username+"/"+dirName, function(err) {
            if(err) {
                res.json({error:2, msg: "创建文件夹失败"});
                console.log(err);
                return;
            }
            res.json({error:0, msg: "创建文件夹成功"});
        })
    }else if(path === "/delAlbum") {
        var username = req.session.username;
        if(!username) {
            res.json({error: 1, msg: "用户没有登录，请登录"});
            return;
        }
        var dirName = req.query.dirName;
        fs.rmdir("albums/"+username+"/"+dirName, function(err) {
            if(err) {
                res.json({error: 2, msg: "删除文件夹失败"});
                console.log(err);
                return;
            }
            res.json({error:0, msg: "删除文件夹成功"});
        })
    }else if(path === "/showImages") {
        var username = req.session.username;
        if(!username){
            res.json({error: 1, msg: "用户没有登录，请登录"});
            return;
        }
        var currentName = req.query.currentName;
        var dirName = req.query.dirName;
        console.log(currentName, dirName);
        fs.readdir("albums/"+currentName+"/"+dirName, function(err, arr) {
            if(err) {
                res.json({error: 1, msg: "读取文件失败"});
                console.log(err);
                return;
            }
            // console.log(arr);
            var dirArr = arr.map(function(item, index, arr) {
                return currentName + "/" + dirName + "/" +item;
            })
            res.json({error:0, msg: "操作成功", arr: arr, dirArr: dirArr});

        })
    }else if(path === "/cutPic") {
        var username = req.session.username;
        var fileName = req.session.fileName;
        res.render("cut.ejs", {
            username: username,
            fileName: fileName
        })
    }else if(path === "/exit") {
        req.session.username = null;
        res.json({error: 0, msg: "用户成功登出"});
    }

    
}


// 注册时候连接数据库
function connectMongo(req, res, params) {
    //  连接数据库
    mongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
        if(err) {
            res.render("error.ejs", {msg: "数据库连接失败"});
            return;
        }
        var dbase = db.db(mydb);
        var collection = dbase.collection("users");
        //  插入数据    
        collection.insertOne(params, function(err, result) {
            if(err) {
                res.render("error.ejs", {msg: "数据插入失败"});
                db.close();
                return;
            }else {
                db.close();
                //  res.render("success.ejs", {msg: username});//渲染页面
                res.redirect("login.html");//跳转页面
            }
        })
    })
}



exports.route = route;