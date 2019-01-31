

/**
 * 该脚本只对接所有GlobalData数据,作为中间层根据变化调度调度其他脚本
 */

let GlobalData = require("GlobalData");
let ComdUIManager = require("ComdUIManager");
let WxWebRequestLogin = require("WxWebRequestLogin");

let ComdCommandData =  cc.Class({
   extends: cc.Component,

    statics: {
        _instance:null
    },

    // editor: {
    //     executionOrder: -1
    // },

    properties: {

        /**
         * 米粒数量
         */
        CoinCount:{
            get(){
                return GlobalData.User.CoinCount;
            },
            set(value){
                GlobalData.User.CoinCount = value;
                WxWebRequestLogin._instance.updatePlayerInfo({rice:JSON.stringify(GlobalData.User.CoinCount)});
            },
        },

        /**
         * 爱心数量
         */
        YBCount:{
            get(){
                return GlobalData.User.YBCount;
            },
            set(value){
                GlobalData.User.YBCount = value;
                ComdUIManager._instance.updateYBLabel_Comd(value);
                WxWebRequestLogin._instance.updatePlayerInfo({love:JSON.stringify(GlobalData.User.YBCount)});
            },

        },

        /**
         * 各等级的爱心制造次数，
         */
        Level_YB:{
            get(){
                return GlobalData.User.Level_YB;
            },
            set(values){
                let index = values[0];
                let count = values[1];
                GlobalData.User.Level_YB[index] = count;
                WxWebRequestLogin._instance.updatePlayerInfo({level_love:JSON.stringify(GlobalData.User.Level_YB)});
            },
        },

        /**
         * 各等级的米粒制造次数，
         */
        Level_Coin:{
            get(){
                return GlobalData.User.Level_Coin;
            },
            set(values){
                let index = values[0];
                let count = values[1];
                GlobalData.User.Level_Coin[index] = count;
                ComdUIManager._instance.updateCreateComdInfo_Comd();
                WxWebRequestLogin._instance.updatePlayerInfo({level_rice:JSON.stringify(GlobalData.User.Level_Coin)});
            },
        },

        /**
         * 当前士兵的最大等级
         */
        Comd_level:{
            get(){
                return GlobalData.User.Comd_level;
            },
            set(value){
                GlobalData.User.Comd_level = value;
               ComdUIManager._instance.updateLeveUplInfo_Comd(value);
                WxWebRequestLogin._instance.updatePlayerInfo({chook_level:JSON.stringify(GlobalData.User.Comd_level)});
            },
        },

        /**
         * 当前能制造的最高级士兵
         */
        Comd_Create_level:{
            get(){
                let level = (GlobalData.User.Comd_level>=6)?(GlobalData.User.Comd_level-4):1;
                return level;
                // return GlobalData.User.Comd_level-2;
            },
        },


        /**
         * 叶片数量
         */
        LeavesCount:{
            get(){
                // WxWebRequestLogin._instance.updateUserAllData();
                return GlobalData.User.Leaves;
            },
            set(value){
                GlobalData.User.Leaves = value;
                ComdUIManager._instance.updateLeavesLabel_Comd(value);
                WxWebRequestLogin._instance.updatePlayerInfo({leaves:JSON.stringify(GlobalData.User.Leaves)});
                WxWebRequestLogin._instance.updateUserAllData();
            },
        },


        /**
         * 场上士兵状态,每秒产跟随变化
         */
        Comds:{
            get(){
                return GlobalData.User.Comds;
            },
            set(values){
                GlobalData.User.Comds = values;
                WxWebRequestLogin._instance.updatePlayerInfo({chook:JSON.stringify(GlobalData.User.Comds)});
                WxWebRequestLogin._instance.updatePlayerInfo({chook_level:JSON.stringify(GlobalData.User.Comd_level)});
            },
        },

        /**
         * 所有士兵的5秒产量
         */
        MakeCoinCount:{
            get(){
                return GlobalData.User.MakeCoinCount;
            },
            set(values){
                GlobalData.User.MakeCoinCount = values; //数组
                ComdUIManager._instance.onShowCoinPerSceond_Comd(values);
            },
        },


        /***
         * 今日是否签到
         * @returns
         * @constructor
         */
        TodaySign:{
            get(){
                return GlobalData.User.TodaySign;
                // WxWebRequestLogin._instance
            },
            set(value){
                GlobalData.User.TodaySign = value;
            },
        },

        /***
         * 获取,设置最大签到天数
         */
        MaxSign:{
            get(){
                return GlobalData.User.MaxSign;
            },
            // set(value){
            //  //   GlobalData.User.MaxSign = value;
            //     //服务器进行今日签到
            //     if(!this.bTest)
            //         WxWebRequestLogin._instance.getSignStatus(2);
            // },
        },


        /***
         * 神秘奖励访问器
         * @returns
         * @constructor
         * 1，查询今日次数 2，增加一次并查询今日次数
         */
        MysteryReward:{
            get(){
                // WxWebRequestLogin._instance.getMySteryStatus(1)
                return GlobalData.User.Mystery_reward;
            },
            set(value){ //2
                WxWebRequestLogin._instance.getMySteryStatus(value);
            },
        },

        Verify:{
            get(){
                return GlobalData.User.Verify;
            },
        },

        /***
         * 获取用户奖励倍数的数据
         */
        Reward_Times:{
            get(){
                return GlobalData.User.Reward_Times;
            },
            set(value){
                GlobalData.User.Reward_Times = value;
                WxWebRequestLogin._instance.updatePlayerInfo({reward_times:JSON.stringify(GlobalData.User.Reward_Times)});
            },
        },

        /***
         * 获取用户的新手教程数据
         */
        Tutorials:{
            get(){
                return GlobalData.User.Tutorials;
            },
            set(value){
                GlobalData.User.Tutorials = value;
                WxWebRequestLogin._instance.updatePlayerInfo({tutorial:JSON.stringify(GlobalData.User.Tutorials)});
            },
        },


        /***
         * 红包雨次数
         */
        Reward_Rain:{
            get(){
                return GlobalData.User.Reward_Rain;
            },
            set(value){
                GlobalData.User.Reward_Rain = value;
                WxWebRequestLogin._instance.updatePlayerInfo({reward_rain:JSON.stringify(GlobalData.User.Reward_Rain)});
                WxWebRequestLogin._instance.updateUserAllData();
            },
        },


        /***
         * 加速次数
         */
        SpeedUp_YB:{
            get(){

                return GlobalData.User.Fast_YB;
            },
            set(value){
                GlobalData.User.Fast_YB = value;
                WxWebRequestLogin._instance.updatePlayerInfo({fast_love:JSON.stringify(GlobalData.User.Fast_YB)});
                WxWebRequestLogin._instance.updateUserAllData();
            },
        },
    },

    /***
     * 提交幸运转盘数据记录
     * @constructor
     */
    UpdateLuckyWhell(){
        WxWebRequestLogin._instance.updateLuckyWhell();
    },


    sumbitPostMessageToRank(obj){
        WxWebRequestLogin._instance.sumbitPostMessageToRank(obj);
    },
    //
    // getMessageFromRank(){
    //     WxWebRequestLogin._instance.getMessageFromRank();
    // },



    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         ComdCommandData._instance = this;
     },

    start () {
        // this.init();
    },

    init(){
        ComdCommandData._instance.CoinCount = GlobalData.User.CoinCount;    //初始化米粒数量
        ComdCommandData._instance.YBCount = GlobalData.User.YBCount;    //初始化爱心数量

        ComdCommandData._instance.Comd_level = GlobalData.User.Comd_level;    //初始化士兵最高等级数量
        ComdCommandData._instance.LeavesCount = GlobalData.User.Leaves;    //初始化树叶数量
        ComdCommandData._instance.Comds =  GlobalData.User.Comds;        //初始化士兵位置信息

        ComdCommandData._instance.MakeCoinCount =  GlobalData.User.MakeCoinCount;    //初始化米粒数量
    },

    // update (dt) {},
});
