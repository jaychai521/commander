let WxWebRequestLogin = require("WxWebRequestLogin");
let GoldSystem = require("GoldSystem");
let GlobalData = require("GlobalData");
let ComdUIManager = require("ComdUIManager");
let ComdCommandData = require("ComdCommandData");

cc.Class({
    extends: cc.Component,

    properties: {
        //神秘奖励
        _secretReward:[0,''],
        //离线奖励
        _offlineReward:[0,''],
        //离线双倍奖励
        _offlineDoubleReward:[0,''],
        //神秘奖励-关闭文本
        _secretRewardText:'',
        //离线奖励-关闭文本
        _offlineRewardText:'',
        //离线双倍奖励-关闭文本
        _offlineDoubleRewardText:'',
        //分享提示文本:
        _shareTips:[],
        //红包雨奖励 - 米粒
        _rainCoinReward:[0,''],
        //红包雨奖励 - 爱心
        _rainYBReward:0,

        _bShareFlag:false,  //状态交替标识



        //离线奖励所有状态
        offlineStatus:{
            default:[],
            type:[cc.Node],
            tooltip:"0.真好 1.分享 2.视频 3.分享+视频",
        },

        //额外奖励所有状态
        extraStatus:{
            default:[],
            type:[cc.Node],
            tooltip:"0.真好 1.分享 2.视频 3.分享+视频",
        },

        //神秘奖励所有状态
        secretStatus:{
            default:[],
            type:[cc.Node],
            tooltip:"0.真好 1.分享 2.视频 3.分享+视频",
        },

        //幸运升级所有状态
        luckyStatus:{
            default:[],
            type:[cc.Node],
            tooltip:"0.真好 1.分享 2.视频 3.分享+视频",
        },

        //红包雨所有状态
        redPackageStatus:{
            default:[],
            type:[cc.Node],
            tooltip:"0.真好 1.分享 2.视频 3.分享+视频",
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._shareTips = ['分享失败 请分享到不同群','分享失败 换个群试试吧！','分享失败 再试一次吧'];
        this.spCount = ComdCommandData._instance.SpeedUp_YB;  //更新加速次数
    },

    start () {
        cc.director.GlobalEvent.on('extraReward_reward_Comd',this.extraReward_reward_Comd,this);  //注册额外奖励事件,wx.onshow广播
        cc.director.GlobalEvent.on('secretReward_reward_Comd',this.secretReward_reward_Comd,this);  //注册神秘奖励事件,wx.onshow广播
        cc.director.GlobalEvent.on('offlineReward_reward_Comd',this.offlineReward_reward_Comd,this);  //注册离线奖励事件,wx.onshow广播
        cc.director.GlobalEvent.on('onLuckyLevelUp_Share_Comd',this.onLuckyLevelUp_Share_Comd,this);  //注册幸运升级奖励事件,wx.onshow广播
        cc.director.GlobalEvent.on('rain_reward_Comd',this.rain_reward_Comd,this);  //注册红包雨奖励奖励事件,wx.onshow广播
        cc.director.GlobalEvent.on('showOffReward_Comd',this.showOffReward_Comd,this);  //注册炫耀一下的奖励事件,wx.onshow广播

        cc.director.GlobalEvent.on('extraReward_receive_share_Comd',this.extraReward_receive_share_Comd,this);  //注册额外奖励事件,纯分享事件,播放广告视频失败回调
        cc.director.GlobalEvent.on('secretReward_receive_share_Comd',this.secretReward_receive_share_Comd,this);  //注册神秘奖励事件,纯分享事件,播放广告视频失败回调
        cc.director.GlobalEvent.on('offlineReward_double_share_Comd',this.offlineReward_double_share_Comd,this);  //注册离线奖励事件,纯分享事件,播放广告视频失败回调

        cc.director.GlobalEvent.on('updateSecretReward_Comd',this.updateSecretReward_Comd,this);  //注册更新玩家神秘奖励事件
        cc.director.GlobalEvent.on('updateOfflineReward_Comd',this.updateOfflineReward_Comd,this);  //注册更新玩家神秘奖励事件
        cc.director.GlobalEvent.on('updateOfflineDoubleReward_Comd',this.updateOfflineDoubleReward_Comd,this);  //注册更新玩家神秘奖励事件

        cc.director.GlobalEvent.on('extraReward_receive_Comd',this.extraReward_receive_Comd,this);  //注册额外奖励事件，用于重新拉起广告
        cc.director.GlobalEvent.on('secretReward_receive_Comd',this.secretReward_receive_Comd,this);  //注册神秘奖励事件，用于重新拉起广告
        cc.director.GlobalEvent.on('offlineReward_double_Comd',this.offlineReward_double_Comd,this);  //注册离线奖励事件，用于重新拉起广告
        cc.director.GlobalEvent.on('onWheelVideo_WarmTip_Comd',this.onWheelVideo_WarmTip_Comd,this);  //注册抽奖广告事件，用于重新拉起广告
        cc.director.GlobalEvent.on('onWheelVideo_BigGiftTip_Comd',this.onWheelVideo_BigGiftTip_Comd,this);  //注册抽奖广告事件，用于重新拉起广告

        cc.director.GlobalEvent.on('openGuidePlanes_Comd',this.openGuidePlanes_Comd,this);  //注册打开新手指引事件

        cc.director.GlobalEvent.on('updateBtnsStatus',this.updateBtnsStatus,this);  //注册刷新按钮事件

        cc.director.GlobalEvent.on('updateRaindReward_Comd',this.updateRaindReward_Comd,this);
        cc.director.GlobalEvent.on('resetRainReward_Comd',this.resetRainReward_Comd,this);

        this.updateBtnsStatus();
        this.resetRainReward_Comd();
    },

    updateBtnsStatus(){

        //幸运升级、评价奖励只存在假分享，不受状态切换控制
        //且6级前保持真好状态,之后只存在分享按钮(状态3)

        this.offlineStatus.forEach((element)=>{
            element.active = false;
            // cc.log('hide:',element);
        });
        this.extraStatus.forEach((element)=>{
            element.active = false;
        });
        this.secretStatus.forEach((element)=>{
            element.active = false;
        });
        this.luckyStatus.forEach((element)=>{
            element.active = false;
        });
        this.redPackageStatus.forEach((element)=>{
            element.active = false;
        });


        if(GlobalData.User.Verify == 0){
            //展现真好状态
            this.offlineStatus[0].active = true;
            this.extraStatus[0].active = true;
            this.secretStatus[0].active = true;
            this.luckyStatus[0].active = true;
            this.redPackageStatus[0].active = true;
        }
        else  if(GlobalData.User.Verify == 1) {
            //展示视频状态
            this.offlineStatus[2].active = true;
            this.extraStatus[2].active = true;
            this.secretStatus[2].active = true;
            this.luckyStatus[2].active = true;
            this.redPackageStatus[2].active = true;
        }
        else if(GlobalData.User.Verify == 2){
            //展示分享状态
            this.offlineStatus[1].active = true;
            this.extraStatus[1].active = true;
            this.secretStatus[1].active = true;
            this.luckyStatus[1].active = true;
            this.redPackageStatus[1].active = true;
        }
        else if(GlobalData.User.Verify == 3){
            let level = ComdCommandData._instance.Comd_level;
            if(level < 6){
                //展示真好状态
                this.offlineStatus[0].active = true;
                this.extraStatus[0].active = true;
                this.secretStatus[0].active = true;
                this.luckyStatus[0].active = true;
                this.redPackageStatus[0].active = true;
            }
            else
            {
                //展示视频+分享状态
                this.offlineStatus[3].active = true;
                this.extraStatus[3].active = true;
                this.secretStatus[3].active = true;
                this.redPackageStatus[3].active = true;
                //幸运,评价默认展示分享状态
                this.luckyStatus[1].active = true;
            }
        }
    },


    /***
     * 炫耀一下 - 奖励
     */
    showOffReward_Comd(event){
        let bSuccess = event.result;
        if(bSuccess)
        {
            GoldSystem._instance.YBOperate(100,{tip:'章+',content:100});
            this.closeNewComdPlanes_Comd();
        }
        else {
            console.log(this._shareTips[GlobalData.Time.ShareCount]);
            ComdUIManager._instance.showTip_Comd(this._shareTips[GlobalData.Time.ShareCount]);
        }
    },


    /***
     * 炫耀一下 - 真好
     */
    showOff_zhenhao_Comd(){
        this.closeNewComdPlanes_Comd();
        // this.showOffReward({result:true});
    },

    /***
     * 炫耀一下 - 分享
     */
    showOff_share_Comd(){
        GlobalData.OnShowTypeValue = GlobalData.OnShowType.SHOW_OFF;
        WxWebRequestLogin._instance.onTokenShare(3,'炫耀一下-分享');
    },

    /***
     * 更新红包雨奖励的数据
     * @param event
     */
    updateRaindReward_Comd(event){
        //米粒
        if(event.type == 1){
            this._rainCoinReward = event.data;
        }
        //爱心
        if(event.type == 2){
            this._rainYBReward = event.data;
        }

       // cc.log('更新米粒:',this._rainCoinReward,' 更新爱心:',this._rainYBReward);
    },

    /***
     * 重置红包雨的奖励数据
     */
    resetRainReward_Comd(){
        this._rainCoinReward = [0,''];
        this._rainYBReward = 0;
    },

    /***
     * 红包奖励 - 真好按钮
     */
    rain_zhenhao_Comd(){
        this.rain_reward_Comd({result:true});
    },

    /***
     * 红包奖励 - 分享按钮
     */
    rain_share_Comd(){
        GlobalData.OnShowTypeValue = GlobalData.OnShowType.REDPACKAGE_RAIN_REWARD;
        WxWebRequestLogin._instance.onTokenShare(3,'红包雨-分享');

        if(!CC_WECHATGAME){
            cc.log('红包奖励 - 分享按钮');
            this.rain_reward_Comd({result:true});
        }
    },

    /***
     * 红包奖励 - 视频按钮
     */
    rain_video_Comd(){
        let limit = GlobalData.User.Video_Today_Time;
        if(limit < GlobalData.User.Video_Limit){
            let callback = function () {
                //爱心和米粒 双倍领取
                this.rain_reward_Comd({result:true});
            }.bind(this);
            cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.RedRainReward_Video,callback:callback,way:'红包雨-看视频',from:'rain_video'});
        }
        else {
            this.rain_share_Comd();
        }

        if(!CC_WECHATGAME){
            cc.log('红包奖励 - 视频按钮');
            this.rain_reward_Comd({result:true});
        }
    },

    /***
     * 红包奖励 - 视频+分享按钮
     */
    rain_queue_Comd(){
        this._bFlag = !this._bFlag;
        if(this._bFlag){
            this.rain_video_Comd();
        }
        else {
            this.rain_share_Comd();
        }

        if(!CC_WECHATGAME){
            cc.log('红包奖励 - 视频+分享按钮');
            this.rain_reward_Comd({result:true});
        }
    },

    /***
     * 红包奖励,onShow调用,双倍领取
     */
    rain_reward_Comd(event){
        let bSuccess = event.result;
        if(bSuccess)
        {
            let coin = this._rainCoinReward[0]*2;
            let unit = this._rainCoinReward[1];
            let yb = this._rainYBReward*2;

            let coinStr = coin.toString();
            let index = coinStr.indexOf('.');
            if(index !== -1){
                coinStr = coinStr.substring(0,index + 3);
            }

            GoldSystem._instance.coinOperate(coin,unit);
            GoldSystem._instance.YBOperate(yb);
            ComdUIManager._instance.showAssetTip_Comd('银+' + coinStr + unit + '\n章+' + yb);

            ComdUIManager._instance.showRedRainPlane_Comd(false);
        }
        else {
            console.log(this._shareTips[GlobalData.Time.ShareCount]);
            ComdUIManager._instance.showTip_Comd(this._shareTips[GlobalData.Time.ShareCount]);
        }
    },

    /***
     * 红包奖励 - 关闭按钮 - 正常领取
     */
    rain_close_Comd(){
        let coin = this._rainCoinReward[0];
        let unit = this._rainCoinReward[1];
        let yb = this._rainYBReward;

        let coinStr = coin.toString();
        let index = coinStr.indexOf('.');
        if(index !== -1){
            coinStr = coinStr.substring(0,index + 3);
        }

        GoldSystem._instance.coinOperate(coin,unit);
        GoldSystem._instance.YBOperate(yb);
        ComdUIManager._instance.showAssetTip_Comd('银+' + coinStr + unit + '\n章+' + yb);

        ComdUIManager._instance.showRedRainPlane_Comd(false);
    },

    /***
     * 幸运升级 分享回调
     */
    onLuckyLevelUp_Share_Comd(event){
        let bSuccess = event.result;
        if(bSuccess)
        {
            cc.director.GlobalEvent.emit('onLuckyUpForShareSuccess',{eventName:''});
        }
        else {
            console.log(this._shareTips[GlobalData.Time.ShareCount]);
            ComdUIManager._instance.showTip_Comd(this._shareTips[GlobalData.Time.ShareCount]);
        }
    },



    //额外奖励 - 签到面板
    extraReward_close_Comd(){
        ComdUIManager._instance.showExtraReward_Comd(false);
        ComdUIManager._instance.showSignPlanes_Comd(false);
        ComdUIManager._instance.showTip_Comd('你放弃了今日的额外奖励');
    },

    //额外奖励 - 分享/看视频交替
    extraReward_queue_Comd(){
        this._bFlag = !this._bFlag;
        if(this._bFlag){
            this.extraReward_receive_share_Comd();
        }
        else {
            this.extraReward_receive_share_Comd();
        }
    },

    //领取按钮
    extraReward_receive_Comd(){
        console.log('正常使用额外奖励领取按钮-extraReward_receive');
        let limit = GlobalData.User.Video_Today_Time;
        if(limit < GlobalData.User.Video_Limit){
            let callback = function () {
                this.extraReward_reward_Comd({result:true});
            }.bind(this);
            cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.SignExtraReward_Video,callback:callback,way:'签到额外奖励',from:'extraReward_receive'});
        }
        else {
            GlobalData.OnShowTypeValue = GlobalData.OnShowType.EXTRA_REWARD;
            WxWebRequestLogin._instance.onTokenShare(3,'额外奖励-正常领取按钮');
        }

        if(!CC_WECHATGAME){
            this.extraReward_reward_Comd({result:true});
            ComdUIManager._instance.showExtraReward_Comd(false);
        }
    },

    //分享按钮
    extraReward_receive_share_Comd(){
        GlobalData.OnShowTypeValue = GlobalData.OnShowType.EXTRA_REWARD;
        WxWebRequestLogin._instance.onTokenShare(3,'额外奖励-纯分享按钮');

        if(!CC_WECHATGAME){
            console.log('分享按钮');
            this.extraReward_reward_Comd({result:true});
            ComdUIManager._instance.showExtraReward_Comd(false);
        }
    },

    //领取按钮 - 真好
    extraReward_receive_zhenhao_Comd(){

        this.extraReward_reward_Comd({result:true});
        ComdUIManager._instance.showExtraReward_Comd(false);

    },

    //wx.onshow广播
    extraReward_reward_Comd(event){
        let bSuccess = event.result;
        if(bSuccess)
        {
            GoldSystem._instance.YBOperate(300,{tip:'章+',content:300});
            ComdUIManager._instance.showExtraReward_Comd(false);
            ComdUIManager._instance.showSignPlanes_Comd(false);
        }
        else
        {
            console.log(this._shareTips[GlobalData.Time.ShareCount]);
            ComdUIManager._instance.showTip_Comd(this._shareTips[GlobalData.Time.ShareCount]);
        }
    },

    //神秘奖励 - 星星降落伞按钮
    secretReward_close_Comd(){
        ComdUIManager._instance.showSecretRewardPlanes_Comd(false);
        ComdUIManager._instance.showTip_Comd('你与神秘奖励擦肩而过');
    },

    //神秘奖励 - 分享/看视频交替
    secretReward_queue_Comd(){
        this._bFlag = !this._bFlag;
        if(this._bFlag){
            this.secretReward_receive_share_Comd();
        }
        else {
            this.secretReward_receive_share_Comd();
        }
    },

    //领取按钮
    secretReward_receive_Comd(){

        let limit = GlobalData.User.Video_Today_Time;
        if(limit < GlobalData.User.Video_Limit){
            console.log('神秘奖励 - ',limit);
            let callback = function () {
                this.secretReward_reward_Comd({result:true});
            }.bind(this);
            cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.SecretReward_Video,callback:callback,way:'神秘奖励',from:'secretReward_receive'});
        }
        else
        {
            console.log('神秘奖励 - 分享');
            GlobalData.OnShowTypeValue = GlobalData.OnShowType.SECRET_REWARD;
            WxWebRequestLogin._instance.onTokenShare(3,'神秘奖励-当日视频次数已满');

            //服务器提交签到次数
            ComdCommandData._instance.MysteryReward = 2;
            //打印数据
            // let maxNum =ComdCommandData._instance.MysteryReward;
            // console.log('已点击-神秘奖励次数:',maxNum);
        }

        if(!CC_WECHATGAME){
            this.secretReward_reward_Comd({result:true});
            ComdUIManager._instance.showSecretRewardPlanes_Comd(false);
        }
    },

    //分享按钮
    secretReward_receive_share_Comd(){
        GlobalData.OnShowTypeValue = GlobalData.OnShowType.SECRET_REWARD;
        WxWebRequestLogin._instance.onTokenShare(3,'神秘奖励-纯分享按钮');

        //服务器提交签到次数
        ComdCommandData._instance.MysteryReward = 2;

        if(!CC_WECHATGAME){
            console.log('分享按钮');
            this.secretReward_reward_Comd({result:true});
            ComdUIManager._instance.showSecretRewardPlanes_Comd(false);
        }
    },

    //领取按钮 - 真好
    secretReward_receive_zhenhao_Comd(){

        this.secretReward_reward_Comd({result:true});

        //服务器提交签到次数
        ComdCommandData._instance.MysteryReward = 2;
        //打印数据
        // let maxNum =ComdCommandData._instance.MysteryReward;
        // console.log('已点击-神秘奖励次数:',maxNum);
    },

    //wx.onshow广播
    secretReward_reward_Comd(event){
        let bSuccess = event.result;
        if(bSuccess)
        {
            let coin = this._secretReward[0];
            let unit = this._secretReward[1];
            GoldSystem._instance.coinOperate(coin,unit ,{tip:'银+',content:this._secretRewardText});
            ComdUIManager._instance.showSecretRewardPlanes_Comd(false);
        }
        else
        {
            console.log(this._shareTips[GlobalData.Time.ShareCount]);
            ComdUIManager._instance.showTip_Comd(this._shareTips[GlobalData.Time.ShareCount]);
        }
    },

    //离线奖励 玩家登陆
    offlineReward_close_Comd(){
        console.log('离线奖励-offlineReward_close');

        ComdUIManager._instance.showOfflinePlanes_Comd(false);
        let coin = this._offlineReward[0];
        let unit = this._offlineReward[1];
        GoldSystem._instance.coinOperate(coin,unit ,{tip:'银+',content: this._offlineRewardText});
    },

    //离线奖励 - 分享/看视频交替
    offlineReward_queue_Comd(){
        this._bFlag = !this._bFlag;
        if(this._bFlag){
            this.offlineReward_double_share_Comd();
        }
        else {
            this.offlineReward_double_share_Comd();
        }
    },

    //离线奖励,真好按钮暂用
    offlineReward_zhenhao_Comd(){
        this.offlineReward_reward_Comd({result:true});
    },

    //领取按钮
    offlineReward_double_Comd(){

        console.log('离线奖励-offlineReward_double');
        let limit = GlobalData.User.Video_Today_Time;
        if(limit < GlobalData.User.Video_Limit){
            let callback = function () {
                this.offlineReward_reward_Comd({result:true});
            }.bind(this);
            cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.OfflineReward_Video,callback:callback,way:'离线奖励',from:'offlineReward_double'});
        }
        else
        {
            GlobalData.OnShowTypeValue = GlobalData.OnShowType.OFFLINE_DOUBLE_REWARD;
            WxWebRequestLogin._instance.onTokenShare(3,'离线奖励-正常领取按钮');
        }

        if(!CC_WECHATGAME){
            this.offlineReward_reward_Comd({result:true});
        }
    },

    //分享按钮
    offlineReward_double_share_Comd(){
        console.log('离线奖励-offlineReward_double_share');
        GlobalData.OnShowTypeValue = GlobalData.OnShowType.OFFLINE_DOUBLE_REWARD;
        WxWebRequestLogin._instance.onTokenShare(3,'离线奖励-纯分享按钮');

        if(!CC_WECHATGAME){
            console.log('分享按钮');
            this.offlineReward_reward_Comd({result:true});
        }
    },


    //wx.onshow广播,领取双倍奖励
    offlineReward_reward_Comd(event){
        console.log('离线奖励-offlineReward_reward');
        let bSuccess = event.result;
        if(bSuccess){
            ComdUIManager._instance.showOfflinePlanes_Comd(false);
            let coin = this._offlineDoubleReward[0];
            let unit = this._offlineDoubleReward[1];
            GoldSystem._instance.coinOperate(coin,unit ,{tip:'银+',content:this._offlineDoubleRewardText});
        }
        else {
            console.log(this._shareTips[GlobalData.Time.ShareCount]);
            ComdUIManager._instance.showTip_Comd(this._shareTips[GlobalData.Time.ShareCount]);
        }
    },


    /***
     * 获取玩家神秘奖励奖励信息
     * @param args
     */
    updateSecretReward_Comd(args){
        this._secretReward = args.secretReward;
        this._secretRewardText = args.text;
    },

    /***
     * 获取玩家离线奖励奖励信息
     * @param args
     */
    updateOfflineReward_Comd(args){
        this._offlineReward = args.reward;
        this._offlineRewardText = args.text;
        cc.log('离线奖励:',this._offlineReward);
        cc.log('离线奖励文本:',this._offlineRewardText);
    },


    /***
     * 获取玩家离线双倍奖励奖励信息
     * @param args
     */
    updateOfflineDoubleReward_Comd(args){
        this._offlineDoubleReward = args.reward;
        this._offlineDoubleRewardText = args.text;
    },

    /***
     * 打开排行榜
     */
    openRankPlane_Comd(){
        WxWebRequestLogin._instance.getMessageFromRank();
        ComdUIManager._instance.showRankPlane_Comd(true);
    },

    closeRankPlane_Comd(){
        ComdUIManager._instance.showRankPlane_Comd(false);
    },

    /***
     * 打开签到面板，更新广告
     */
    openSignPlane_Comd(){
        //播放音效
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showSignPlanes_Comd(true);
    },

    closeSignPlane_Comd(){
        //播放音效
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showSignPlanes_Comd(false);
    },

    /***
     * 打开互助红包面板，更新广告
     */
    openRedPackagePlanes_Comd(){
        //播放音效
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showRedPackagePlanes_Comd(true);
    },

    closeRedPackagePlanes_Comd(){
        //播放音效
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showRedPackagePlanes_Comd(false);
    },


    /***
     * 打开每日大礼面板，更新广告
     */
    openInviteFriendPlanes_Comd(){
        //播放音效
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showCallFriendPlanes_Comd(true);
    },

    closeInviteFriendPlanes_Comd(){
        //播放音效
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showCallFriendPlanes_Comd(false);
    },

    /***
     * 打开邀请礼包面板,不限人数
     */
    openInviteGiftsPlanes_Comd(){
        let callback = function(res){
            let step = 148;
            let count = GlobalData.TemInviteGiftCount;
            if(count < 1)
                return;
            let v2 = new cc.Vec2(0,374+count*step);
            res.setContentPosition(v2);
        };
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showInviteFriendPlanes_Comd(true,callback);
    },

    closeInviteGiftsPlanes_Comd(){
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showInviteFriendPlanes_Comd(false);
    },


    /***
     * 打开抽奖面板
     */
    openRewarPlanes_Comd(){
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showRewardWheelPlanes_Comd(true);
    },

    closeRewarPlanes_Comd(){
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showRewardWheelPlanes_Comd(false);
    },

    /***
     * 打开新手说明面板
     */
    openGuidePlanes_Comd(){
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showGuidePlanes_Comd(true);
    },

    closeGuidePlanes_Comd(){
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showGuidePlanes_Comd(false);
        //关闭新手指引教程,理论上不需要销毁
        cc.director.GlobalEvent.emit('Guide_Show_HowToPlay_Chicken',{eventName:'',bStart:false});
    },



    /***
     * 打开商店面板
     */
    openShopPlanes_Comd(){
        let callback = function(res){
            let step = 149.6;
            let topLevel = ComdCommandData._instance.Comd_level;
            if(topLevel <6)
                return;
            let number = topLevel -6;
            let v2 = new cc.Vec2(0,461+number*step);
            res.setContentPosition(v2);
        };
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showShopPlanes_Comd(true,callback);

        cc.director.GlobalEvent.emit('onGuideStep3',{eventName:'',result:false});
        cc.director.GlobalEvent.emit('Guide_Shop',{eventName:'',bStart:false});//关闭商店指引
        cc.director.GlobalEvent.emit('Guide_ArrowToShop',{eventName:'',bStart:true});//开启爱心购买指引
    },

    closeShopPlanes_Comd(){
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showShopPlanes_Comd(false);
        cc.director.GlobalEvent.emit('Guide_ArrowToShop',{eventName:'',bStart:false});//关闭爱心购买指引
        cc.director.GlobalEvent.emit('Guide_Show_HowToPlay_Chicken',{eventName:'',bStart:true});//打开怎么玩界面
    },

    /***
     * 打开新的士兵面板
     */
    openNewComdPlanes_Comd(){

    },

    closeNewComdPlanes_Comd(){
        cc.director.GlobalEvent.emit('onBtnClickClip',{eventName:''});
        ComdUIManager._instance.showNewComdPlane_Comd(false)

        cc.director.GlobalEvent.emit('Guide_ThumbUp_Level_3',{eventName:'',bStart:false});//关闭3级指引
        cc.director.GlobalEvent.emit('Guide_Create_Level_2_Chicken',{eventName:'',bStart:false});//关闭2级指引
        cc.director.GlobalEvent.emit('Guide_Create_Level_3_Chicken',{eventName:'',bStart:true});//开启3级目标指引
        cc.director.GlobalEvent.emit('Guide_Buy_Chicken',{eventName:'',bStart:true});//开启购买士兵指引
        cc.director.GlobalEvent.emit('Guide_Shop',{eventName:'',bStart:true});//开启商店指引
    },


    /***
     * 抽奖叶子数量不足时
     */
    onWheelVideo_WarmTip_Comd(){
        // console.log('抽奖-抽奖叶子数量不足时');
        let self = this;

        //如果不是正常使用广告,只给提示
        if(GlobalData.User.Verify == 0 || GlobalData.User.Verify == 2){
            console.log('GlobalData.User.Verify:',GlobalData.User.Verify);
            ComdUIManager._instance.showWheelWarmTip_Comd(false);    //关闭温馨提示提示面板
            ComdUIManager._instance.showTip_Comd('没有更多的视频可以看了');
            return;
        }

        let limit = GlobalData.User.Video_Today_Time;
        //正常看广告，拿树叶
        if(limit < GlobalData.User.Video_Limit){
            self.callback = function () {
                GoldSystem._instance.LeavesOperate(5);
               // ComdUIManager._instance.showTip('得到树叶x5');
                ComdUIManager._instance.showAssetTip_Comd('票+5');
                ComdUIManager._instance.showWheelWarmTip_Comd(false);    //关闭温馨提示提示面板
            }.bind(this);
            cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.RewardWheel_Video,callback:self.callback,way:'票子不足',from:'onWheelVideo_WarmTip'});
        }
        //观看广告次数用完后给提示
        else
        {
            console.log('GlobalData.User.Video_Today_Time:观看视频次数不足');
            ComdUIManager._instance.showTip_Comd('没有更多的视频可以看了');
            ComdUIManager._instance.showWheelWarmTip_Comd(false);    //关闭温馨提示提示面板
        }

        // if(!CC_WECHATGAME){
        //     self.callback();
        // }
    },

    /***
     * 抽奖抽中大礼倍率
     */
    onWheelVideo_BigGiftTip_Comd(){
        // console.log('抽奖-抽奖抽中大礼倍率');
        let self = this;
        self.callback = function () {
            let rt = ComdCommandData._instance.Reward_Times;
            ComdUIManager._instance.showTip_Comd('下次抽奖翻'+ rt + '倍');
            ComdUIManager._instance.showWheelBigGiftTip_Comd(false);    //关闭大礼包提示面板,等待下次抽奖
        }.bind(this);

        if(CC_WECHATGAME)
        {
            //如果不是正常使用广告,给提示，并且返还叶子，重置倍率(倍率需要看完广告才能获得)
            if(GlobalData.User.Verify == 0 || GlobalData.User.Verify == 2){
                ComdUIManager._instance.showWheelBigGiftTip_Comd(false);    //关闭大礼包提示面板
                ComdUIManager._instance.showTip_Comd('没有更多的视频可以看了');
                GoldSystem._instance.LeavesOperate(1);  //返回叶子
                cc.director.GlobalEvent.emit('resetTimes',{eventName:''});
                return;
            }

            let limit = GlobalData.User.Video_Today_Time;
            //正常看广告，倍率正常使用(ComdRewardController)
            if(limit < GlobalData.User.Video_Limit){
                cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.RewardWheel_Video,callback:self.callback,way:'票子不足',from:'onWheelVideo_BigGiftTip'});
            }
            //观看广告次数用完后给提示,不给倍率，返还叶子
            else
            {
                ComdUIManager._instance.showTip_Comd('没有更多的视频可以看了');
                ComdUIManager._instance.showWheelBigGiftTip_Comd(false);    //关闭大礼包提示面板
                GoldSystem._instance.LeavesOperate(1);  //返回叶子
                cc.director.GlobalEvent.emit('resetTimes',{eventName:''});
            }
        }
        else
        {
            ComdUIManager._instance.showTip_Comd('没有更多的视频可以看了');
            GoldSystem._instance.LeavesOperate(1);  //返回叶子
            ComdUIManager._instance.showWheelBigGiftTip_Comd(false);    //关闭大礼包提示面板,等待下次抽奖
        }

        // if(!CC_WECHATGAME){
        //     self.callback();
        // }
    },

    // /***
    //  * 打开抽奖-神秘礼物面板
    //  */
    // openWheelBigGiftTip(){
    //     ComdUIManager._instance.showWheelBigGiftTip(true);
    // },
    //关闭抽奖大礼包按钮，返还叶子，重设倍率
    closeWheelBigGiftTip_Comd(){
        ComdUIManager._instance.showWheelBigGiftTip_Comd(false);
        GoldSystem._instance.LeavesOperate(1);  //返回叶子
        cc.director.GlobalEvent.emit('resetTimes',{eventName:''});
    },

    // /***
    //  * 叶子不足时点击抽奖打开
    //  */
    // openWheelWarmTip(){
    //     ComdUIManager._instance.showWheelWarmTip(true);
    // },
    //
    //不，谢谢 按钮
    closeWheelWarmTip_Comd(){
        ComdUIManager._instance.showWheelWarmTip_Comd(false);
    },

    /***
     * 开启红包雨面板
     */
    openRainPlane_Comd(){
        ComdUIManager._instance.showRedRainPlane_Comd(true);
    },

    /***
     * 关闭红包雨面板
     */
    closeRainPlane_Comd(){
        ComdUIManager._instance.showRedRainPlane_Comd(false);
    },

    /***
     * 开启加速面板
     */
    openSpeedUpPlane_Comd(){
        let val = this.spCount*20+10;
        ComdUIManager._instance.OpenSpeedUpPlane_Comd(true,'章×'+ val);
    },

    /***
     * 关闭加速面板
     */
    closeSpeedUpPlane_Comd(){
        ComdUIManager._instance.OpenSpeedUpPlane_Comd(false);
    },

    /***
     * 使用爱心加速 1min
     */
    speedUpForYB_Comd(){
       let ybCount = ComdCommandData._instance.YBCount;
        if(ybCount >= 10) {
            let val = this.spCount*20+10;
            GoldSystem._instance.YBOperate(-val);
            cc.director.GlobalEvent.emit('onSpeedUpForMakeCoin',{eventName:'',bStart:true,duration:60});
            ComdUIManager._instance.OpenSpeedUpPlane_Comd(false);

            this.spCount += 1;
            ComdCommandData._instance.SpeedUp_YB = this.spCount ;//更新加速数值
        }
        else {
            // cc.log('没有足够的元宝');
            ComdUIManager._instance.showTip_Comd('没有足够的元宝');
        }
    },

    /***
     * 看广告加速 3min
     */
    speedUpForVideo_Comd(){

        let self = this;
        self.callback = function(){
            cc.director.GlobalEvent.emit('onSpeedUpForMakeCoin',{eventName:'',bStart:true,duration:180});
            ComdUIManager._instance.OpenSpeedUpPlane_Comd(false);
        }.bind(this);

        let limit = GlobalData.User.Video_Today_Time;
        if(limit < GlobalData.User.Video_Limit){
            cc.director.GlobalEvent.emit('onWatchVideo',{eventName:'',path:GlobalData.SpeedUp_Video,callback:self.callback,way:'看广告加速',from:'speedUpForVideo'});
        }
        //观看广告次数用完后给提示
        else
        {
            ComdUIManager._instance.showTip_Comd('没有更多的视频可以看了');
            ComdUIManager._instance.OpenSpeedUpPlane_Comd(false);
        }

        if(!CC_WECHATGAME){
            cc.log('看广告加速 - 3min');
            self.callback();
        }

    },


    // update (dt) {},
});
