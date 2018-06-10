// 退出登录
$("#exit").click(function() {
    var exit = confirm("确定要退出么?");
    if(exit) {
        $.ajax({
            url: "/exit",
            type: "get",
            dataType: "json",
            success: function(data) {
                console.log(data);
                if(!data.error) {
                    location.href = "/login.html";
                }
            }
        })
    }
})

// 我的主页选项卡
$(".myHome").hover(function() {
    $(this).siblings().toggle();
   /*  if($(".select:visible")){
        $(this).siblings().show();
    }
    $(".select").blur(function() {
        console.log("失去焦点")
        $(this).hide();
    }) */
})

// 移动到相册上的蒙版,给已有的相册添加蒙版
$(".li_dir").hover(mask);
$(".li_pic").hover(mask);

// 创建相册
$("#createAlbum").click(function() {
    $(this).parent().addClass("cur").siblings().removeClass("cur");
    var name = prompt("请输入你想创建的文件夹名称", "旅游");
    console.log(name);
    if(name) {
        $.ajax({
            url: "/createAlbum?dirName="+name,
            // data: {dirName: name},
            type: "get",
            dataType: "json",
            success: function(data){
                console.log(data);
                if(!data.error) {
                    var $li = $("<li class='li_dir'></li>");
                    // 追加
                    /* var div = [
                        '<div class="images">',
                            '<img src="images/folder.png" alt="" class="cover">',
                        '</div>',
                        '<p class="explain">',
                            '<a href="" class="Alame">'+name+'</a>',
                            '<a href="">图标</a>',
                        '</p>',
                        '<div class="mask">',
                            '<a href="" class="delAlbum"><img src="images/del.png" alt=""></a>',
                        '</div>',
                    ].join(""); */
                    var div = `
                        <div class="images">
                            <img src="images/folder.png" alt="" class="cover">
                        </div>
                        <p class="explain">
                            <a href="" class="Alame">${name}</a>
                            <a href="">图标</a>
                        </p>
                        <div class="mask">
                            <a href="" class="delAlbum"><img src="images/del.png" alt=""></a>
                        </div>
                    `;
                    $li.html(div);
                    $li.hover(mask);//添加hover事件
                    $(".showImg").append($li);
                    // 在上传照片的下拉框里增加这个新的相册<option value=""><%=arr[i]%></option>
                    var option = `<option value=''>${name}</option>`;
                    $("#wenjianjia").append(option);
                }else if(data.error === 1) {
                    window.open("/login.html");
                }else {
                    new Error(data.msg);
                }
            }
        })
    }
    return false;
})

// 删除相册,这里可以用委托模式，因为li是动态的，给li绑事件如果新增的li默认没有事件。所以给父元素增加事件
$(".delAlbum").click(function() {
    var $that = $(this);
    var del = confirm("你确定要删除这个相册么？");
    if(del) {
        var dirName = $(this).parent().siblings(".explain").children(".Alame").text();
        console.log(dirName);
        $.ajax({
            url: "/delAlbum",
            data: {dirName, dirName},
            type: "get",
            dataType: "json",
            success: function(data) {
                console.log(data);
                if(!data.error){
                    // console.log($that.parents("li"));
                    // 下树
                    $that.parents("li").remove();
                    // 弹出框里的option也得消失
                    $("#wenjianjia option").contains(dirName).remove();
                }
            }
        })
    }
    return false;
})

// 我的相册
/* $("#myAlbum").click(function() {
    $(this).parent().addClass("cur").siblings().removeClass("cur");
    $.ajax({
        url: "/myAlbum",
        type: "get",
        dataType: "json",
        success: function(data) {
            console.log(data);
        }
    })
}) */

// 全部用户
$("#allUser").click(function() {
    $(this).parent().addClass("cur").siblings().removeClass("cur");
    $.ajax({
        url: "/allUser",
        type: "get",
        dataType: "json",
        success: function(data) {
            console.log(data);
            if(!data.error) {
                $(".showImg").children().remove();
                // 追加
                var arr = [];
                for(var i=0; i<data.arr.length;i++) {
                    /* var temp = [
                        '<li class="li_user">',
                            '<div class="images">',
                                '<img src="'+data.arr[i]+'/head_pic/head_pic.jpg" alt="" class="cover">',
                            '</div>',
                            '<p class="explain">',
                                '<a href="" class="Alame">'+data.arr[i]+'</a>',
                                '<a href="">图标</a>',
                            '</p>',
                            '<div class="mask">',
                                '<a href="" class="delAlbum"><img src="images/del.png" alt=""></a>',
                            '</div>',
                        '</li>'
                    ]; */
                    var temp = `
                        <li class="li_user">
                            <div class="images">
                                <img src="${data.arr[i]}/head_pic/head_pic.jpg" alt="" class="cover">
                            </div>
                            <p class="explain">
                                <a href="" class="Alame">${data.arr[i]}</a>
                                <a href="">图标</a>
                            </p>
                        </li>
                        `;
                    arr.push(temp);
                }
                // console.log(arr);
                $(".showImg").append(arr.join(""));
            }
        }
    })
})

// 点击某个用户/相册显示对应的相册/图片列表
// 委托模式，给每个li绑定事件，但是li是动态添加的，所以操作li的父亲ul
$(".showImg").on("click", "li", function() {
    if(this.className === "li_user") {//用户列表
        var username = $(this).find(".Alame").html();
        window.location.href = "/main?username="+username;
        // $(this).parents().siblings(".hidden").attr("href", ("/main?username="+username))[0].click();
    }else if(this.className === "li_dir"){//目录列表
        var dirName = $(this).find(".Alame").html();
        var currentName = $("#currentname").val();
        console.log(currentName);
        // 显示所有照片
        $.ajax({
            url: "/showImages",
            data: {currentName:currentName,dirName:dirName},
            type: "get",
            dataType: "json",
            success: function(data) {
                console.log(data);
                if(!data.err) {
                    $(".showImg").children().remove();
                    // 追加
                    for(var i=0; i<data.dirArr.length;i++) {
                        /* var temp = [
                            '<li class="li_pic">',
                                '<div class="images">',
                                    '<img src="'+data.dirArr[i]+'" alt="" class="cover">',
                                '</div>',
                                '<p class="explain">',
                                    '<a href="" class="Alame">'+data.arr[i]+'</a>',
                                    '<a href="">图标</a>',
                                '</p>',
                                '<div class="mask">',
                                    '<a href="" class="delAlbum"><img src="images/del.png" alt=""></a>',
                                '</div>',
                            '</li>'
                        ]; */
                        // arr.push(temp.join(""));
                        var $li = $("<li class='li_pic'></li>");
                        var div = `
                            <div class="images">
                                <img src="${data.dirArr[i]}" alt="" class="cover">
                            </div>
                            <p class="explain">
                                <a href="" class="Alame">${data.arr[i]}</a>
                                <a href="">图标</a>
                            </p>
                            <div class="mask">
                                <a href="" class="delAlbum"><img src="images/del.png" alt=""></a>
                            </div>
                        `
                        $li.html(div);
                        $li.hover(mask);//加hover事件
                        $(".showImg").append($li);
                    }
                }
            }
        })
    }else if(this.className === "li_pic"){//图片列表
        // console.log("点不了");
        return false;
    }

})

// 添加蒙版
function mask() {
    $(this).children(".mask").toggle();
}

// 上传图片
$("#uploadPic").click(function() {
    // 显示弹出框
    $(".meng").show().next().show();

})

// 取消上传照片
$(".cancel").click(function() {
    $(".meng").hide().next().hide();
})
