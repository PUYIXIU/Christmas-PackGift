// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

// 显示孩子信息的菜单
@ccclass
export default class ChildMenu extends cc.Component {

    // 当前显示的孩子索引
    curIndex = 0

    // 孩子列表
    childList:cc.JsonAsset = null

    // 全局字典
    globalDict:cc.JsonAsset = null

    // 纸张
    papper:cc.Node = null
    // 礼花
    ribbon:cc.Node = null
    // 花纹
    pattern:cc.Node = null
    // 状态框
    doneFrame:cc.Node = null
    // 文字框
    descFrame:cc.Node = null
    // 页数
    pageLabel:cc.Node = null

    prePageBtn:cc.Node = null
    nextPageBtn:cc.Node = null

    doneFrameUrl = {
        done:undefined,
        notDone:undefined
    }
    onLoad(){
        this.childList = window.game.childList
        this.globalDict = window.game.globalDict

        this.papper = this.node.getChildByName('papper')
        this.ribbon = this.node.getChildByName('ribbon')
        this.pattern = this.node.getChildByName('pattern')
        this.doneFrame = this.node.getChildByName('DoneFrame')
        this.descFrame = this.node.getChildByName('ChildDesc')
        this.pageLabel = this.node.getChildByName('PageLabel')

        this.prePageBtn = this.node.getChildByName('LeftBtn')
        this.nextPageBtn = this.node.getChildByName('RightBtn')
        


        cc.resources.load([
            'imgs/UI/childMenu/btns/DoneFrame',
            'imgs/UI/childMenu/btns/notDoneFrame',
        ],cc.SpriteFrame,(error:Error,assets:cc.SpriteFrame[])=>{
            if(error){
                console.error(error)
                return
            }
            this.doneFrameUrl.done = assets[0]
            this.doneFrameUrl.notDone = assets[1]
            this.loadChild()
        })
    }

    start () {
    }

    // 加载孩子
    loadChild(){
        let child = this.childList.json.data[this.curIndex]
        this.setPageInfo()

        let papper = this.globalDict.json.papper.find(item=>item.value == child.papper)
        let ribbon = this.globalDict.json.ribbon.find(item=>item.value == child.ribbon)
        let pattern = this.globalDict.json.pattern.find(item=>item.value == child.pattern)

        

        // 修改描述
        this.descFrame.getComponent(cc.Label).string = child.description[window.game.lang]
        
        cc.resources.load([
            papper.url, ribbon.url, pattern.url, child.avator
        ],cc.SpriteFrame,(error:Error,assets:cc.SpriteFrame[])=>{
            if(error){
                console.error(error)
                return
            }
            this.papper.getComponent(cc.Sprite).spriteFrame = assets[0]
            this.ribbon.getComponent(cc.Sprite).spriteFrame = assets[1]
            this.pattern.getComponent(cc.Sprite).spriteFrame = assets[2]
            
            let avator = this.doneFrame.getChildByName('avator')
            avator.getComponent(cc.Sprite).spriteFrame = assets[3]
        })

        // 加载状态框
        if(child.done){
            this.doneFrame.getComponent(cc.Sprite).spriteFrame = this.doneFrameUrl.done
        }else{
            this.doneFrame.getComponent(cc.Sprite).spriteFrame = this.doneFrameUrl.notDone
        }

    }
    // update (dt) {}

    // 重置页面信息
    setPageInfo(){
        this.pageLabel.getComponent(cc.Label).string = `${this.curIndex+1} / ${this.childList.json.data.length}`
    }

    // 前一页
    prePage(event){
        this.curIndex--
        if(this.curIndex <= 0){
            this.prePageBtn.getComponent(cc.Button).interactable = false
        }
        // 右侧留出翻页的空间了
        if(this.curIndex < this.childList.json.data.length - 1){
            this.nextPageBtn.getComponent(cc.Button).interactable = true
        }
        this.loadChild()
    }

    // 后一页
    nextPage(event){
        this.curIndex ++ 
        if(this.curIndex >= this.childList.json.data.length - 1){
            this.nextPageBtn.getComponent(cc.Button).interactable = false
        }
        // 前面流出了翻页的空间
        if(this.curIndex > 0){
            this.prePageBtn.getComponent(cc.Button).interactable = true
        }
        this.loadChild()
    }
}
