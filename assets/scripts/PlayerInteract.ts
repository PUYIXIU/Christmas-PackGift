// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GiftBox from "./GiftBox";
import PlayerPick from "./PlayerPick";
import Gift from "./Gift";
const {ccclass, property} = cc._decorator;
import NPC from './NPC'
import PlayerMove from "./PlayerMove";
// 初始化的礼物盒样式
const initGiftStyle = {
    color: 0,
    ribbonColor: 0,
    pattern:0 ,
}



// 玩家交互
@ccclass
export default class PlayerInteract extends cc.Component {

    talkBanner:{top:cc.Node,bottom:cc.Node} = {
        top:null,
        bottom:null
    }

    menuNavs:{left:cc.Node, right:cc.Node} = {
        left: null,
        right:null
    }

    // 当前节点的捡拾脚本
    pickComp = null

    // 当前需要修改的礼物盒
    giftBox:GiftBox = null

    // 当前有效的交互函数
    interActive = null

    // 正在编辑中的样式
    editStyle = {...initGiftStyle}

    // 没有进入对话之前的相机机位
    preCameraPosition:cc.Vec2 = null

    // 当前的对话脚本
    curScript = null 
    initScript = null // 开场动画脚本
    randomTalkScript = [] // 随机对话脚本


    // 谈话人名称
    @property(cc.Node)
    talkerNameLabel:cc.Node = null
    tNameLabelCp:cc.Label = null

    // 谈话内容
    @property(cc.Node)
    talkContentLabel:cc.Node = null
    tCLabelCp:cc.Label = null

    // 谈话的目标，用于面对面说话用
    @property(cc.Node)
    TalkerNPC:cc.Node = null
    
    curTalkIndex:number = 0

    onLoad(){
        //////////////////////////////////////加载脚本
        // 当前的对话脚本
        // this.curScript = StartTalkScript
        cc.resources.load('json/StartTalk',cc.JsonAsset,(error:Error, assets:cc.JsonAsset)=>{
            if(error){
                console.log(error)
                return
            }
            this.initScript = assets.json
        })

        cc.resources.load([
            'json/RandomTalk_1'
        ],cc.JsonAsset,(error:Error, assets: cc.JsonAsset[])=>{
            if(error){
                console.log(error)
                return
            }
            this.randomTalkScript = assets.map(item=>item.json)
        })
    }
    start () {
        this.talkBanner = {
            top:cc.find('Canvas/UI/talkBannerTop'),
            bottom:cc.find('Canvas/UI/talkBannerBottom'),
        }
        this.menuNavs = {
            left: cc.find('Canvas/UI/NavBtns/LeftBtns'),
            right:cc.find('Canvas/UI/NavBtns/RightBtns')
        }
        this.pickComp = this.node.getComponent(PlayerPick)
        this.tNameLabelCp = this.talkerNameLabel.getComponent(cc.Label)
        this.tCLabelCp = this.talkContentLabel.getComponent(cc.Label)
        window.game.camera.x = this.node.x

        if(window.game.debug.talkDebug){
            this.talk()
        }
    }

    // 显示谈话的UI
    ToggleTalkUI(isShow){
        let dur = 1
        let menuDur = 0.5
        let camera = window.game.camera
        if(isShow){
            return new Promise((resolve, reject)=>{
                // 显示UI
                this.preCameraPosition = camera.position
                // 相机向下移动
                let cameraAction = cc.sequence(
                    cc.moveTo(dur, camera.x, camera.y - this.talkBanner.bottom.height),
                    cc.callFunc(()=>resolve(null),this)
                )
                camera.runAction(cameraAction) 

                // 上部电影条下移
                this.talkBanner.top.active = true
                let talkBannerTopAction = cc.moveBy(dur, 0,  - this.talkBanner.top.height )
                this.talkBanner.top.runAction(talkBannerTopAction)
                
                // 下部电影条上移
                this.talkBanner.bottom.active = true
                let talkBannerBottomAction = cc.moveBy(dur, 0,  this.talkBanner.bottom.height )
                this.talkBanner.bottom.runAction(talkBannerBottomAction)

                // 左侧UI向左移动
                let leftMenuAction = cc.spawn(
                    // cc.moveBy(menuDur, -this.menuNavs.left.width, 0),
                    cc.moveBy(menuDur, -this.menuNavs.left.width, 0),
                    cc.fadeTo(menuDur, 0),
                )
                this.menuNavs.left.runAction(leftMenuAction)

                // 右侧UI向右移动
                let rightMenuAction = cc.spawn(
                    cc.moveBy(menuDur, this.menuNavs.right.width, 0),
                    cc.fadeTo(menuDur, 0),
                )
                this.menuNavs.right.runAction(rightMenuAction)

                // 圣诞需要和小精灵面对面
                let npc = this.TalkerNPC.getComponent(NPC)
                let move = this.node.getComponent(PlayerMove)
                if(npc.dir == move.dir){
                    // 两人同向
                    move.setFaceDir(-npc.dir)
                }

            })
        }else{
            // 隐藏UI
            return new Promise((resolve,reject)=>{
                let cameraAction = cc.sequence(
                    cc.moveTo(dur, this.preCameraPosition.x, this.preCameraPosition.y),
                    cc.callFunc(()=>{
                        resolve(null)
                    },this)
                )
                camera.runAction(cameraAction)
                
                // 上下电影条移出消失
                
                let talkBannerTopAction = cc.sequence(
                    cc.moveBy(dur, 0, this.talkBanner.top.height ),
                    cc.callFunc(()=>{
                        this.talkBanner.top.active = false
                    },this)
                )
                this.talkBanner.top.runAction(talkBannerTopAction)
    
                
                let talkBannerBottomAction = cc.sequence(
                    cc.moveBy(dur, 0, -this.talkBanner.bottom.height ),
                    cc.callFunc(()=>{
                        this.talkBanner.bottom.active = false
                    },this)
                )
                this.talkBanner.bottom.runAction(talkBannerBottomAction)

                
                // 左侧UI出现
                let leftMenuAction = cc.spawn(
                    cc.moveBy(menuDur, this.menuNavs.left.width, 0),
                    cc.fadeTo(menuDur, 255),
                )
                this.menuNavs.left.runAction(leftMenuAction)

                // 右侧UI出现
                let rightMenuAction = cc.spawn(
                    cc.moveBy(menuDur, -this.menuNavs.right.width, 0),
                    cc.fadeTo(menuDur, 255),
                )
                this.menuNavs.right.runAction(rightMenuAction)
            })

        }
    }


    // 和NPC说话
    talk(){
        // 游戏暂停
        window.game.Pause()

        this.ToggleTalkUI(true).then(res=>{
            this.startLoadTalk()
        })

        
    }

    // 停止说话，谈话结束
    stopTalk(){


        this.ToggleTalkUI(false).then(res=>{
            window.game.Continue()
            this.curTalkIndex = 0
            this.tNameLabelCp.string = ''
            this.tCLabelCp.string = ''
            this.targetContent = ''
        })
    }

    // 初始化样式菜单，将手中的礼盒的样式放到菜单上
    initStyleMenu(){
        this.editStyle.color = this.giftBox.color
        this.editStyle.ribbonColor = this.giftBox.ribbonColor
        this.editStyle.pattern = this.giftBox.pattern
    }

    // 打开样式菜单
    openStyleMenu(){
        
        if(!this.pickComp.pickingItem) {
            window.globalData.playSound('wrongBox')
            return
        }
        // 当前手上抓着的礼物盒
        let pickingItem = this.pickComp.pickingItem
        if(pickingItem.group !== 'GiftBox') return
        this.giftBox = pickingItem.getComponent(GiftBox)
        this.initStyleMenu()
        window.game.styleMenu.active = true
        window.game.openStyleMenu()
    }

    // 关闭样式菜单
    closeStyleMenu(){
        this.editStyle = {...initGiftStyle}
        window.game.closeStyleMenu()
    }

    // 提交样式菜单
    submitStleMenu(){
        if(this.editStyle.color !== this.giftBox.color){
            this.giftBox.setColor(this.editStyle.color)
        }
        if(this.editStyle.ribbonColor !== this.giftBox.ribbonColor){
            this.giftBox.setRibbonColor(this.editStyle.ribbonColor)
        }
        if(this.editStyle.pattern !== this.giftBox.pattern){
            this.giftBox.setPattern(this.editStyle.pattern)
        }
        // 重写礼物盒的样式
        this.giftBox.resetSprite()
        // 关闭样式菜单
        this.closeStyleMenu()
    }
    // 修改编辑菜单中的选项
    setBoxStyle(event, type){
        window.globalData.playSound('btnClick')
        let [key, value] = type.split('-')
        value = Number(value)
        this.editStyle[key] = value
    }
    
    // 重置样式菜单
    setStyleMenuBtns(){
        // 纸张按钮
        let papperBtns = cc.find('Canvas/UI/StyleMenu/PapperBtns')?.children
        // 礼花按钮
        let ribbonBtns = cc.find('Canvas/UI/StyleMenu/RibbonBtns')?.children
        // 纹理按钮
        let patternBtns = cc.find('Canvas/UI/StyleMenu/PatternBtns')?.children
        let btnsList = [
            papperBtns, ribbonBtns, patternBtns
        ]
        let curValues = [this.editStyle.color, this.editStyle.ribbonColor, this.editStyle.pattern]
        for(let i = 0 ; i < btnsList.length ; i++){
               let groups = btnsList[i]
               let groupValue = curValues[i]
               // 遍历按钮内部
               for(let j = 0; j< groups.length;j++){
                    if(groupValue == j){
                        // 激活状态
                        groups[j].getComponent(cc.Button).interactable = false
                    }else{
                        // 未激活状态
                        groups[j].getComponent(cc.Button).interactable = true
                    }
               }
        }
    }

    update (dt) {
        if(window.game.styleMenu.active){
            this.setStyleMenuBtns()
        }
        this.typingSpeed = 150 - window.globalData.textSpeed * 100
    }
    // 检测碰撞
    onBeginContact(contact, self, other){
        /**
         * 碰撞盒3负责检测，检测Group为NPC的节点
         */
        if(self.tag != 3 || other.node.group !== "NPC") return
        switch(other.node.name){
            case 'StyleTable':
                // 样式工作台
                this.interActive = this.openStyleMenu
                break;
            case 'SpriteBoy':
                // 精灵
                this.interActive = this.talk
                break;
            default:
                break;
        }
    }
    onEndContact(contact, self, other){
        if(self.tag != 3 || other.node.group !== "NPC") return
        this.interActive = null
    }
    // 打字速度
    typingSpeed:number = 100
    // 打字位置记录
    typingLocation:number = 0
    // 目标打字内容
    targetContent:string = ''

    // 模拟打字
    simTyping(){    
        window.globalData.playSound(this.talkerSound)
        this.tCLabelCp.string += this.targetContent[this.typingLocation]
        this.typingLocation ++
        if(this.typingLocation < this.targetContent.length){
            setTimeout(()=>{
                this.simTyping()
            },this.typingSpeed)
        }
    }

    // 当前说话人的声音
    talkerSound = ''
    // 加载下一句话
    loadNextWord(event:cc.Event.EventKeyboard){
        const talkEnd = ()=>{
            /**
             * 判断对话已结束就修改curScript为空，
             * 因为需要使用curScript作为对话结束判断，
             * 防止因为按空格/X键过快出现淡出抖动的问题
             */
            this.curScript = null
            cc.systemEvent.off(
                cc.SystemEvent.EventType.KEY_UP,
                this.loadNextWord
            )
            this.stopTalk()
        }
        if(!this.curScript) return // 为了解决键盘无法解绑的问题，简单粗暴的解决方式

        // 输入的是空格，跳过对话
        if(event && event.keyCode == cc.macro.KEY.space){
            talkEnd()
            return 
        }

        if(event && event.keyCode !== cc.macro.KEY.e) return
        // 打字还没有打完
        if(this.tCLabelCp.string.length !== this.targetContent.length) return
        this.typingLocation = 0
        this.targetContent = ''

        if(this.curTalkIndex >= this.curScript.data.length) {
            this.curScript = null
            // 对话已经结束，事件无法真正解绑，此处有问题
            talkEnd()
            return
        }
        let wordData = this.curScript.data[this.curTalkIndex]
        let talker = this.curScript.chara.find(item=>item.id == wordData.talker)
        this.tNameLabelCp.string = talker.name[window.globalData.lang]
        this.talkerNameLabel.color = new cc.Color(...talker.color)
        this.talkerSound = talker.sound

        // 此处插入一个打字特效
        this.targetContent = wordData.content[window.globalData.lang]
        this.tCLabelCp.string = ''
        this.simTyping()

        this.curTalkIndex ++
    }
    
    // 是否经历过开场对话
    hasInitTalked:boolean = false

    // 是否是游戏结束对话
    isGameEndTalk:boolean = false
    // 加载对话
    startLoadTalk(){

        if(!this.hasInitTalked){
            // 如果没有经过开场对话，加载开场对话脚本
            this.curScript = this.initScript
            this.hasInitTalked = true
        }else if(this.isGameEndTalk){
            console.log("游戏结束对话")
        }else{

            // 正在捡起的物品
            let pickingItem = this.pickComp.pickingItem
            let group = pickingItem?.group
            // 如果是手上拿着礼物或者是礼物盒，加载礼物对应的脚本
            if(group == 'Gift'){ // 是礼物，直接加载脚本
                this.curScript = pickingItem.getComponent(Gift).script.json
            }else if(group == 'GiftBox'){
                let gift = pickingItem.getComponent(GiftBox).gift
                this.curScript = gift.getComponent(Gift).script.json
            }else{
                // 如果是其它情况，则加载随机对话
                this.curScript = this.randomTalkScript[0]
            }
        }
        
        this.loadNextWord(null)
        cc.systemEvent.on(
            cc.SystemEvent.EventType.KEY_UP,
            this.loadNextWord.bind(this)
        )
        
    }
}
