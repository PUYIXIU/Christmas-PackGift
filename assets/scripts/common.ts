/**
 * 切换标签的显隐
 * @param show 是否是显示
 * @param target 被碰撞的节点
 * @param tipLabel 标签节点
 */
export const toggleTipLabel = (show:boolean,  target:cc.Collider, tipLabel:cc.Node) => {
    /**
     * 淡出动画一定要比淡入动画花的时间长，
     * 在碰撞抖动的时候，
     * 淡出不会覆盖淡入
     */
    
    let dur = show? 0.7 : 0.5
    let opacity = show? 255 : 0
    let scale = show? 1 : 0
    if(target.node.group == 'Player' && target.tag == 3){
        let action = cc.spawn(
            cc.scaleTo(dur, scale).easing(cc.easeInOut(1.0)),
            cc.fadeTo(dur, opacity).easing(cc.easeInOut(1.0))
        )
        tipLabel.runAction(action)
    }
}