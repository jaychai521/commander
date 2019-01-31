// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let ComdJsonUtility = require("ComdJsonUtility");
let GoldSystem = require("GoldSystem");
let ComdCommandData = require("ComdCommandData");
let ComdAnchorPoints = require("ComdAnchorPoints");
let ComdUIManager = require("ComdUIManager");
let GlobalData = require("GlobalData");

cc.Class({
    extends: cc.Component,

    properties: {

        //漂浮文本
        flowText:{
            default: null,
            type:cc.Label
        },
        //等级文本框
        levelLabel:
        {
            default:null,
            type:cc.Label
        },
        comd_id:0 ,
        anchorIndex:-1,  //存储士兵所在的位置
        level:1,//等级
        comdName:'',   //名字
        getCoin:25, //每x秒产生的米粒数量
        unit:'',    //产生的米粒单位
        spawnToInterval:5,  //产生米粒数量的间隔
        recoverFactor:4, //回收系数

        lastTime:0, //时间
        countdown:0,    //计时器

        //士兵头像
        sprite:{
            default: null,
            type:cc.Sprite
        },

        comdObjects:{
            default:[],
            type:[cc.String],
        },

        //动画组件
        animation:{
            default:null,
            type:cc.Animation
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.GlobalEvent.on('onPlayAnimation',this.onPlayAnimation,this);

        cc.director.GlobalEvent.on('switchSpeedMakeCoin',this.switchSpeedMakeCoin,this);
    },

    start () {
        this.initData();
        // this.initFlowData();

        //数据初始化异步进行，延时更新数据
        cc.director.GlobalEvent.emit('updateChickenPosition',{eventName:''});

        cc.log('startSpeedUp:',this.startSpeedUp);
    },

    /***
     * 加速产米粒
     */
    switchSpeedMakeCoin(event){
        GlobalData.TemSpawnToInterval = event.bStart ? 1:5;
        cc.log(' GlobalData.TemSpawnToInterva:', GlobalData.TemSpawnToInterval);
    },

    initData(){
        this.node.parent.zIndex = 0;

        let anchors = ComdAnchorPoints._instance.spawnPositions;
        let chickenData = ComdJsonUtility._instance.chickenData;
        this.level = this.comd_id+1;
        this.comdName = chickenData.chicken[this.comd_id].name;
        this.getCoin = chickenData.chicken[this.comd_id].getRice
        this.unit = chickenData.chicken[this.comd_id].grUnit;
        this.recoverFactor = chickenData.chicken[this.comd_id].recoverFactor;

        this.levelLabel.string = this.level;

        GoldSystem._instance.updateMakeCoinCount(this.getCoin,this.unit,true);

        let  sprId = chickenData.chicken[this.comd_id].basicIcon;


        let callback = function(){
            //刷新最高级的ui
            if(this.level > ComdCommandData._instance.Comd_level){
                // console.log('合成新J，最高级别更新:'+this.level);
                ComdCommandData._instance.Comd_level = this.level;
                let _sprite = this.sprite;
                let _level = this.level;
                let _comdeName = this.comdName;
                // HandBook._instance.selectComdID = this.comd_id;
                let obj = {sprite:_sprite,levelLabel:_level,comdNameLabel:_comdeName};
                ComdUIManager._instance.showNewComdPlane_Comd(true,obj);
                // ComdUIManager._instance.updateNewComdInfoPlane(_sprite,_level,_comdeName);

                cc.director.GlobalEvent.emit('Guide_Create_Level_2_Chicken',{eventName:'',bStart:true});//检测2级指引
                cc.director.GlobalEvent.emit('Guide_Create_Level_3_Chicken',{eventName:'',bStart:false});//关闭3级目标指引

                cc.director.GlobalEvent.emit('Guide_Create_Level_4_Chicken',{eventName:'',bStart:false});  //关闭升4级指引
                cc.director.GlobalEvent.emit('Guide_Create_Level_5_Chicken',{eventName:'',bStart:true});  //检测5级指引
                cc.director.GlobalEvent.emit('Guide_Create_Level_5_Chicken',{eventName:'',bStart:false});  //检测5级指引

                cc.director.GlobalEvent.emit('Guide_Create_Level_6_Chicken',{eventName:'',bStart:true});  //检测6级指引
                cc.director.GlobalEvent.emit('Guide_Create_Level_6_Chicken',{eventName:'',bStart:false});  //检测6级指引

                cc.director.GlobalEvent.emit('Guide_Show_AllUI',{eventName:''});  //检测是否需要开放更多的ui

                cc.director.GlobalEvent.emit('updateBtnsStatus',{eventName:''});  //检测是否关闭状态3下的真好按钮

                cc.director.GlobalEvent.emit('Guide_ThumbUp_Level_3',{eventName:'',bStart:true});//检测3级指引
            }
        }.bind(this);

        ComdUIManager._instance.loadAtlas(this.sprite,sprId,callback);
    },

    initFlowData(){
       // console.log('initFlowData:'+ this.getCoin + this.unit);
        this.schedule(function () {
            this.onCreateComd();
            cc.log('onCreateComd:',this.spawnToInterval);
        },this.spawnToInterval);//this.spawnToInterval
    },


    onCreateComd(){
        this.flowText.node.active = true;
        this.flowText.string = '+' + this.getCoin.toString() + this.unit;

        GoldSystem._instance.makeCoinOperate(this.level,this.getCoin,this.unit);
        //触发总米粒文本缩放事件
        cc.director.GlobalEvent.emit('onlabelCoinCountAnimation_Comd',{eventName:''});
        this.animation.play('xiaojiji');

        let moveTo = cc.moveTo(0.4, cc.v2(0, 80));
        this.flowText.node.runAction(cc.sequence( moveTo,cc.callFunc(function (){
            this.flowText.node.position = cc.v2(0,0);
            this.flowText.node.active = false;
        },this)));

        //播放音效
        cc.director.GlobalEvent.emit('onMakeCoinClickClip',{eventName:''});
    },

    onDestroy(){
        GoldSystem._instance.updateMakeCoinCount(this.getCoin,this.unit,false);

        cc.director.GlobalEvent.off('switchSpeedMakeCoin',this);

        // cc.director.GlobalEvent.off('onPlayAnimation');
    },

    onPlayAnimation(args){
        let node = args.node;
        let clip = args.clip;
        if(node!==this.node)
            return;
        this.node.parent.zIndex = 10;
        this.animation.play(clip);
    },

    update (dt) {

        if(this.lastTime >=  GlobalData.TemSpawnToInterval){
            this.onCreateComd();
            this.lastTime = 0;
        }
        else {
            this.lastTime+=dt;
        }

    },
});
