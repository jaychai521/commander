let WxWebRequestLogin = require("WxWebRequestLogin");
let GoldSystem = require("GoldSystem");
let GlobalData = require("GlobalData");
let ComdUIManager = require("ComdUIManager");
let ComdCommandData = require("ComdCommandData");
let ComdSprite = require("ComdSprite");

cc.Class({
    extends: cc.Component,

    properties: {

        labelAnimation:{
            default:null,
            type:cc.Animation
        },

        node_rail:{
            default:null,
            type:cc.Node
        },

        node_recovery:{
            default:null,
            type:cc.Node
        },

        shootStarManager:{
            default:null,
            type:require('ComdShootStarManager'),
        },

        _bChange:false,

        _guideIndex:{
            default:0,
            type:cc.Integer
        },


        node_planes:{
            default:null,
            type:cc.Node
        },

        assetLabelPrefab:{
            default:null,
            type:cc.Prefab
        },

    },

    createAssetLabel(){
        let obj = cc.instantiate(this.assetLabelPrefab);
        obj.setParent(this.node_planes);
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    chanegeNodeInfo(){
        // cc.log('node_rail:',this.node_rail.zIndex,' node_recovery:',this.node_recovery.zIndex);
        this._bChange = !this._bChange;
        this.node_recovery.zIndex = this._bChange ? 1: -1;
        this.node_recovery.opacity =  this._bChange ? 255: 155;
    },

    openSecretReward(){
        cc.log('openSecretReward');
        GoldSystem._instance.secretReward();
    },

    labelScale(){
        cc.log('animation play');
        this.labelAnimation.play('label-scale-coincount');
    },

    getPlayerAllAsset(){
        GoldSystem._instance.getPlayerAllAsset();
    },

    redpackageReceive(){
        let newUser = GlobalData.User.IsNewUser ? 3:1;
        let reward = ComdCommandData._instance.MakeCoinCount[0]*12*12*newUser;
        let unit = ComdCommandData._instance.MakeCoinCount[1];
        GoldSystem._instance.coinOperate(reward,unit,{tip:'银+',content:''});
        // console.log('领取奖励:GlobalData.FriendUid6:',GlobalData.FriendUid6[n]);
    },

    zhenhaoBtn(){
        //领取奖励
        let reward = ComdCommandData._instance.MakeCoinCount[0]*12960;
        let unit = ComdCommandData._instance.MakeCoinCount[1];
        GoldSystem._instance.coinOperate(reward,unit,{tip:'银+',content:''});
        GlobalData.User.Receive_CallFriend = 1;
        // 向服务器提交领取状态
        WxWebRequestLogin._instance.invite_pull(GlobalData.FriendUid4[0],this.inviteType);
    },

    offlineReward(){
        GoldSystem._instance.offlineReward();
    },

    StartTime(){
        cc.director.TimeStamp.StartTime();
    },

    StayTime(){
        cc.director.TimeStamp.StayTime();
    },

    ShowAD(){
        cc.director.GlobalEvent.emit('onShowBanner',{eventName:'',bannerID:GlobalData.MainPage_Banner_ID});
    },

    BtnParament(event){
        cc.log('event:',event);
    },


    startRain(){
        ComdUIManager._instance.showRedRainPlane_Comd(true);
      //  this.shootStarManager.startRain();
    },

    onGuide(){
        cc.director.GuideManager.startCurGuide(GlobalData.GuideID.Guide_Buy_Chicken);
    },

    onGuideRemove(){
        cc.director.GuideManager.finishCurGuide(GlobalData.GuideID.Guide_Buy_Chicken);
    },

    speedToMakeCoin(){
        this._bChange = !this._bChange;
        cc.director.GlobalEvent.emit('switchSpeedMakeCoin',{eventName:'',bStart:this._bChange});
    },

    staticTest(){
        ComdUIManager._instance.OpenSpeedUpPlane_Comd(true);
    },


    // update (dt) {},
});
