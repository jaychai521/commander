// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let ComdRules = require("ComdRules");
let ComdSprite = require("ComdSprite");
let ComdAnchorPoints = require("ComdAnchorPoints");
let GoldSystem = require("GoldSystem");
let ComdCommandData = require("ComdCommandData");
let ComdUIManager = require("ComdUIManager");
let WxWebRequestLogin = require("WxWebRequestLogin");

cc.Class({
    extends: cc.Component,


    properties: {
        comdSprite:{
            default:null,
            type:ComdSprite,
        },
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        // cc.log("本士兵的贴图:"+this.node.getComponent(cc.Sprite).spriteFrame.name);
     },

    start ()
    {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.TouchStart(event);
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.TouchMove(event);
        },this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            // cc.log('TOUCH_CANCEL');
            this.TouchLastStep(event);
        },this);

        this.node.on(cc.Node.EventType.TOUCH_UP, function (event) {
            // cc.log('TOUCH_UP');
            this.TouchLastStep(event);
        },this);


        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            // cc.log('TOUCH_END');
            this.TouchLastStep(event);
        }, this);

    },

    TouchStart(event){

        this.node.parent.zIndex = 10;
        cc.director.GlobalEvent.emit('onRecovery_Comd',{eventName:'',bStart:true});
        //  this.startPos = cc.v2(event.getLocation().x, event.getLocation().y);
        //获取点击的位置
        //  cc.log("起始坐标点：x = " + event.getLocation().x + ", y = " + event.getLocation().y);
    },

    TouchMove(event){
        let delta = event.touch.getDelta();
        this.node.x += delta.x;
        this.node.y += delta.y;
    },

    TouchLastStep(event){
        this.node.parent.zIndex = 0;
        cc.director.GlobalEvent.emit('onRecovery_Comd',{eventName:'',bStart:false});

        this.fingerPos = cc.v2(event.getLocation().x, event.getLocation().y);
        //cc.log("终点坐标点 x ：" + event.getLocation().x + ", 终点坐标点 y ：" + event.getLocation().y );

        let spawnPositions = ComdAnchorPoints._instance.spawnPositions;   //持有所有的位置锚点
        let arParent = ComdAnchorPoints._instance.spawnPositions[0].parent; //持有锚点的父节点Root
        for (let n=0;n<spawnPositions.length;n++)
        {
            //由父节点Root将子节点的相对坐标转化为世界坐标
            let arWrldPos = arParent.convertToWorldSpaceAR(spawnPositions[n].getPosition());
            let distance = this.fingerPos.sub(arWrldPos).mag();
            // cc.log("距离锚点的距离 ：" +spawnPositions[n].name + "  "  + distance);

            let resComd = this.node;
            let destAR = spawnPositions[n];

            if(resComd.parent.name==destAR.name){
                // cc.log(resComd.node.parent.name + ":" + destAR.name);
                continue;
            }

            if(distance < 110)
            {
                // cc.log("close..");
                ComdRules._instance.judgeResult(resComd,destAR);
                return;
            }
        }

        let recovery = ComdAnchorPoints._instance.recoveryPoint;
        let rWrldPos = arParent.convertToWorldSpaceAR(recovery.getPosition());
        let distance = this.fingerPos.sub(rWrldPos).mag();
        // console.log('距离回收站距离:',distance);
        if(distance < 60){
            //判断等级是否足够出售
            if(!this.result2Sale()){
                ComdUIManager._instance.showTip_Comd('当前等级不允许复员!');
                this.node.setPosition(8.6,100);
                return;
            }
            let coin = this.comdSprite.getCoin;
            let unit = this.comdSprite.unit;
            let factor = this.comdSprite.recoverFactor;
            GoldSystem._instance.RecoveryCoin(coin,unit,factor);
            this.node.destroy();
            return;
        }
        //  cc.log("手指离开后本士兵的贴图:"+this.node.getComponent(cc.Sprite).spriteFrame.name);
        this.node.setPosition(8.6,100);
    },

    result2Sale(){
        return (this.comdSprite.level>=ComdCommandData._instance.Comd_level-3)?false:true;
        // return true;
    },

});
