// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOver extends cc.Component {

    // 结束脚本
    @property(cc.JsonAsset)
    overScript:cc.JsonAsset = null
    curScript = null

    talkBanner = {
        top: null,
        bottom: null
    }

    bottomLabel = {
        left: null,
        right: null
    }
    // 谈话人名称
    @property(cc.Node)
    talkerNameLabel:cc.Node = null
    tNameLabelCp:cc.Label = null

    // 谈话内容
    @property(cc.Node)
    talkContentLabel:cc.Node = null
    tCLabelCp:cc.Label = null
    
    curTalkIndex:number = 0

    
    // 打字速度
    typingSpeed:number = 100
    // 打字位置记录
    typingLocation:number = 0
    // 目标打字内容
    targetContent:string = ''

    onLoad(){
        this.talkBanner.top = cc.find('Canvas/UI/TalkBanner/talkBannerTop')
        this.talkBanner.bottom = cc.find('Canvas/UI/TalkBanner/talkBannerBottom')

        this.bottomLabel.left =  cc.find('Canvas/UI/BottomLabel/BackBtn')
        this.bottomLabel.right =  cc.find('Canvas/UI/BottomLabel/TheEnd')
    }

    start () {
        this.tNameLabelCp = this.talkerNameLabel.getComponent(cc.Label)
        this.tCLabelCp = this.talkContentLabel.getComponent(cc.Label)
        this.curScript = this.overScript.json
        
        this.startTalk()
    }
    startTalk(){
        // 开始谈话
        this.toggleBanner(true).then(res=>{
            setTimeout(()=>{
                this.startLoadTalk()
            },1000)
        })
    }
    toggleBanner(isTalk){
        return new Promise((resolve,reject)=>{
            if(isTalk){
                let dur = 1
                // 进入谈话
                let topBannerAction = cc.moveBy(dur, 0, -this.talkBanner.top.height)
                let bottomBannerAction = cc.moveBy(dur, 0 , this.talkBanner.bottom.height)
    
    
                this.talkBanner.top.runAction(topBannerAction)
                this.talkBanner.bottom.runAction(bottomBannerAction)
            }else{
                //退出谈话
                let dur = 0.5
                // 进入谈话
                let topBannerAction = cc.moveBy(dur, 0, this.talkBanner.top.height)
                let bottomBannerAction = cc.moveBy(dur, 0 , -this.talkBanner.bottom.height)
                let leftAction = cc.spawn(
                    cc.moveBy(dur,300,0),
                    cc.fadeTo(dur,255)
                )
                let rightAction = cc.spawn(
                    cc.moveBy(dur,-300,0),
                    cc.fadeTo(dur,255)
                )
                this.talkBanner.top.runAction(topBannerAction)
                this.talkBanner.bottom.runAction(bottomBannerAction)
                this.bottomLabel.left.runAction(leftAction)
                this.bottomLabel.right.runAction(rightAction)
            }
            resolve('切换成功！')
        })
    }
    // 停止说话，谈话结束
    stopTalk(){
        this.toggleBanner(false).then(res=>{
            this.curTalkIndex = 0
            this.tNameLabelCp.string = ''
            this.tCLabelCp.string = ''
            this.targetContent = ''
        })
    }
    update (dt) {
        this.typingSpeed = 150 - window.globalData.textSpeed * 100
    }
    typingTimer = null
    // 模拟打字
    simTyping(){   
        window.globalData.playSound(this.talkerSound) 
        this.tCLabelCp.string += this.targetContent[this.typingLocation]
        this.typingLocation ++
        if(this.typingLocation < this.targetContent.length){
            this.typingTimer = setTimeout(()=>{
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
        // if(this.tCLabelCp.string.length !== this.targetContent.length) return
        // 字还没有打完，按E直接显示全部对话
        if(this.tCLabelCp.string.length !== this.targetContent.length) {
            this.typingLocation = this.targetContent.length
            this.tCLabelCp.string = this.targetContent
            clearTimeout(this.typingTimer)
            return
        }
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
    // 加载对话
    startLoadTalk(){
        
        this.loadNextWord(null)
        cc.systemEvent.on(
            cc.SystemEvent.EventType.KEY_UP,
            this.loadNextWord.bind(this)
        )
        
    }

    // 回到开始画面
    BackToStart(){
        cc.director.loadScene('StartMenu',(error)=>{
            if(error){
                console.log('error')
            }else{
                console.log("跳转开始界面")
            }
        })
    }
}
