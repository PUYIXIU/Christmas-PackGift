// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Gift from './Gift'

const {ccclass, property} = cc._decorator;

const SizeType = ['小','长','大']
const ColorType = ['红','蓝','绿']
const RibbonColorType = ['白','黄','粉']
const PatternType = [
    '纯色',
    '横纹',
    '竖纹',
    '棋盘格'
]


// 礼物盒子
@ccclass
export default class GiftBox extends cc.Component {

    // 是否是通过合成产生的
    isMerge:Boolean = true
    // 礼物
    gift:cc.Node = null

    @property
    size:number = 0
    /**
     * 颜色尺寸
     * 0=红色 1=蓝色 2=绿色
     */
    color = 0

    /**
     * 丝带颜色
     * 0=白色 1=黄色 2-粉色
     */
    ribbonColor = 0

    /**
     * 花纹
     * 0=纯色
     * 1=横纹
     * 2=竖纹
     * 3=棋盘格
     */
    pattern = 0

    // 匹配成功
    done = false

    start () {
        this.playMergeEffect()
    }

    setPattern(pattern){
        this.pattern = pattern
    }
    setRibbonColor(color){
        this.ribbonColor = color
    }
    setColor(color){
        this.color = color
    }
    // 设置礼物
    setGift(gift){
        this.gift = gift
        this.playSound()
    }

    // 重新加载贴图
    resetSprite(){
        /**
         * 贴图命名模版
         * 盒子尺寸-盒子颜色-丝带颜色-盒子纹理
         * 大-蓝-白-纯色
         */
        let name = [
            SizeType[this.size],
            ColorType[this.color],
            RibbonColorType[this.ribbonColor],
            PatternType[this.pattern]
        ].join('-')
        cc.resources.load(`imgs/boxes/${name}`,cc.SpriteFrame, (error:Error, assets:cc.SpriteFrame)=>{
            if(error){
                console.log(error)
                return
            }
            this.node.getComponent(cc.Sprite).spriteFrame = assets
            this.isMerge && this.playChange()
        })
    }

    // 开始碰撞
    onBeginContact(contact, self, other){
        if(!this.isMerge) return
        if(this.done) return
        // 检测是否是雪橇车的礼物检测碰撞盒
        if(other.tag == 3 && other.node.name == 'SnowCar'){
            let success = false
            // debugger
            // 对礼物组合进行判定
            let data = window.game.childList.json.data
            for(let i = 0; i< data.length; i++){
                let child = data[i]
                // 已经包装完毕
                if(child.isDone) {
                    continue
                };

                let giftList = window.game.globalDict.json.gift
                let wish = giftList.find(item=>item.value == child.gift)
                // 礼物不一致
                if(wish.name !== this.gift.name) continue;
                if(
                    child.papper == this.color &&
                    child.ribbon == this.ribbonColor &&
                    child.pattern == this.pattern 
                ){
                    // 判定礼物分配结束
                    child.done = true
                    success = true
                    this.node.group = "default"
                    break;
                }
            }
            // console.log(window.game.childList.json.data)
            if(success){
                this.done = true
                this.playMergeEffect()
                this.playSound()
                let collider = this.node.getComponent(cc.PhysicsPolygonCollider)
                collider.density = 1000
                collider.friction = 1000

            }else{
                // 施加一个向外的力
                const rb = this.node.getComponent(cc.RigidBody)
                let v = rb.linearVelocity
                v.x = -300 
                v.y = 300
                rb.linearVelocity = v
                this.playBadEffect()
                window.globalData.playSound('wrongBox')
            }
        }
    }
    playChange(){
        debugger
        window.globalData.playSound('change')
        let effect = this.node.getChildByName('Change').getComponent(cc.ParticleSystem)
        effect.resetSystem()
    }
    playSound(){
        window.globalData.playSound('merge')
    }
    playMergeEffect(){
        let effect = this.node.getChildByName('Merge').getComponent(cc.ParticleSystem)
        effect.resetSystem()
    }
    playBadEffect(){
        let effect = this.node.getChildByName('Bad').getComponent(cc.ParticleSystem)
        effect.resetSystem()
    }
    playSuccessEffect(){
        let effect = this.node.getChildByName('Success').getComponent(cc.ParticleSystem)
        effect.resetSystem()
    }

}
