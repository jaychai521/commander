
let ComdCommandData = require("ComdCommandData");
let GoldSystem = require("GoldSystem");
let ComdUIManager = require("ComdUIManager");

cc.Class({
    extends: cc.Component,

    properties: {

        bCommentFlag:{
            default:1,
            type:cc.Integer,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        let btn = this.node.getComponent(cc.Button);
        btn.node.on('click',this.onClick,this);
    },

    onClick(){

        cc.director.GlobalEvent.emit('Guide_ThumbUp_Level_3',{eventName:'',bStart:false});//关闭3级指引
        cc.director.GlobalEvent.emit('Guide_Create_Level_2_Chicken',{eventName:'',bStart:false});//关闭2级指引
        cc.director.GlobalEvent.emit('Guide_Create_Level_3_Chicken',{eventName:'',bStart:true});//开启3级目标指引
        cc.director.GlobalEvent.emit('Guide_Buy_Chicken',{eventName:'',bStart:true});//开启购买士兵指引
        cc.director.GlobalEvent.emit('Guide_Shop',{eventName:'',bStart:true});//开启商店指引

        let self = this;
        self.callback = function () {
            GoldSystem._instance.YBOperate(100,{tip:'章+',content:100});
        }




        if(!CC_WECHATGAME){
            cc.log('炫耀完毕，+100章');
            self.callback();
        }
    },

    // update (dt) {},
});
