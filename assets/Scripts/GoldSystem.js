// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let ComdCommandData = require("ComdCommandData");
let GlobalData = require("GlobalData");
let ComdUIManager = require("ComdUIManager");

let  GoldSystem = cc.Class({
    extends: cc.Component,

    statics: {
            _instance:null
    },

    properties: {
        //米粒单位
        unit:{
          default:[],
          type:[cc.String]
        },
        coinCount:0, //玩家的米粒数量
        iUnit:'',  //玩家的米粒单位
        ybCount:0, //玩家的爱心数量
        leavesCount:0,  //玩家的叶子数量

        // makeCoinCount:{  //记录玩家当前所有士兵的总产量
        //     default:[],
        //     type:[cc.Integer],
        // },

        makeCoinCount:[],

        comdObjects:{
            default:[],
            type:[cc.String],
        },
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         GoldSystem._instance = this;
     },

    start () {
        // cc.director.GlobalEvent.on('offlineReward',this.offlineReward,this);

        //向服务器请求数据,测试环境下默认为k
        this.coinCount =ComdCommandData._instance.CoinCount[0];
        this.iUnit = ComdCommandData._instance.CoinCount[1];
        cc.log('start this.iUnit:',this.iUnit);
        this.ybCount = ComdCommandData._instance.YBCount;
        this.leavesCount = ComdCommandData._instance.LeavesCount;
        // this.init();
        this.checkUnitForMainPage();
    },


    /**
     * 初始化json数据表,米粒相关数据
     */
    init(object){
        this.comdObjects = object;
        // cc.log('GoldSystem Json初始化成功:'+this.comdObjects.chicken.length);
        this.scheduleOnce(()=>{
            this.offlineReward();   //初始化离线奖励
            this.initRank();        //初始化排行榜信息
        },.5);
        cc.log('初始化米粒等数据');

    },

    /***
     *初始化排行榜数据
     */
    initRank(){
        let level = ComdCommandData._instance.Comd_level;
        let id = level - 1;
        let title = this.comdObjects.chicken[id].name;
        let assets = this.getPlayerAllAsset();
        ComdCommandData._instance.sumbitPostMessageToRank({level:GlobalData.User.Comd_level,
                                                        score:assets[0],
                                                            unit:assets[1],title:title});
    },


    /***
     * 获取离线奖励
     */
    offlineReward(){
        // console.log('offlineReward');
        let offlineTime = GlobalData.User.OffLineTime;
        if (offlineTime > 180) {
            let maker = ComdCommandData._instance.MakeCoinCount[0]/5;
            offlineTime = Math.min(offlineTime,7200);
            let addNum = offlineTime*maker;
            let unit = ComdCommandData._instance.MakeCoinCount[1];
            cc.log('离线奖励:',addNum,unit);
            if(offlineTime >= 3600){
                let data = this.getSecretReward();
                let temCoin = data[0];
                let temUnit = data[1];
                let convData = this.unitConvert(temCoin,temUnit,unit);
                addNum = addNum+convData[0];
                cc.log('离线奖励大于1小时额外增加神秘奖励:',convData);
            }
            cc.log('总的离线奖励:',addNum,unit);

            // console.log('离线奖励:',addNum,unit);
            let values = this.checkUnitForExtraPlane(addNum,unit).value;
            let text = this.checkUnitForExtraPlane(addNum,unit).text;
            let values_double = this.checkUnitForExtraPlane(addNum*2,unit).value;
            let text_double = this.checkUnitForExtraPlane(addNum*2,unit).text;



            ComdUIManager._instance.showOfflinePlanes_Comd(true,text);

            //广播离线奖励事件，单倍，双倍
            cc.director.GlobalEvent.emit('updateOfflineReward_Comd',{eventName:'',reward:values,text:text});
            cc.director.GlobalEvent.emit('updateOfflineDoubleReward_Comd',{eventName:'',reward:values_double,text:text_double});
        }
    },

    /***
     * 获取神秘奖励
     */
    secretReward(){

        let data =  this.getSecretReward();
        let reward = data[0];
        let unit = data[1];

        let values = this.checkUnitForExtraPlane(reward,unit).value;
        let text = this.checkUnitForExtraPlane(reward,unit).text;
        ComdUIManager._instance.showSecretRewardPlanes_Comd(true,text);

        //广播神秘奖励事件
        // cc.director.GlobalEvent.emit('updateSecretReward',{eventName:'',secretReward:values});
        cc.director.GlobalEvent.emit('updateSecretReward_Comd',{eventName:'',secretReward:values,text:text});
    },

    getSecretReward() {
        let data = this.getCurrentCreateComdData(false);
        let coinCount = data[1];
        let unit = data[2];
        let reward = coinCount * 1.01;
        return [reward, unit];
    },

    /***
     * 获取红包雨对应的价值
     * @param type 1.米粒 2.爱心
     * @param size  1.大 2.中 3.小
     */
    getLittleItemValue(type,size){
        if(type==1){
            let data = this.getCurrentCreateComdData(false);
            let coinCount = data[1];
            let unit = data[2];
            let res;
            switch (size) {
                case 1:
                    res = coinCount*0.01;
                    break;
                case 2:
                    res = coinCount*0.02;
                    break;
                case 3:
                    res = coinCount*0.03;
                    break;
            }
            return [res,unit];
        }
        else if(type == 2){
            let res;
            switch (size) {
                case 1:
                    res = 1;
                    break;
                case 2:
                    res = 2;
                    break;
                case 3:
                    res = 3;
                    break;
            }
            return res;
        }
    },

    getRainResult(type,res){
        //米粒
        if(type == 1){
            let values = this.unitConvert(res[0],res[1],res[1]);

            let str = values[0].toString();
            let index = str.indexOf('.');
            if(index !== -1){
                str = str.substring(0,index + 3);
            }

            values[0] = parseFloat(str);

            return values;
        }
        //爱心
        if(type == 2){
            return res;
        }
    },

    rainReward(){
        let values = this.checkUnitForExtraPlane(addNum,unit).value;
        let text = this.checkUnitForExtraPlane(addNum,unit).text;
        let values_double = this.checkUnitForExtraPlane(addNum*2,unit).value;
        let text_double = this.checkUnitForExtraPlane(addNum*2,unit).text;

        //广播离线奖励事件，单倍，双倍
        cc.director.GlobalEvent.emit('updateOfflineReward_Comd',{eventName:'',reward:values,text:text});
        cc.director.GlobalEvent.emit('updateOfflineDoubleReward_Comd',{eventName:'',reward:values_double,text:text_double});
    },



    /***
     * 计算玩家总资产 - 总资产=场上所有士兵变卖价值+现有米粒值
     */
    getPlayerAllAsset(){
        let comd_arr = ComdCommandData._instance.Comds;
        let assets = 0;
        comd_arr.forEach((level)=>{
            if(level !==0){
                let id = level - 1;
                let factor = this.comdObjects.chicken[id].recoverFactor;
                let getCoin = this.comdObjects.chicken[id].getRice;
                let res = factor*getCoin;
                let unit = this.comdObjects.chicken[id].grUnit;
                let kv = this.unitConvert(res,unit,this.iUnit);
                assets+=kv[0];
                // cc.log('有士兵,等级:',level,' 出售价格:',kv,' 总资产:',assets);
            }
        });
        assets+=this.coinCount;
        // this.coinCount+=assets;
        return this.checkUnitForRank(assets,this.iUnit);
    },

    /***
     * 士兵产生米粒
     * @param level
     * @param coin
     * @param unit
     */
    makeCoinOperate(level,coin,unit){
        // cc.log('coin:'+coin + " unit:"+unit);
        // unit = (unit ==='') ? this.iUnit: unit;
        coin = parseFloat(coin);
        let val = this.unitConvert(coin,unit,this.iUnit);
        this.coinCount+= parseFloat(val[0]);
        this.checkUnitForMainPage();
        // console.log('等级:',level,'(产米)增加的米粒:'+ val[0] +' 单位:'+val[1] + ' 当前米粒:' + this.coinCount + ' 单位:'+ this.iUnit);
    },

    /***
     * @param coin
     * @param unit
     * @param obj 提示框及米粒奖励面板
     */
    coinOperate(coin,unit,obj=null){
        // cc.log('coin:'+coin + " unit:"+unit);
        // unit = (unit ==='') ? this.iUnit: unit;
        coin = parseFloat(coin);
        let val = this.unitConvert(coin,unit,this.iUnit);
        // cc.log('增加的米粒:'+ val[0] +' 单位:'+val[1]);
        console.log('当前米粒:' + this.coinCount + ' 单位:'+ this.iUnit,'  增加的米粒:'+ val[0] +' 单位:'+val[1]);
        this.coinCount+= parseFloat(val[0]);
        this.checkUnitForMainPage();
         console.log( '总米粒:' + this.coinCount + ' 单位:'+ this.iUnit);


        if(obj!=null){
            let tip = obj.tip;
            let str = obj.content;
            if(str ===''){
                str = (val[0].toString().length>=6) ? val[0].toString().substring(0,6):val[0].toString();
                let index = str.indexOf('.');
                if(index !== -1){
                    str = str.substring(0,index + 3);
                }
                ComdUIManager._instance.showAssetTip_Comd(tip + parseFloat(str) + val[1]);
            }
            else {
                ComdUIManager._instance.showAssetTip_Comd(tip + str);
            }
        }
    },

    /***
     * @param coin
     * @param unit
     * @param obj 提示框及米粒奖励面板
     */
    coinOperateForExtraPlane(coin,unit,obj=null){
        // cc.log('coin:'+coin + " unit:"+unit);
        // unit = (unit ==='') ? this.iUnit: unit;
        coin = parseFloat(coin);
        let val = this.unitConvert(coin,unit,this.iUnit);
        // cc.log('增加的米粒:'+ val[0] +' 单位:'+val[1]);
        console.log('当前米粒:' + this.coinCount + ' 单位:'+ this.iUnit,'  增加的米粒:'+ val[0] +' 单位:'+val[1]);
        this.coinCount+= parseFloat(val[0]);
        this.checkUnitForMainPage();
        console.log( '总米粒:' + this.coinCount + ' 单位:'+ this.iUnit);


        if(obj!=null){
            let tip = obj.tip;
            let str = obj.content;
            if(str ===''){
                str = (coin.toString().length>=6) ? coin.toString().substring(0,6):coin.toString();
                let index = str.indexOf('.');
                if(index !== -1){
                    str = str.substring(0,index + 3);
                }
                ComdUIManager._instance.showTip_Comd(tip + coin + unit);
            }
            else {
                ComdUIManager._instance.showTip_Comd(tip + str);
            }
        }
    },

    /***
     * 增加米粒操作，抽奖调用
     * @param coin
     * @param unit
     * @param obj
     */
    coinOperateForWheel(coin,unit,obj=null){
        // cc.log('coin:'+coin + " unit:"+unit);
        // unit = (unit ==='') ? this.iUnit: unit;
        coin = parseFloat(coin);
        let val = this.unitConvert(coin,unit,this.iUnit);
        // cc.log('增加的米粒:'+ val[0] +' 单位:'+val[1]);
        console.log('当前米粒:' + this.coinCount + ' 单位:'+ this.iUnit,'  增加的米粒:'+ val[0] +' 单位:'+val[1]);
        this.coinCount+= parseFloat(val[0]);
        let values = this.checkUnitForExtraPlane(coin,unit).value;
        console.log( '总米粒:' + this.coinCount + ' 单位:'+ this.iUnit);

        let tip = obj.tip;
        let str = obj.content;
        str = (values[0].toString().length>=6) ? values[0].toString().substring(0,6):values[0].toString();
        let index = str.indexOf('.');
        if(index !== -1){
            str = str.substring(0,index + 3);
        }
        ComdUIManager._instance.showAssetTip_Comd(tip + parseFloat(str) + values[1]);

        this.checkUnitForMainPage();
    },



    /***
     * 爱心数量变化
     * @constructor
     */
    YBOperate(val,obj=null){
        this.ybCount+=parseInt(val);
        ComdCommandData._instance.YBCount = this.ybCount;

        if(obj!=null){
            let tip = obj.tip;
            let str = obj.content;
            ComdUIManager._instance.showAssetTip_Comd(tip + str);
        }
    },


    /***
     * 叶子数量变化
     * @constructor
     */
    LeavesOperate(val,obj=null){
        this.leavesCount+=parseInt(val);
        ComdCommandData._instance.LeavesCount = this.leavesCount;

        if(obj!=null){
            let tip = obj.tip;
            let str = obj.content;
            ComdUIManager._instance.showAssetTip_Comd(tip + str);
        }
    },

    /***
     * 判断是否有足够的叶子数量
     * @returns {boolean}
     */
    getleavesResult(){
        return (ComdCommandData._instance.LeavesCount>=1)?true:false;
    },

    /***
     * 检测玩家米粒总数的单位转换
     * 总米粒文本
     * @param bPost
     */
    checkUnitForMainPage(bPost=true) {
        let inx = this.unit.indexOf(this.iUnit);
        // console.log(inx + "_当前单位 " + this.unit[inx]);
        let value;
        if (this.coinCount < 100 && this.iUnit !== '') {    //处理最小单位
            inx-=1;
            value = this.unitConvert(this.coinCount, this.iUnit, this.unit[inx]);
            this.coinCount = value[0];
            this.iUnit = value[1];  //更新单位
        } else if (this.coinCount >= 1000000) {
            inx+=1;
            value = this.unitConvert(this.coinCount, this.iUnit, this.unit[inx]);
            this.coinCount = value[0];
            this.iUnit = value[1];  //更新单位
        }
        else {
            value = this.unitConvert(this.coinCount,this.iUnit,this.iUnit);
        }

        let str = (value[0].toString().length>=6)?value[0].toString().substring(0,6):value[0].toString();
        let index = str.indexOf('.');
        if(index !== -1){
            str = str.substring(0,index + 3);
        }

        if(bPost)
        {
            ComdCommandData._instance.CoinCount = value;
            ComdUIManager._instance.updateCoinLabel_Comd(parseFloat(str)+value[1]);
        }
    },

    /***
     * 神秘奖励，离线奖励面板
     * @param rCount
     * @param destUnit
     * @returns {*}
     */
    checkUnitForExtraPlane(rCount,destUnit){
        let inx = this.unit.indexOf(destUnit);
        let value;
        if (rCount < 100 && destUnit !== '') {    //处理最小单位
            inx-=1;
            value = this.unitConvert(rCount, destUnit, this.unit[inx]);
        } else if (rCount >= 1000000) {
            while (rCount >= 1000000){
                inx+=1;
                value = this.unitConvert(rCount, destUnit, this.unit[inx]);
                rCount = value[0];
                destUnit = value[1];
            }
            value = [rCount,destUnit];
        }
        else {
            value = this.unitConvert(rCount, destUnit, destUnit);
        }
        // return value;
        let v1 = value[0].toString();
        let index = v1.indexOf('.');
        if(index !== -1){   //存在小数点
            v1 = v1.substring(0,index);
        }
        // v1 = (v1.length>=6)?v1.substring(0,6):v1;
        let v2 = value[1];
        return {value:value,text:v1+v2};
    },



    /***
     * 界面购买按钮，商店米粒购买按钮，每秒产量文本
     * @param rCount
     * @param destUnit
     * @returns {*}
     */
    checkUnitForOtherPage(rCount,destUnit){

        let inx = this.unit.indexOf(destUnit);
        let value;
        if (rCount < 1) {
            inx-=1;
            value = this.unitConvert(rCount, destUnit, this.unit[inx]);
        } else if (rCount > 1000) {
            inx+=1;
            value = this.unitConvert(rCount, destUnit, this.unit[inx]);
        }
        else {
            value = this.unitConvert(rCount, destUnit, destUnit);
        }
        // return value;
        let v1 = value[0].toString();
        v1 = (v1.length>=4)?v1.substring(0,4):v1;
        let index = v1.indexOf('.');
        if(index !== -1){
            v1 = v1.substring(0,index + 3);
        }
        let v2 = value[1];
        return {value:value,text:parseFloat(v1)+v2};
     },

    /***
     * 检测排行榜的单位转换
     * @param rCount
     * @param destUnit
     * @returns {*[]}
     */
    checkUnitForRank(rCount,destUnit){

        let inx = this.unit.indexOf(destUnit);
        let value;
        if (rCount < 10) {
            inx-=1;
            value = this.unitConvert(rCount, destUnit, this.unit[inx]);
        } else if (rCount >= 1000000) {
            while (rCount >= 1000000){
                inx+=1;
                value = this.unitConvert(rCount, destUnit, this.unit[inx]);
                rCount = value[0];
                destUnit = value[1];
            }
            value = [rCount,destUnit];
        }
        else {
            value = this.unitConvert(rCount, destUnit, destUnit);
        }
        let str = value[0].toString();
        let res = parseFloat(((str.length>=6)?str.substring(0,6):str));
        // cc.log('玩家总资产(转换前):',value);
        return [res,value[1]];
    },


    /***
     * 获取当前能够购买的策略士兵数据
     * @returns {*}
     */
    getBuyStrategyData(){
        let curLV = ComdCommandData._instance.Comd_Create_level;
        let items = [];
        let factor = [1,2,4,8];
        let fInx = -1;
        for (let n=curLV;n >= curLV - 3;n--) {
            if (n < 1)
                break;
            let comdId = n - 1;
            let data = this.getCurrentCreateComdDataByID(comdId);
            let convData = this.unitConvert(data[0],data[1],'k');
            fInx+=1;
            //0.id 1.转化后的值，用于比较 3&4.适用于ui界面的值
            let obj = {comdId:comdId,
                compareData:convData[0]*factor[fInx],
                coin:data[0],
                unit:data[1]};
            items.push(obj);
        }

        if(items.length > 1){
            items.sort((a,b)=>{
                return  a.compareData - b.compareData;
            });

        }
        return items[0];
    },

    /***
     * 购买策略，自动选择购买性价比最高的士兵
     */
    buyStrategy(){
        let curLV = ComdCommandData._instance.Comd_Create_level;
        let items = [];
        let factor = [1,2,4,8];
        let fInx = -1;
        for (let n=curLV;n >= curLV - 3;n--) {
            if (n < 1)
                break;
            let comdId = n - 1;
            let data = this.getCurrentCreateComdDataByID(comdId);
            let convData = this.unitConvert(data[0],data[1],'k');
            fInx+=1;
            //0.id 1.转化后的值，用于比较 3&4.适用于ui界面的值
            items.push({comdId:comdId,
                        compareData:convData[0]*factor[fInx],
                        coin:data[0],
                        unit:data[1]});
        }

        if(items.length > 1){
            items.sort((a,b)=>{
                return  a.compareData - b.compareData;
            });
        }

        let data = items[0];
        let conv = this.unitConvert(data.coin,data.unit,this.iUnit);

        if(conv[0] <= this.coinCount){  //可以购买
            this.coinCount-=conv[0];
            //  cc.log('士兵等级:'+data[0] + ' 制造次数:'+ ComdCommandData._instance.Level_Coin[id] +' 需要消耗米粒:'+conv[0]+' 单位:'+conv[1]);
            //   cc.log("购买成功,剩余米粒:"+this.coinCount + " 单位:"+this.iUnit);
            this.checkUnitForMainPage();
            return [true,data.comdId];
        }
        else {
            // cc.log('无法购买:士兵等级:'+data[0] + ' 制造次数:'+ ComdCommandData._instance.Level_Coin[id] +' 需要消耗米粒:'+conv[0]+' 单位:'+unit);
            return [false,data.comdId];
        }
    },


    /***
     * 根据id判断是否有足够的米粒购买指定的等级士兵
     */
    getBuyCoinResultByID(comd_id){
        let res = this.calculateCoinResult(comd_id)[0];
        let unit = this.calculateCoinResult(comd_id)[1];    //配置表的对应米粒单位
        //  console.log("购买所需原生价格:"+res + "单位:" +  unit);
        let conv = this.unitConvert(res,unit,this.iUnit);
        //  console.log("购买所需转化后价格:"+conv[0] + "单位:" +  conv[1]);
        if(conv[0] <= this.coinCount){  //可以购买
            this.coinCount-=conv[0];
            //  cc.log('士兵等级:'+data[0] + ' 制造次数:'+ ComdCommandData._instance.Level_Coin[id] +' 需要消耗米粒:'+conv[0]+' 单位:'+conv[1]);
            // cc.log("购买成功,剩余米粒:"+this.coinCount + " 单位:"+this.iUnit);
            this.checkUnitForMainPage();
            return true;
        }
        else {
            // cc.log('无法购买:士兵等级:'+data[0] + ' 制造次数:'+ ComdCommandData._instance.Level_Coin[comd_id] +' 需要消耗米粒:'+conv[0]+' 单位:'+unit);
            return false;
        }
    },

    /***
     * 根据id判断是否有足够的爱心购买指定的等级士兵
     */
    getBuyYBResultByID(comd_id){
        let res = this.calculateYBResult(comd_id);
        if(res <= this.ybCount){  //可以购买
            this.YBOperate(-res);
            ComdCommandData._instance.YBCount = this.ybCount;
            cc.log('需要爱心:'+res+ ' 购买成功');
            return true;
        }
        else {
            cc.log('需要爱心:'+res+ ' 购买失败');
            return false;
        }
    },


    /***
     * 计算购买一只士兵需要的米粒数量
     * @param id 等级士兵的id
     */
    calculateCoinResult(comd_id){
        let num = ComdCommandData._instance.Level_Coin[comd_id];   //次数
        let coinBasic = this.comdObjects.chicken[comd_id].riceBasic;
        let unit = this.comdObjects.chicken[comd_id].rbUnit;
        if(coinBasic === ''){
            return
        }

        if(comd_id===0){
            // cc.log('1级士兵单独计算价格');
            coinBasic = parseFloat(coinBasic);
            let res = 0;
            //我要养士兵日活百万
            if (num > 36){
                res = 0.85* coinBasic * Math.pow(Math.E,0.161*num);
            }
            else {
                res = coinBasic + (num-1)*20 + Math.floor(num/10)*50;
            }
            return [res,unit];
        }
        else {
            coinBasic = parseFloat(coinBasic);
            // coinBasic = Number(coinBasic);
            let res = 0.85* coinBasic * Math.pow(Math.E,0.161*num);
            return [res,unit];
        }
    },

    /***
     * 根据id计算购买一只士兵需要的爱心数量
     * @param comd_id
     */
    calculateYBResult(comd_id){
        let num = ComdCommandData._instance.Level_YB[comd_id];   //次数
     //   cc.log('id:'+comd_id +' 制造次数:'+num);
        let baseHeart = parseInt(this.comdObjects.chicken[comd_id].baseHeart) ;
        let increHeart = parseInt(this.comdObjects.chicken[comd_id].increHeart);
        if(baseHeart === '' || increHeart === ''){
            console.log('baseHeart or increHeart is null');
        }
        let res = baseHeart+(num-1)*increHeart;
        return res;
    },

    /***
     *  转化米粒单位
     * @param count
     * @param baseUnit
     * @param targetUnit 要转化的单位
     */
    unitConvert(count,baseUnit,targetUnit){

        // baseUnit = (baseUnit==='')?'':baseUnit.toLowerCase();
        // targetUnit = (targetUnit==='')?'':targetUnit.toLowerCase();
        // cc.log('baseUnit:'+baseUnit);
        // cc.log('targetUnit:'+targetUnit);

        let bInx = this.unit.indexOf(baseUnit);
        let tInx = this.unit.indexOf(targetUnit);

        if(tInx>bInx){  //转大单位,退位操作
            let dVal = tInx - bInx;
            let result;
            let _unit;
            for (let n=0;n<dVal;n++){
                result = (count/=1000);
                bInx+=1;
                _unit = this.unit[bInx];
            }
            // console.log('转大单位,退位操作 ' + result + _unit);
            if(_unit === '')
                result = parseInt(result);
            return [result,_unit];
        }
        else if(tInx < bInx){  //转小单位，进位操作
            let dVal = bInx - tInx;
            let result;
            let _unit;
            for (let n=0;n<dVal;n++){
                result = (count*=1000);
                bInx-=1;
                _unit = this.unit[bInx];
            }
            // console.log('转小单位，进位操作 ' + result + _unit);
            // console.log('转大单位,退位操作 ' + result + _unit);
            if(_unit === '')
                result = parseInt(result);
            return [result,_unit];
        }
        else {  //单位相同，不需要转化
            // console.log('单位相同，不需要转化 ' + count + baseUnit);
            if(count === '')
                count = parseInt(count);
            return [count,baseUnit];
        }
    },



    /***
     * 获取当前能制造的士兵的等级，需要的米粒数量，单位
     * 返回值 能制造的士兵的等级，需要的米粒数量，单位
     * @param  是否需要进行单位转化
     */
    getCurrentCreateComdData(isConv=false){
        let level =ComdCommandData._instance.Comd_Create_level;
        let comd_id = level - 1;                          //等级士兵的id为等级-1
        // cc.log('当前等级:'+level + ' num'+num);

        let coinCount = this.calculateCoinResult(comd_id)[0];
        let unit = this.calculateCoinResult(comd_id)[1];
        if(isConv){
            let values = this.checkUnitForOtherPage(coinCount,unit).value;
            return  [level,values[0],values[1]];
        }
        else {
            return [level,coinCount,unit];
        }
    },

    compareCoins(){
        let defaultComd = this.getCurrentCreateComdData(false);
        let dCoin = defaultComd[1];
        let dUnit = defaultComd[2];
        let values = this.unitConvert(dCoin,dUnit,this.iUnit);

        // cc.log('默认士兵数据:',values,' 当前总米粒:',this.coinCount+this.iUnit);
        if(this.coinCount > values[0]){
            // cc.log('总米粒数量 > 默认士兵所需米粒数量');
            return true;
        }
        else{
            // cc.log('总米粒数量 < 默认士兵所需米粒数量');
            return false
        }
    },

    /***
     * 根据id获取指定等级士兵的相关米粒数据
     * @param comd_id
     * @returns 需消耗米粒，单位
     */
    getCurrentCreateComdDataByID(comd_id){
        // cc.log('length:'+this.comdObjects.chicken.length);

        let coinCount = this.calculateCoinResult(comd_id)[0];
        let unit = this.calculateCoinResult(comd_id)[1];
        let values = this.checkUnitForOtherPage(coinCount,unit).value;
        return values;
    },

    /***
     * 计算出售士兵的值
     * @param getCoin
     * @param recoverFactor
     */
    RecoveryCoin(coin,unit,recoverFactor){
        let res = coin*recoverFactor;
        let text = this.checkUnitForOtherPage(res,unit).text;
        this.coinOperate(res,unit,{tip:'银+',content:text});
        console.log('出售士兵');
        cc.director.GlobalEvent.emit('updateChickenPosition',{eventName:''});//更新位置
    },

    /***
     *  更新士兵的总5秒产
     * @param coin
     * @param unit
     * @param bInit
     * @returns {*}
     */
    updateMakeCoinCount(coin,unit,bInit){
        //把传递进来的形参每秒产转化成统一单位
        let values = this.unitConvert(coin,unit,'');
        //把全局变量的每秒产转化成统一单位
        let maker = parseFloat(ComdCommandData._instance.MakeCoinCount[0]);
        let mUnit = ComdCommandData._instance.MakeCoinCount[1];
        let mValues = this.unitConvert(maker,mUnit,'');
        //计算
        let num = parseFloat(mValues[0]);
        if(bInit)
            num+=parseFloat(values[0]);
        else
            num-=parseFloat(values[0]);
        //检测单位转化
        let res = this.checkUnitForOtherPage(num,mValues[1]).value;
        if(res[1] === undefined)
            res[1] === '';
        //更新转化后的结果
        ComdCommandData._instance.MakeCoinCount = res;
        // cc.log('更新士兵的总5秒产-updateMakeCoinCount:',res);
        return res;
    },





    /***
     * 测试随机数
     * @param lowerValue
     * @param upperValue
     * @returns {*}
     */
    randomFrom(lowerValue,upperValue){
        // return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
        return Math.random() * (upperValue - lowerValue) + lowerValue;
    },


});
