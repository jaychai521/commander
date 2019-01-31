let ComdShopItem = require("ComdShopItem");
let ComdRules = require("ComdRules");
let GoldSystem = require("GoldSystem");

cc.Class({
    extends: cc.Component,

    properties: {
        label:cc.Label,
        comdShopItem:ComdShopItem,
        comd_id:-1,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.comd_id = this.comdShopItem.comd_id;
        let btn = this.node.getComponent(cc.Button);
        btn.node.on('click',this.onClick,this);
    },

    onClick(){
        //购买士兵
        ComdRules._instance.getComdByID(this.comd_id,true);
        //更新文本显示内容
        let data = GoldSystem._instance.getCurrentCreateComdDataByID(this.comd_id);
        let coinCount = data[0].toString();
        let str = (coinCount.length > 4)?coinCount.substring(0,4):coinCount;
        let count = parseFloat(str);
        let unit = data[1];

        let val = count+unit;
        this.label.string = val;
    },

    // update (dt) {},
});
