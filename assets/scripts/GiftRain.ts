// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GiftBox from "./GiftBox";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    bigBoxPre:cc.Prefab = null
    @property(cc.Prefab)
    longBoxPre:cc.Prefab = null
    @property(cc.Prefab)
    smallBoxPre:cc.Prefab = null

    @property(cc.Node)
    camera:cc.Node = null

    interTime = 50

    canavsHeight = 0
    canvasWidth = 0

    boxList = []
    interval = null
    onLoad(){
        cc.director.getPhysicsManager().enabled = true
        this.canavsHeight = cc.view.getCanvasSize().height
        this.canvasWidth = cc.view.getCanvasSize().width
    }


    start () {
        const giftPre = [
            this.bigBoxPre,
            this.longBoxPre,
            this.smallBoxPre,
        ]
        this.interval = setInterval(()=>{
            
            let index = this.getRandom(giftPre.length)
            let pre = giftPre[index]
            let newBox = cc.instantiate(pre) 
            let giftBox = newBox.getComponent(GiftBox)
            giftBox.isMerge = false
            giftBox.setColor(this.getRandom(3))
            giftBox.setRibbonColor(this.getRandom(3))
            giftBox.setPattern(this.getRandom(4))
            giftBox.resetSprite()


            newBox.y = this.canavsHeight  + this.camera.y - 100
            // newBox.x = (this.canvasWidth) * (0.5 - Math.random()) + this.camera.x
            newBox.x = (this.canvasWidth) * (0.8 - Math.random()) + this.camera.x
            newBox.scale = 0.3 + 0.3 * Math.random()
            newBox.angle =  360 * Math.random()

            this.boxList.push(newBox)
            newBox.setParent(this.node)
            
        },this.interTime)
    }

    getRandom(len){
        return Math.floor(Math.random() *len)
    }
    
    update (dt) {
        this.boxList = this.boxList.filter(box=>{
            if(box.y < -this.canavsHeight - 30){
                box.active = false
                this.node.removeChild(box)
                return false
            }
            return true
        })
    }

    protected onDestroy(): void {
        clearInterval(this.interval)
        this.interval = null
    }
}
