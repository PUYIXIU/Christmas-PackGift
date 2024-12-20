// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import MusicSound from "./MusicSound";

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
    textSpeed: number = 0.75

    // 音效控制器
    @property(cc.Node)
    SoundController:cc.Node = null

    // 进度条
    @property(cc.Node)
    loader:cc.Node =null

    // 加载页面
    @property(cc.Node)
    loadingPage:cc.Node = null

    onLoad(){
        window.globalData = this
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
            // console.log(`加载中：${Math.round(doneCount / totalCount * 100)} %`)
            if(this.loader){
                let progressBar = this.loader.getComponent(cc.ProgressBar)
                progressBar.progress = doneCount / totalCount
            }
        },(error)=>{
            if(error){  
                console.log(error)
                return
            }
            if(!this.loader) return
            let dur = 0.3
            let action = cc.spawn(
                cc.moveBy(dur, 0, this.loadingPage.height).easing(cc.easeInOut(1)),
                cc.fadeTo(dur, 0),
            )
            cc.callFunc(()=>{
                this.loadingPage.active = false
            },this.loadingPage)
            this.loadingPage.runAction(action)
            console.log("加载完成")
            this.init = true
        })

        cc.director.preloadScene('GameWin',(doneCount, totalCount, item)=>{
            // console.log(`正在加载游戏结束界面：${Math.round(doneCount / totalCount * 100)} %`)
        },(error)=>{
            if(error){
                console.log(error)
                return
            }else{
                // console.log('游戏结束界面加载成功')
            }
        })
    }

    playSound(name:string){
        let sound = this.SoundController.getChildByName(name)
        let audio = sound.getComponent(cc.AudioSource)
        audio.play()
    }
    // 音频渐入
    playFadeInSound(name:string, step, speed){
        let sound = this.SoundController.getChildByName(name)
        let audio = sound.getComponent(cc.AudioSource)
        audio.volume = 0
        audio.play()
        return this.fadeIn(audio, step, speed)
    }
    fadeIn(audio, step, speed){
        return new Promise((resolve,reject)=>{

            audio.volumn += step
            if(audio.volumn >=this.effectStrong){
                let musicController = this.node.getComponent(MusicSound)
                musicController.isControl = true
                resolve(null)
            }else{
                setTimeout(()=>{
                    this.fadeIn(audio,step,speed)
                }, speed)
            }

        })
    }
}
