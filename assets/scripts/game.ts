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
        talkDebug:true
    }

    // 样式菜单
    @property(cc.Node)
    styleMenu: cc.Node = null

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

    onLoad(){
        this.canvas = cc.view.getCanvasSize()
        window.game = this
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

    start () {
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true
        cc.director.getCollisionManager().enabledDrawBoundingBox = true
    }
    Pause(){
        this.isPause = true
    }

    Continue(){
        this.isPause = false
        

    }

    // 游戏开始
    gameStart(){
        
    }

    // 打开新的菜单
    openMenu(newMenu:cc.Node){
        this.Pause()
        if(this.activeMenu){
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

    update(dt){
        if(!this.isPause){
            this.setChildNumLabel()
            this.setTimeCounter(dt)
        }
    }

    setChildNumLabel(){
        let childList = this.childList.json.data
        let total = childList.length
        let doneCount = childList.filter(item=>item.done).length

        this.doneChildLabel.getComponent(cc.Label).string = `${doneCount} / ${total}`
    }

    setTimeCounter(dt){
        this.timeCounter += dt;
        let value = Math.round(this.timeCounter)
        let hour = Math.floor(value / (60*60)).toString().padStart(2,"0")
        let minit = Math.floor((value % (60*60))/60).toString().padStart(2,"0")
        let second = (value % 60).toString().padStart(2,"0")
        let string = `${hour}:${minit}:${second}`
        this.timeLabel.getComponent(cc.Label).string = string
    }

    }
}
