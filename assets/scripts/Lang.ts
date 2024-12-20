// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class lang extends cc.Component {

    // 中文精灵图
    @property(cc.SpriteFrame)
    ch_sprite:cc.SpriteFrame = null

    @property
    ch_width:number = 0

    @property
    en_width:number = 0

    // 英文精灵图
    @property(cc.SpriteFrame)
    en_sprite:cc.SpriteFrame = null

    // 中文文本
    @property
    ch_label:string = ''

    // 中文文本字体大小
    @property
    ch_font_size:number = 0

    // 英文文本
    @property
    en_label:string = ''

    // 英文文本字体大小
    @property
    en_font_size:number = 0

    // 中文组件
    @property(cc.Node)
    ch_node:cc.Node = null

    // 英文组件
    @property(cc.Node)
    en_node:cc.Node = null
    // 语言
    lang:number = 0

    onLoad(){
    }

    start () {
        this.lang = window.globalData.lang
        this.reloadLang()
    }

    // 重新加载语言
    reloadLang(){
        if(this.ch_sprite && this.en_sprite){
            // 贴图
            this.node.getComponent(cc.Sprite).spriteFrame = [this.ch_sprite, this.en_sprite][this.lang]
            if(this.ch_width > 0 && this.en_width > 0){
                this.node.width = [this.ch_width, this.en_width][this.lang]
            }
        }else if(this.ch_label && this.en_label){
            let label = this.node.getComponent(cc.Label)
            // 文字
            label.string = [this.ch_label, this.en_label][this.lang]
            label.fontSize = [this.ch_font_size, this.en_font_size][this.lang]
        }else if(this.ch_node && this.en_node){
            this.ch_node.active = this.lang == 0
            this.en_node.active = this.lang == 1
        }
    }

    update (dt) {
        // 检测到语言切换
        if(this.lang !== window.globalData.lang){
            this.lang = window.globalData.lang
            this.reloadLang()
        }
    }
}
