// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Gift from "./Gift";
import GiftBox from "./GiftBox";
// 包装原料组
const materialGroupList = [
  "Gift", // 礼物
  "Papper", // 纸张
  "Ribbon", // 丝带
];

// 初始化材料
const initMaterial = {
  // 礼物
  gift: undefined,
  // 纸张
  papper: undefined,
  // 丝带
  ribbon: undefined,
  // 材料集齐总数
  count: 0,
};

// 初始化状态中旋转的半径
const initSpinRadius = 60
// 初始化状态旋转的速度
const initSpinSpeed = 1

// 工作台
@ccclass
export default class WorkTable extends cc.Component {
  @property(cc.Node)
  giftBoxGroup:cc.Node = null

  // 存放材料
  // mat = JSON.parse(JSON.stringify(initMaterial));
  mat = {...initMaterial};
  // 存放当前包围圈里可以被使用的材料
  contactMats = [];
  // 旋转半径
  spinRadius = 100;
  // 旋转速度
  spinSpeed = 1;

  // 合并状态：集齐3个材料，材料们开始向内被吸入，旋转速度加速
  isMerge = false;
  // 合并阶段的旋转速度
  mergingSpinSpeed = 2;
  // 合并/被吸入的速度
  mergeSpeed = 0.5;
  // 最小的旋转半径（小于这个值判断为合成结束）
  minRadius = 5;

  // 围绕旋转的中心点
  center = {
    x:0,
    y:0,
  }

  giftBoxPrefab = []

  start() {
    this.center.x = this.node.x
    this.center.y = this.node.y + this.node.getChildByName('MergePoint').y
    cc.resources.load([
      'prelab/SmallGiftBox',
      'prelab/LongGiftBox',
      'prelab/BigGiftBox',
    ],cc.Prefab,(error:Error, assets:cc.Prefab[])=>{
      this.giftBoxPrefab = assets
    })
  }

  // 对号入座
  preload() {
    let cm = [...this.contactMats]
    for (let material of cm) {
      let load = false
      switch (material.group) {
        case "Gift":
          if (!this.mat.gift) {
            this.mat.gift = material;
            load = true
          }
          break;
        case "Papper":
            if(!this.mat.papper){
                this.mat.papper = material;
                load = true
            }
          break;
        case "Ribbon":
            if(!this.mat.ribbon){
                this.mat.ribbon = material
                load = true
            }
          break;
      }
      if(load){
        this.mat.count++
        // 从预备列表中提出
        this.contactMats = this.contactMats.filter(item=>item.uuid != material.uuid)
        // 
        let matRb = material.getComponent(cc.RigidBody)
        matRb.gravityScale = 0
        let v = matRb.linearVelocity
        v.x = 0
        v.y = 0
        matRb.linearVelocity = v
        let matCol = material.getComponent(cc.PhysicsPolygonCollider)
        matCol.enabled = false
        matRb.enabled = false

      }
      if(this.mat.count>=3){
        break;
      }
    }
  }
  // 旋转
  spin(){
    let spinItems = Object.values(this.mat).filter(item=>{
        return item && item instanceof cc.Node
    })
    spinItems.forEach(item=>{
        // 计算相对位置
        let diffX = item.x - this.center.x
        let diffY = item.y - this.center.y
        let distance = Math.sqrt(diffX ** 2 + diffY ** 2)
        // 计算弧度
        let radian = Math.atan(diffY / diffX)
        // 弧度转角度
        let angle = radian * 180 / Math.PI
        if(diffX < 0) angle+=180
        if(angle < 0) angle += 360
        angle += this.spinSpeed
        radian = angle * Math.PI / 180

        distance -= this.mergeSpeed
        let r = distance > this.spinRadius? distance: this.spinRadius
        item.x = this.center.x + r * Math.cos(radian)  
        item.y = this.center.y + r * Math.sin(radian)  
    })
  }
  // 开始合并
  merge(){
    // 收缩
    this.spinRadius -= this.mergeSpeed
    // 缩到最小数值
    if(this.spinRadius < this.minRadius){
        this.mergeEnd()
    }

  }

  // 生成礼物
  generateGift(gift){
    // 根据礼物的尺寸获取礼物盒
    const giftPrefab = this.giftBoxPrefab[gift.getComponent(Gift).size]
    const newGiftBox = cc.instantiate(giftPrefab)
    let giftBoxCom = newGiftBox.getComponent(GiftBox)
    giftBoxCom.setGift(gift)
    newGiftBox.x = this.center.x
    newGiftBox.y = this.center.y
    newGiftBox.setParent(this.giftBoxGroup)
  }
  // 合并结束
  mergeEnd(){
    // 此处应该生成一个新的礼物
    this.generateGift(this.mat.gift)
    this.mat.gift.active = false
    this.mat.papper.active = false
    this.mat.ribbon.active = false
    // this.mat = JSON.parse(JSON.stringify(initMaterial))
    this.mat = {...initMaterial}
    this.spinRadius = initSpinRadius
    this.spinSpeed = initSpinSpeed
    this.isMerge = false
  }
  update() {
    this.spinSpeed = initSpinSpeed
    if (this.mat.count < 3) {
      this.preload(); // 预装
    }else{
      this.spinSpeed = this.mergingSpinSpeed
      this.merge() // 合并
    }
    if(this.mat.count>0){
        this.spin() // 旋转
    }
  }

  // 碰撞监听
  onBeginContact(contact, self, other) {
    // 不是合成包围盒监听到的碰撞
    // 不是原材料的，返回
    if (self.tag != 1 || !materialGroupList.includes(other.node.group)) return;
    // contactMat中已经存在的，返回
    if (this.contactMats.find((item) => item.uuid == other.node.uuid)) return;
    // 装载的材料中已经存在的，返回
    if (Object.values(this.mat).find((item) => item?.uuid == other.node.uuid))
      return;

    this.contactMats.push(other.node);
  }

  onEndContact(contact, self, other) {
    // 已经装载的材料，不用再判断了
    if (Object.values(this.mat).find((item) => item?.uuid == other.node.uuid))
        return;
    
    // 剔除
    this.contactMats = this.contactMats.filter(
      (item) => item.uuid != other.node.uuid
    );
  }
}
