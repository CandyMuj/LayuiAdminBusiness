var Enum = {
    payType: (s) => {
        if (s == 1) {
            return "微信支付";
        } else if (s == 2) {
            return "支付宝支付";
        } else if (s == 4) {
            return "钱包余额支付";
        } else if (s == 8) {
            return "微信公众号";
        } else if (s == 16) {
            return "线下转账支付"
        } else {
            return "未支付";
        }
    }
};