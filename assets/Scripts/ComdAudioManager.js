// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        //创建士兵的音效
        spawanComdClip:{
            default:null,
            type:cc.AudioClip,
        },

        //点击按钮的音效
        btnClickClip:{
            default:null,
            type:cc.AudioClip,
        },

        //士兵产生金币的音效
        makeGoldClip:{
            default:null,
            type:cc.AudioClip,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.addPersistRootNode(this.node);

        cc.director.GlobalEvent.on('onSpwanComdClip',this.onSpwanComdClip,this);
        cc.director.GlobalEvent.on('onBtnClickClip',this.onBtnClickClip,this);
        cc.director.GlobalEvent.on('onMakeGoldClickClip',this.onMakeGoldClickClip,this);
    },

    /***
     * 播放制造士兵的音效
     */
    onSpwanComdClip(){
       // this.audioSource.play(this.spawanComdClip);
        cc.audioEngine.play(this.spawanComdClip,false,.5);
    },

    /***
     * 播放点击按钮的音效
     */
    onBtnClickClip(){
        cc.audioEngine.play(this.btnClickClip,false,.5);
    },

    /***
     * 播放授权按钮的音效
     */
    onMakeGoldClickClip(){
        cc.audioEngine.play(this.makeCoinClip,false,.5);
    },



    // update (dt) {},
});
