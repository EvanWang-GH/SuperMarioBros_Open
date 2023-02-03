// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:

import Item from "./Item";

//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
const { ccclass, property } = cc._decorator;

@ccclass
export default class OpenDataContext extends cc.Component {
  @property(cc.Prefab)
  itemPrefab: cc.Prefab = null;
  @property(cc.Node)
  content: cc.Node = null;
  @property(cc.Node)
  LoadingLabelNode: cc.Node = null;

  isSubmitted = false;

  protected onLoad(): void {
    this.LoadingLabelNode.active = true;
    if (cc.sys.platform == cc.sys.WECHAT_GAME_SUB) {
      wx.onMessage((data: { type: string; value: string }) => {
        switch (data.type) {
          case "reset":
            this.LoadingLabelNode.active = true;
            this.isSubmitted = false;
            this.content.removeAllChildren();
            break;
          case "submitScore":
            if (!this.isSubmitted) {
              this.isSubmitted = true;
              let newScore = parseInt(data.value);
              if (!isNaN(newScore)) {
                console.log(`本次分数 ${newScore}`);
                wx.getUserCloudStorage({
                  keyList: ["score"],
                  success: (res) => {
                    console.log("历史分数拉取成功");
                    let dataList = res.KVDataList;
                    if (dataList.length) {
                      console.log("历史分数不为空，开始比较");
                      let oldScore = parseInt(res.KVDataList[0].value);
                      console.log(`历史分数 ${oldScore}`);
                      if (newScore < oldScore) {
                        console.log("历史分数高于当前分数");
                        newScore = oldScore;
                      } else {
                        console.log("创造新纪录");
                      }
                    }
                    wx.setUserCloudStorage({
                      KVDataList: [
                        { key: "score", value: newScore.toString() },
                      ],
                      success: () => {
                        console.log("分数上传成功");
                      },
                      fail: (res) => {
                        console.log(`分数上传失败 ${res.errMsg}`);
                      },
                    });
                  },
                  fail: (res) => {
                    console.log(`历史分数拉取失败 ${res.errMsg}`);
                  },
                });
              } else {
                console.log("未传递分数");
              }
              // 遍历好友列表
              wx.getFriendCloudStorage({
                keyList: ["score"],
                success: (res) => {
                  let userList: {
                    nickname: string;
                    avatarUrl: string;
                    score: number;
                  }[] = [];
                  res.data.forEach((user) => {
                    let nickname = user.nickname;
                    let avatarUrl = user.avatarUrl;
                    let score = parseInt(user.KVDataList[0].value);
                    userList.push({ nickname, avatarUrl, score });
                  });
                  userList.sort(function (a, b) {
                    return b.score - a.score;
                  });
                  for (let i = 0; i < userList.length; i++) {
                    const user = userList[i];
                    let itemNode = cc.instantiate(this.itemPrefab);
                    itemNode.getComponent(Item).init(i + 1, user);
                    this.content.addChild(itemNode);
                  }
                  this.LoadingLabelNode.active = false;
                },
                fail: (res) => {
                  console.log(`好友数据拉取失败 ${res.errMsg}`);
                },
              });
            }
            break;
        }
      });
    }
  }
}
