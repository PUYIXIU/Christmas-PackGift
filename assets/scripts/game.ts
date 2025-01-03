// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import ChildMenu from './ChildMenu'
import MusicSound from './MusicSound';

const {ccclass, property} = cc._decorator;
import SettingMenu from './SettingMenu' 
@ccclass
export default class Game extends cc.Component {

    // 调试配置
    debug = {
        // 对话调试
        talkDebug:true
    }

    // 是否是开始界面
    @property
    isStartPage:Boolean = false

    // 重新开始菜单
    @property(cc.Node)
    restartMenu: cc.Node = null

    // 样式菜单
    @property(cc.Node)
    styleMenu: cc.Node = null

    // 设置菜单
    @property(cc.Node)
    settingMenu: cc.Node = null

    // 参数设置菜单
    @property(cc.Node)
    gameSettingMenu: cc.Node = null

    // 操作规则菜单
    @property(cc.Node)
    rulesMenu: cc.Node = null

    // 关于游戏菜单
    @property(cc.Node)
    aboutGameMenu: cc.Node = null

    // 确定返回开始界面菜单
    @property(cc.Node)
    ensureBackToStartMenu: cc.Node = null

    // 加载中
    @property(cc.Node)
    loadingPage: cc.Node = null
    
    // 显示孩子信息的菜单
    @property(cc.Node)
    childMenu: cc.Node = null

    // 孩子列表
    @property(cc.JsonAsset)
    childList: cc.JsonAsset = null

    // 全局字典
    @property(cc.JsonAsset)
    globalDict: cc.JsonAsset = null


    // 相机
    @property(cc.Node)
    camera: cc.Node = null

    // 玩家
    @property(cc.Node)
    player: cc.Node = null

    // 已完成孩子数量
    @property(cc.Node)
    doneChildLabel: cc.Node = null

    // 计时器label
    @property(cc.Node)
    timeLabel: cc.Node = null

    
    // 胜利特效
    @property(cc.Node)
    gameWinEffect: cc.Node = null

    timeCounter:number = 0

    canvas = null
    
    // 当前被激活的菜单
    activeMenu:cc.Node = null
    /**
     * 游戏是否暂停：
     * 1. 过场动画
     * 2. 修改礼物盒子样式
     * 3. 菜单栏
     */
    isPause: boolean = false

    // 游戏是否结束
    isGameOver: boolean = false
    onLoad(){
        this.canvas = cc.view.getCanvasSize()
        window.game = this
        if(!this.isStartPage){
            // 开启物理引擎
            cc.director.getPhysicsManager().enabled = true
            // 开启碰撞检测
            cc.director.getCollisionManager().enabled = true;
            cc.director.getCollisionManager().enabledDebugDraw = true
            cc.director.getCollisionManager().enabledDrawBoundingBox = true
            // 每个孩子都初始化为未完成状态
            this.childList.json.data.forEach(child=>{
                child.done = false
            })
        }else{
        }

    }
    start () {
        if(this.isStartPage && window.globalData.init){
            this.loadingPage.active = false
        }
    }
    // 游戏暂停
    Pause(){
        this.isPause = true
    }
    // 游戏继续
    Continue(){
        this.isPause = false
    }

    // 游戏开始，加载游戏场景
    gameStart(){
        if(!window.globalData.start) return
        window.globalData.playSound('btnClick')
        cc.director.loadScene('level1',()=>{
        // cc.director.loadScene('GameWin',()=>{
            console.log("游戏开始")
        })
    }

    // 返回到游戏开始界面
    returnToStartMenu(){
        window.globalData.playSound('btnClick')
        cc.director.loadScene('StartMenu',()=>{
            console.log("开始界面")
        })
    }


    // 打开新的菜单
    openMenu(newMenu:cc.Node, closeOther:Boolean=true, callback?){
        if(this.isPause && closeOther) return
        if(!window.globalData.init) return
        this.Pause()
        window.globalData.playSound('btnClick')
        if(this.activeMenu && closeOther){
            if(this.activeMenu.uuid == newMenu.uuid) return
            else {
                // 关闭当前活跃的菜单
                this.activeMenu.active = false
            }
        }
        this.activeMenu = newMenu
        this.activeMenu.active = true
        // 回调
        if(callback) callback()
    }

    // 关闭菜单
    closeMenu(target:cc.Node){
        window.globalData.playSound('btnClick')
        this.activeMenu = null
        target.active = false
        this.Continue()
    }

    // 开启样式菜单
    openStyleMenu(){
        this.openMenu(this.styleMenu)
    }

    // 关闭样式菜单
    closeStyleMenu(){
        this.closeMenu(this.styleMenu)
    }

    // 开启孩子信息菜单
    openChildMenu(){
        this.openMenu(this.childMenu)
        this.childMenu.getComponent(ChildMenu).loadChild()
    }

    // 关闭孩子信息菜单
    closeChildMenu(){
        this.closeMenu(this.childMenu)
    }

    // 开启重新开始游戏菜单
    openRestartMenu(){
        this.openMenu(this.restartMenu)
    }

    // 关闭重新开始游戏菜单
    closeRestartMenu(){
        this.closeMenu(this.restartMenu)
    }

    // 开启设置菜单
    openSettingMenu(){
        this.openMenu(this.settingMenu)
    }

    // 关闭设置菜单
    closeSettingMenu(){
        this.closeMenu(this.settingMenu)
    }

    /**** 设置菜单下的相关控制 *************************** */
    // 开启游戏设置
    openGameSetting(){
        // 初始化设置菜单数值
        // let comp = this.gameSettingMenu.children[0].getComponent(SettingMenu) as SettingMenu
        // comp.initMenuData()
        this.openMenu(this.gameSettingMenu, false, ()=>{
            // 透明度调到最低
            this.gameSettingMenu.opacity = 0
            new Promise((resolve, reject)=>{
                // 初始化
                setTimeout(()=>{
                    this.gameSettingMenu.getComponentInChildren(SettingMenu).initMenuData()
                    resolve(null)
                },200)
            }).then(res=>{
                this.gameSettingMenu.opacity = 255
            })
        })

        // 延迟2秒后
        // setTimeout(()=>{
        //     this.gameSettingMenu.getComponentInChildren(SettingMenu).initMenuData()
        // },200)
        
    }
    // 关闭游戏设置
    closeGameSetting(){
        this.closeMenu(this.gameSettingMenu)
    }

    // 查看操作控制菜单
    openOperationMenu(){
        this.openMenu(this.rulesMenu, false)
    }

    // 关闭操作控制菜单
    closeOperationMenu(){
        this.closeMenu(this.rulesMenu)
    }

    // 打开关于菜单
    openAboutGameMenu(){
        this.openMenu(this.aboutGameMenu)
    }

    // 关闭关于菜单
    closeAboutGameMenu(){
        this.closeMenu(this.aboutGameMenu)
    }

    // 加载上/下一页操作控制菜单
    loadOperationMenu(event, dir){
        let parent = event.target.parent
        let gparent = parent.parent
        let totalChildren = gparent.getChildren()
        let parentIndex = parent.getSiblingIndex()
        parent.active = false
        window.globalData.playSound('btnClick')
        if(dir == '-1'){
            // 上一页
            totalChildren[parentIndex - 1].active = true
        }else if(dir == '1'){
            totalChildren[parentIndex + 1].active = true
        }
    }

    // 打开确定返回开始界面菜单
    openSureStartMenu(){
        this.openMenu(this.ensureBackToStartMenu, false)

    }
    // 关闭确定返回开始界面菜单
    closeSureStartMenu(){
        this.closeMenu(this.ensureBackToStartMenu)

    }
    update(dt){
        if(this.isStartPage){
            return
        }
        if(!this.isPause && !this.isGameOver){
            this.setChildNumLabel()
            this.setTimeCounter(dt)
        }
    }

    // 已完成的孩子
    setChildNumLabel(){
        let childList = this.childList.json.data
        let total = childList.length
        // done标记已经完成的孩子
        let doneCount = childList.filter(item=>item.done).length
        this.doneChildLabel.getComponent(cc.Label).string = `${doneCount} / ${total}`

        // 所有孩子的礼物都分配完了
        if(total == doneCount){
            this.isGameOver = true
            this.gameOver()
        }
    }

    fadeStep = 0.1
    fadeSpeed = 200
    // 背景音乐消失
    backFadeOut(){
        let audio = this.node.getComponent(cc.AudioSource)
        
        audio.volume -= this.fadeStep
        if(audio.volume >0){
            setTimeout(()=>{
                this.backFadeOut()
            },this.fadeSpeed)
        }
    }

    // 游戏结束
    gameOver(){
        let musicController = this.node.getComponent(MusicSound)
        musicController.isControl = false
        let globalController = window.globalData.node.getComponent(MusicSound)
        musicController.isControl = false

        this.backFadeOut()
        window.globalData.playFadeInSound('gamingMusic',this.fadeStep,this.fadeSpeed)
        setTimeout(()=>{

            cc.director.loadScene('GameWin',(error)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log("GameOver界面")
                }
            })
            },7500)
        // 显示胜利特效
        this.gameWinEffect.active = true


    }

    // 倒计时时间
    setTimeCounter(dt){
        this.timeCounter += dt;
        let value = Math.round(this.timeCounter)
        let hour = Math.floor(value / (60*60)).toString().padStart(2,"0")
        let minit = Math.floor((value % (60*60))/60).toString().padStart(2,"0")
        let second = (value % 60).toString().padStart(2,"0")
        let string = `${hour}:${minit}:${second}`
        this.timeLabel.getComponent(cc.Label).string = string
    }

    // 重新开始游戏
    restartGame(){
        window.globalData.playSound('btnClick')
        cc.director.loadScene('level1',()=>{
            // console.log('加载成功')
        })
    }
}
