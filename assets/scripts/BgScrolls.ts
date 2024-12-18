// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class BgScrolls extends cc.Component {

    moveSize:number = 0
    moveSpeed:number = 25
    start () {
        this.moveSize = - cc.view.getCanvasSize().width
    }

    update (dt) {
        let nextX = this.node.x - this.moveSpeed * dt
        if(nextX < this.moveSize){
            this.node.x = nextX % this.moveSize
        }else{
            this.node.x = nextX
        }
    }   
}
