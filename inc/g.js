var config = {
    root: 'http://127.0.0.1:9233',
    ueditor: 'http://127.0.0.1/ueditor/',
    ossroot: 'http://xxx.oss-cn-hangzhou.aliyuncs.com/',
    pageSize: 10,
    // base: "/a/"
    base: "/"
};

var AJAX = new function () {
    var _xhr,
        K = "_token",
        abs = null,
        t = this;
    const signField = 'sign',
        signKey = 'SxgKESLGzlw@iH8f',
        signNonce = 'nonce_str';

    function finish(v, cb) {
        if (cb == null) return;
        var o;
        if (v && v.length > 1) {
            try {
                o = JSON.parse(v);
            } catch (e) {
                o = v;
            }
        }
        if (o && o.code < 0) {
            Comm.message(o.msg);
        }
        if (o && o.code === 403) {
            Comm.msg("登录已过期，请重新登录", 5);
            AJAX.clearTag();
            return;
        }
        cb(o);
    }

    function ab() {
        if (abs == null) {
            abs = top.Comm.db(K);
            if (abs == null) abs = "";
        }
        return abs;
    }

    function repair(api) {
        // var a = ab();
        // if (a)
        //     api += (api.indexOf("?") > 0 ? "&" : "?") + K + "=" + a + "&timespan=" + Math.random();
        // return api;
        api += (api.indexOf("?") > 0 ? "&" : "?") + "timespan=" + (new Date().getTime());
        return api;
    }

    function deobj(obj, url) {
        if (obj == null) return "";
        let s = [];
        let data = {};
        // 如果传入了url，那么就从url中解析参数，如果有则用于加密（在设置参数名称时禁止重名，否则会被覆盖
        if (url) urlParame(url, data);

        for (let i in obj) {
            let val = obj[i];
            if (typeof val === typeof "") {
                if (val.indexOf("%") > 0) val = val.replace(/%/g, "%25");
                if (val.indexOf("&") > 0) val = val.replace(/&/g, "%26");
                if (val.indexOf("+") > 0) val = val.replace(/\+/g, "%2B");
            }
            if (val || typeof val === "number") {
                s.push(i + "=" + encodeURIComponent(val));
                data[i] = val;
            }
        }

        // 参数数据加密处理
        // 仅可校验非body参数，因为body参数在后端仅可被读取一次，重复读取将会抛异常，所以无法加密的，而且body还可能是二进制文件，是不方便加密和重复读取的，流的特性只可被读取一次
        s.push(signField + "=" + generateSignature(data))

        return s.join("&");
    }

    /**
     * 从url中解析参数并追加到已有参数对象中
     */
    function urlParame(url, param) {
        let index = url.indexOf("?");
        if (index !== -1) {
            let str = url.substring(index + 1)
            if (str) {
                if (param == null) param = {};
                str.split("&").forEach(v => {
                    let o = v.split("=");
                    param[o[0]] = o[1];
                })
            }
        }

        return param
    }

    /**
     * 生成签名
     *
     * @param data json格式数据
     * @returns {string}
     */
    function generateSignature(data) {
        let keyArray = [];
        $.each(data, key => {
            keyArray.push(key)
        })

        keyArray = keyArray.sort();
        let sb = "";
        $.each(keyArray, i => {
            let k = keyArray[i];
            if (k === signField) {
                return true;
            }
            let val = (data[k] || typeof data[k] === "number") ? String(data[k]).trim() : null;
            if (val) {
                sb += (k + '=' + val + '&');
            }
        })
        sb += ('key=' + signKey);

        return MD5.md5(sb).toUpperCase();
    }

    function error(code, cb) {
        Comm.loading();
        cb && cb({code: -1, msg: "服务器异常"});
    }

    /**
     * 初始化请求操作
     * @param method
     * @param url
     * @param data 规定data为json格式
     * @param body body传参，规定post请求，json格式
     * @param cb
     * @param asyn
     */
    function init(method, url, data, body, cb, asyn) {
        // Comm.loading(true);
        url = t.Uri() + repair(url);
        let xhrMethod = ("BODY" === method ? "POST" : method);
        if (asyn == null) asyn = true;
        if (body == null) body = {};
        data = (data == null) ? {} : data;
        data[signNonce] = Comm.uuid();

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    finish(this.responseText, cb);
                } else {
                    error(this.status, cb);
                }
            }
        };

        let ag = ab();
        if ("GET" === method) {
            data = deobj(data, url);
            url += (url.indexOf("?") === -1 ? "?" : "&") + data;
            data = null;

            xhr.open(xhrMethod, url, asyn);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        } else if ("BODY" === method) {
            data = deobj(data, url);
            url += (url.indexOf("?") === -1 ? "?" : "&") + data;
            data = JSON.stringify(body);

            xhr.open(xhrMethod, url, asyn);
            xhr.setRequestHeader("Content-Type", "application/json");
        } else {
            data = deobj(data, url);

            xhr.open(xhrMethod, url, asyn);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.setRequestHeader("Authorization", ag ? "Bearer " + ag : "Basic SFlDQk9CVmN4N2ltbUQzTDolTlVPaVQ5RiVPUCk2UGwhM1BDdw==");

        xhr.send(data);
        // Comm.loading(false);
    }

    /*----AJAX公用方法-----*/

    /* 支持的请求方式 */
    t.SUPPORT = {
        GET: 'GET',
        POST: 'POST',
        BODY: 'BODY',
        DELETE: 'DELETE',
        PUT: 'PUT',
    }

    /*获取服务器接口根路径*/
    t.Uri = function () {
        return window["config"] && window["config"]["root"] ? config.root : "";
    };

    /*拼接请求路径*/
    t.Url = function (uri) {
        return t.Uri() + uri;
    }

    /*获取服务器调试页面根路径*/
    t.WebRoot = function () {
        return window["config"] && window["config"]["webroot"] ? config.webroot : "";
    };

    /*调用用户登录token*/
    t.setTag = function (a) {
        abs = a;
        Comm.db(K, abs);
    };

    /*用户登录成功*/
    t.setLogin = function (d) {
        var u = d.data.customerInfo;
        var s = d.data.storeInfo;
        AJAX.setTag(u.token);
        Comm.db("_userinfo", {
            id: u.userId,
            p: u.phone,
            status: u.status,
            headImg: s.companyLogo,
            nickname: u.nickname,
            realname: u.realname,
            phone: s.phone
        });
    };

    /*退出登录清除token，并跳转到登录*/
    t.clearTag = function () {
        abs = null;
        top.Comm.db(K, null);
        top.Comm.db("_userinfo", null);

        setTimeout(function () {
            if (self == top) {
                location.href = config.base + 'login.html';
            } else {
                top.location.href = config.base + 'login.html';
            }
        }, 2000);
    };

    /*自定义初始化，一般用于框架内的组件调用，如：table，因为无法确认使用post还是get所以需要手动在组件内初始化，其他类似的也是这个道理*/
    t.INIT = function (method, url, data, body, cb, asyn) {
        init(method, url, data, body, cb, asyn);
    };
    /*执行GET方法，一般用于从服务器获取数据，api长度尽量不超过1000字节*/
    t.GET = function (api, data, cb, asyn) {
        init(t.SUPPORT.GET, api, data, null, cb, asyn);
    };
    /*执行POST方法，一般用于向服务器提交数据，data建议不为空*/
    t.POST = function (api, data, cb, asyn) {
        init(t.SUPPORT.POST, api, data, null, cb, asyn);
    };
    /*执行POST BODY传参，data建议不为空*/
    t.BODY = function (api, data, body, cb, asyn) {
        init(t.SUPPORT.BODY, api, data, body, cb, asyn);
    };
    /*执行DELETE方法*/
    t.DELETE = function (api, data, cb, asyn) {
        init(t.SUPPORT.DELETE, api, data, null, cb, asyn);
    };
    /*执行PUT方法，一般用于向服务器提交数据，data建议不为空*/
    t.PUT = function (api, data, cb, asyn) {
        init(t.SUPPORT.PUT, api, data, null, cb, asyn);
    };
    /*根据用户凭证判断用户是否登录*/
    t.isLogin = function () {
        return ab().length > 0;
    };
}();
var Comm = {
    /**
     * json格式化输出到页面
     *
     * @param json json数据对象或者json字符串
     * @param preId pre标签id，用于页面展示
     * @returns {string}
     */
    /* 需添加css样式
    <style type="text/css">
        pre {
            outline: 1px solid #ccc; padding: 5px; margin: 5px;
            text-align: left;
        }
        .string { color: green; }
        .number { color: darkorange; }
        .boolean { color: blue; }
        .null { color: magenta; }
        .key { color: red; }
    </style>
    <pre id="result"></pre>
    $('#result').html(syntaxHighlight(res));
    */
    jsonSyntaxHighlight: function (json, preId) {
        if (preId != null) {
            $('#' + preId).html(toHtml(json));
        } else {
            return toHtml(json);
        }


        function toHtml(json) {
            if (typeof json != 'string') {
                json = JSON.stringify(json, undefined, 2);
            }
            json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }
    },
    // 生成uuid
    uuid: function uuid() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    },
    //限制字数
    limitSize: function (a, v, size, remark) {
        var str = $(a + "[name='" + v + "']").val();
        if (str && str.length > size) {
            Comm.msg(remark + "字数超过" + size + "字", 5)
            return true;
        }
        return false;
    },
    Cookie: {
        set: function (name, value) {
            document.cookie = name + "=" + escape(value);
        },
        get: function (name) {
            var arr,
                reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
            else return "";
        }
    },
    /**
     * 获取当前选中的菜单的id
     * @return {jQuery}
     */
    nowMenuId: function () {
        return $('.layui-side .layui-this a').data('id');
    },
    parse: function (s) {
        var o;
        try {
            o = JSON.parse(s);
        } catch (e) {
            o = s;
        }
        return o;
    },
    deData: function (s) {
        if (s && s.indexOf("/") > -1) {
            s = decodeURIComponent(s.replace(/\//g, "%"));
        }
        return Comm.parse(s);
    },
    enData: function (o) {
        return encodeURIComponent(JSON.stringify(o)).replace(/\%/g, "/");
    },
    db: function (t, v) {
        if (v == null) {
            if (arguments.length === 1) {
                return Comm.deData(Comm.Cookie.get(t));
            } else {
                Comm.Cookie.set(t, "");
            }
        } else {
            Comm.Cookie.set(t, Comm.enData(v));
        }
    },
    //调用方法Comm.OSS.getImgUrl(uri,'l');图片前缀更新方法
    OSS: {
        /*阿里云oss工具*/
        host: function () {
            return window["config"] && window.config["ossroot"] ? config.ossroot : "";
        },
        inithtml: function (d, cb) {
            top.Comm.laytpl(top.$("#upimgTpl").html()).render(d, function (html) {
                cb && cb(html)
            })
        },
        initimg: function (key, cb, readOnly) {
            var d = {};
            d.key = key;
            d.readOnly = readOnly;
            top.Comm.laytpl(top.$("#upimgTpl").html()).render(d, function (html) {
                cb && cb(html)
            })
        },
        imghtml: function (uri, styleType, isurl) {
            if (!uri || uri == 'undefined') return "";

            var style;
            switch (styleType) {
                case 1:
                    style = 'width:30px;height:30px;border-radius:60px;';
                    break;
                default:
                    style = '';
                    break;
            }

            return '<img onclick="Comm.showimg(this)" src=' + (isurl ? '' : config.ossroot) + uri + ' class="layui-upload-img" style="' + style + '">';
        },
        /*oss访问地址*/
        /*
            获取图片访问地址
            uri:数据库中保存的文件地址
            type:显示类型 	取值:s|m|l
             */
        getImgUrl: function (uri, type) {
            if (uri == null) return "-----------error";
            if (uri.length >= 4 && uri.indexOf("http") > -1) return uri;
            var url = Comm.OSS.host() + uri;
            if (type) {
                switch (type) {
                    case "l":
                        url += "/800";
                        break;
                    case "f":
                        url += "/400";
                        break;
                    case "m":
                        url += "/250";
                        break;
                    case "s":
                        url += "/120";
                        break;
                    default:
                        break;
                }
            }
            return url;
        }
    },
    //创建对象，并追加到f里面，attr:对象属性
    create: function (att, f, tag) {
        var a = document.createElement(tag ? tag : "div");
        if (att)
            for (var i in att) a[i] = att[i];
        (Comm.g(f) || document.body).appendChild(a);
        return a;
    },
    g: function (o) {
        if (typeof o == typeof {}) return o;
        return document.getElementById(o);
    },
    //尝试执行根方法
    exec: function (m) {
        if (window[m]) {
            var a = [];
            for (var i = 1; i < arguments.length; i++)
                a[i - 1] = arguments[i];
            window[m].apply(null, a);
        }
    },
    //显示加载s为需要显示的内容,s为false则表示关闭
    loading: function (s) {
        if (s) {
            layer.load();
        } else {
            layer.closeAll('loading');
        }
    },
    msg: function (msg, type) {
        Comm.layer.msg(msg, {
            icon: type,
            zIndex: 9999999999999999999
        });
    },
    alert: function (str, tabCode) {
        if (tabCode) {
            Comm.layer.alert(str, {
                icon: 5,
                closeBtn: 0,
                yes: () => {
                    parent.cms.deltab(tabCode);
                }
            });
        } else {
            Comm.layer.alert(str, {icon: 1});
        }
    },
    //confirm cb返回true,false
    confirm: function (str, cb) {
        Comm.layer.confirm(str, {
            icon: 3,
            title: "提示",
            btnAlign: 'c'
        }, function (index) {
            cb && cb(1);
            layer.close(index);
        })
    },
    //查询url参数，n:名称
    query: function (n, u) {
        var s = u;
        if (s == null) s = self.location.href;
        if (n) {
            var g = new RegExp("(\\?|&)" + n + "=([^&|#]*)");
            var r = s.match(g);
            if (r) {
                try {
                    return decodeURIComponent(r[2]);
                } catch (err) {
                    return unescape(r[2]);
                }

            } else return "";
        } else {
            var i = s.indexOf("?");
            if (i === -1) return "";
            return s.substr(i + 1);
        }
    },
    go: function (r) {
        location.href = r;
    },
    price: function (v) {
        if (v == 0) {
            return v;
        }
        if (v != null && v != "" && v != undefined) {
            return (Number(v) / 100).toFixed(2);
        }
    },
    onlyNum: function (dom, n) {
        // 仅可是正数
        // 后方可保留的小数位数
        // 为空：默认两位
        // 为0 或小于0：正整数
        n = (n == 0 || n) ? n : 2;
        let reg = new RegExp("\\d+(" + (n > 0 ? "\\.\\d{0," + n + "}" : "") + ")?");
        dom.value = dom.value.match(reg) ? dom.value.match(reg)[0] : '';
    },
    sex: function (sex) {
        if (sex == '1' || sex == 1) {
            return "男";
        } else if (sex == '2' || sex == 2) {
            return "女";
        } else {
            return "人妖";
        }
    },
    //时间转换函数
    format: function (stamp, type) {
        type = type && type.match(/\w+/g);
        var now = new Date(stamp),
            year = now.getFullYear(),
            month = now.getMonth() + 1,
            date = now.getDate(),
            hour = now.getHours(),
            minute = now.getMinutes(),
            second = now.getSeconds(),
            o = [],
            arr = {
                yyyy: year,
                mm: check(month),
                dd: check(date),
                h: check(hour),
                m: check(minute),
                s: check(second)
            };
        if (type) {
            for (var i = 0; i < type.length; i++) {
                var tmp = type[i];
                tmp = tmp.toLocaleLowerCase();
                if (arr[type[i]])
                    o.push(type[i] == "h" ? " " + arr[type[i]] : "-" + arr[type[i]]);
            }
            if (o.length) return o.join("").slice(1);
        } else
            return (
                arr.yyyy +
                "-" +
                arr.mm +
                "-" +
                arr.dd +
                " " +
                arr.h +
                ":" +
                arr.m +
                ":" +
                arr.s
            );

        function check(num) {
            if (num < 10) {
                return "0" + num;
            }
            return num;
        }
    },
    GetData: function (id) {
        var p = {};
        var id = id == undefined || id == "" ? "form" : id;
        $("#" + id).find("input,textarea,select").each(function (i, e) {
            if ($(e).attr("name") != undefined) {
                if ($(e).attr('laydate') != undefined) {
                    p[$(e).attr("name")] = $(e).val();
                } else {
                    p[$(e).attr("name")] = $(e).val();
                }
            }
        })
        return p;
    },
    SetData: function (p, id) {
        var id = id == undefined || id == "" ? "form" : id;

        $("#" + id).find("input,textarea,select").each(function (i, e) {
            if ($(e).attr("name") != undefined && $(e).attr("type") != "radio") {
                var v = p[$(e).attr("name")]
                if (void 0 !== v && null !== v && "null" !== v || (v = "")) {
                    $(e).val(v);
                }
                if (e.hasAttribute('laydate')) {
                    Comm.laydateinit(e);
                }
            }
        })
        return p;
    },
    laydateinit: function (e) {
        var c = {
            elem: "#" + $(e).attr("id"),
            type: $(e).attr("type") != undefined && $(e).attr("type") != '' ? $(e).attr("type") : 'date',
            range: $(e).attr("range") != undefined ? true : false,
        }
        if (e.hasAttribute("min")) {
            c.min = $(e).attr("min")
        }
        if (e.hasAttribute("max")) {
            c.max = $(e).attr("max")
        }
        if (e.hasAttribute("format")) {
            c.format = $(e).attr("format");
        }
        if ($(e).val() != "") {
            c.value = $(e).val();
        }
        $(e).attr("type", 'text');
        Comm.laydate.render(c);
    },
    showimg: function (a) {
        Comm.layer.open({
            type: 1,
            title: '查看图片',
            maxmin: true,
            area: ['500px', '500px'],
            shade: 0.3,
            content: '<div style="text-align: center;"><img src="' + $(a).attr('src') + '" width="100%"/></div>'
        })
    },
    richText: function (str) {
        if (typeof (str) == typeof ('')) {
            return str.replace(/%26/g, "&").replace(/%25/g, "%").replace(/%2B/g, "+");
        }
        return str;
    },
    bitunencode: function (t, w) { //反解析 位运算的值
        var l = [];
        for (var i = 0; i < w; i++) {
            if (t & Math.round(Math.pow(2, i))) {
                console.log(i + 1)
                l.push(i + 1);
            }
        }
        return l;
    },
    bitencode: function (d) {
        //d:[1, 2, 4, 9, 12, 20, 26, 29, 30, 31]; 需要位运算的值
        var t = 0;
        for (var i = 0; i < d.length; i++) {
            t += Math.round(Math.pow(2, d[i] - 1))
            console.log(t)
        }
        return t;
    },
};

var $ = null;
//初始化页面
window.onload = function () {
    layui.config({
        base: 'inc/'
    });
    /**
     * 对layui进行全局配置
     */
    layui.use(['table', 'laydate', 'form', 'laytpl', 'layer', 'jquery', 'upload', 'element'], function () {
        //初始化,全局变量 不可污染
        Comm.table = layui.table, Comm.laytpl = layui.laytpl, Comm.form = layui.form, Comm.laydate = layui.laydate, Comm.layer = layui.layer, $ = layui.jquery, Comm.upload = layui.upload;

        /*处理时间选择器*/
        $("input[laydate]").each(function (i, e) {
            Comm.laydateinit(e);
        });

        //处理页面table
        /*search
        parm@id:表单id
        parm@table:tableid
        */
        Comm.search = function (id, table) {
            id = id ? id : 'search-form'
            table = table ? table : 'table'
            //执行重载
            Comm.table.reload(table, {
                page: {curr: 1}, //重新从第 1 页开始
                where: Comm.GetData(id)
            });
        };

        // 获取table中选中的数据的id串
        // onlyone:true 仅可选择一条数据
        Comm.checkIds = function (id, table, onlyone) {
            id = id ? id : 'id';
            table = table ? table : 'table';

            var d = Comm.table.checkStatus(table);  //获取选中的数据
            if (onlyone && d.data.length != 1) {
                Comm.msg("请选择一条数据哦", 5);
                return;
            }
            if (d.data.length <= 0) {
                Comm.msg("请至少选择一条数据", 5);
                return;
            }

            var ids = [];
            for (var i = 0; i < d.data.length; i++) {
                ids.push(d.data[i][id]);
            }
            return ids.join(",");
        };

        /*sort
        parm@id:表单id
        parm@table:tableid
        */
        Comm.sort = function (id, table) {
            id = id ? id : 'search-form'
            table = table ? table : 'table'
            /*sort*/
            Comm.table.on('sort(' + table + ')', function (obj) {
                var p = Comm.GetData(id);
                p[obj.field] = obj.type
                Comm.table.reload(table, {
                    page: {curr: 1}, //重新从第 1 页开始
                    initSort: obj,
                    where: p
                });
            })
        };
        Comm.reset = function () {
            $("input").val("");
            $("select").val(-1);
            layui.form.render();
            Comm.table.reload('table', {
                page: {curr: 1},//重新从第 1 页开始
                where: Comm.GetData("search-form")
            });
        }
        //注册排序查询
        Comm.sort();
        Comm.exec("pageload");


        /*--------------------------------------------------------------------------------------------------------*/
        //解决行工具多的时候，显示后点击没效果问题
        $(document).off('mousedown', '.layui-table-grid-down').on('mousedown', '.layui-table-grid-down', function (event) {
            _tableTrCurr = $(this).closest('td');
        });

        $(document).off('click', '.layui-table-tips-main [lay-event]').on('click', '.layui-table-tips-main [lay-event]', function (event) {
            var elem = $(this);
            var tableTrCurr = _tableTrCurr;
            if (!tableTrCurr) {
                return;
            }
            var layerIndex = elem.closest('.layui-table-tips').attr('times');
            // 关闭当前这个显示更多的tip
            layer.close(layerIndex);
            _tableTrCurr.find('[lay-event="' + elem.attr('lay-event') + '"]').first().click();
        });
        /*---------------------------------------------------------------------------------------------------*/

    });
};
