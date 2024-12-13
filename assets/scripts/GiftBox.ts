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
    
    start () {

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
        })
    }

    // 开始碰撞
    onBeginContact(contact, self, other){
        // 检测是否是雪橇车的礼物检测碰撞盒
        if(other.tag == 3 && other.node.name == 'SnowCar'){
            // debugger
            // 对礼物组合进行判定
            let data = window.game.childList.json.data
            for(let i = 0; i< data.length; i++){
                let child = data[i]
                // 已经包装完毕
                if(child.isDone) break;

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
                    continue;
                }
            }
            console.log(window.game.childList.json.data)
        }
    }

}
