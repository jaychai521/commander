/***
 * 离线奖励，关闭按钮
 */



let WxWebRequestLogin = require("WxWebRequestLogin");
let GoldSystem = require("GoldSystem");

cc.Class({
    extends: cc.Component,

    properties: {

        singleReward:{
            default:[],
            type:[0,'']
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn = this.node.getComponent(cc.Button);
        btn.node.on('click',this.callback,this);

        cc.director.GlobalEvent.on('singleReward',this.onSingleReward,this);
        cc.director.GlobalEvent.on('updateSingleReward',this.updateSingleReward,this);

        console.log('注册双倍奖励事件');
    },

    callback () {
        this.onSingleReward();
    },

    onSingleReward(){
        console.log('没有分享,领取普通奖励');
        GoldSystem._instance.coinOperate(this.singleReward[0],this.singleReward[1],{tip:'银+',content:''});
    },





    // update (dt) {},
});
