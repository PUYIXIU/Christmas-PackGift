// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Gift extends cc.Component {

    // 用于判断包装时的礼物盒大小
    //  0=小 1=长 2=大
    @property
    size:number = 0

    // 对话脚本
    @property(cc.JsonAsset)
    script:cc.JsonAsset = null
    start () {
    }

}
