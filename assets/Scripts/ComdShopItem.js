// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


let GoldSystem = require("GoldSystem");
let ComdCommandData = require("ComdCommandData");
let ComdUIManager = require("ComdUIManager");

let Status = cc.Enum({
    RICE_STATUS:0,
    LOVE_STATUS:1,
    TOP_LEVEL_STATUS:2,
    LOCK_STATUS:3,
});

cc.Class({
    extends: cc.Component,

    properties: {
        comd_id:-1,
        level:-1,
        coinPirce:-1,
        ybPirce:-1,
        unLock:false,


        levelLabel:cc.Label,
        ybLabel:cc.Label,
        coinLabel:cc.Label,
        sprite:cc.Sprite,
        unLockLabel:cc.Label,    //描述解锁等级文本
        titleLabel:cc.Label,

        coinStatus:cc.Node, //米粒购买状态
        ybStatus:cc.Node, //爱心购买状态
        lockStatus:cc.Node, //锁住状态


        _chickenData:{
            default:[],
            type:[cc.String],
        },

        bShowIcon:true,
    },

    // LIFE-CYCLE CALLBACKS:

   // onLoad () { cc.log('onLoad,注册事件:updateStatus');},

    start () {


    },

    init(_id,_object){
        //注册事件监听
        GlobalEvent.on('updateStatus',this.updateStatus,this);
        //初始化数据
        this._chickenData = _object;
        this.comd_id = _id;
        this.level = parseInt(_object.chicken[this.comd_id].level);
        //初始化文本内容
        this.levelLabel.string = this.level;
        this.unLockLabel.string = (this.level + 4);
        //刷新状态
        this.bShowIcon = true;
        this.titleLabel.string = this._chickenData.chicken[this.comd_id].name;
        this.refreashStatus();
    },

    updateStatus(){
        // cc.log('update my shop icon status...');
        this.bShowIcon = false;
        this.refreashStatus();
    },

    refreashStatus(){
        let topLevel = ComdCommandData._instance.Comd_level;
        if(topLevel >= 6){
            if(this.level > topLevel){
                //未解锁状态
                // cc.log('未解锁状态:',this.level);
                this.onStatus(Status.LOCK_STATUS);
            }
            else  if(this.level === topLevel || this.level === topLevel - 1){
                //当前等级为最高级或者次一级，单独显示一种状态
                this.onStatus(Status.TOP_LEVEL_STATUS);
                //   cc.log('当前等级为最高级或者次一级，单独显示一种状态:'+this.level);
            }
            else if( this.level < (topLevel - 1) &&  this.level > (topLevel - 4)){
                if(this.level == 3){
                    //米粒购买状态
                    this.onStatus(Status.RICE_STATUS);
                }
                else {
                    //爱心购买状态
                    this.onStatus(Status.LOVE_STATUS);
                }
            }
            else {
                //米粒购买状态
                this.onStatus(Status.RICE_STATUS);
                //  cc.log(' 米粒购买状态:'+this.level + ' 当前最高级别:'+topLevel);
            }
        }
        else {
            let coinLeve = topLevel - 1;
            if(this.level === 1){
                this.onStatus(Status.RICE_STATUS);
            }
            else if(this.level === topLevel || this.level <= coinLeve) {
                this.onStatus(Status.TOP_LEVEL_STATUS);
            }
            else {
                this.onStatus(Status.LOCK_STATUS);
            }
        }

    },

    onStatus(status){

        this.coinStatus.active = false;
        this.lockStatus.active = false;
        this.ybStatus.active = false;

        switch (status) {
            case Status.RICE_STATUS:
                this.onCoinStatus();
                break;
            case Status.LOVE_STATUS:
                this.onYBStatus();
                break;
            case Status.TOP_LEVEL_STATUS:
                this.onTopLevelStatus();
                break;
            case Status.LOCK_STATUS:
                this.onLockStatus();
                break;
        }
    },

    onCoinStatus(){
        this.coinStatus.active = true;

        let data = GoldSystem._instance.getCurrentCreateComdDataByID(this.comd_id);
        let str = data[0].toString();
        let coinPcoin = (str.length>4)?str.substring(0,4):str;
        let unit = data[1];
        this.coinLabel.string = parseFloat(coinPcoin) + unit;
        this.titleLabel.string = this._chickenData.chicken[this.comd_id].name;
        // if(!this.bShowIcon)
        //     return;
        let sprId = this._chickenData.chicken[this.comd_id].basicIcon;
        // this.showIcon(url);
        ComdUIManager._instance.loadAtlas(this.sprite,sprId);
    },

    onYBStatus(){
        this.ybStatus.active = true;
        this.lockStatus.active = true;
        this.titleLabel.string = this._chickenData.chicken[this.comd_id].name;

        if(this.comd_id >= 2){ //3级士兵以上才有计算爱心的数据
            let data = GoldSystem._instance.calculateYBResult(this.comd_id);
            this.ybLabel.string = data;
            console.log('id:',this.comd_id,' 爱心:',data);
        }

        // if(!this.bShowIcon)
        //     return;
        let sprId = this._chickenData.chicken[this.comd_id].basicIcon;
        // this.showIcon(url);
        ComdUIManager._instance.loadAtlas(this.sprite,sprId);
    },


    onTopLevelStatus(){
        this.lockStatus.active = true;
        this.titleLabel.string = this._chickenData.chicken[this.comd_id].name;
        // if(!this.bShowIcon)
        //     return;
        let sprId = this._chickenData.chicken[this.comd_id].basicIcon;
        // this.showIcon(url);
        ComdUIManager._instance.loadAtlas(this.sprite,sprId);
    },


    onLockStatus(){
        this.titleLabel.string = '？？？';
        this.lockStatus.active = true;
    },

    showIcon(url){
        cc.loader.loadRes(url,cc.SpriteFrame,function (err,spriteFrame) {

            if(err){
                return;
            }
            this.sprite.spriteFrame = spriteFrame;
            // this.sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        }.bind(this))


    },

    onDestroy(){
        GlobalEvent.off("updateStatus", this.updateStatus, this);
    },



    // update (dt) {},
});
