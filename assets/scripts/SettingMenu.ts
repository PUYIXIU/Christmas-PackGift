// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

// 设置界面
@ccclass
export default class SettingMenu extends cc.Component {

    editSetting = {
        // 语言
        lang:0,
        // 音量强度
        musicStrong:0,
        // 音效强度
        effectStrong:0,
        // 文字速度
        textSpeed:0
    }

    // 音乐强度勾选器
    musicToggle:cc.Node = null
    //音乐强度滑动器
    musicSlider:cc.Node = null
    // 音效强度勾选器
    effectToggle:cc.Node = null
    //音效强度滑动器
    effectSlider:cc.Node = null
    // 文本速度滑动器
    textSlider: cc.Node = null
    // 语言选择器
    langSelector: cc.Node = null

    btnBackAssets = {
        active: null,
        normal: null
    }

    onLoad(){
        cc.resources.load([
            'imgs/UI/btns/btn-normal',
            'imgs/UI/btns/btn-active',
        ],cc.SpriteFrame,(error:Error, assets:cc.SpriteFrame[])=>{
            if(error){
                console.log(error)
                return
            }
            this.btnBackAssets.normal = assets[0]
            this.btnBackAssets.active = assets[1]
            
            this.changeLangText()
        })
    }

    start () {
        this.musicToggle = cc.find('rowOne/bgmSlider/MusicToggle', this.node)
        this.musicSlider = cc.find('rowOne/bgmCheck/MusicSlider', this.node)
        this.effectToggle = cc.find('rowTwo/effectSlider/FormToggle', this.node)
        this.effectSlider = cc.find('rowTwo/EffectSlider/bgmSlider', this.node)
        this.textSlider = cc.find('EffectSlider/textSpeedSlider', this.node)
        this.langSelector = cc.find('LangSelector/textInput', this.node)
    }

    // 初始化菜单
    initMenuData(){
        this.editSetting.lang = window.globalData.lang
        this.editSetting.musicStrong = window.globalData.musicStrong
        this.editSetting.effectStrong = window.globalData.effectStrong
        this.editSetting.textSpeed = window.globalData.textSpeed

        this.changeToggle(this.musicToggle, this.editSetting.musicStrong > 0)   
        this.changeToggle(this.effectToggle, this.editSetting.effectStrong > 0)   

        this.changeSlider(this.musicSlider, this.editSetting.musicStrong)
        this.changeSlider(this.effectSlider, this.editSetting.effectStrong)
        this.changeSlider(this.textSlider, this.editSetting.textSpeed)

        // 修改按钮状态
        this.changeLangText()
    }

    // 切换选框
    changeToggle(target, value){
        let toggleComp = target.getComponent(cc.Toggle)
        toggleComp.isChecked = value
    }

    // 切换滑动框
    changeSlider(target, value){
        let sliderComp = target.getComponent(cc.Slider)
        sliderComp.progress = value
    }

    // 切换音乐勾选框
    toggleMusic(event, type:string){

        
        let toggleComp 
        let sliderComp 
        let target = ''
        switch(type){
            case "0": 
                // 音乐强度
                toggleComp = this.musicToggle.getComponent(cc.Toggle)
                sliderComp = this.musicSlider.getComponent(cc.Slider)
                target = 'musicStrong'
                break;
            case "1": 
                 // 音效强度
                toggleComp = this.effectToggle.getComponent(cc.Toggle)
                sliderComp = this.effectSlider.getComponent(cc.Slider)
                target = 'effectStrong'
                break;
        }
        if(toggleComp.isChecked){
            // 静音
            sliderComp.progress = 0.5
        }else{
            // 0.5音量
            sliderComp.progress = 0.
        }
        this.editSetting[target] = sliderComp.progress
    }

    // 修改滑动组件值
    changeSliderComp(event, type){ 
        let toggleComp 
        let sliderComp 
        let target = ''
        type = Number(type)
        switch(type){
            case 0: 
                // 音乐强度拖动组件
                toggleComp = this.musicToggle.getComponent(cc.Toggle)
                sliderComp = this.musicSlider.getComponent(cc.Slider)
                target = 'musicStrong'
                break;
                
            case 1: 
                // 音效强度拖动组件
                toggleComp = this.effectToggle.getComponent(cc.Toggle)
                sliderComp = this.effectSlider.getComponent(cc.Slider)
                target = 'effectStrong'
                break;
            
            case 2: 
                // 文本速度拖动组件
                sliderComp = this.textSlider.getComponent(cc.Slider)
                target = 'textSpeed'
                break;
        }
        this.editSetting[target] = sliderComp.progress
        // 音效
        if(type <= 1 ){
            toggleComp.isChecked = sliderComp.progress > 0
        }
    }

    // 选择下拉框
    toggleOptions(event){
        let options = this.langSelector.getChildByName('options')
        options.active = !options.active

    }

    // 修改语言
    handleChangeLang(event, type){
        type = Number(type)
        if(this.editSetting.lang == type) return
        this.editSetting.lang = type
        this.changeLangText()
        this.toggleOptions(null)
    }

    // 修改文本框的文字内容
    changeLangText(){
        if(!this.langSelector) return
        let label = this.langSelector.getChildByName('langLabel').getComponent(cc.Label)
        let optionBtnsNode = cc.find('LangSelector/textInput/options/view/content', this.node)
        let options = optionBtnsNode.children
        options.forEach((option, index)=>{
            let sprite = option.getComponentInChildren(cc.Sprite)
            if(index == this.editSetting.lang){
                // 激活状态
                sprite.spriteFrame = this.btnBackAssets.active
            }else{
                // 取消激活状态
                sprite.spriteFrame = this.btnBackAssets.normal
            }
        })
        switch(this.editSetting.lang){
            case 0: 
            // 中文
                if(window.globalData.lang == 0){
                    label.string = '中文'
                }else{
                    label.string = 'Chinese'
                }
                break;
            case 1:
                // 英文
                label.string = 'English'
                break
        }
    }

    // 确定修改菜单
    submitChange(){
        window.globalData.changeMenuSetting(this.editSetting)
    }
}
