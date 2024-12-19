// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class GlobalData extends cc.Component {

    // 游戏是否已经启动
    init:Boolean = false

    // 语言选择
    // 0=中文 1=英文
    lang:number = 0

    // 音乐音量
    musicStrong:number = 0.5

    // 音效音量
    effectStrong:number = 1

    // 文本速度
    textSpeed: number = 0.5

    // 音效控制器
    @property(cc.Node)
    SoundController:cc.Node = null

    onLoad(){
        window.globalData = this
        this.init = true
        this.preload()
        cc.game.addPersistRootNode(this.node)
        if(this.SoundController){
            cc.game.addPersistRootNode(this.SoundController)
        }
    }

    start () {
    }

    // 修改菜单设置
    changeMenuSetting(newSetting){
        this.musicStrong = newSetting.musicStrong
        this.effectStrong = newSetting.effectStrong
        this.textSpeed = newSetting.textSpeed
        this.lang = newSetting.lang
    }

    // 预加载数据
    preload(){
        cc.director.preloadScene('level1',(doneCount, totalCount,item)=>{
            console.log(`加载中：${Math.round(doneCount / totalCount * 100)} %`)
        },(error)=>{
            if(error){
                console.log(error)
                return
            }
            console.log("加载完成")
        })

        cc.director.preloadScene('GameWin',(doneCount, totalCount, item)=>{
            console.log(`正在加载游戏结束界面：${Math.round(doneCount / totalCount * 100)} %`)
        },(error)=>{
            if(error){
                console.log(error)
                return
            }else{
                console.log('游戏结束界面加载成功')
            }
        })
    }

    playSound(name:string){
        let sound = this.SoundController.getChildByName(name)
        let audio = sound.getComponent(cc.AudioSource)
        audio.play()
    }
}
