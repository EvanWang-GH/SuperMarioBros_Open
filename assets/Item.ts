// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Item extends cc.Component {
  @property(cc.Label)
  rankLabel: cc.Label = null;
  @property(cc.Sprite)
  avatarSprite: cc.Sprite = null;
  @property(cc.Label)
  nicknameLabel: cc.Label = null;
  @property(cc.Label)
  scoreLabel: cc.Label = null;

  init(
    rank: number,
    user: { avatarUrl: string; nickname: string; score: number }
  ) {
    cc.loader.load(
      { type: "jpg", url: user.avatarUrl },
      (err: any, texture: cc.Texture2D) => {
        this.avatarSprite.spriteFrame = new cc.SpriteFrame(texture);
      }
    );
    this.rankLabel.string = `${rank}.`;
    this.nicknameLabel.string = user.nickname;
    this.scoreLabel.string = user.score.toString();
  }
}
