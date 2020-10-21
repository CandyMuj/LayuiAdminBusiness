/**
 * 接口统一配置
 * 还有一种策略就是在这个文件里面同时直接调用ajax，返回结果就好，因为之前有个前端同事他们是这么设计的，这个文件内的方法直接请求，只返回结果即可
 * 如：
 * var IFACE = {
 *     account:{
 *         addOrUpd: function(data){
 *             let d
 *             AJAX.POST(....,d=>{
 *                 d=d;
 *             })
 *             return d;
 *         }
 *     }
 * }
 *
 * 缺点也很明显，写法和处理业务逻辑都并不方便，反正上层都是调用一个方法获取返回结果集，那么直接在上层用ajax的回调处理起来要更方便一些，
 * 只需要把接口统一管理一下就好了，这样处理是最方便的处理方式。我也不知道为什么他们那么设计，有什么好处呢？
 */

var IFACE = {
    third: {
        // 获取图形验证码
        imgCode: "/third/img/code",
    },
    acccount: {
        login: "/account/admin/login",
    }
}