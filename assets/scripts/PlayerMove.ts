// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { CollisionTags, playerCollistionTags } from "./utils";
import PlayerPick from './PlayerPick'
import PlayerInteract from './PlayerInteract'
const { ccclass, property } = cc._decorator;

const wallGroup = ['Wall','Ground']

@ccclass
export default class PlayerMove extends cc.Component {
  //  走路的速度
  walkSpeed: number = 0;

  // 初始走路速度
  initWalkSpeed: number = 0;

  // 最快走路速度
  maxWalkSpeed: number = 350;

  // 是否可以跳跃
  jumpEnable: boolean = true
  // 跳起的速度
  jumpSpeed: number = 800;


  // 刚体
  rbBody: cc.RigidBody = null;

  // 朝向
  dir: number = 1;

  // 键盘按键时间戳
  keyDownStamp = 0;
  // 当前按下的键
  pressKeys = [];

  // 玩家背景贴图
  bg:cc.Node = null

  onLoad() {
    this.rbBody = this.node.getComponent(cc.RigidBody);

  }

  start() {
    this.bg = this.node.getChildByName('bg')
    cc.systemEvent.on(
      cc.SystemEvent.EventType.KEY_UP,
      (event: cc.Event.EventKeyboard) => {
        this.pressKeys[event.keyCode] = false;
      }
    );
    cc.systemEvent.on(
      cc.SystemEvent.EventType.KEY_DOWN,
      (event: cc.Event.EventKeyboard) => {
        let now = new Date().getTime();
        // if (now - this.keyDownStamp > 2000) {
        //   this.keyDownStamp = now;
        //   this.pressKeys = [];
        // }
        // 处理组合键
        this.pressKeys[event.keyCode] = true;
        let  validPressKey = this.pressKeys.map((item,index)=>{
            return [item,index]
        }).filter(item=>item[0] == true)
      }
    );
  }
  // 检查按键
  checkKeyboard(){
    for (let [key, value] of Object.entries(this.pressKeys)) {
        if (value == false) continue;
        let keyCode = Number(key);
        switch (keyCode) {
          case cc.macro.KEY.a:
          case cc.macro.KEY.left:
            // 向左移动
            this.setFaceDir(-1);
            this.move();
            break;
          case cc.macro.KEY.d:
          case cc.macro.KEY.right:
            // 向左移动
            this.setFaceDir(1);
            this.move();
            break;
          case cc.macro.KEY.w:
          case cc.macro.KEY.up:
            // 跳跃
            this.jump();
            break;
          case cc.macro.KEY.e:
            // 捡起物品
            this.node.getComponent(PlayerPick).pickup()
            break;
          case cc.macro.KEY.x:
            let interComp = this.node.getComponent(PlayerInteract)
            if(interComp.interActive){
              interComp.interActive()
            }
        }
      }
  }
  // 沿着x轴移动
  move() {
    let v = this.rbBody.linearVelocity;
    if (this.walkSpeed < 200) {
      this.walkSpeed += 2;
    }
    if (Math.abs(v.x + this.walkSpeed * this.dir) < this.maxWalkSpeed) {
      v.x += this.walkSpeed * this.dir;
    } else {
      v.x = this.maxWalkSpeed * this.dir;
    }
    this.rbBody.linearVelocity = v;
  }
  // 设置朝向
  setFaceDir(dir) {
    // 转向
    if (this.dir !== dir) {
      this.dir = dir;
      this.walkSpeed = this.initWalkSpeed;
      if (this.dir == 1) {
        // 向右
        this.node.scaleX = 1;
      } else {
        // 向左
        this.node.scaleX = -1;
      }
    }
  }
  // 跳跃
  jump() {
    if(!this.jumpEnable) return
    
    let v = this.rbBody.linearVelocity
    v.y = this.jumpSpeed
    this.rbBody.linearVelocity = v
    this.jumpEnable = false;
  }

  walkSinSpeed:number = 10
  walkSinCounter:number = 0
  walkSinMax:number = 5
  // 检查玩家是否正在走动
  checkWalking(dt){
    // 立正站好
    const setStand = ()=>{
      let step = 5
      if(this.bg.angle < 0){
        this.bg.angle += (0-this.bg.angle)/step
      }else if(this.bg.angle > 0)
        this.bg.angle -= (this.bg.angle)/step
    }
    let v = this.rbBody.linearVelocity
    if(v.y !== 0){ // 跳跃时无走路动画
        setStand()
        return
    }
    if(v.x != 0){
      // 正在走路
      this.walkSinCounter += dt *this.walkSinSpeed
      this.bg.angle =  this.walkSinMax * Math.sin(this.walkSinCounter)
      
    }else{
      setStand()
      // this.rbBody.angularVelocity = 0
    }
  }
  update(dt) {
    this.checkWalking(dt)
    if(window.game.isPause) return
    this.checkKeyboard()
    this.cameraFollow();
  }
  // 相机跟随
  cameraFollow() {
    window.game.camera.x = this.node.x;
    let scrollHeight = 0
    if(this.node.y + scrollHeight <= 0){
        // 角色低于屏幕的1/6高度，相机不移动
        window.game.camera.y = 0
    }else{
        window.game.camera.y = this.node.y + scrollHeight;
    }
  }
  // 检测与地面之间的碰撞
  onBeginContact(contact, self, other){
  // 接触到地面，可以跳起
      let group = other.node.group
      if(other.tag == CollisionTags.ground && self.tag == playerCollistionTags.move){
          // 从上至下落下
          let normal = contact.getWorldManifold().normal
          if(normal.y < 0){
            this.jumpEnable = true
          }
      }
  }   
  // 检测玩家双脚离地
  onEndContact(contact, self, other){
      // 离开地面，无法跳起
  
      if(other.tag == CollisionTags.ground && self.tag == playerCollistionTags.move){
          // 从上至下落下
          let normal = contact.getWorldManifold().normal
          if(normal.y < 0){
            this.jumpEnable = false
          }
      }
  }
  
}
