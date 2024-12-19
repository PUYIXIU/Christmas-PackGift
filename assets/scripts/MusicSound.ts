// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

// 音响控制
@ccclass
export default class MusicSound extends cc.Component {

    // 是否是一组音效
    @property
    isGroup:boolean = false

    // 背景音乐
    @property
    isBgm:boolean = true

    // 音效
    @property
    isSoundEffect = false

    
    start () {
    }

    // 控制音响大小
    constrolVolumn(node?: cc.Node){
        let audioComp = node.getComponent(cc.AudioSource)
        if(this.isBgm){
            audioComp.volume = window.globalData.musicStrong
        }
        if(this.isSoundEffect){
            audioComp.volume = window.globalData.effectStrong
        }
    }

    update(){
        if(this.isGroup){
            this.node.children.forEach(node=>{
                this.constrolVolumn(node)
            })
        }else{
            this.constrolVolumn(this.node)
        }
    }
    // update (dt) {}
}
