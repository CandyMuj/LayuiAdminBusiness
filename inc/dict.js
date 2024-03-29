var GDict = {
    _data: null,
    _d: {},
    _c: {},
    _a: null,
    dictname: function () {
        return '__dict';
    },
    //通过id（int）或code（string）获取子节点[推荐]
    get: function (v, en) {
        //如果传入ID，为int则先取得code
        if (en == null) en = true;
        if (typeof(v) == typeof(0)) {
            v = GDict.getItem(v);
            if (v == null) return [];
            v = v.dictcode;
        }
        if (GDict._data) {
            var temp = [], a = GDict._data[v];
            if (a) for (var i = 0; i < a.length; i++) {
                if (en && a[i].enable == 0) continue;
                temp.push({
                    dictId: a[i].dictId, dictpid: a[i].dictpid, dictname: a[i].dictname, dictcode: a[i].dictcode,
                    orderindex: a[i].orderindex, remark: a[i].remark, dicttype: a[i].dicttype
                });
            }
            return temp;
        }
        return [];
    },
    //通过id获取字典名称[推荐]
    getName: function (id) {
        var o = GDict.getItem(id);
        if (o) return o.dictname;
        return '-';
    },
    //通过id获取字典对象[推荐]
    getItem: function (id) {
        if (GDict._d[id])
            return GDict._d[id];
        return null;
    },
    // 通过code获取字典对象
    getItemc: function (code) {
        if (GDict._c[code])
            return GDict._c[code];
        return null;
    },
    /*//获取原始数据不推荐[性能极低]
    getList:function(havenull){
        var data=[],d=GDict._a;
        if(havenull)
            data.push({id:-1,name:'无上级',pid:0});
        for (var i=0;i<d.length;i++){
            data.push({id:d[i].dictId,name:d[i].dictname,pid:d[i].dictpid});
        }
        return data;
    },*/
    //用户管理字典一般情况不可调用[性能极低]
    getManageList: function (haveroot) {
        var data = [], expanded = false, d = GDict._a;
        if (haveroot) {
            expanded = true;
            data.push({id: 0, pid: -1, name: '字典类别', expanded: expanded});
        }
        if (d) for (var i = 0; i < d.length; i++) {
            if (d[i].dicttype == 'sys')
                data.push({
                    id: d[i].dictId,
                    pid: d[i].dictpid,
                    name: d[i].dictname + (haveroot ? '（' + d[i].dictcode + '）' : ''),
                    expanded: expanded
                });
        }
        return data;
    },
    //是否加载成功
    loaded: function () {
        return GDict._data != null
    },
    //从服务器获取字典
    load: function (cb) {
        AJAX.GET('/api/dict/getlist', function (a) {
            if (a.data) {
                if (window.sessionStorage)
                    window.sessionStorage[GDict.dictname()] = "0" + JSON.stringify(a.data).replace(/\'/g, "｜");
                GDict.serialize(a.data, true, cb);
            }
        }, false);
    },
    serialize: function (list, first, cb) {
        GDict._data = null;
        var a = {};
        a.data = list;
        var cd = null, cs = 'cs';
        GDict._a = a.data;
        GDict._data = {};
        //序列化
        for (var i = 0; i < a.data.length; i++) {
            GDict._d[a.data[i].dictId] = a.data[i];
            GDict._c[a.data[i].dictcode] = a.data[i];
        }
        //构建树
        for (var i = 0; i < a.data.length; i++) {
            cd = a.data[i];
            if (cd.dictpid > 0) {
                if (GDict._d[cd.dictpid] == null)
                    GDict._d[cd.dictpid] = {};
                if (GDict._d[cd.dictpid][cs] == null) {
                    GDict._d[cd.dictpid][cs] = [];
                    GDict._data[GDict._d[cd.dictpid].dictcode] = GDict._d[cd.dictpid][cs];
                }
                GDict._d[cd.dictpid][cs].push(cd);
            }
        }
        cb && cb(first);
    },
    init: function (cb) {
        var list = null;
        // if (window.sessionStorage) {
        //     list = window.sessionStorage[GDict.dictname()];
        // }
        if (list) {
            if (typeof(list) == typeof('')) {
                list = list.substring(1).replace(/｜/g, "'");
                list = JSON.parse(list);
            }
            GDict.serialize(list, false, cb);
        }
        else
            GDict.load(cb);
    }
};
