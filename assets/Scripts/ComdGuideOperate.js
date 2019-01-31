

cc.Class({
    extends: cc.Component,

    properties: {
        // _guideOperate:require('ComdGuideOperate'),
        _uiid:0,
        uiid:{
            get(){
                return this._uiid;
            },
            set(value){
                this._uiid = value;
            }
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    start () {
        let oper = this.node.getComponent('ComdGuideOperate');
        cc.director.GuideManager.addUI(oper);
    },


    onGuideBegin(id){

    },

    onWidgetTouched(){

    },

    onGuideEnd(id){

    },

    // update (dt) {},
});
