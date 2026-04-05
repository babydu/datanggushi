# 剧本格式（模板）

本文总结当前游戏引擎支持的剧本 JSON 格式，并给出可直接复制修改的模板。推荐把剧本文件放在 `data/` 目录下，并在 `data/packs-index.json` 中登记，以便在“云端剧本”列表中展示。

## 1. 顶层结构

剧本文件是一个 JSON 对象，核心字段：

- `packInfo`：剧本元信息
- `attributeConfig`：属性约束（影响 UI 显示、上限/下限裁剪）
- `timeLimitConfig`：默认倒计时配置（可被卷/身份/关卡覆盖）
- `scoreConfig`：评分维度与称号
- `specialEvents`：全局特殊事件（可选）
- `volumeList`：卷列表（至少 1 个卷）

### 1.1 packInfo

```json
{
  "packInfo": {
    "packName": "剧本名称",
    "dynasty": "朝代/时代",
    "version": "1.0",
    "author": "作者",
    "description": "一句话介绍"
  }
}
```

### 1.2 attributeConfig

引擎内置常用属性：`health`、`helpTimes`、`debuff`，也支持扩展如 `wealth`、`officialRank`。

```json
{
  "attributeConfig": {
    "health": { "name": "生命值", "max": 100, "min": 0 },
    "helpTimes": { "name": "求救次数", "max": 10, "min": 0 },
    "debuff": { "name": "负面状态", "max": 5, "min": 0 },
    "wealth": { "name": "财富值", "max": 1000, "min": 0 },
    "officialRank": { "name": "官职品级", "max": 9, "min": 0 }
  }
}
```

### 1.3 timeLimitConfig

```json
{
  "timeLimitConfig": {
    "baseTime": 12,
    "healthDeductPerSecond": 1,
    "freezeOnModal": true
  }
}
```

说明：

- `baseTime`：每题倒计时秒数
- `healthDeductPerSecond`：超时后每秒扣血基数（引擎内部会加速扣血）
- `freezeOnModal`：弹窗显示时是否暂停倒计时

## 2. 卷与身份

`volumeList` 是卷列表，一个卷包含多个身份（`identityList`），一个身份包含关卡数组（`levelList`）。

```json
{
  "volumeList": [
    {
      "id": "unique_volume_id",
      "name": "卷名称",
      "subtitle": "副标题",
      "dynasty": "本卷时间/背景",
      "description": "卷介绍",
      "isFirst": true,
      "unlockCondition": null,
      "inheritFrom": null,
      "timeLimitConfig": { "baseTime": 12 },
      "specialEvents": [],
      "identityList": [
        {
          "id": "unique_identity_id",
          "name": "身份名称",
          "description": "身份介绍",
          "specialEvents": [],
          "levelList": []
        }
      ]
    }
  ]
}
```

## 3. 关卡（levelList）

每一关是一个“剧情节点”，字段：

- `level`：关卡编号（数字，唯一）
- `story`：剧情文本
- `storyVariants`：可选，按条件替换 `story`
- `knowledgeTag`：关卡关联的知识标签数组
- `timeLimitConfig`：可选，覆盖倒计时
- `specialEvents`：可选，关卡级事件
- `optionPool` 或 `options`：选项

### 3.1 storyVariants（可选）

用于“状态不同，剧情文本不同”。按顺序匹配，命中第一个就替换。

```json
{
  "storyVariants": [
    {
      "conditions": ["wealth >= 100"],
      "story": "你财力雄厚，因此……"
    }
  ]
}
```

`conditions` 支持的字段和运算符以引擎的安全条件 DSL 为准（示例：`health < 20`、`correct == true && currentLevel > 3`）。

## 4. 选项（options / optionPool）

### 4.1 固定选项 options

适合“强剧情、强分支”的关卡。要求至少 2 个选项。

```json
{
  "options": [
    {
      "id": "opt_1",
      "text": "选项文本",
      "type": "correct",
      "isCorrect": true,
      "result": "选择后的剧情结果",
      "history": "历史知识点解释（务必写具体且可核查）",
      "knowledgeTag": ["标签1", "标签2"],
      "healthChange": 5,
      "debuffChange": -1,
      "effects": {"wealth": 10},
      "setEffects": {"debuff": 0},
      "nextLevel": 2,
      "endGame": false,
      "endDesc": "（仅 endGame=true 时使用）"
    }
  ]
}
```

### 4.2 选项池 optionPool（推荐）

适合“正式答题”，引擎会从池中随机抽取 3 个选项作为本次出题结果。

规则：

- 必须至少有 1 个 `type: "correct"` 的正确选项
- 必须至少有 2 个非致命错误选项（`minor_wrong`/`major_wrong`）以保证能凑够 3 个
- 可选提供 `deadly`（致命选项），引擎会按一定概率抽中

```json
{
  "optionPool": [
    {"id":"c1","type":"correct","text":"...","isCorrect":true,"result":"...","history":"..."},
    {"id":"c2","type":"correct","text":"...","isCorrect":true,"result":"...","history":"..."},
    {"id":"w1","type":"minor_wrong","text":"...","isCorrect":false,"result":"...","history":"..."},
    {"id":"w2","type":"major_wrong","text":"...","isCorrect":false,"result":"...","history":"..."},
    {"id":"d1","type":"deadly","text":"...","isCorrect":false,"result":"...","history":"...","endGame":true,"endDesc":"..."}
  ]
}
```

建议：

- **正确选项尽量多写（2-4 个）**，这样每次抽题“正确项位置/措辞”会变，避免固定 A/B。
- 错误选项要包含“时代错置/制度误读/概念偷换”等，避免仅靠常识推理。

## 5. 特殊事件 specialEvents（可选）

事件支持挂载在：全局、卷、身份、关卡。字段：

- `triggerTiming`：`beforeLevelStart` 或 `afterOptionSelect`
- `triggerConditions`：条件数组（全部为真才触发）
- `triggerOnce`：是否只触发一次
- `eventType`：目前使用 `dialog`
- `eventData`：对话内容与效果

```json
{
  "specialEvents": [
    {
      "id": "event_id",
      "triggerTiming": "afterOptionSelect",
      "triggerConditions": ["health < 20", "correct == true"],
      "triggerOnce": true,
      "eventType": "dialog",
      "eventData": {
        "character": "角色名",
        "title": "事件标题",
        "content": "事件内容",
        "effects": {"health": 20, "debuff": -1}
      }
    }
  ]
}
```

## 6. 最小可用模板（可复制）

可参考仓库中的：

- `data/song_pack.json`（大型完整剧本）
- `data/branching-demo-pack.json`（分支演示）
