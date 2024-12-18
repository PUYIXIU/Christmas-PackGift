// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import ChildMenu from './ChildMenu'

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    // 调试配置
    debug = {
        // 对话调试
        talkDebug:false
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

    // 确定返回开始界面菜单
    @property(cc.Node)
    ensureBackToStartMenu: cc.Node = null

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

    timeCounter:number = 0

    // 语言选择
    // 0=中文 1=英文
    lang = 0

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
        }

    }
    start () {}
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
        cc.director.loadScene('level1',()=>{
            console.log("游戏开始")
        })
    }

    // 返回到游戏开始界面
    returnToStartMenu(){
        cc.director.loadScene('StartMenu',()=>{
            console.log("开始界面")
        })
    }


    // 打开新的菜单
    openMenu(newMenu:cc.Node, closeOther:Boolean=false){
        this.Pause()
        if(this.activeMenu && closeOther){
            if(this.activeMenu.uuid == newMenu.uuid) return
            else {
                // 关闭当前活跃的菜单
                this.activeMenu.active = false
            }
        }
        this.activeMenu = newMenu
        this.activeMenu.active = true

    }

    // 关闭菜单
    closeMenu(target:cc.Node){
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
        window.globalData.initGameSettingMenu()
        this.openMenu(this.gameSettingMenu, false)
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

    // 加载上/下一页操作控制菜单
    loadOperationMenu(event, dir){
        let parent = event.target.parent
        let gparent = parent.parent
        let totalChildren = gparent.getChildren()
        let parentIndex = parent.getSiblingIndex()
        parent.active = false
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

    // 游戏结束
    gameOver(){
        cc.director.loadScene('GameWin',(error)=>{
            if(error){
                console.log(error)
            }else{
                console.log("GameOver界面")
            }
        })
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
        cc.director.loadScene('level1',()=>{
            // console.log('加载成功')
        })
    }
}
