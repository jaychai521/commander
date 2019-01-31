// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        ComdRules._instance.getComdByID(this.comd_id,false);

        let data = GoldSystem._instance.calculateYBResult(this.comd_id);
        this.label.string = data;
    },


    // update (dt) {},
});
