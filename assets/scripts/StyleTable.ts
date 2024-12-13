// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { toggleTipLabel } from "./common";
const {ccclass, property} = cc._decorator;

// 样式工作台
@ccclass
export default class StyleTable extends cc.Component {

    // 提示字样
    @property(cc.Node)
    tipLabel: cc.Node = null

    start () {

    }

    // update (dt) {}
    // 开始碰撞
    onBeginContact(contact, self, other){
        toggleTipLabel(true, other, this.tipLabel)
    }
    // 碰撞结束
    onEndContact(contact, self, other){
        toggleTipLabel(false, other, this.tipLabel)
    }
}
