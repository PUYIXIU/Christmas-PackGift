// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Spin extends cc.Component {

    rb:cc.RigidBody = null
    radius = 60
    minRadius = 30
    rotateSpeed = 1

    isSucking = false
    suckEnd = false
    suckSpeed = 1
    // 开始旋转
    startRotate = false

    onLoad(){
        // 开启物理引擎
        cc.director.getPhysicsManager().enabled = true
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
    }

    start () {
        this.rb = this.node.getComponent(cc.RigidBody)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,(event:cc.Event.EventKeyboard)=>{
            if(event.keyCode == cc.macro.KEY.space && !this.isSucking){
                this.isSucking = true
            }
        })
    }

    //
    suckIn(){
        this.radius -= this.suckSpeed
        if(this.radius <= this.minRadius){
            this.suckEnd = true
            console.log("吸引结束")
        }
    }

    rotate(){
        this.node.children.forEach((box,index)=>{
            // 计算弧度
            let radial = Math.atan(box.y / box.x)
            // 弧度转角度
            let angle = radial * 180 / Math.PI
            if(box.x < 0){
                angle += 180
            }
            if(angle<0) angle = 360 + angle
            angle += this.rotateSpeed
            // 角度转弧度
            let newRadial = angle * Math.PI / 180


            // 控制被扯入的效果
            let distance = Math.sqrt(
                box.x**2 + box.y **2
            )
            
            distance-=this.suckSpeed
            let r = distance > this.radius? distance : this.radius
            box.y = r * Math.sin(newRadial)
            box.x = r * Math.cos(newRadial)
        })
    }
    update (dt) {
        // 正在吸入并且没有结束
        if(this.isSucking && !this.suckEnd){
            this.suckIn()
        }
        if(this.startRotate){
            this.rotate()
        }
    }

    // 开始检测到碰撞
    onBeginContact(contact, self, other){

        if(!this.startRotate) this.startRotate = true
        let action = cc.spawn(
            cc.rotateBy(2, 720),
            cc.scaleTo(2, 0.7)
        )
        other.node.runAction(action)
    }
}
