// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let ComdUIManager = require("ComdUIManager");
let ComdCommandData = require("ComdCommandData");
let ComdAnchorPoints = require("ComdAnchorPoints");
let GoldSystem = require("GoldSystem");
let GlobalData = require("GlobalData");
let WxWebRequestLogin = require("WxWebRequestLogin");

let ComdRules = cc.Class({
    extends: cc.Component,

    statics:{
        _instance:null
    },


    properties: {
        prefab:{
            default:null,
            type:cc.Prefab,
        },

        //粒子效果
        // particalPrefab:{
        //     default:null,
        //     type:cc.Prefab,
        // },

        lucky_comd_id:-1,//存储幸运升级的士兵id
        lucky_comd_anchor:-1,  //存储幸运升级的士兵位置

        _bSpeedUp:false,    //士兵加速产米

    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         ComdRules._instance = this;
         this._bSpeedUp = false;
         this._speedUpDuration = 0;
     },

    start () {
        cc.director.GlobalEvent.on('onLuckyLevelUp',this.onLuckyLevelUp,this);  //注册幸运升级事件，用于重新拉起广告
        cc.director.GlobalEvent.on('onLuckyUpForShareSuccess',this.onLuckyUpForShareSuccess,this);
        cc.director.GlobalEvent.on('onLuckyUp_Share',this.onLuckyUp_Share,this);    //注册幸运升级 纯分享事件,播放广告视频失败回调
        cc.director.GlobalEvent.on('updateChickenPosition',this.updateChickenPosition,this);

        cc.director.GlobalEvent.on('getComdForGuide',this.getComdForGuide,this);

        cc.director.GlobalEvent.on('onSpeedUpForMakeCoin',this.onSpeedUpForMakeCoin,this);  //士兵产米加速
    },

    /**
     * 读取数据生成上次存储的士兵
     */
    init(){
        let coData = ComdCommandData._instance.Comds;
        let anchors = ComdAnchorPoints._instance.spawnPositions;
        for (let n=0;n<coData.length;n++){
            if(coData[n]===0)
                continue;
            let comd_id = coData[n] - 1;   //id=等级-1
            this.createComd(comd_id,anchors[n]);
        }
    },

    /***
     * 更新士兵的位置信息(出售士兵/生成新的士兵)
     */
    updateChickenPosition(){
        this.scheduleOnce(function () {
            let anchors = ComdAnchorPoints._instance.spawnPositions;
            let data = [];
            for (let n=0;n<anchors.length;n++){
                if(anchors[n].children.length >0){
                    let lv = anchors[n].getComponentInChildren('ComdSprite').level;
                    data[n] = lv;
                }
                else
                {
                    data[n] = 0;
                }
            }
            // console.log('更新士兵的位置信息:',data);
            ComdCommandData._instance.Comds = data;
        }.bind(this),.5);
    },

    /***
     * 购买士兵,新手教程调用
     */
    getComdForGuide(args){

        let bLucky = args.bLucky;

        //播放音效
        cc.director.GlobalEvent.emit('onSpawanComdClip',{eventName:''});

        let bFull = true;
        let spawnPositions = ComdAnchorPoints._instance.spawnPositions;
        for (let n=0;n<spawnPositions.length;n++)
        {
            //先判断是否有空位，再判断是否能购买
            if(spawnPositions[n]._children<=0)
            {
                let res = GoldSystem._instance.buyStrategy();
                let bBuy = res[0];
                let comd_id = res[1];
                this.lucky_comd_id = comd_id + 1;
                this.lucky_comd_anchor = n;
                if(!bBuy){
                    ComdUIManager._instance.showTip_Comd('没有足够的银元');

                    let limit = GlobalData.User.Video_Today_Time;
                    if(limit < GlobalData.User.Video_Limit){
                        GoldSystem._instance.secretReward();
                    }
                    else {
                        if(GlobalData.User.Receive_CallFriend === 0)
                            ComdUIManager._instance.showCallFriendPlanes_Comd();
                        else
                            ComdUIManager._instance.showCallFriendPlanes_Comd();
                    }
                    return;
                }

                let createCount = ComdCommandData._instance.Level_Coin[comd_id]+1;
                ComdCommandData._instance.Level_Coin = [comd_id,createCount];
                if(!bLucky){
                    this.createComd(comd_id,spawnPositions[n]);
                }
                else {
                    let lowLevel = comd_id;
                    let heightLevel = comd_id+1;
                    ComdUIManager._instance.showLevelupPlane_Comd(true,lowLevel,heightLevel);
                }

                bFull = false;
                return;
            }
        }

        if(bFull){
            ComdUIManager._instance.showTip_Comd('没有足够的位置');
            console.log('full!');
        }
    },


    /***
     * 购买士兵,主界面调用
     */
    getComd(){
        let bFull = true;
        let spawnPositions = ComdAnchorPoints._instance.spawnPositions;
        for (let n=0;n<spawnPositions.length;n++)
        {
            //先判断是否有空位，再判断是否能购买
            if(spawnPositions[n]._children<=0)
            {
                let res = GoldSystem._instance.buyStrategy();
                let bBuy = res[0];
                let comd_id = res[1];
                this.lucky_comd_id = comd_id + 1;
                this.lucky_comd_anchor = n;
                if(!bBuy){
                    ComdUIManager._instance.showTip_Comd('没有足够的银元');

                    let limit = GlobalData.User.Video_Today_Time;
                    if(limit < GlobalData.User.Video_Limit){
                        GoldSystem._instance.secretReward();
                    }
                    else {
                        if(GlobalData.User.Receive_CallFriend === 0)
                            ComdUIManager._instance.showCallFriendPlanes_Comd();
                        else
                            ComdUIManager._instance.showCallFriendPlanes_Comd();
                    }
                    return;
                }

                let createCount = ComdCommandData._instance.Level_Coin[comd_id]+1;
                ComdCommandData._instance.Level_Coin = [comd_id,createCount];

                let blevelUp = this.rollPoint();
                if(blevelUp){
                    let lowLevel = comd_id;
                    let heightLevel = comd_id+1;
                    ComdUIManager._instance.showLevelupPlane_Comd(true,lowLevel,heightLevel);
                }
                else {
                    this.createComd(comd_id,spawnPositions[n]);
                }

                bFull = false;
                //播放音效
                cc.director.GlobalEvent.emit('onSpawanComdClip',{eventName:''});

                return;
            }
        }

        if(bFull){
            ComdUIManager._instance.showTip_Comd('没有足够的位置');
            console.log('full!');
        }
    },

    /***
     * 购买士兵,商城界面调用
     * @param id
     * @param byCoin 是否米粒购买
     */
    getComdByID(comd_id,byCoin=true){
        let bFull = true;
        let spawnPositions = ComdAnchorPoints._instance.spawnPositions;
        for (let n=0;n<spawnPositions.length;n++)
        {
            //先判断是否有空位，再判断是否能购买
            if(spawnPositions[n]._children<=0)
            {
                let bBuy = byCoin ? GoldSystem._instance.getBuyCoinResultByID(comd_id) :
                    GoldSystem._instance.getBuyYBResultByID(comd_id);

                if(!bBuy){
                    if(byCoin)
                    {
                        ComdUIManager._instance.showTip_Comd('没有足够的银元');

                        let limit = GlobalData.User.Video_Today_Time;
                        if(limit < GlobalData.User.Video_Limit){
                            GoldSystem._instance.secretReward();
                        }
                        else {
                            if(GlobalData.User.Receive_CallFriend === 0)
                                ComdUIManager._instance.showCallFriendPlanes_Comd();
                            else
                                ComdUIManager._instance.showCallFriendPlanes_Comd();
                        }
                    }
                    else{
                        ComdUIManager._instance.showTip_Comd('没有足够的元宝');
                        ComdUIManager._instance.showInviteFriendPlanes_Comd();
                    }


                    return;
                }

                this.createComd(comd_id,spawnPositions[n]);
                bFull = false;

                //更新玩家数据
                if(byCoin){
                    let coinCount = ComdCommandData._instance.Level_Coin[comd_id]+1;
                    ComdCommandData._instance.Level_Coin = [comd_id,coinCount];
                }
                else {
                    let ybCount = ComdCommandData._instance.Level_YB[comd_id]+1;
                    ComdCommandData._instance.Level_YB = [comd_id,ybCount];
                }

                //播放音效
                cc.director.GlobalEvent.emit('onSpawanComdClip',{eventName:''});

                return;
            }
        }

        if(bFull){
            ComdUIManager._instance.showTip_Comd('没有足够的位置');
            console.log('full!');
        }
    },

    //幸运升级 - 分享/看视频交替
    Lucky_queue(){
        this._bFlag = !this._bFlag;
        if(this._bFlag){
            this.onLuckyLevelUp();
        }
        else {
            this.onLuckyUp_Share();
        }
    },

    /***
     * 幸运升级，根据限制次数看视频或分享
     */
    onLuckyLevelUp(){

        let callback = function(){
            let spawnPositions = ComdAnchorPoints._instance.spawnPositions;
            this.createComd(this.lucky_comd_id,spawnPositions[this.lucky_comd_anchor]);
            ComdUIManager._instance.showLevelupPlane_Comd(false);
        }.bind(this);

        if(!CC_WECHATGAME){
            callback();
        }
        else {
            let limit = GlobalData.User.Video_Today_Time;
            if(limit < GlobalData.User.Video_Limit){
                cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.LuckyLevelUp_Video,callback:callback,way:'幸运升级',from:'onLuckyLevelUp'});
            }
            else {
                GlobalData.OnShowTypeValue = GlobalData.OnShowType.LUCKY_LEVELUP;
                WxWebRequestLogin._instance.onTokenShare(3,'幸运升级-当日视频次数已满');
            }
        }
    },

    /***
     * 幸运升级，纯分享,视频不可看时调用
     */
    onLuckyUp_Share(){
        GlobalData.OnShowTypeValue = GlobalData.OnShowType.LUCKY_LEVELUP;
        WxWebRequestLogin._instance.onTokenShare(3,'幸运升级-纯分享按钮');

        if(!CC_WECHATGAME){
            cc.log('幸运升级，分享按钮');
             this.onLuckyLevelUp();
        }
    },

    /***
     * 幸运升级，分享成功后调用，士兵升级
     */
    onLuckyUpForShareSuccess(){
        let spawnPositions = ComdAnchorPoints._instance.spawnPositions;
        this.createComd(this.lucky_comd_id,spawnPositions[this.lucky_comd_anchor]);
        ComdUIManager._instance.showLevelupPlane_Comd(false);
    },

    /***
     * 幸运升级 取消按钮,等级不提升
     * 真好按钮调用
     */
    onLuckyLevelUp_close(){
        let originID = this.lucky_comd_id - 1;
        let spawnPositions = ComdAnchorPoints._instance.spawnPositions;
        this.createComd(originID,spawnPositions[this.lucky_comd_anchor]);
        ComdUIManager._instance.showLevelupPlane_Comd(false);
    },

    /***
     * 获取幸运升级几率
     * @returns {boolean}
     */
    rollPoint(){
        let rand = this.randomFrom(0,10);
        return rand < 1 ? true:false;
        // return true;
    },

    randomFrom(lowerValue,upperValue){
        return Math.random() * (upperValue - lowerValue) + lowerValue;
    },


    /***
     * 生成士兵
     * @param id
     */
    createComd(comd_id,parent){
        // let chickenData = ComdJsonUtility._instance.chickenData;
        let newComd = cc.instantiate(this.prefab);
        newComd.parent = parent;
        // newComd.position = cc.Vec2.ZERO;
        newComd.setPosition(8.6,100);

        let cs = newComd.getComponent("ComdSprite");
        cs.comd_id = comd_id;
        return newComd;
    },

    /**
     * 交换节点位置
     * @param res 被拖拽的士兵节点
     * @param dest  目标锚点节点
     */
    switchPosition(res,dest){

        let temPar = res.parent;
        let targetNode = dest.getChildByName("chook");

        res.parent =  dest;
        res.setPosition(8.6,100);

        targetNode.parent = temPar;
        targetNode.setPosition(8.6,100);
    },

    /**
     *  等级相同, 士兵升级
     * @param res
     * @param dest
     * @param baseLevel 上一级士兵的等级
     */
    levelUp(res,dest,baseLevel){

        let id = baseLevel;
        let obj = this.createComd(id,dest);
        obj.active = false;

        //合体效果
        res.parent = dest;
        res.setPosition(8.6,100);
        let dest_comd = dest.getChildByName("chook");
        cc.director.GlobalEvent.emit('onPlayAnimation',{eventName:'',node:res,clip:'moveRight'});
        cc.director.GlobalEvent.emit('onPlayAnimation',{eventName:'',node:dest_comd,clip:'moveLeft'});


        this.scheduleOnce(function () {
            obj.active = true;
            dest_comd.destroy();
            res.destroy();
        },.2);

        //播放音效
        cc.director.GlobalEvent.emit('onSpawanComdClip',{eventName:''});

        cc.director.GlobalEvent.emit('Guide_NewPlayer',{eventName:'',bStart:false});//关闭1级指引
    },

    /***
     * 目标位置为空，直接改变士兵位置
     * @param resComd
     * @param destAR
     */
    putPosition(resComd,destAR){
         resComd.parent = destAR;
         resComd.setPosition(8.6,100);
        // cc.log("准备放置的士兵:" + resComd.name + " 所在锚点:"+resComd.parent.name);
    },

    judgeResult(resComd,destAR){
        if(destAR.getComponentInChildren("ComdSprite")){//如果destAR锚点下存在士兵...
            let res = resComd.getComponent("ComdSprite");
            let dest = destAR.getComponentInChildren("ComdSprite");
            if(res.level === dest.level){    //如果2只士兵的等级相同则合体
            //       cc.log("JJ 合体");
                if(res.level < 37){
                    this.levelUp(resComd,destAR,res.level);
                }
                else{
                    ComdUIManager._instance.showTip_Comd('士兵已到达凡界最高等级!');
                    this.switchPosition(resComd,destAR);
                }
            }
            else {
          //     cc.log("JJ 交换");
                this.switchPosition(resComd,destAR);
            }
        }
        else {
         // cc.log("JJ 空置");
            this.putPosition(resComd,destAR);
        }
    },

    //监听士兵产米
    onSpeedUpForMakeCoin(event){
        this._bSpeedUp = event.bStart;
        this._speedUpDuration = event.duration;
        cc.director.GlobalEvent.emit('switchSpeedMakeCoin',{eventName:'',bStart: true});
    },

     update (dt) {

        if(!this._bSpeedUp)
            return;

         if(this._speedUpDuration <= 0){
             this._speedUpDuration = 0;
             this._bSpeedUp = false;
             cc.log("停止加速..");
             //TO DO LIST
             //士兵产米停止
             cc.director.GlobalEvent.emit('switchSpeedMakeCoin',{eventName:'',bStart: false});
             cc.director.GlobalEvent.emit('speedUpStatus_Comd',{eventName:'',label:'00:00',bStart:false});
         }
         else
         {
             this._speedUpDuration -= dt;
             // let countdown = parseInt(this._speedUpDuration);

             // let str = this._speedUpDuration.toString();
             // let ss = '';
             // //只显示小数点后2位
             // let index = str.indexOf('.');
             // if(index !== -1){
             //     str = str.substring(0,index + 3);
             //     ss = str.replace('.',':');
             // }
             // if(this._speedUpDuration < 10){
             //     ss = '0' + str;
             // }
             // cc.director.GlobalEvent.emit('speedUpStatus_Comd',{eventName:'',label:ss, bStart:true});
             // cc.log("加速中..:",ss);

             let countdown = parseInt(this._speedUpDuration);
             let m = Math.floor((countdown / 60 % 60)) < 10 ? '0' + Math.floor((countdown / 60 % 60)) : Math.floor((countdown / 60 % 60));
             let s = Math.floor((countdown % 60)) < 10 ? '0' + Math.floor((countdown % 60)) : Math.floor((countdown % 60));
             let label = m + ':' + s;
             // cc.log("加速中..:",m + ':' +
             cc.director.GlobalEvent.emit('speedUpStatus_Comd',{eventName:'',label: label, bStart:true});
         }

     },
});
