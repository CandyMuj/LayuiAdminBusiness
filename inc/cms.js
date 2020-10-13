layui.define(['layer', 'element', 'fortree'], function(exports) {
    var layer = layui.layer;
    var element = layui.element;
    var fortree = layui.fortree;
    var $ = layui.jquery;

    var nav = null;
    var navfilter = null;
    var _url = 'main.html';

    /**
     * 添加导航
     */
    function addNav(data, topid, idname, pidname, nodename, urlname) {
        topid = topid || 0;
        idname = idname || 'id';
        pidname = pidname || 'pid';
        nodename = nodename || 'node';
        urlname = urlname || 'url';

        /** 加载菜单 */
        var url = queryurl();
        if (url) {
            _url = url;
            addtab(url);
        } else {
            addtab(_url);
        }

        var mytree = new fortree(data, idname, pidname, topid);
        var html = '';

        mytree.forBefore = function(v, k, hasChildren) {
            var _layui_this = "";
            if (_url == v.url) {
                _layui_this = "layui-this";
            }
            if (hasChildren) {
                var child = this.getChildren(v.id);
                for (var i = 0; i < child.length; i++) {
                    var e = child[i];
                    if (e.url == _url) {
                        _layui_this = "layui-nav-itemed";
                    }
                }
            }
            html += '<li class="layui-nav-item ' + _layui_this + '">';
        };

        mytree.forcurr = function(v, k, hasChildren) {
            var url = v[urlname] ? v[urlname] : "";
            html += '<a href="###' + url + '"' + (v[urlname] ? ' data-url="' + v[urlname] + '" data-id="' + v[idname] + '"' : '') + '>';
            if (v.pid) {
                html += "&nbsp;&nbsp;&nbsp;&nbsp;" + v[nodename];
            } else {
                html += v[nodename];
            }
            html += '</a>';
        };

        mytree.callBefore = function(v, k) {
            html += '<ul class="layui-nav-child">';
        };

        mytree.callAfter = function(v, k) {
            html += '</ul>';
        };

        mytree.forAfter = function(v, k, hasChildren) {
            html += '</li>';
        };

        mytree.each();

        nav.append(html);

        element.init('nav(' + navfilter + ')');
        element.render('nav', navfilter);
        /**
         * 监听侧边栏导航点击事件
         */
        element.on('nav(' + navfilter + ')', function(a) {
            var title = a.html();
            var src = a.attr('data-url');
            var id = a.attr('data-id');
            if (src) {
                addtab(src, title, id);
            }
        });

    }

    function addtab(src, title, id) {
        document.getElementById('iframe').src = src;
        if (title) {
            //document.title = title;
        }
    }

    function deltab(layid, table) {
        history.back();
    }

    function queryurl() {
        var u = "";
        var url = self.location.href;
        if (url && url.indexOf("#") >= 0) {
            u = url.substr(url.lastIndexOf("#") + 1, url.length - 1);
        }
        return u;
    }


    /**
     * 导出接口
     */
    exports('cms', function(navLayFilter) {
        navfilter = navLayFilter;
        nav = $('.layui-nav[lay-filter=' + navfilter + ']').eq(0);

        var error = '';
        if (nav.length == 0) {
            error += '没有找到导航栏<br>';
        }

        if (error) {
            layer.msg('cms模块初始化失败！<br>' + error);
            return false;
        }
        return { addNav: addNav, addtab: addtab, deltab: deltab };
    });
});