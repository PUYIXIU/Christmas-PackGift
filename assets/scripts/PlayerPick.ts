// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
import {playerCollistionTags} from './utils'
import PlayerMove from './PlayerMove';
const {ccclass, property} = cc._decorator;

const pickableList = [
    'Gift', // 礼物
    'Papper', // 纸张
    'Ribbon', // 
    'GiftBox', // 礼物盒
]
// 用户捡拾
@ccclass
export default class PlayerPick extends cc.Component {

    // 物品收集的CD
    pickingCD = 0

    // 是否可以捡起
    pickable:boolean = false

    // 被捡起来的物品
    pickItemList:cc.Node[] = []

    // 当前正在抓着的物品
    pickingItem:cc.Node = null

    // 圣诞老人背景（修改样式）
    @property(cc.Node)
    bgNode:cc.Node = null
    
    // 手部（捡取物品时显示）
    @property(cc.Node)
    hand:cc.Node = null

    assets = {
        normalBg : null,  //正常的背景
        pickBg : null, // 捡取物品的背景
    }
    start () {
        cc.resources.load('imgs/chara/santabear', cc.SpriteFrame, (err:Error, assets:cc.SpriteFrame)=>{
            this.assets.normalBg = assets
        })
        cc.resources.load('imgs/chara/santa-side', cc.SpriteFrame, (err:Error, assets:cc.SpriteFrame)=>{
            this.assets.pickBg = assets
        })
    }
    update(){
        if(this.pickingItem){
            this.lift()
        }
        if(this.pickingCD > 0){
            this.pickingCD --
        }
    }
    // 切换圣诞老人的动作贴图
    toggleSprite(type){
        switch(type){
            case 'pick':
                this.bgNode.getComponent(cc.Sprite).spriteFrame = this.assets.pickBg
                this.hand.active = true
                break;
            case 'normal':
                this.bgNode.getComponent(cc.Sprite).spriteFrame = this.assets.normalBg
                this.hand.active = false
                break;
        }
    }
    // 丢出物品
    throwOut(){
        this.toggleSprite('normal')

        // 检查当前玩家的朝向，向指定朝向丢出物品
        const pm = this.node.getComponent(PlayerMove)
        const dir = pm.dir
        
        // 此处顺序不能颠倒，否则受力失败
        const pickRb = this.pickingItem.getComponent(cc.RigidBody)
        pickRb.enabled = true
        this.pickingItem.getComponent(cc.PhysicsPolygonCollider).enabled = true

        let v = pickRb.linearVelocity
        pickRb.gravityScale = 1
        v.x = 300* dir
        v.y = 300
        pickRb.linearVelocity = v
        
        this.pickingItem = null
    }
    // 捡起物品
    pickup(){
        if(this.pickingCD>0) return
        this.pickingCD = 20
        // 如果手中有物品，丢出去
        if(this.pickingItem) {
            window.globalData.playSound('pick')
            this.throwOut()
            return
        }
        if(this.pickItemList.length > 0){
            window.globalData.playSound('pick')
            this.pickingItem = this.pickItemList.shift()
            this.toggleSprite('pick')
        }
    }

    // 举起物品
    lift(){
        let pickRb = this.pickingItem.getComponent(cc.RigidBody)

        // 将线性速度、角速度控制为0
        // 即便是把刚体撤离之后，物体依旧会按照原本的角速度运动
        pickRb.linearVelocity.x = 0
        pickRb.linearVelocity.y = 0
        pickRb.angularVelocity = 0
        pickRb.gravityScale = 0
        pickRb.enabled = false
        this.pickingItem.getComponent(cc.PhysicsPolygonCollider).enabled = false
        
        this.pickingItem.x = this.node.x
        this.pickingItem.y = this.node.y + this.pickingItem.height
    }
    // 碰撞盒检测
    onBeginContact(contact, self, other){
        // 判断是否是可交互物品，是否是交互探测碰撞盒检测到的碰撞
        if(pickableList.includes(other.node.group) && self.tag == playerCollistionTags.pick){
            
            // 检测是否已经存在这个物品
            if(this.pickItemList.findIndex(item=>item.uuid == other.node.uuid) < 0){
                // 推入该物品
                this.pickItemList.push(other.node)
            }
        }
    }
    onEndContact(contact, self, other){
        if(pickableList.includes(other.node.group) && self.tag == playerCollistionTags.pick){
            this.pickItemList = this.pickItemList.filter(item=>other.node.uuid !== item.uuid)
        }
    }
}
