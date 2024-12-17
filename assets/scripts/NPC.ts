// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { toggleTipLabel } from "./common";

const {ccclass, property} = cc._decorator;

// 精灵小孩脚本
@ccclass
export default class NPC extends cc.Component {
    // 方向 1=右面 -1=左面
    dir:number = -1
    
    // 提示字样
    @property(cc.Node)
    tipLabel: cc.Node = null
    // 背景
    @property(cc.Node)
    bgNode: cc.Node = null
    start () {
    }
    update(){
        // NPC朝向要跟随玩家
        this.setDir()
    }
    setDir(){
        let player = window.game.player
        if(player.x > this.node.x){
            this.dir = 1
        }else{
            this.dir = -1
        }
        this.bgNode.scaleX = 1 * this.dir
    }
    // 开始碰撞
    onBeginContact(contact, self, other){
        toggleTipLabel(true, other, this.tipLabel)
    }
    // 碰撞结束
    onEndContact(contact, self, other){
        toggleTipLabel(false, other, this.tipLabel)
    }
}