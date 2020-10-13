// 缓存分类,并不是真实缓存，每次初始化都去获取一次最新的数据，分类信息可能会改变
// 因为分类id是唯一的，所以不区分具体module了
var CCategory = {
    // 以id为key，存放分类信息
    _dataKeyId: {},
    // 以格式：itemType-itemId-moduleType 为key
    _dataKeyType: {},
    // 以格式：itemType-itemId-moduleType 为key;pid=0
    _dataKeyTypeR: {},
    // 以pid为key  由于id都是唯一的不会重复，所以我们不用考虑那么复杂，直接可以以pid为key;但是一个pid会有多条数据，所以还是得弄数组
    _dataKeyPid: {},

    init: () => {
        // 后期如果需要根据条件筛选初始化，那么就换另一个查询接口，加初始化参数
        // 应该不会有这种情况，因为此表数据都是唯一的不会出现需要筛选的情况
        AJAX.GET('/common/category/getAll', (d) => {
            if (d.code != 1) {
                Comm.msg("初始化分类失败：" + d.msg, 5);
            }

            for (let i in d.data) {
                let data = d.data[i];
                CCategory._dataKeyId[data.categoryId] = data;

                // init _dataKeyType
                let key_keyType = data.itemType + '-' + data.itemId + '-' + data.moduleType;
                let keyTypeArr = CCategory._dataKeyType[key_keyType];
                if (!keyTypeArr) {
                    keyTypeArr = [];
                    CCategory._dataKeyType[key_keyType] = keyTypeArr;
                }
                keyTypeArr.push(data);

                // init _dataKeyTypeR
                if (data.pid == 0) {
                    let keyTypePArr = CCategory._dataKeyTypeR[key_keyType];
                    if (!keyTypePArr) {
                        keyTypePArr = [];
                        CCategory._dataKeyTypeR[key_keyType] = keyTypePArr;
                    }
                    keyTypePArr.push(data);
                }

                // init _dataKeyPid
                let keyPidArr = CCategory._dataKeyPid[data.pid];
                if (!keyPidArr) {
                    keyPidArr = [];
                    CCategory._dataKeyPid[data.pid] = keyPidArr;
                }
                keyPidArr.push(data);
            }
        }, false);
    },
    getByPid: (pid) => {
        return CCategory._dataKeyPid[pid];
    },
    // 三个参数缺一不可,根据筛选来
    getByModule: (itemType, itemId, moduleType) => {
        return CCategory._dataKeyType[itemType + '-' + itemId + '-' + moduleType];
    },
    // 三个参数缺一不可,根据筛选来,仅pid为0的
    getRootByModule: (itemType, itemId, moduleType) => {
        return CCategory._dataKeyTypeR[itemType + '-' + itemId + '-' + moduleType];
    },
    getById: (id) => {
        return CCategory._dataKeyId[id];
    },
    getCnByIds: (ids, spli) => {
        let str = '';
        if (ids) {
            let idarr = String(ids).split(',');

            let len = idarr.length;
            for (let i in idarr) {
                let d = CCategory._dataKeyId[idarr[len - i - 1]];
                if (d) {
                    if (i < idarr.length - 1) {
                        str += d.cname + (spli ? spli : ' ');
                    } else {
                        str += d.cname;
                    }
                }
            }
        }
        return str;
    },
    getCnById: (id) => {
        let d = CCategory._dataKeyId[id];
        return d ? d.cname : null;
    }
};
