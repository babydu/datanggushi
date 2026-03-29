# 历史生存模拟器 - 游戏引擎深度优化与内容扩展规划

> 本文档专注于游戏本身的深度优化，涵盖核心玩法增强、内容扩展性提升两大方向。
> 不包含运营相关功能（签到、打卡等）。

---

## 一、核心问题分析

### 1.1 当前游戏的核心循环

```
选择剧本 → 选择卷 → 选择身份 → 答题 → 通关 → 结束
```

这是一个**线性流程**，缺乏：
- 玩家成长感和累积反馈
- 多样化的结局体验
- 策略选择深度
- 历史沉浸感

### 1.2 亟需解决的问题

| 问题 | 影响 |
|------|------|
| 缺乏玩家成长系统 | 通关后没有"变得更强"的感觉 |
| 结局单一 | 所有玩家通关后看到的内容差不多 |
| 历史人物无存在感 | 答题只是冷冰冰的选择 |
| 剧本扩展性不足 | 新剧本需要大量手动编写 |
| 缺乏支线/隐藏内容 | 重玩价值低 |

---

## 二、游戏引擎升级

### 2.1 爵位/等级系统 ⭐⭐⭐⭐⭐

**设计思路**：玩家通过答题积累历史积分（学识），学识达到一定程度可以提升爵位/等级。

#### 2.1.1 爵位体系（以唐朝为例）

```
庶人 → 佃农 → 自耕农 → 中农 → 富农 → 地主 → 乡绅 → 县尉 → 县令 → 司马 → 刺史 → 太守 → 尚书 → 将军 → 王侯
```

| 爵位 | 学识要求 | 解锁内容 |
|------|----------|----------|
| 庶人 | 0 | 初始身份：农户 |
| 佃农 | 100 | 解锁商人身份选项 |
| 自耕农 | 300 | 解锁商人身份 |
| 中农 | 600 | 解锁特殊事件 |
| 富农 | 1000 | 解锁"与历史名人对话"功能 |
| 地主 | 1500 | 解锁第二剧本 |
| 乡绅 | 2500 | 解锁隐藏关卡 |
| ... | ... | ... |

#### 2.1.2 学识积分系统

```javascript
// 每答对一题获得学识积分
const KNOWLEDGE_POINTS = {
    correct: 10,           // 答对 +10
    wrong: -5,            // 答错 -5
    streak: {              // 连胜加成
        3: 5,             // 3连胜额外 +5
        5: 15,            // 5连胜额外 +15
        10: 50            // 10连胜额外 +50
    },
    timeBonus: {          // 时间加成
        fast: 5,          // 3秒内答题 +5
        medium: 2          // 5秒内答题 +2
    }
};

// 学识等级配置
const SCHOLAR_RANK_CONFIG = {
    ranks: [
        { id: 'commoner', name: '庶人', minPoints: 0, title: '白丁' },
        { id: 'tenant', name: '佃农', minPoints: 100, title: '田舍郎' },
        { id: 'owner', name: '自耕农', minPoints: 300, title: '田主' },
        { id: 'rich', name: '富农', minPoints: 600, title: '殷实户' },
        { id: 'landlord', name: '地主', minPoints: 1000, title: '地主' },
        { id: 'gentry', name: '乡绅', minPoints: 1500, title: '乡贤' },
        { id: 'official', name: '县尉', minPoints: 2500, title: '父母官' },
        // ... 更多等级
    ],
    prestigeMultipliers: {
        'zhenguan': 1.2,   // 贞观卷积分加成 120%
        'kaiyuan': 1.5     // 开元卷积分加成 150%
    }
};
```

#### 2.1.3 爵位特权

| 爵位 | 解锁特权 |
|------|----------|
| 富农+ | 初始生命值 +20 |
| 乡绅+ | 每关开始时清除1层负面状态 |
| 县尉+ | 求救机会 +2 |
| 刺史+ | 解锁"历史名人"功能 |
| 太守+ | 连续正确奖励翻倍 |

---

### 2.2 多故事结局系统 ⭐⭐⭐⭐⭐

**设计思路**：玩家的选择和属性累积会影响最终结局，不同的选择组合产生不同的故事线。

#### 2.2.1 结局判定因素

```javascript
const ENDING_FACTORS = {
    // 属性因素
    attributes: ['health', 'wealth', 'officialRank', 'reputation', 'knowledge'],
    // 选择因素
    choices: {
        correctRate: 'all_correct',      // 正确率100%
        lowHealthPass: 'survivor',      // 低生命通关
        highWealth: 'rich_ending',      // 财富达到一定程度
        correctOnDangerous: 'brave'     // 在必死选项中选择正确
    },
    // 隐藏因素
    secrets: {
        helpedTimes: 'benevolent',       // 使用求救次数少
        noDeath: 'survivor',           // 从未死亡
        allIdentities: 'historian'       // 体验所有身份
    }
};
```

#### 2.2.2 结局类型

```javascript
const ENDING_TYPES = {
    // 通用结局
    common: [
        { id: 'death', name: '英年早逝', condition: { health: 0 }, probability: 0.1 },
        { id: 'average', name: '平淡一生', condition: { correctRate: '<0.6' }, probability: 0.3 },
        { id: 'success', name: '功成名就', condition: { correctRate: '>=0.8', health: '>50' }, probability: 0.4 },
        { id: 'perfect', name: '流芳百世', condition: { correctRate: 1, allSecrets: true }, probability: 0.2 }
    ],
    // 身份特定结局
    identitySpecific: {
        farmer: [
            { id: 'rich_farmer', name: '富甲一方', condition: { wealth: '>=500' }, description: '...' },
            { id: 'scholar', name: '弃农从文', condition: { knowledge: '>=1000' }, description: '...' }
        ],
        merchant: [
            { id: 'commerce_king', name: '富可敌国', condition: { wealth: '>=800' }, description: '...' },
            { id: 'official_merchant', name: '官商勾结', condition: { officialRank: '>=5' }, description: '...' }
        ]
    }
};
```

#### 2.2.3 结局展示

- 结局页面显示专属插图（用文字描述或 emoji 表示）
- 显示详细的结局文案
- 展示影响结局的关键选择
- 提供"重新挑战"和"查看其他结局"选项

---

### 2.3 历史名人互动系统 ⭐⭐⭐⭐

**设计思路**：达到特定条件后，可以与历史名人对话，获得知识加成或特殊事件。

#### 2.3.1 名人解锁条件

```javascript
const FAMOUS_HISTORICAL_FIGURES = [
    {
        id: 'li_shimin',
        name: '李世民',
        title: '唐太宗',
        unlockCondition: { rank: 'xiangshen' }, // 达到乡绅
        avatar: '👑',
        dialogues: [
            { condition: { correctRate: 1 }, text: '朕观你答题，从无失误，实乃栋梁之材！' },
            { condition: { health: '<20' }, text: '身体是本钱，莫要过度消耗。' },
            { condition: { default: true }, text: '以史为鉴，可以知兴亡。望你好自为之。' }
        ],
        rewards: { knowledgeBonus: 1.2 }
    },
    {
        id: 'wei_zheng',
        name: '魏征',
        title: '谏臣',
        unlockCondition: { correctStreak: 5 },
        avatar: '📜',
        dialogues: [
            { condition: { consecutiveCorrect: '>=10' }, text: '连续答对十题，实属不易！' },
            { condition: { default: true }, text: '兼听则明，偏信则暗。望你广开言路。' }
        ],
        rewards: { helpTimes: 1 }
    },
    {
        id: 'libai',
        name: '李白',
        title: '诗仙',
        unlockCondition: { poetryCorrect: 5 }, // 答对5道诗词题
        avatar: '🖋️',
        dialogues: [
            { condition: { default: true }, text: '君不见黄河之水天上来？' }
        ],
        rewards: { correctBonus: 1.1 }
    }
];
```

#### 2.3.2 互动方式

- 在游戏主页显示已解锁的名人列表
- 点击名人可以查看对话历史
- 每次通关后可能触发随机名人对话
- 对话内容根据玩家当前状态动态生成

---

### 2.4 天赋/技能系统 ⭐⭐⭐⭐

**设计思路**：玩家在游戏中积累的某些成就可以转化为天赋，提供永久或临时加成。

#### 2.4.1 天赋树设计

```javascript
const TALENT_TREE = {
    // 历史学派（影响答题正确率）
    historySchool: {
        name: '史学派',
        talents: [
            { id: 't1', name: '博闻强识', desc: '答对后额外+5学识', effect: { correctBonus: 5 } },
            { id: 't2', name: '过目不忘', desc: '连续正确+2学识', effect: { streakBonus: 2 }, requires: 't1' },
            { id: 't3', name: '融会贯通', desc: '10连胜额外+20学识', effect: { streak10Bonus: 20 }, requires: 't2' }
        ]
    },
    // 生存学派（影响生命值）
    survivalSchool: {
        name: '生存派',
        talents: [
            { id: 's1', name: '坚忍不拔', desc: '初始生命+10', effect: { healthBonus: 10 } },
            { id: 's2', name: '修身养性', desc: '负面状态-1', effect: { debuffReduction: 1 }, requires: 's1' },
            { id: 's3', name: '百毒不侵', desc: '免疫必死选项一次', effect: { deathImmune: 1 }, requires: 's2' }
        ]
    },
    // 社交学派（影响求助和事件）
    socialSchool: {
        name: '社交派',
        talents: [
            { id: 'c1', name: '能言善辩', desc: '求救提示更明确', effect: { helpPrecision: true } },
            { id: 'c2', name: '八面玲珑', desc: '特殊事件正面效果+50%', effect: { eventBonus: 1.5 }, requires: 'c1' },
            { id: 'c3', name: '左右逢源', desc: '解锁所有名人对话', effect: { allDialogues: true }, requires: 'c2' }
        ]
    }
};
```

#### 2.4.2 天赋获取方式

- 学识达到阈值自动领悟
- 完成特定成就解锁
- 与历史名人对话获得

---

### 2.5 命运/支线系统 ⭐⭐⭐

**设计思路**：在主线关卡之间，随机触发命运事件，提供额外挑战或奖励。

#### 2.5.1 命运事件示例

```javascript
const FATE_EVENTS = [
    {
        id: 'encounter_scholar',
        name: '路遇书生',
        description: '途中遇一书生，与你讨论历史典故',
        choices: [
            { text: '谦虚请教', result: 'gain_knowledge', effect: { knowledge: 20 } },
            { text: '与之辩论', result: 'debate', effect: { correctBonus: true } }
        ],
        probability: 0.15
    },
    {
        id: 'temple_blessing',
        name: '庙宇祈福',
        description: '路过一座古庙，进香还是离开？',
        choices: [
            { text: '虔诚上香', result: 'blessing', effect: { health: 10, wealth: -20 } },
            { text: '匆匆离去', result: 'nothing', effect: {} },
            { text: '偷窃香火钱', result: 'sin', effect: { debuff: 1, wealth: 30 } }
        ],
        probability: 0.1
    }
];
```

#### 2.5.2 支线任务

```javascript
const SIDE_QUESTS = [
    {
        id: ' PoetryChallenge',
        name: '诗词挑战',
        description: '完成5道诗词相关题目',
        condition: { poetryCorrect: 5 },
        reward: { talent: 'libai_unlock', knowledge: 100 }
    },
    {
        id: 'no_help',
        name: '自力更生',
        description: '不使用求救通关',
        condition: { helpUsed: 0 },
        reward: { talent: 'independence', healthBonus: 20 }
    }
];
```

---

### 2.6 剧本继承与轮回系统 ⭐⭐⭐⭐

**设计思路**：通关一个剧本后，可以将部分积累带入下一个剧本，保持成长感。

#### 2.6.1 继承机制

```javascript
const PRESTIGE_CONFIG = {
    // 通关后可继承的内容
    inheritables: {
        knowledgePoints: { rate: 0.5, name: '学识积分' },      // 50%可继承
        talents: { rate: 1.0, name: '天赋' },               // 100%可继承
        achievements: { rate: 1.0, name: '成就' },          // 100%可继承
        historicalFigures: { rate: 1.0, name: '历史名人' },   // 100%可继承
        rank: { rate: 0.3, name: '爵位' }                    // 30%可继承
    },
    // 轮回等级
    prestigeLevels: [
        { level: 1, name: '一星轮回', multiplier: 1.1, requirement: 'first_completion' },
        { level: 2, name: '二星轮回', multiplier: 1.2, requirement: 'all_endings' },
        { level: 3, name: '三星轮回', multiplier: 1.5, requirement: 'all_achievements' }
    ]
};
```

---

## 三、内容扩展性设计

### 3.1 剧本模板引擎 ⭐⭐⭐⭐⭐

**设计思路**：设计一套剧本模板引擎，通过配置而非代码来定义新的剧本。

#### 3.1.1 剧本模板结构

```javascript
const STORY_TEMPLATE = {
    meta: {
        title: '{{dynasty}}历史生存剧本',
        variables: ['dynasty', 'setting', 'protagonist']
    },
    
    // 自动生成的关卡
    autoGenerateLevels: {
        enabled: true,
        templates: [
            {
                id: 'level_{{index}}',
                storyTemplate: '{{setting}}年间，作为{{protagonist}}的你面临人生抉择...',
                optionsTemplate: {
                    correct: '符合历史正确的选择',
                    wrong: '看似合理但历史错误的选择',
                    deadly: '会导致严重后果的选择'
                },
                count: 10
            }
        ]
    },
    
    // 预设关卡池
    presetLevels: [],
    
    // 自动注入的结局
    endings: [
        {
            id: 'ending_1',
            name: '{{protagonist}}的传奇人生',
            conditions: ['correctRate >= 0.8'],
            text: '你从一个{{protagonist}}最终...'
        }
    ],
    
    // 命运事件池
    fateEvents: [],
    
    // 历史名人池
    historicalFigures: []
};
```

#### 3.1.2 变量替换引擎

```javascript
function fillTemplate(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
}

// 示例
const template = '{{dynasty}}历史生存剧本';
const result = fillTemplate(template, { dynasty: '唐朝' });
console.log(result); // "唐朝历史生存剧本"
```

---

### 3.2 知识图谱引擎 ⭐⭐⭐

**设计思路**：将历史知识点结构化，支持自动生成关卡和题目。

#### 3.2.1 知识节点结构

```javascript
const KNOWLEDGE_NODES = {
    'tang_zulin': {
        id: 'tang_zulin',
        category: '制度',
        era: '唐朝',
        difficulty: 'easy',
        relatedNodes: ['tang_juntian', 'tang_fuyu'],
        questions: [
            {
                stem: '唐代均田制规定，每个成年男子可授田多少亩？',
                options: ['30亩', '50亩', '100亩', '200亩'],
                correct: 1,
                explanation: '唐代均田制规定，每个成年男子可授口分田30亩，永业田20亩。'
            }
        ]
    }
};
```

#### 3.2.2 自动题目生成

```javascript
function generateQuestionsFromKnowledge(knowledgePool, count, difficulty) {
    const filtered = knowledgePool.filter(k => k.difficulty === difficulty);
    const shuffled = shuffleArray(filtered);
    return shuffled.slice(0, count).map(k => {
        const q = k.questions[Math.floor(Math.random() * k.questions.length)];
        return {
            knowledgeId: k.id,
            ...q
        };
    });
}
```

---

### 3.3 剧情分支引擎 ⭐⭐⭐

**设计思路**：支持根据玩家属性动态生成不同的剧情描述。

#### 3.3.1 条件文本

```javascript
const CONDITIONAL_TEXT = {
    'story_intro': {
        default: '你出生在关中平原的一个小村庄...',
        conditions: [
            { if: { wealth: '>500' }, text: '你出生在地主家庭，锦衣玉食...' },
            { if: { health: '<50' }, text: '你自幼体弱多病，但聪明过人...' }
        ]
    }
};
```

---

## 四、关键技术架构

### 4.1 模块化架构

```
┌─────────────────────────────────────────────────┐
│                   game.js                        │
├─────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │
│  │ 核心引擎 │ │ 积分系统 │ │ 爵位系统         │  │
│  └─────────┘ └─────────┘ └─────────────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │
│  │ 结局系统 │ │ 名人系统 │ │ 天赋系统         │  │
│  └─────────┘ └─────────┘ └─────────────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │
│  │ 命运系统 │ │ 剧本引擎│ │ 知识图谱引擎    │  │
│  └─────────┘ └─────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 4.2 数据存储策略

```javascript
const STORAGE_KEYS = {
    SAVE_KEY: 'history_survivor_save',
    KNOWLEDGE_KEY: 'history_survivor_knowledge',    // 学识积分
    RANK_KEY: 'history_survivor_rank',              // 爵位
    TALENTS_KEY: 'history_survivor_talents',        // 天赋
    FIGURES_KEY: 'history_survivor_figures',        // 已解锁名人
    ENDINGS_KEY: 'history_survivor_endings',        // 已解锁结局
    PRESTIGE_KEY: 'history_survivor_prestige',     // 轮回等级
    ACHIEVEMENTS_KEY: 'history_survivor_achievements',
    DAILY_TASKS_KEY: 'history_survivor_daily'
};
```

---

## 五、实施优先级（精简版）

### 5.1 v2.3 阶段：核心成长系统

| 功能 | 工作量 | 说明 |
|------|--------|------|
| 学识积分系统 | 小 | 答题获得积分 |
| 爵位/等级系统 | 中 | 积分解锁爵位和特权 |
| 结局判定系统 | 中 | 多结局判定逻辑 |

### 5.2 v2.4 阶段：历史名人系统

| 功能 | 工作量 | 说明 |
|------|--------|------|
| 名人解锁 | 小 | 达成条件解锁名人 |
| 名人对话 | 小 | 根据状态显示对话 |
| 名人奖励 | 小 | 解锁加成 |

### 5.3 v2.5 阶段：天赋系统

| 功能 | 工作量 | 说明 |
|------|--------|------|
| 天赋树 | 中 | 三大流派 |
| 天赋获取 | 小 | 条件触发 |
| 天赋效果 | 小 | 属性加成 |

### 5.4 v3.0 阶段：高级系统

| 功能 | 工作量 | 说明 |
|------|--------|------|
| 命运事件 | 中 | 随机事件 |
| 剧本模板引擎 | 大 | 自动化剧本生成 |
| 轮回继承 | 中 | 通关传承 |

---

## 六、与现有系统的融合

### 6.1 融合点

| 现有系统 | 融合方式 |
|-----------|----------|
| 属性系统 | 新增 wealth、reputation、knowledge 属性 |
| 成就系统 | 成就解锁天赋/名人 |
| 每日任务 | 任务奖励学识积分 |
| 剧本格式 | 新增 endingConditions、fateEvents 等字段 |

### 6.2 向后兼容

- 旧剧本仍然可以在新引擎运行
- 新功能对旧剧本是可选的
- 默认使用保守配置（无加成）

---

*文档版本：v2.0*  
*更新日期：2026-03-29*  
*核心主题：游戏引擎深度升级 + 内容扩展性提升*
