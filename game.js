// ===================== 固定配置常量 =====================
const SAVE_KEY = "history_survivor_save_data";
const CUSTOM_PACK_LIST_KEY = "customPackList"; // 存储剧本列表（多剧本管理）
const CUSTOM_PACK_KEY = "customPackData"; // 存储当前自定义剧本（用于存档兼容）
const DEFAULT_PACK_URL = "data/song_pack.json";
const OPTION_DRAW_COUNT = 3;
const DEADLY_OPTION_CHANCE = 0.25;
const WEAKNESS_THRESHOLD = 0.5;
const DEFAULT_TIME_CONFIG = {
    baseTime: 10,
    healthDeductPerSecond: 1,
    freezeOnModal: true
};
const DEFAULT_ATTRIBUTE_CONFIG = {
    health: { name: "生命值", max: 100, min: 0 },
    helpTimes: { name: "求救次数", max: 10, min: 0 },
    debuff: { name: "负面状态", max: 5, min: 0 }
};
const UNLOCK_KEY_PREFIX = "unlocked_volumes_"; // 【新增】卷解锁状态存储前缀

// ===================== 新手引导常量 =====================
const TUTORIAL_KEY = "history_survivor_tutorial_completed";
const TUTORIAL_STEPS = [
    {
        id: "welcome",
        target: "#start-game-btn",
        content: "欢迎来到历史生存模拟器！点击这里开始选择剧本，开启你的历史之旅。",
        position: "bottom",
        highlightPadding: 10
    },
    {
        id: "pack-select",
        target: "#confirm-pack-btn",
        content: "选择一个剧本，点击确认按钮进入游戏。内置唐朝剧本包含多卷内容。",
        position: "bottom",
        highlightPadding: 10
    },
    {
        id: "volume-select",
        target: "#confirm-volume-btn",
        content: "每个剧本包含多个篇章，通关当前篇章后可解锁下一篇章。",
        position: "bottom",
        highlightPadding: 10
    },
    {
        id: "identity-select",
        target: "#confirm-identity-btn",
        content: "选择你想要体验的身份，不同身份有不同的人生历程和挑战。",
        position: "bottom",
        highlightPadding: 10
    },
    {
        id: "level-select",
        target: "#level-select-page .btn:not(.btn-secondary)",
        content: "滑块选择本次游玩的关卡数量，完成所选关卡即可通关。",
        position: "top",
        highlightPadding: 10
    },
    {
        id: "game-start",
        target: "#game-page",
        content: "游戏开始！阅读剧情故事，从选项中选择你的决定。答对恢复生命值，答错会扣除生命。",
        position: "center",
        highlightPadding: 0
    },
    {
        id: "help-btn",
        target: "#help-btn",
        content: "遇到难题？点击使用求救机会，可以获得正确答案的提示，但会消耗求救次数。",
        position: "top",
        highlightPadding: 10
    },
    {
        id: "save-btn",
        target: "#save-btn",
        content: "记得随时保存进度！中断后可以从首页读取存档继续游戏。",
        position: "top",
        highlightPadding: 10
    }
];

// ===================== 多结局判定系统 =====================
const ENDING_CONFIG = {
    // 通用结局
    commonEndings: [
        {
            id: 'death_early',
            name: '英年早逝',
            icon: '💀',
            condition: (state) => state.health <= 0,
            description: '你因长期做出错误选择，耗尽生机，在历史长河中黯然退场...',
            color: '#c62828'
        },
        {
            id: 'average_life',
            name: '平淡一生',
            icon: '🌾',
            condition: (state) => state.correctRate < 0.6 && state.isSuccess,
            description: '你度过了平凡的一生，虽无大富大贵，但也安稳踏实...',
            color: '#8b4513'
        },
        {
            id: 'success_career',
            name: '功成名就',
            icon: '🎖️',
            condition: (state) => state.correctRate >= 0.7 && state.health > 30 && state.isSuccess,
            description: '你凭借对历史的深刻理解，在仕途上平步青云，成就了一番事业...',
            color: '#2e7d32'
        },
        {
            id: 'scholar_gentry',
            name: '学而优则仕',
            icon: '📜',
            condition: (state) => state.correctRate >= 0.85 && state.isSuccess,
            description: '你的历史学问出类拔萃，被世人尊为学究，大家风范流芳百世...',
            color: '#1565c0'
        },
        {
            id: 'perfect_history',
            name: '千古流芳',
            icon: '👑',
            condition: (state) => state.correctRate >= 0.95 && state.health > 50 && state.isSuccess && state.noHelpUsed,
            description: '你以近乎完美的历史知识，一路过关斩将，最终成为一代宗师，令后人敬仰！',
            color: '#ffd700'
        }
    ],
    // 身份特定结局
    identityEndings: {
        farmer: [
            {
                id: 'farmer_rich',
                name: '富甲一方',
                icon: '🏠',
                condition: (state) => state.wealth >= 300 && state.isSuccess,
                description: '你通过勤勉耕作，积累财富，成为当地有名的地主乡绅...'
            },
            {
                id: 'farmer_scholar',
                name: '耕读传家',
                icon: '📚',
                condition: (state) => state.correctRate >= 0.8 && state.isSuccess,
                description: '你虽为农户，却好读诗书，最终培养出下一代书生...'
            }
        ],
        merchant: [
            {
                id: 'merchant_king',
                name: '富可敌国',
                icon: '💰',
                condition: (state) => state.wealth >= 500 && state.isSuccess,
                description: '你的商号遍布大唐各地，财富惊人，连朝廷都要向你借贷...'
            }
        ]
    }
};

function determineEnding(gameState, isSuccess) {
    const state = {
        health: gameState.health,
        correctRate: gameState.gameRecord.length > 0 
            ? gameState.levelPassed / gameState.gameRecord.length 
            : 0,
        helpUsed: 3 - gameState.helpTimes,
        wealth: gameState.wealth || 0,
        isSuccess: isSuccess,
        noHelpUsed: gameState.helpTimes === 3
    };
    
    // 首先检查身份特定结局
    const identityId = gameState.currentIdentity?.id;
    if (identityId && ENDING_CONFIG.identityEndings[identityId]) {
        for (const ending of ENDING_CONFIG.identityEndings[identityId]) {
            if (ending.condition(state)) {
                return ending;
            }
        }
    }
    
    // 然后检查通用结局（按优先级排序）
    const sortedEndings = [...ENDING_CONFIG.commonEndings].sort((a, b) => {
        const aScore = calculateEndingScore(a, state);
        const bScore = calculateEndingScore(b, state);
        return bScore - aScore;
    });
    
    for (const ending of sortedEndings) {
        if (ending.condition(state)) {
            return ending;
        }
    }
    
    // 默认结局
    return {
        id: 'default',
        name: '历史过客',
        icon: '🍃',
        condition: () => true,
        description: '你如历史长河中的一片落叶，悄然飘过...',
        color: '#5a3817'
    };
}

function calculateEndingScore(ending, state) {
    let score = 0;
    // 根据达成条件计算得分
    if (ending.id === 'perfect_history') score = 100;
    else if (ending.id === 'scholar_gentry') score = 85;
    else if (ending.id === 'success_career') score = 70;
    else if (ending.id === 'average_life') score = 50;
    else if (ending.id === 'death_early') score = 20;
    return score;
}

// ===================== 音效系统常量 =====================
const AUDIO_CONFIG = {
    enabled: true,
    volume: 0.5,
    sounds: {
        correct: { file: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU', fallback: 'correct' },
        wrong: { file: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU', fallback: 'wrong' },
        click: { file: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU', fallback: 'click' },
        success: { file: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU', fallback: 'success' },
        fail: { file: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU', fallback: 'fail' }
    }
};

// 音效系统对象
const AudioSystem = {
    context: null,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API 不可用，音效功能已禁用');
            AUDIO_CONFIG.enabled = false;
        }
    },
    
    play(soundType) {
        if (!AUDIO_CONFIG.enabled || !this.context) return;
        
        // 确保 AudioContext 处于活动状态
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        const volume = AUDIO_CONFIG.volume;
        gainNode.gain.value = volume;
        
        switch (soundType) {
            case 'correct':
                oscillator.frequency.value = 523.25; // C5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(volume, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(this.context.currentTime + 0.3);
                break;
                
            case 'wrong':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(volume * 0.5, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.4);
                oscillator.start();
                oscillator.stop(this.context.currentTime + 0.4);
                break;
                
            case 'click':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(volume * 0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
                oscillator.start();
                oscillator.stop(this.context.currentTime + 0.05);
                break;
                
            case 'success':
                oscillator.frequency.value = 523.25;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(volume, this.context.currentTime);
                oscillator.start();
                oscillator.frequency.setValueAtTime(523.25, this.context.currentTime);
                oscillator.frequency.setValueAtTime(659.25, this.context.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.context.currentTime + 0.2); // G5
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                oscillator.stop(this.context.currentTime + 0.5);
                break;
                
            case 'fail':
                oscillator.frequency.value = 400;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(volume * 0.5, this.context.currentTime);
                oscillator.start();
                oscillator.frequency.setValueAtTime(400, this.context.currentTime);
                oscillator.frequency.setValueAtTime(300, this.context.currentTime + 0.15);
                oscillator.frequency.setValueAtTime(200, this.context.currentTime + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                oscillator.stop(this.context.currentTime + 0.5);
                break;
        }
    },
    
    setVolume(vol) {
        AUDIO_CONFIG.volume = Math.max(0, Math.min(1, vol));
    },
    
    toggle() {
        AUDIO_CONFIG.enabled = !AUDIO_CONFIG.enabled;
        return AUDIO_CONFIG.enabled;
    }
}

// ===================== 学识积分与爵位系统（按身份差异化）=====================
const KNOWLEDGE_KEY = 'history_survivor_knowledge';
const RANK_KEY = 'history_survivor_rank';

// 学识积分配置
const KNOWLEDGE_CONFIG = {
    correct: 10,           // 答对 +10
    wrong: -3,             // 答错 -3
    streak: {              // 连胜加成
        3: 5,              // 3连胜额外 +5
        5: 15,             // 5连胜额外 +15
        10: 50             // 10连胜额外 +50
    },
    timeBonus: {          // 时间加成
        fast: 3,           // 3秒内答题 +3
        medium: 1           // 5秒内答题 +1
    },
    levelComplete: 50      // 完成关卡额外 +50
};

// 按身份类型划分的爵位体系
const IDENTITY_BASED_RANKS = {
    // 农户身份爵位体系
    farmer: [
        { id: 'pauper', name: '赤贫', minPoints: 0, title: '身无立锥之地', icon: '🙏', description: '一贫如洗的雇农' },
        { id: 'tenant', name: '佃农', minPoints: 100, title: '租人田者', icon: '🌾', description: '租用他人土地的农民' },
        { id: 'micro', name: '微农', minPoints: 300, title: '薄田数亩', icon: '🌱', description: '拥有少量土地的农民' },
        { id: 'small', name: '小农', minPoints: 600, title: '自给自足', icon: '🏠', description: '能够自给自足的自耕农' },
        { id: 'middle', name: '中农', minPoints: 1000, title: '小有余粮', icon: '🌾', description: '有余裕的中等农户' },
        { id: 'rich_farmer', name: '富农', minPoints: 1500, title: '殷实户', icon: '💰', description: '雇佣劳动力的富户' },
        { id: 'landlord', name: '地主', minPoints: 2500, title: '良田千亩', icon: '🏘️', description: '拥有大量土地的地主' },
        { id: 'gentry', name: '乡绅', minPoints: 4000, title: '乡贤', icon: '📜', description: '退隐官员或地方贤达' },
        { id: 'county_official', name: '县尉', minPoints: 6000, title: '父母官', icon: '🏛️', description: '县级官员' },
        { id: 'magistrate', name: '县令', minPoints: 9000, title: '一县之尊', icon: '🎖️', description: '县级最高长官' },
        { id: ' prefect', name: '太守', minPoints: 13000, title: '一郡之守', icon: '🏯', description: '郡级长官' },
        { id: 'minister', name: '尚书', minPoints: 18000, title: '部堂大人', icon: '📚', description: '中央各部首长' },
        { id: 'general', name: '将军', minPoints: 25000, title: '镇守一方', icon: '⚔️', description: '军级将领' },
        { id: 'duke', name: '王侯', minPoints: 35000, title: '封疆裂土', icon: '👑', description: '王侯将相' }
    ],
    
    // 商户身份爵位体系
    merchant: [
        { id: 'apprentice', name: '学徒', minPoints: 0, title: '店小二', icon: '🧑‍🍳', description: '商铺学徒' },
        { id: 'assistant', name: '伙计', minPoints: 100, title: '伙计', icon: '👨‍💼', description: '店员或帮工' },
        { id: 'clerk', name: '掌柜', minPoints: 300, title: '掌柜', icon: '💼', description: '独立经营的店主' },
        { id: 'shop_owner', name: '东家', minPoints: 600, title: '商铺东主', icon: '🏪', description: '拥有店铺的业主' },
        { id: 'trader', name: '行商', minPoints: 1000, title: '行商坐贾', icon: '🚢', description: '从事长途贸易的商人' },
        { id: 'major_merchant', name: '大贾', minPoints: 1500, title: '富甲一方', icon: '💎', description: '声名显赫的大商人' },
        { id: 'guild_master', name: '豪商', minPoints: 2500, title: '行业翘楚', icon: '🏆', description: '行业公会领袖' },
        { id: 'royal_merchant', name: '皇商', minPoints: 4000, title: '供奉内廷', icon: '👑', description: '为皇室采购的商人' },
        { id: 'provincial_merchant', name: '省商', minPoints: 6000, title: '一省首富', icon: '🌟', description: '省级商业巨头' },
        { id: 'national_merchant', name: '国商', minPoints: 9000, title: '富可敌国', icon: '🏅', description: '全国知名富商' },
        { id: 'banker', name: '钱庄主', minPoints: 13000, title: '金融巨擘', icon: '🏦', description: '经营钱庄银行' },
        { id: 'industrialist', name: '工场主', minPoints: 18000, title: '百业之首', icon: '🏭', description: '手工业工场主' },
        { id: 'commercial_emperor', name: '商圣', minPoints: 25000, title: '商道至尊', icon: '📜', description: '商业传奇人物' },
        { id: 'commercial_legend', name: '首富', minPoints: 35000, title: '富甲天下', icon: '💰', description: '天下首富' }
    ],
    
    // 学子身份爵位体系
    scholar: [
        { id: 'child', name: '童生', minPoints: 0, title: '白身', icon: '📖', description: '尚未考取功名的读书人' },
        { id: 'xiucai', name: '秀才', minPoints: 100, title: '相公', icon: '🎓', description: '考取功名的最低级别' },
        { id: 'juren', name: '举人', minPoints: 300, title: '举人老爷', icon: '📜', description: '省级考试及格者' },
        { id: 'jinshi', name: '贡士', minPoints: 600, title: '贡士', icon: '🎖️', description: '礼部主持的全国性考试及格者' },
        { id: 'jinshi2', name: '进士', minPoints: 1000, title: '进士及第', icon: '🏆', description: '最终及第的读书人' },
        { id: 'jinshi3', name: '传胪', minPoints: 1500, title: '传胪', icon: '🥇', description: '二甲第一名' },
        { id: 'hanlin', name: '翰林', minPoints: 2500, title: '词臣', icon: '📚', description: '翰林院官员' },
        { id: 'censor', name: '御史', minPoints: 4000, title: '言官', icon: '⚖️', description: '朝廷监察官员' },
        { id: 'minister2', name: '尚书', minPoints: 6000, title: '部堂', icon: '🏛️', description: '中央各部首长' },
        { id: 'prime', name: '内阁', minPoints: 9000, title: '首辅', icon: '👑', description: '内阁大学士' },
        { id: 'academician', name: '院士', minPoints: 13000, title: '帝师', icon: '🎓', description: '太子太师' },
        { id: 'grand_master', name: '大宗师', minPoints: 18000, title: '学究天人', icon: '📖', description: '学术泰斗' },
        { id: 'saint', name: '圣人', minPoints: 25000, title: '至圣先师', icon: '🙏', description: '儒家圣贤' },
        { id: 'sage_king', name: '圣王', minPoints: 35000, title: '垂拱而治', icon: '✨', description: '内圣外王' }
    ]
};

// 通用爵位体系（用于未知身份或默认显示）
const COMMON_RANKS = [
    { id: 'commoner', name: '庶人', minPoints: 0, title: '白丁', icon: '👤' },
    { id: 'scholar1', name: '士人', minPoints: 100, title: '读书人', icon: '📚' },
    { id: 'scholar2', name: '士绅', minPoints: 300, title: '地方贤达', icon: '🏛️' },
    { id: 'scholar3', name: '乡贤', minPoints: 600, title: '乡绅', icon: '📜' },
    { id: 'scholar4', name: '名流', minPoints: 1000, title: '社会名流', icon: '⭐' },
    { id: 'official1', name: '县尉', minPoints: 1500, title: '父母官', icon: '🏛️' },
    { id: 'official2', name: '县令', minPoints: 2500, title: '一县之尊', icon: '🎖️' },
    { id: 'official3', name: '郡守', minPoints: 4000, title: '一郡之守', icon: '🏯' },
    { id: 'official4', name: '尚书', minPoints: 6000, title: '部堂大人', icon: '📚' },
    { id: 'minister', name: '将军', minPoints: 9000, title: '镇守一方', icon: '⚔️' },
    { id: 'duke', name: '王侯', minPoints: 13000, title: '封疆裂土', icon: '👑' },
    { id: 'marquis', name: '公卿', minPoints: 18000, title: '位列公卿', icon: '🏅' },
    { id: 'imperial', name: '皇室', minPoints: 25000, title: '龙子凤孙', icon: '🐉' },
    { id: 'sage', name: '圣贤', minPoints: 35000, title: '千古一圣', icon: '✨' }
];

// 获取当前身份对应的爵位体系
function getIdentityRankConfig(identityId) {
    if (!identityId) return COMMON_RANKS;
    
    const identityLower = identityId.toLowerCase();
    
    if (identityLower.includes('farmer') || identityLower.includes('农') || identityLower.includes('耕')) {
        return IDENTITY_BASED_RANKS.farmer;
    } else if (identityLower.includes('merchant') || identityLower.includes('商') || identityLower.includes('贾') || identityLower.includes('店')) {
        return IDENTITY_BASED_RANKS.merchant;
    } else if (identityLower.includes('scholar') || identityLower.includes('学子') || identityLower.includes('读书') || identityLower.includes('儒')) {
        return IDENTITY_BASED_RANKS.scholar;
    } else if (identityLower.includes('official') || identityLower.includes('官') || identityLower.includes('仕')) {
        return IDENTITY_BASED_RANKS.scholar; // 官员也走学子路线
    }
    
    return COMMON_RANKS;
}

// 爵位特权配置
const RANK_PRIVILEGES = {
    farmer: {
        'middle': { healthBonus: 10 },
        'rich_farmer': { wealthBonus: 50 },
        'landlord': { debuffImmunity: 1 },
        'gentry': { helpTimesBonus: 1 },
        'county_official': { helpTimesBonus: 2 },
        'magistrate': { streakBonus: 1.2 },
        'prefect': { correctBonus: 1.1 },
        'minister': { allEndingsUnlock: true },
        'general': { prestigeBonus: 1.2 },
        'duke': { title: '田园诗画家' }
    },
    merchant: {
        'trader': { healthBonus: 5 },
        'major_merchant': { wealthBonus: 100 },
        'guild_master': { debuffImmunity: 1 },
        'royal_merchant': { helpTimesBonus: 2 },
        'provincial_merchant': { streakBonus: 1.2 },
        'national_merchant': { correctBonus: 1.1 },
        'banker': { allEndingsUnlock: true },
        'industrialist': { prestigeBonus: 1.2 },
        'commercial_emperor': { title: '商道传人' }
    },
    scholar: {
        'juren': { healthBonus: 5 },
        'jinshi': { wealthBonus: 30 },
        'hanlin': { debuffImmunity: 1 },
        'censor': { helpTimesBonus: 2 },
        'minister2': { streakBonus: 1.2 },
        'prime': { correctBonus: 1.15 },
        'academician': { allEndingsUnlock: true },
        'grand_master': { prestigeBonus: 1.2 },
        'saint': { title: '万世师表' }
    }
};

// 爵位等级配置（统一格式，用于兼容性）
const RANK_CONFIG = {
    ranks: COMMON_RANKS,
    privileges: RANK_PRIVILEGES
};

// 学识与爵位状态（新增身份字段）
let knowledgeState = {
    totalPoints: 0,       // 累计学识
    currentPoints: 0,      // 当前学识（可用于本局）
    currentRank: 'commoner',
    highestRank: 'commoner',
    rankProgress: 0,        // 距离下一爵位的进度百分比
    currentIdentityType: null // 当前身份类型
};

function loadKnowledgeState() {
    try {
        const saved = localStorage.getItem(KNOWLEDGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            knowledgeState.totalPoints = parsed.totalPoints || 0;
            knowledgeState.highestRank = parsed.highestRank || 'commoner';
            knowledgeState.currentIdentityType = parsed.currentIdentityType || null;
        }
    } catch (e) {
        console.warn('加载学识状态失败');
    }
    updateRankFromPoints();
}

function saveKnowledgeState() {
    try {
        localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify({
            totalPoints: knowledgeState.totalPoints,
            highestRank: knowledgeState.highestRank,
            currentIdentityType: knowledgeState.currentIdentityType
        }));
    } catch (e) {
        console.warn('保存学识状态失败');
    }
}

// 更新学识等级（按身份差异化）
function updateRankFromPoints(identityId = null) {
    const points = knowledgeState.totalPoints;
    
    // 确定身份类型
    if (identityId) {
        knowledgeState.currentIdentityType = identityId;
    }
    
    // 获取当前身份对应的爵位体系
    const rankList = getIdentityRankConfig(knowledgeState.currentIdentityType);
    
    let newRank = rankList[0];
    
    for (const rank of rankList) {
        if (points >= rank.minPoints) {
            newRank = rank;
        } else {
            break;
        }
    }
    
    if (newRank.id !== knowledgeState.currentRank || knowledgeState.currentIdentityType !== identityId) {
        knowledgeState.currentRank = newRank.id;
        
        // 检查是否突破最高爵位（在同一身份体系下）
        const currentIndex = rankList.findIndex(r => r.id === newRank.id);
        const highestIndex = rankList.findIndex(r => r.id === knowledgeState.highestRank);
        
        if (currentIndex > highestIndex) {
            knowledgeState.highestRank = newRank.id;
        }
    }
    
    // 计算进度
    const currentIndex = rankList.findIndex(r => r.id === knowledgeState.currentRank);
    if (currentIndex < rankList.length - 1) {
        const currentMin = newRank.minPoints;
        const nextMin = rankList[currentIndex + 1].minPoints;
        knowledgeState.rankProgress = ((points - currentMin) / (nextMin - currentMin)) * 100;
    } else {
        knowledgeState.rankProgress = 100;
    }
}

function addKnowledgePoints(points, source) {
    knowledgeState.totalPoints += points;
    if (points > 0) {
        knowledgeState.currentPoints += points;
        if (appState.gameState) {
            appState.gameState.currentKnowledge = (appState.gameState.currentKnowledge || 0) + points;
        }
        updateRankFromPoints();
        saveKnowledgeState();
    }
    return knowledgeState.currentPoints;
}

// 获取爵位信息（支持按身份差异化）
function getRankInfo(rankId) {
    const rankList = getIdentityRankConfig(knowledgeState.currentIdentityType);
    return rankList.find(r => r.id === rankId) || rankList[0];
}

// 获取当前爵位特权（支持按身份差异化）
function getCurrentRankPrivileges() {
    const rankId = knowledgeState.currentRank;
    const identityType = knowledgeState.currentIdentityType || 'farmer';
    
    // 尝试从身份特定的特权配置中获取
    if (RANK_PRIVILEGES[identityType] && RANK_PRIVILEGES[identityType][rankId]) {
        return RANK_PRIVILEGES[identityType][rankId];
    }
    
    // 回退到通用特权
    const rankList = getIdentityRankConfig(identityType);
    const rankIndex = rankList.findIndex(r => r.id === rankId);
    
    // 根据爵位等级给予相应特权
    const privileges = {};
    if (rankIndex >= 4) privileges.healthBonus = 5;
    if (rankIndex >= 6) privileges.wealthBonus = 30;
    if (rankIndex >= 8) privileges.debuffImmunity = 1;
    if (rankIndex >= 10) privileges.helpTimesBonus = 1;
    
    return privileges;
}

// 获取爵位列表（用于显示）
function getRankList(identityType = null) {
    return getIdentityRankConfig(identityType || knowledgeState.currentIdentityType);
}

function calculateKnowledgeForAnswer(isCorrect, timeUsed, consecutiveCorrect, levelComplete) {
    let points = 0;
    
    if (isCorrect) {
        points += KNOWLEDGE_CONFIG.correct;
        
        // 连胜加成
        if (consecutiveCorrect >= 10) {
            points += KNOWLEDGE_CONFIG.streak[10];
        } else if (consecutiveCorrect >= 5) {
            points += KNOWLEDGE_CONFIG.streak[5];
        } else if (consecutiveCorrect >= 3) {
            points += KNOWLEDGE_CONFIG.streak[3];
        }
        
        // 时间加成
        if (timeUsed <= 3) {
            points += KNOWLEDGE_CONFIG.timeBonus.fast;
        } else if (timeUsed <= 5) {
            points += KNOWLEDGE_CONFIG.timeBonus.medium;
        }
        
        // 完成关卡加成
        if (levelComplete) {
            points += KNOWLEDGE_CONFIG.levelComplete;
        }
    } else {
        points += KNOWLEDGE_CONFIG.wrong;
    }
    
    return Math.max(0, points);
}

// ===================== 成就系统 =====================
const ACHIEVEMENT_KEY = 'history_survivor_achievements';

// 简化版成就定义（5个核心成就）
const ACHIEVEMENTS = [
    {
        id: 'first_pass',
        name: '初出茅庐',
        description: '首次通关任意篇章',
        icon: '🎖️',
        condition: (state) => state.stats.volumeCount >= 1,
        type: 'volume'
    },
    {
        id: 'streak_5',
        name: '连胜达人',
        description: '连续答对5题',
        icon: '🔥',
        condition: (state) => state.stats.maxConsecutiveCorrect >= 5,
        type: 'streak'
    },
    {
        id: 'perfect_health',
        name: '极限生存',
        description: '生命值≤10通关',
        icon: '💀',
        condition: (state) => state.stats.lowHealthPass && state.stats.passSuccess,
        type: 'special'
    },
    {
        id: 'all_correct',
        name: '知识渊博',
        description: '答对所有题目',
        icon: '🧠',
        condition: (state) => state.stats.allCorrect,
        type: 'special'
    },
    {
        id: 'all_identities',
        name: '全家福',
        description: '体验所有身份',
        icon: '👨‍👩‍👧‍👦',
        condition: (state) => state.stats.identityCount >= 3,
        type: 'collection'
    }
];

// 成就状态管理
let achievementState = {
    unlocked: [],
    unlockTime: {}
};

function loadAchievementState() {
    try {
        const saved = localStorage.getItem(ACHIEVEMENT_KEY);
        if (saved) {
            achievementState = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('加载成就状态失败');
    }
}

function saveAchievementState() {
    try {
        localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(achievementState));
    } catch (e) {
        console.warn('保存成就状态失败');
    }
}

function checkAndUnlockAchievements(gameState, isSuccess) {
    if (!isSuccess) return;
    
    const state = {
        stats: {
            maxConsecutiveCorrect: gameState.consecutiveCorrect || 0,
            lowHealthPass: gameState.health <= 10 && gameState.health > 0,
            allCorrect: gameState.levelPassed === gameState.userSelectedLevelCount,
            identityCount: getUnlockedIdentityCount()
        }
    };
    
    // 初出茅庐：首次通关任意篇章
    if (!achievementState.unlocked.includes('first_pass')) {
        unlockAchievement('first_pass');
    }
    
    // 连胜达人：连续答对5题
    if (!achievementState.unlocked.includes('streak_5') && state.stats.maxConsecutiveCorrect >= 5) {
        unlockAchievement('streak_5');
    }
    
    // 极限生存：生命值≤10通关
    if (!achievementState.unlocked.includes('perfect_health') && state.stats.lowHealthPass) {
        unlockAchievement('perfect_health');
    }
    
    // 知识渊博：答对所有题目
    if (!achievementState.unlocked.includes('all_correct') && state.stats.allCorrect) {
        unlockAchievement('all_correct');
    }
    
    // 全家福：体验所有身份
    if (!achievementState.unlocked.includes('all_identities') && state.stats.identityCount >= 3) {
        unlockAchievement('all_identities');
    }
}

function unlockAchievement(achievementId) {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement || achievementState.unlocked.includes(achievementId)) return;
    
    achievementState.unlocked.push(achievementId);
    achievementState.unlockTime[achievementId] = new Date().toLocaleString();
    saveAchievementState();
    
    // 显示成就解锁弹窗
    showAchievementPopup(achievement);
    
    // 播放成就解锁音效
    AudioSystem.init();
    AudioSystem.play('success');
}

function showAchievementPopup(achievement) {
    const modal = document.createElement('div');
    modal.className = 'modal achievement-modal';
    modal.innerHTML = `
        <div class="modal-content achievement-content">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">成就解锁！</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            <button class="btn" onclick="this.closest('.modal').remove()">确定</button>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 50);
}

function getUnlockedIdentityCount() {
    // 简化：返回已解锁身份的估计数量
    const identities = new Set();
    const saveData = localStorage.getItem('history_survivor_save_data');
    if (saveData) {
        try {
            const data = JSON.parse(saveData);
            if (data?.gameState?.currentIdentity) {
                identities.add(data.gameState.currentIdentity.id);
            }
        } catch (e) {}
    }
    // 如果通关了第一卷的农户，认为已解锁1个身份
    const unlockedVolumes = localStorage.getItem('unlocked_volumes_default_pack');
    if (unlockedVolumes && JSON.parse(unlockedVolumes).includes('kaiyuan')) {
        identities.add('farmer');
        identities.add('merchant');
    }
    return identities.size;
}

function getAchievementStats() {
    return {
        total: ACHIEVEMENTS.length,
        unlocked: achievementState.unlocked.length,
        list: ACHIEVEMENTS.map(a => ({
            ...a,
            isUnlocked: achievementState.unlocked.includes(a.id),
            unlockTime: achievementState.unlockTime[a.id] || null
        }))
    };
}

// ===================== 每日任务系统 =====================
const DAILY_TASK_KEY = 'history_survivor_daily_tasks';

// ===================== 知识点详解系统 =====================
const KNOWLEDGE_DB_KEY = 'history_survivor_knowledge_db';
const KNOWLEDGE_FAVORITE_KEY = 'history_survivor_knowledge_favorites';
const KNOWLEDGE_MASTERED_KEY = 'history_survivor_knowledge_mastered';

let knowledgeDbState = {
    knowledgeList: [],
    favorites: [],
    mastered: [],
    currentFilter: 'all',
    searchKeyword: ''
};

function loadKnowledgeDbState() {
    try {
        const dbSaved = localStorage.getItem(KNOWLEDGE_DB_KEY);
        if (dbSaved) {
            knowledgeDbState.knowledgeList = JSON.parse(dbSaved);
        }
        const favSaved = localStorage.getItem(KNOWLEDGE_FAVORITE_KEY);
        if (favSaved) {
            knowledgeDbState.favorites = JSON.parse(favSaved);
        }
        const masterSaved = localStorage.getItem(KNOWLEDGE_MASTERED_KEY);
        if (masterSaved) {
            knowledgeDbState.mastered = JSON.parse(masterSaved);
        }
    } catch (e) {
        console.warn('加载知识点状态失败');
    }
}

function saveKnowledgeDbState() {
    try {
        localStorage.setItem(KNOWLEDGE_DB_KEY, JSON.stringify(knowledgeDbState.knowledgeList));
        localStorage.setItem(KNOWLEDGE_FAVORITE_KEY, JSON.stringify(knowledgeDbState.favorites));
        localStorage.setItem(KNOWLEDGE_MASTERED_KEY, JSON.stringify(knowledgeDbState.mastered));
    } catch (e) {
        console.warn('保存知识点状态失败');
    }
}

function extractKnowledgeFromGame(gameRecord) {
    const newKnowledgeMap = new Map();
    
    gameRecord.forEach(record => {
        const tags = record.knowledgeTag || [];
        const allOptions = record.allOptions || [];
        
        tags.forEach(tag => {
            if (!newKnowledgeMap.has(tag)) {
                const correctOption = allOptions.find(o => o.isCorrect);
                newKnowledgeMap.set(tag, {
                    id: tag,
                    category: tag,
                    title: tag,
                    content: correctOption?.history || '',
                    source: record.volume,
                    level: record.level,
                    timesEncountered: 0,
                    correctCount: 0,
                    wrongCount: 0,
                    lastEncountered: record.answerTime
                });
            }
            const k = newKnowledgeMap.get(tag);
            k.timesEncountered++;
            if (record.isCorrect) {
                k.correctCount++;
            } else {
                k.wrongCount++;
            }
        });
        
        const userOption = record.userOption;
        if (userOption?.knowledgeTag) {
            userOption.knowledgeTag.forEach(tag => {
                if (newKnowledgeMap.has(tag)) {
                    const k = newKnowledgeMap.get(tag);
                    if (!record.isCorrect) {
                        k.wrongCount++;
                    }
                }
            });
        }
    });
    
    const newList = Array.from(newKnowledgeMap.values());
    newList.forEach(newK => {
        const existing = knowledgeDbState.knowledgeList.find(k => k.id === newK.id);
        if (existing) {
            existing.timesEncountered += newK.timesEncountered;
            existing.correctCount += newK.correctCount;
            existing.wrongCount += newK.wrongCount;
        } else {
            knowledgeDbState.knowledgeList.push(newK);
        }
    });
    
    saveKnowledgeDbState();
}

function toggleFavorite(knowledgeId) {
    const index = knowledgeDbState.favorites.indexOf(knowledgeId);
    if (index > -1) {
        knowledgeDbState.favorites.splice(index, 1);
    } else {
        knowledgeDbState.favorites.push(knowledgeId);
    }
    saveKnowledgeDbState();
    renderKnowledgeList();
}

function toggleMastered(knowledgeId) {
    const index = knowledgeDbState.mastered.indexOf(knowledgeId);
    if (index > -1) {
        knowledgeDbState.mastered.splice(index, 1);
    } else {
        knowledgeDbState.mastered.push(knowledgeId);
    }
    saveKnowledgeDbState();
    renderKnowledgeList();
}

function getKnowledgeCategories() {
    const categories = new Set();
    knowledgeDbState.knowledgeList.forEach(k => {
        if (k.category) {
            categories.add(k.category);
        }
    });
    return Array.from(categories);
}

function filterKnowledge() {
    knowledgeDbState.searchKeyword = document.getElementById('knowledge-search').value.toLowerCase();
    renderKnowledgeList();
}

function filterKnowledgeByCategory(category) {
    knowledgeDbState.currentFilter = category;
    
    document.querySelectorAll('.filter-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
    
    renderKnowledgeList();
}

function renderKnowledgeList() {
    const container = document.getElementById('knowledge-list');
    const totalCount = document.getElementById('knowledge-total-count');
    const masteredCount = document.getElementById('knowledge-mastered-count');
    const favoriteCount = document.getElementById('knowledge-favorite-count');
    
    let filtered = knowledgeDbState.knowledgeList;
    
    if (knowledgeDbState.currentFilter === '收藏') {
        filtered = filtered.filter(k => knowledgeDbState.favorites.includes(k.id));
    } else if (knowledgeDbState.currentFilter !== 'all') {
        filtered = filtered.filter(k => k.category === knowledgeDbState.currentFilter);
    }
    
    if (knowledgeDbState.searchKeyword) {
        filtered = filtered.filter(k => 
            k.title.toLowerCase().includes(knowledgeDbState.searchKeyword) ||
            k.content.toLowerCase().includes(knowledgeDbState.searchKeyword)
        );
    }
    
    totalCount.textContent = knowledgeDbState.knowledgeList.length;
    masteredCount.textContent = knowledgeDbState.mastered.length;
    favoriteCount.textContent = knowledgeDbState.favorites.length;
    
    if (filtered.length === 0) {
        container.innerHTML = `<p class="knowledge-empty">暂无知识点记录</p>`;
        return;
    }
    
    container.innerHTML = filtered.map(k => {
        const isFavorite = knowledgeDbState.favorites.includes(k.id);
        const isMastered = knowledgeDbState.mastered.includes(k.id);
        const correctRate = k.timesEncountered > 0 
            ? ((k.correctCount / k.timesEncountered) * 100).toFixed(0) 
            : 0;
        
        let cardClass = 'knowledge-card';
        if (isMastered) cardClass += ' mastered';
        if (isFavorite) cardClass += ' favorite';
        
        return `
            <div class="${cardClass}">
                <div class="knowledge-card-header">
                    <span class="knowledge-category">${k.category}</span>
                    <div class="knowledge-actions">
                        <button class="mastered-btn ${isMastered ? 'active' : ''}" onclick="toggleMastered('${k.id}')">
                            ${isMastered ? '✓ 已掌握' : '未掌握'}
                        </button>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${k.id}')">
                            ${isFavorite ? '★ 已收藏' : '☆ 收藏'}
                        </button>
                    </div>
                </div>
                <div class="knowledge-card-title">${k.title}</div>
                <div class="knowledge-card-content">${k.content}</div>
                <div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-muted);">
                    正确率: ${correctRate}% (${k.correctCount}/${k.timesEncountered}) | 来源: ${k.source}第${k.level}关
                </div>
            </div>
        `;
    }).join('');
}

function clearAllKnowledge() {
    if (confirm('确定要清除所有知识点记录吗？此操作不可恢复。')) {
        knowledgeDbState.knowledgeList = [];
        knowledgeDbState.favorites = [];
        knowledgeDbState.mastered = [];
        saveKnowledgeDbState();
        renderKnowledgeList();
    }
}

// ===================== 本地排行榜系统 =====================
const LEADERBOARD_KEY = 'history_survivor_leaderboard';

let leaderboardState = {
    scoreRecords: [],
    correctRateRecords: [],
    streakRecords: [],
    currentTab: 'score'
};

function loadLeaderboardState() {
    try {
        const saved = localStorage.getItem(LEADERBOARD_KEY);
        if (saved) {
            leaderboardState = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('加载排行榜状态失败');
    }
}

function saveLeaderboardState() {
    try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboardState));
    } catch (e) {
        console.warn('保存排行榜状态失败');
    }
}

function updateLeaderboard(gameState, isSuccess) {
    if (!isSuccess) return;
    
    const packName = gameState.currentPack?.packInfo?.packName || '未知剧本';
    const volumeName = gameState.currentVolume?.name || '未知篇章';
    const identityName = gameState.currentIdentity?.name || '未知身份';
    const totalScore = calculateScore(gameState, isSuccess).totalScore;
    const correctRate = gameState.gameRecord.length > 0 
        ? (gameState.levelPassed / gameState.gameRecord.length) 
        : 0;
    const maxStreak = gameState.consecutiveCorrect || 0;
    
    const recordTemplate = {
        packName,
        volumeName,
        identityName,
        score: totalScore,
        correctRate: Math.round(correctRate * 100),
        maxStreak,
        date: new Date().toLocaleDateString()
    };
    
    leaderboardState.scoreRecords.push(recordTemplate);
    leaderboardState.correctRateRecords.push({...recordTemplate});
    leaderboardState.streakRecords.push({...recordTemplate});
    
    leaderboardState.scoreRecords.sort((a, b) => b.score - a.score);
    leaderboardState.correctRateRecords.sort((a, b) => b.correctRate - a.correctRate);
    leaderboardState.streakRecords.sort((a, b) => b.maxStreak - a.maxStreak);
    
    const maxRecords = 20;
    leaderboardState.scoreRecords = leaderboardState.scoreRecords.slice(0, maxRecords);
    leaderboardState.correctRateRecords = leaderboardState.correctRateRecords.slice(0, maxRecords);
    leaderboardState.streakRecords = leaderboardState.streakRecords.slice(0, maxRecords);
    
    saveLeaderboardState();
}

function switchLeaderboardTab(tab) {
    leaderboardState.currentTab = tab;
    
    document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.leaderboard === tab);
    });
    
    renderLeaderboard();
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboard-content');
    
    let records = [];
    let valueLabel = '';
    
    switch (leaderboardState.currentTab) {
        case 'score':
            records = leaderboardState.scoreRecords;
            valueLabel = '分';
            break;
        case 'correctRate':
            records = leaderboardState.correctRateRecords;
            valueLabel = '%';
            break;
        case 'streak':
            records = leaderboardState.streakRecords;
            valueLabel = '连';
            break;
    }
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="leaderboard-empty">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">暂无记录</p>
                <p>完成游戏后将自动记录您的成绩</p>
            </div>
        `;
        return;
    }
    
    const rankClass = ['gold', 'silver', 'bronze'];
    
    container.innerHTML = `
        <div class="leaderboard-summary">
            <div class="leaderboard-summary-title">最高分</div>
            <div class="leaderboard-summary-value">${leaderboardState.scoreRecords[0]?.score || 0} 分</div>
        </div>
        <div class="leaderboard-section">
            <div class="leaderboard-section-title">历史最佳</div>
            ${records.slice(0, 10).map((record, index) => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${rankClass[index] || ''}">${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-pack">${record.packName} - ${record.volumeName}</div>
                        <div class="leaderboard-volume">${record.identityName} | ${record.date}</div>
                    </div>
                    <div class="leaderboard-score">
                        <div class="leaderboard-score-value">${leaderboardState.currentTab === 'correctRate' ? record.correctRate + '%' : record.score}</div>
                        <div class="leaderboard-score-label">${valueLabel}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function resetLeaderboard() {
    if (confirm('确定要重置所有排行榜记录吗？此操作不可恢复。')) {
        leaderboardState = {
            scoreRecords: [],
            correctRateRecords: [],
            streakRecords: [],
            currentTab: 'score'
        };
        saveLeaderboardState();
        renderLeaderboard();
    }
}

// 简化版每日任务定义
const DAILY_TASKS = [
    {
        id: 'daily_login',
        name: '每日登录',
        description: '每日首次进入游戏',
        reward: { type: 'helpTimes', value: 1 },
        check: (state) => state.loginCount >= 1
    },
    {
        id: 'daily_answer_3',
        name: '每日答题',
        description: '每日答对3道题',
        reward: { type: 'helpTimes', value: 1 },
        check: (state) => state.correctCount >= 3
    }
];

let dailyTaskState = {
    lastLoginDate: null,
    loginCount: 0,
    correctCount: 0,
    completedTasks: []
};

function loadDailyTaskState() {
    try {
        const saved = localStorage.getItem(DAILY_TASK_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // 检查是否是今天的数据
            const today = new Date().toDateString();
            if (parsed.lastLoginDate === today) {
                dailyTaskState = parsed;
            } else {
                // 重置任务状态
                dailyTaskState = {
                    lastLoginDate: today,
                    loginCount: parsed.loginCount ? parsed.loginCount + 1 : 1,
                    correctCount: 0,
                    completedTasks: []
                };
                saveDailyTaskState();
            }
        } else {
            // 首次登录
            dailyTaskState = {
                lastLoginDate: new Date().toDateString(),
                loginCount: 1,
                correctCount: 0,
                completedTasks: []
            };
            saveDailyTaskState();
        }
    } catch (e) {
        console.warn('加载每日任务状态失败');
    }
}

function saveDailyTaskState() {
    try {
        localStorage.setItem(DAILY_TASK_KEY, JSON.stringify(dailyTaskState));
    } catch (e) {
        console.warn('保存每日任务状态失败');
    }
}

function checkAndCompleteDailyTasks() {
    const rewards = [];
    
    DAILY_TASKS.forEach(task => {
        if (!dailyTaskState.completedTasks.includes(task.id)) {
            if (task.check(dailyTaskState)) {
                dailyTaskState.completedTasks.push(task.id);
                rewards.push(task.reward);
            }
        }
    });
    
    if (rewards.length > 0) {
        saveDailyTaskState();
        
        // 发放奖励
        rewards.forEach(reward => {
            if (reward.type === 'helpTimes' && appState.gameState) {
                updateAttribute('helpTimes', reward.value);
            }
        });
        
        showDailyTaskRewardPopup(rewards);
    }
    
    return rewards;
}

function addDailyCorrectCount() {
    dailyTaskState.correctCount++;
    saveDailyTaskState();
    checkAndCompleteDailyTasks();
}

function showDailyTaskRewardPopup(rewards) {
    const rewardText = rewards.map(r => {
        if (r.type === 'helpTimes') return `求救次数 +${r.value}`;
        return JSON.stringify(r);
    }).join('、');
    
    const modal = document.createElement('div');
    modal.className = 'modal daily-task-modal';
    modal.innerHTML = `
        <div class="modal-content daily-task-content">
            <div class="daily-task-icon">🎁</div>
            <div class="daily-task-title">每日任务奖励！</div>
            <div class="daily-task-desc">完成任务获得：${rewardText}</div>
            <button class="btn" onclick="this.closest('.modal').remove()">确定</button>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 50);
}

function getDailyTaskStats() {
    return {
        tasks: DAILY_TASKS.map(t => ({
            ...t,
            isCompleted: dailyTaskState.completedTasks.includes(t.id)
        })),
        loginCount: dailyTaskState.loginCount,
        correctCount: dailyTaskState.correctCount
    };
}

function updateWelcomeRankDisplay() {
    const rankInfo = getRankInfo(knowledgeState.currentRank);
    const rankList = getRankList();
    
    document.getElementById('welcome-rank-icon').textContent = rankInfo.icon;
    document.getElementById('welcome-rank-name').textContent = rankInfo.name;
    document.getElementById('welcome-rank-title').textContent = rankInfo.title || rankInfo.name;
    document.getElementById('rank-progress-fill').style.width = `${knowledgeState.rankProgress}%`;
    document.getElementById('welcome-rank-points').textContent = `${knowledgeState.totalPoints} 学识`;
    
    // 更新身份类型提示
    const rankDisplayBox = document.getElementById('rank-display-box');
    if (rankDisplayBox) {
        const existingTypeLabel = rankDisplayBox.querySelector('.identity-type-label');
        if (existingTypeLabel) {
            existingTypeLabel.remove();
        }
        
        // 添加身份类型标签
        if (knowledgeState.currentIdentityType) {
            const typeLabel = document.createElement('span');
            typeLabel.className = 'identity-type-label';
            typeLabel.style.fontSize = '0.8rem';
            typeLabel.style.color = 'var(--text-muted)';
            typeLabel.style.marginLeft = '10px';
            
            const identityTypeNames = {
                farmer: '农户',
                merchant: '商户', 
                scholar: '学子',
                common: '通用'
            };
            typeLabel.textContent = `【${identityTypeNames[knowledgeState.currentIdentityType] || '通用'}】`;
            document.getElementById('welcome-rank-name').after(typeLabel);
        }
    }
}

// ===================== 全局状态管理 =====================
let appState = {
    defaultPack: null,
    customPack: null,
    selectedPackType: null,
    selectedPack: null,
    selectedVolume: null,
    selectedIdentity: null,  // 当前选择的身份
    gameState: null,
    countdown: {
        timerId: null,
        remainingTime: 0,
        isRunning: false,
        isPaused: false,
        currentConfig: null,
        overTimeSeconds: 0,      // 超时秒数（用于渐进式扣血）
        totalDamage: 0           // 累计超时扣血
    },
    triggeredEventIds: [],
    tutorial: {
        isActive: false,
        currentStep: 0,
        isCompleted: false
    },
    // 世代传承相关状态
    inheritance: {
        previousVolumeId: null,      // 上一卷ID
        previousIdentityId: null,     // 上一卷身份ID
        previousIdentityType: null,  // 上一卷身份类型
        inheritedPoints: 0,         // 继承的学识积分
        inheritanceRate: 0.3        // 继承比例
    }
};

// ===================== 世代传承系统 =====================
// 获取身份类型（农户/商户/学子）
function getIdentityType(identityId) {
    if (!identityId) return 'common';
    
    const idLower = identityId.toLowerCase();
    
    if (idLower.includes('farmer') || idLower.includes('农') || idLower.includes('耕') || idLower.includes('农户')) {
        return 'farmer';
    } else if (idLower.includes('merchant') || idLower.includes('商') || idLower.includes('贾') || idLower.includes('店') || idLower.includes('掌柜')) {
        return 'merchant';
    } else if (idLower.includes('scholar') || idLower.includes('学子') || idLower.includes('读书') || idLower.includes('儒') || idLower.includes('秀') || idLower.includes('举')) {
        return 'scholar';
    } else if (idLower.includes('official') || idLower.includes('官') || idLower.includes('仕')) {
        return 'scholar'; // 官员走学子路线
    } else if (idLower.includes('doctor') || idLower.includes('郎中') || idLower.includes('医')) {
        return 'scholar'; // 医生走学子路线
    }
    
    return 'common';
}

// 检查身份是否与上一卷匹配（世代传承）
function isIdentityInherited(identity, previousIdentityType) {
    if (!previousIdentityType) return true; // 第一卷无需检查
    
    const currentType = getIdentityType(identity.id);
    
    // 同一类型身份可以传承
    if (currentType === previousIdentityType) return true;
    
    // 如果剧本定义了继承关系，则允许
    if (appState.selectedVolume?.identityInheritance) {
        return appState.selectedVolume.identityInheritance.includes(identity.id);
    }
    
    return false;
}

// 获取继承的身份列表（过滤后的可用身份）
function getInheritedIdentityList(volume) {
    const previousType = appState.inheritance.previousIdentityType;
    
    if (!previousType) {
        return volume.identityList; // 第一卷返回所有身份
    }
    
    // 世代传承：返回与上一卷同类型的身份
    return volume.identityList.filter(identity => isIdentityInherited(identity, previousType));
}

// 计算继承的学识积分
function calculateInheritedPoints(previousVolumeId) {
    if (!previousVolumeId) return 0;
    
    const saveKey = `${previousVolumeId}_completion`;
    const completionData = localStorage.getItem(saveKey);
    
    if (!completionData) return 0;
    
    try {
        const data = JSON.parse(completionData);
        // 继承30%的学识积分
        return Math.floor(data.totalKnowledge * appState.inheritance.inheritanceRate);
    } catch (e) {
        return 0;
    }
}

// 保存通关数据用于传承
function saveCompletionForInheritance(volumeId, totalKnowledge, completedIdentity) {
    const saveKey = `${volumeId}_completion`;
    const data = {
        volumeId: volumeId,
        totalKnowledge: totalKnowledge,
        completedIdentity: completedIdentity,
        completedAt: new Date().toISOString()
    };
    localStorage.setItem(saveKey, JSON.stringify(data));
}

// 应用传承效果
function applyInheritance(volume) {
    // 获取上一卷的信息
    if (volume.inheritFrom) {
        appState.inheritance.previousVolumeId = volume.inheritFrom;
        
        // 从存储中读取上一卷的通关数据
        const saveKey = `${volume.inheritFrom}_completion`;
        const completionData = localStorage.getItem(saveKey);
        
        if (completionData) {
            try {
                const data = JSON.parse(completionData);
                appState.inheritance.previousIdentityId = data.completedIdentity;
                appState.inheritance.previousIdentityType = getIdentityType(data.completedIdentity);
                appState.inheritance.inheritedPoints = Math.floor(data.totalKnowledge * appState.inheritance.inheritanceRate);
            } catch (e) {
                console.warn('读取传承数据失败');
            }
        }
    } else {
        // 重置传承状态
        appState.inheritance = {
            previousVolumeId: null,
            previousIdentityId: null,
            previousIdentityType: null,
            inheritedPoints: 0,
            inheritanceRate: 0.3
        };
    }
}

// 初始化游戏状态
function initGameState() {
    return {
        currentPack: null,
        currentVolume: null,
        currentIdentity: null,
        currentLevel: 1,
        totalLevel: 0,
        userSelectedLevelCount: 0,
        health: 100,
        helpTimes: 3,
        debuff: 0,
        wealth: 0,
        officialRank: 0,
        selectedOption: null,
        levelPassed: 0,
        currentOptions: [],
        consecutiveCorrect: 0,
        pendingDeathOption: null,
        isFromSave: false,
        gameRecord: [],
        currentKnowledge: 0  // 本局获得的学识积分
    };
}

const optionLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ===================== 核心工具函数 =====================
function shuffleArray(array) {
    const newArray = JSON.parse(JSON.stringify(array));
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 【新增】获取卷解锁状态的存储key
function getVolumeUnlockKey(packId) {
    return `${UNLOCK_KEY_PREFIX}${packId}`;
}

// 【新增】检查卷是否已解锁
function isVolumeUnlocked(packId, volumeId, volumeList) {
    const unlockKey = getVolumeUnlockKey(packId);
    const unlockedVolumes = JSON.parse(localStorage.getItem(unlockKey) || '[]');
    
    // 第一卷直接解锁
    const volume = volumeList.find(v => v.id === volumeId);
    if (volume?.isFirst) return true;
    
    // 检查是否在已解锁列表中
    return unlockedVolumes.includes(volumeId);
}

// 【新增】标记卷为已解锁
function unlockVolume(packId, volumeId) {
    const unlockKey = getVolumeUnlockKey(packId);
    const unlockedVolumes = JSON.parse(localStorage.getItem(unlockKey) || '[]');
    if (!unlockedVolumes.includes(volumeId)) {
        unlockedVolumes.push(volumeId);
        localStorage.setItem(unlockKey, JSON.stringify(unlockedVolumes));
    }
}

// 通用属性更新函数
function updateAttribute(key, changeValue) {
    const gameState = appState.gameState;
    const attrConfig = appState.selectedPack.attributeConfig || DEFAULT_ATTRIBUTE_CONFIG;
    const config = attrConfig[key] || DEFAULT_ATTRIBUTE_CONFIG[key] || { max: Infinity, min: -Infinity };

    const currentValue = gameState[key];
    if (currentValue === undefined) {
        console.error(`属性${key}不存在`);
        return { success: false, newValue: currentValue, isFull: false };
    }

    let newValue = currentValue + changeValue;
    newValue = Math.min(config.max, Math.max(config.min, newValue));

    const isFull = changeValue > 0 && currentValue >= config.max;
    const isEmpty = changeValue < 0 && currentValue <= config.min;

    gameState[key] = newValue;

    return {
        success: true,
        key: key,
        name: config.name || key,
        oldValue: currentValue,
        newValue: newValue,
        changeValue: changeValue,
        isFull: isFull,
        isEmpty: isEmpty,
        max: config.max,
        min: config.min
    };
}

function getAttributeConfig(key) {
    const attrConfig = appState.selectedPack.attributeConfig || DEFAULT_ATTRIBUTE_CONFIG;
    return attrConfig[key] || DEFAULT_ATTRIBUTE_CONFIG[key] || { max: Infinity, min: -Infinity };
}

function getCurrentTimeConfig() {
    const gameState = appState.gameState;
    const currentLevelData = gameState.currentIdentity.levelList.find(item => item.level === gameState.currentLevel);
    
    return currentLevelData?.timeLimitConfig 
        || gameState.currentIdentity.timeLimitConfig 
        || gameState.currentVolume.timeLimitConfig
        || gameState.currentPack.timeLimitConfig 
        || DEFAULT_TIME_CONFIG;
}

function checkConditions(conditions) {
    const gameState = appState.gameState;
    const context = { ...gameState };

    try {
        return conditions.every(condition => {
            const expression = condition.replace(/([a-zA-Z0-9_]+)/g, (match) => {
                return context.hasOwnProperty(match) ? `context.${match}` : match;
            });
            return eval(expression);
        });
    } catch (err) {
        console.error("条件解析错误：", condition, err);
        return false;
    }
}

async function checkAndTriggerEvents(triggerTiming) {
    const gameState = appState.gameState;
    const currentLevelData = gameState.currentIdentity.levelList.find(item => item.level === gameState.currentLevel);
    const allEvents = [
        ...(currentLevelData?.specialEvents || []),
        ...(gameState.currentIdentity?.specialEvents || []),
        ...(gameState.currentVolume?.specialEvents || []),
        ...(gameState.currentPack?.specialEvents || [])
    ];

    const validEvents = allEvents.filter(event => {
        if (event.triggerTiming !== triggerTiming) return false;
        if (event.triggerOnce && appState.triggeredEventIds.includes(event.id)) return false;
        return checkConditions(event.triggerConditions || []);
    });

    for (const event of validEvents) {
        await triggerEvent(event);
    }
}

function triggerEvent(event) {
    return new Promise((resolve) => {
        appState.triggeredEventIds.push(event.id);
        
        if (appState.countdown.isRunning && getCurrentTimeConfig().freezeOnModal) {
            pauseCountdown();
        }

        const eventData = event.eventData;
        document.getElementById('event-modal-title').innerText = eventData.title || "特殊事件";
        document.getElementById('event-character').innerText = eventData.character || "";
        document.getElementById('event-content').innerText = eventData.content;
        
        const effectEl = document.getElementById('event-effect');
        let effectList = [];
        if (eventData.effects) {
            const effects = eventData.effects;
            Object.keys(effects).forEach(key => {
                const changeValue = effects[key];
                const result = updateAttribute(key, changeValue);
                if (result.success) {
                    const prefix = changeValue >= 0 ? "增加" : "减少";
                    const absValue = Math.abs(changeValue);
                    effectList.push(`${prefix}${absValue}${result.name}`);
                }
            });
            if (effectList.length > 0) {
                effectEl.innerText = effectList.join(" | ");
                effectEl.style.display = 'block';
            } else {
                effectEl.style.display = 'none';
            }
        } else {
            effectEl.style.display = 'none';
        }

        updateGameUI();
        const eventModal = document.getElementById('event-modal');
        eventModal.classList.add('active');
        window.currentEventResolve = resolve;
    });
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('active');
    if (appState.countdown.isPaused) {
        resumeCountdown();
    }
    if (window.currentEventResolve) {
        window.currentEventResolve();
        window.currentEventResolve = null;
    }
}

function switchPage(pageId) {
    clearCountdown();
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
    
    // 知识点页面特殊处理
    if (pageId === 'knowledge-page') {
        renderKnowledgeList();
    }
    
    // 排行榜页面特殊处理
    if (pageId === 'leaderboard-page') {
        renderLeaderboard();
    }
    
    // 触发新手引导（仅首次）
    if (!appState.tutorial.isCompleted && !appState.tutorial.isActive) {
        if (pageId === 'pack-page') {
            setTimeout(() => startTutorial(), 500);
        }
    }
    
    // 更新新手引导步骤
    if (appState.tutorial.isActive) {
        setTimeout(() => {
            updateTutorialForPage(pageId);
        }, 100);
    }
}

function updateTutorialForPage(pageId) {
    const pageStepMap = {
        'pack-page': 1,      // 选择剧本
        'volume-page': 2,     // 选择卷
        'identity-page': 3,   // 选择身份
        'level-select-page': 4, // 选择关卡
        'game-page': 5,      // 游戏开始
        'end-page': -1       // 结束
    };
    
    const targetStep = pageStepMap[pageId];
    if (targetStep === undefined) return;
    
    if (targetStep === -1) {
        // 页面结束时不显示引导
        document.getElementById('tutorial-overlay').style.display = 'none';
    } else {
        document.getElementById('tutorial-overlay').style.display = 'block';
        showTutorialStep(targetStep);
    }
}

// ===================== 剧本选择核心逻辑 =====================
function bindPackCardEvents() {
    const defaultCard = document.getElementById('default-pack-card');
    const customCard = document.getElementById('custom-pack-card');

    if (defaultCard) defaultCard.onclick = () => selectPack('default');
    if (customCard) customCard.onclick = () => appState.customPack && selectPack('custom');
}

function selectPack(packType) {
    document.querySelectorAll('.pack-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('confirm-pack-btn').disabled = true;

    let targetPack = packType === 'default' ? appState.defaultPack : appState.customPack;
    if (!targetPack) return;

    const targetCard = document.querySelector(`[data-pack-type="${packType}"]`);
    if (targetCard) targetCard.classList.add('selected');
    appState.selectedPackType = packType;
    appState.selectedPack = targetPack;
    document.getElementById('confirm-pack-btn').disabled = false;
}

function confirmPack() {
    if (!appState.selectedPack) return;
    appState.gameState = initGameState();
    appState.triggeredEventIds = [];
    appState.gameState.currentPack = appState.selectedPack;
    
    // 兼容旧剧本，自动生成默认卷
    if (!appState.selectedPack.volumeList || appState.selectedPack.volumeList.length === 0) {
        appState.selectedPack.volumeList = [
            {
                id: "default",
                name: "默认篇章",
                subtitle: appState.selectedPack.packInfo.dynasty || "",
                dynasty: appState.selectedPack.packInfo.dynasty || "",
                description: appState.selectedPack.packInfo.description || "",
                isFirst: true,
                identityList: appState.selectedPack.identityList || [],
                timeLimitConfig: appState.selectedPack.timeLimitConfig,
                specialEvents: appState.selectedPack.specialEvents,
                scoreConfig: appState.selectedPack.scoreConfig
            }
        ];
    }

    // 如果只有一个卷，直接跳过卷选择
    if (appState.selectedPack.volumeList.length === 1) {
        appState.selectedVolume = appState.selectedPack.volumeList[0];
        appState.gameState.currentVolume = appState.selectedVolume;
        
        // 【新增】如果只有一个身份，直接跳过身份选择
        if (appState.selectedVolume.identityList.length === 1) {
            appState.gameState.currentIdentity = appState.selectedVolume.identityList[0];
            goToLevelSelectDirectly(); // 直接去关卡选择
            return;
        }
        
        renderIdentityList();
        document.getElementById('identity-subtitle').innerText = `当前篇章：${appState.selectedVolume.name} | 剧本：${appState.selectedPack.packInfo.packName}`;
        switchPage('identity-page');
    } else {
        // 多个卷，进入卷选择页
        renderVolumeList();
        document.getElementById('volume-pack-subtitle').innerText = `当前剧本：${appState.selectedPack.packInfo.packName}`;
        switchPage('volume-page');
    }
}


// ===================== 默认剧本加载（无内置剧情）=====================
const PACK_LIST_KEY = 'customPackList'; // 自定义剧本列表

async function loadDefaultPack() {
    try {
        const response = await fetch(DEFAULT_PACK_URL);
        if (response.ok) {
            const pack = await response.json();
            if (validatePackFormat(pack, false)) {
                appState.defaultPack = pack;
                updateDefaultPackCard(pack);
                return;
            }
        }
        throw new Error("网络加载失败");
    } catch (err) {
        console.warn("内置剧本文件加载失败，请上传本地剧本或使用云端剧本。");
        appState.defaultPack = null;
        updateDefaultPackCard(null);
    }
}

function updateDefaultPackCard(pack) {
    const card = document.getElementById('default-pack-card');
    
    if (!pack) {
        card.innerHTML = `
            <div class="pack-title" style="color: var(--text-muted);">暂无内置剧情</div>
            <div class="pack-meta">
                <span style="color: var(--warning);">请上传本地剧本或使用云端剧本</span>
            </div>
            <div class="pack-desc">本版本已移除内置剧情，所有剧情以JSON剧本包形式提供。请在下方上传本地剧本文件。</div>
        `;
        card.style.opacity = '0.7';
        return;
    }
    
    card.style.opacity = '1';
    const volumeCount = pack.volumeList?.length || 1;
    card.innerHTML = `
        <div class="pack-title">${pack.packInfo.packName}</div>
        <div class="pack-meta">
            <span>朝代：${pack.packInfo.dynasty}</span>
            <span>篇章数量：${volumeCount}卷</span>
            <span>作者：${pack.packInfo.author || '官方'}</span>
            <span>版本：${pack.packInfo.version || '1.0'}</span>
        </div>
        <div class="pack-desc">${pack.packInfo.description}</div>
    `;
}

// ===================== 自定义剧本上传逻辑 =====================
const uploadInput = document.getElementById('pack-upload');
const uploadArea = document.getElementById('upload-area');

if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    });
}

if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    });
}

function handleFileUpload(file) {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showUploadError("请上传符合格式的JSON文件！");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const customPack = JSON.parse(e.target.result);
            if (validatePackFormat(customPack, true)) {
                // 1. 保存到 CUSTOM_PACK_KEY（兼容存档加载）
                localStorage.setItem(CUSTOM_PACK_KEY, JSON.stringify(customPack));
                
                // 2. 保存到剧本列表（支持多剧本管理）
                const packEntry = saveCustomPackToList(customPack);
                
                appState.customPack = customPack;
                
                // 3. 更新剧本列表显示
                renderCustomPackCards();
                
                // 4. 自动选中新上传的剧本
                setTimeout(() => {
                    selectCustomPackFromList(packEntry);
                    showUploadError(`剧本「${packEntry.packName}」上传成功！已自动选中，可点击确认进入游戏。`, false);
                }, 100);
            }
        } catch (err) {
            showUploadError("JSON格式解析失败！请检查文件格式是否正确。");
            console.error(err);
        }
    };
    reader.readAsText(file);
}

function renderCustomPackCard(pack) {
    const customCard = document.getElementById('custom-pack-card');
    const volumeCount = pack.volumeList?.length || 1;
    customCard.style.display = 'block';
    customCard.innerHTML = `
        <div class="pack-title">${pack.packInfo.packName}（自定义剧本）</div>
        <div class="pack-meta">
            <span>朝代：${pack.packInfo.dynasty || '自定义'}</span>
            <span>篇章数量：${volumeCount}卷</span>
            <span>作者：${pack.packInfo.author || '自定义'}</span>
            <span>版本：${pack.packInfo.version || '1.0'}</span>
        </div>
        <div class="pack-desc">${pack.packInfo.description || '自定义历史生存剧本'}</div>
    `;
    bindPackCardEvents();
}


// ===================== 自定义剧本多存档管理 =====================
function getCustomPackList() {
    try {
        const listStr = localStorage.getItem(CUSTOM_PACK_LIST_KEY);
        return listStr ? JSON.parse(listStr) : [];
    } catch (err) {
        console.error("读取自定义剧本列表失败", err);
        return [];
    }
}

// 【重写】保存自定义剧本到列表
function saveCustomPackToList(pack) {
    const list = getCustomPackList();
    const packId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const packEntry = {
        id: packId,
        packName: pack.packInfo.packName,
        dynasty: pack.packInfo.dynasty || "自定义",
        author: pack.packInfo.author || "自定义",
        version: pack.packInfo.version || "1.0",
        description: pack.packInfo.description || "自定义历史生存剧本",
        uploadTime: new Date().toLocaleString(),
        packData: pack // 完整的剧本数据
    };
    
    list.unshift(packEntry); // 新剧本放在最前面
    localStorage.setItem(CUSTOM_PACK_LIST_KEY, JSON.stringify(list));
    return packEntry;
}

// 【重写】删除自定义剧本
function deleteCustomPack(packId) {
    let list = getCustomPackList();
    list = list.filter(p => p.id !== packId);
    localStorage.setItem(CUSTOM_PACK_LIST_KEY, JSON.stringify(list));
    renderCustomPackCards();
    if (appState.selectedPackType === 'custom' && appState.customPack?.id === packId) {
        appState.customPack = null;
        appState.selectedPackType = null;
        appState.selectedPack = null;
        document.getElementById('confirm-pack-btn').disabled = true;
    }
}

// 【重写】渲染所有自定义剧本卡片
function renderCustomPackCards() {
    const customContainer = document.getElementById('custom-pack-container');
    if (!customContainer) return;
    
    const list = getCustomPackList();
    customContainer.innerHTML = '';
    
    if (list.length === 0) {
        customContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">暂无上传的自定义剧本</p>';
        return;
    }
    
    list.forEach(packEntry => {
        const card = document.createElement('div');
        card.className = 'pack-card';
        card.dataset.packId = packEntry.id;
        card.dataset.packType = 'custom';
        
        const volumeCount = packEntry.packData.volumeList?.length || 1;
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div class="pack-title">${packEntry.packName}</div>
                    <div class="pack-meta">
                        <span>朝代：${packEntry.dynasty}</span>
                        <span>篇章数量：${volumeCount}卷</span>
                        <span>作者：${packEntry.author}</span>
                        <span>上传时间：${packEntry.uploadTime}</span>
                    </div>
                    <div class="pack-desc">${packEntry.description}</div>
                </div>
                <button class="btn btn-danger" style="margin-left: 15px; padding: 8px 15px; font-size: 0.9rem;" onclick="event.stopPropagation(); confirmDeletePack('${packEntry.id}', '${packEntry.packName}')">删除</button>
            </div>
        `;
        
        card.onclick = () => selectCustomPackFromList(packEntry);
        customContainer.appendChild(card);
    });
}

// 【新增】从列表中选择自定义剧本
function selectCustomPackFromList(packEntry) {
    document.querySelectorAll('.pack-card').forEach(card => card.classList.remove('selected'));
    const targetCard = document.querySelector(`[data-pack-id="${packEntry.id}"]`);
    if (targetCard) targetCard.classList.add('selected');
    
    appState.customPack = packEntry.packData;
    appState.selectedPackType = 'custom';
    appState.selectedPack = packEntry.packData;
    document.getElementById('confirm-pack-btn').disabled = false;
}

// 【新增】确认删除剧本
function confirmDeletePack(packId, packName) {
    if (confirm(`确定要删除剧本「${packName}」吗？此操作不可恢复！`)) {
        deleteCustomPack(packId);
    }
}




// ===================== 剧本格式校验 =====================
function validatePackFormat(pack, showError) {
    const errorTip = (msg) => {
        if (showError) showUploadError(`剧本格式错误：${msg}`);
        return false;
    };

    if (!pack.packInfo) return errorTip("缺少packInfo剧本基础信息字段");
    if (!pack.packInfo.packName) return errorTip("缺少剧本名称packName");

    const hasVolumeList = pack.volumeList && Array.isArray(pack.volumeList) && pack.volumeList.length > 0;
    const hasOldIdentityList = pack.identityList && Array.isArray(pack.identityList) && pack.identityList.length > 0;

    if (!hasVolumeList && !hasOldIdentityList) {
        return errorTip("必须包含volumeList卷列表，或旧版identityList身份列表");
    }

    if (hasVolumeList) {
        // 检查是否有第一卷
        const hasFirstVolume = pack.volumeList.some(v => v.isFirst);
        if (!hasFirstVolume) {
            return errorTip("volumeList中必须有一个卷标记为isFirst: true");
        }

        for (let i = 0; i < pack.volumeList.length; i++) {
            const volume = pack.volumeList[i];
            if (!volume.id) return errorTip(`第${i+1}个卷缺少唯一id字段`);
            if (!volume.name) return errorTip(`第${i+1}个卷缺少名称name字段`);
            if (!volume.identityList || !Array.isArray(volume.identityList) || volume.identityList.length === 0) {
                return errorTip(`卷「${volume.name}」缺少identityList身份列表，或身份列表为空`);
            }

            for (let j = 0; j < volume.identityList.length; j++) {
                const identity = volume.identityList[j];
                if (!identity.id) return errorTip(`卷「${volume.name}」第${j+1}个身份缺少唯一id字段`);
                if (!identity.name) return errorTip(`卷「${volume.name}」第${j+1}个身份缺少名称name字段`);
                if (!identity.levelList || !Array.isArray(identity.levelList) || identity.levelList.length === 0) {
                    return errorTip(`卷「${volume.name}」身份「${identity.name}」缺少levelList关卡列表，或关卡列表为空`);
                }

                for (let k = 0; k < identity.levelList.length; k++) {
                    const level = identity.levelList[k];
                    if (!level.level) return errorTip(`卷「${volume.name}」身份「${identity.name}」第${k+1}个关卡缺少level序号字段`);
                    if (!level.story) return errorTip(`卷「${volume.name}」身份「${identity.name}」第${level.level}关缺少story剧情字段`);
                    
                    const hasOptionPool = level.optionPool && Array.isArray(level.optionPool) && level.optionPool.length >= 3;
                    const hasFixedOptions = level.options && Array.isArray(level.options) && level.options.length >= 2;
                    if (!hasOptionPool && !hasFixedOptions) {
                        return errorTip(`卷「${volume.name}」身份「${identity.name}」第${level.level}关必须包含optionPool选项池或options固定选项`);
                    }
                }
            }
        }
    }

    return true;
}


function showUploadError(msg, isError = true) {
    const errorBox = document.getElementById('upload-error');
    errorBox.style.display = 'block';
    errorBox.className = isError ? 'error-tip' : 'format-tip';
    errorBox.innerText = msg;
}

// ===================== 卷选择逻辑（带解锁机制和世代传承） =====================
function renderVolumeList() {
    const volumeGrid = document.getElementById('volume-grid');
    const packId = appState.selectedPackType === 'default' ? 'default_pack' : 'custom_pack';
    volumeGrid.innerHTML = '';
    
    appState.selectedPack.volumeList.forEach(volume => {
        const isUnlocked = isVolumeUnlocked(packId, volume.id, appState.selectedPack.volumeList);
        
        // 检查是否有传承信息
        let inheritanceInfo = '';
        if (volume.inheritFrom && isUnlocked) {
            const previousVolume = appState.selectedPack.volumeList.find(v => v.id === volume.inheritFrom);
            if (previousVolume) {
                inheritanceInfo = `<div class="inheritance-hint">传承自：${previousVolume.name}</div>`;
            }
        }
        
        const card = document.createElement('div');
        card.className = `volume-card ${isUnlocked ? '' : 'locked'}`;
        card.dataset.volumeId = volume.id;
        if (isUnlocked) {
            card.onclick = () => selectVolume(volume);
        }
        
        // 获取该卷的身份信息
        const identityCount = volume.identityList.length;
        const totalLevels = volume.identityList.reduce((sum, id) => sum + (id.levelList?.length || 0), 0);
        
        card.innerHTML = `
            <div>
                <div class="volume-name">${volume.name}</div>
                <div class="volume-subtitle">${volume.subtitle || volume.dynasty}</div>
                <div class="volume-desc">${volume.description}</div>
                ${inheritanceInfo}
            </div>
            <div class="volume-meta">
                <span>身份数量：${identityCount}个</span>
                <span>关卡总数：${totalLevels}关</span>
            </div>
        `;
        volumeGrid.appendChild(card);
    });
}

function selectVolume(volume) {
    document.querySelectorAll('.volume-card').forEach(card => card.classList.remove('selected'));
    const targetCard = document.querySelector(`[data-volume-id="${volume.id}"]`);
    if (targetCard) targetCard.classList.add('selected');
    appState.selectedVolume = volume;
    appState.gameState.currentVolume = volume;
    
    // 应用世代传承
    applyInheritance(volume);
    
    document.getElementById('confirm-volume-btn').disabled = false;
}

function confirmVolume() {
    if (!appState.selectedVolume) return;
    
    // 【世代传承】获取可用的身份列表
    const availableIdentities = getInheritedIdentityList(appState.selectedVolume);
    
    // 如果只有一个身份，直接跳过身份选择
    if (availableIdentities.length === 1) {
        appState.gameState.currentIdentity = availableIdentities[0];
        // 更新爵位身份类型
        const identityType = getIdentityType(availableIdentities[0].id);
        updateRankFromPoints(identityType);
        goToLevelSelectDirectly();
        return;
    }
    
    // 如果没有可用身份（世代传承限制），提示用户
    if (availableIdentities.length === 0) {
        alert('当前篇章的身份与上一卷不匹配，无法传承。请选择其他篇章。');
        return;
    }
    
    renderIdentityList(availableIdentities);
    document.getElementById('identity-subtitle').innerText = `当前篇章：${appState.selectedVolume.name} | 剧本：${appState.selectedPack.packInfo.packName}`;
    
    // 显示传承提示
    if (appState.inheritance.inheritedPoints > 0) {
        document.getElementById('identity-subtitle').innerHTML += `<br><span style="color: var(--primary);">传承学识：+${appState.inheritance.inheritedPoints}点</span>`;
    }
    
    switchPage('identity-page');
}


// ===================== 身份选择逻辑（支持世代传承） =====================
function renderIdentityList(identityList = null) {
    const identityGrid = document.getElementById('identity-grid');
    const listToRender = identityList || appState.selectedVolume.identityList;
    
    identityGrid.innerHTML = '';
    
    // 世代传承：显示身份类型标签
    const previousType = appState.inheritance.previousIdentityType;
    if (previousType) {
        const typeHint = document.createElement('div');
        typeHint.className = 'inheritance-type-hint';
        typeHint.innerHTML = `<span>请选择与上一卷【${getIdentityTypeName(previousType)}】传承的身份</span>`;
        identityGrid.appendChild(typeHint);
    }
    
    listToRender.forEach(identity => {
        const card = document.createElement('div');
        card.className = 'identity-card';
        card.dataset.identityId = identity.id;
        card.onclick = () => selectIdentity(identity);
        
        // 显示身份类型标签
        const identityType = getIdentityType(identity.id);
        const typeTag = getIdentityTypeName(identityType);
        
        card.innerHTML = `
            <div class="identity-type-tag">${typeTag}</div>
            <div class="identity-name">${identity.name}</div>
            <div class="identity-desc">${identity.description}</div>
        `;
        identityGrid.appendChild(card);
    });
}

// 获取身份类型的中文名称
function getIdentityTypeName(type) {
    const typeNames = {
        farmer: '农户',
        merchant: '商户',
        scholar: '学子',
        common: '通用'
    };
    return typeNames[type] || '通用';
}

function selectIdentity(identity) {
    document.querySelectorAll('.identity-card').forEach(card => card.classList.remove('selected'));
    const targetCard = document.querySelector(`[data-identity-id="${identity.id}"]`);
    if (targetCard) targetCard.classList.add('selected');
    appState.gameState.currentIdentity = identity;
    appState.selectedIdentity = identity;
    
    // 更新爵位系统身份类型
    const identityType = getIdentityType(identity.id);
    updateRankFromPoints(identityType);
    
    // 应用传承学识积分
    if (appState.inheritance.inheritedPoints > 0) {
        knowledgeState.totalPoints += appState.inheritance.inheritedPoints;
        saveKnowledgeState();
    }
    
    document.getElementById('confirm-identity-btn').disabled = false;
}


// 【新增】直接进入关卡选择页（跳过身份选择）
function goToLevelSelectDirectly() {
    const totalLevel = appState.gameState.currentIdentity.levelList.length;
    document.getElementById('level-select-identity').innerText = `当前身份：${appState.gameState.currentIdentity.name}`;
    document.getElementById('total-level-count').innerText = totalLevel;
    document.getElementById('level-slider').max = totalLevel;
    document.getElementById('level-slider').value = totalLevel;
    document.getElementById('selected-level-count').innerText = totalLevel;
    
    const slider = document.getElementById('level-slider');
    const display = document.getElementById('selected-level-count');
    slider.oninput = () => display.innerText = slider.value;
    switchPage('level-select-page');
}


// ===================== 关卡数量选择逻辑 =====================
function goToLevelSelect() {
    if (!appState.gameState.currentIdentity) return;
    const totalLevel = appState.gameState.currentIdentity.levelList.length;
    document.getElementById('level-select-identity').innerText = `当前身份：${appState.gameState.currentIdentity.name}`;
    document.getElementById('total-level-count').innerText = totalLevel;
    document.getElementById('level-slider').max = totalLevel;
    document.getElementById('level-slider').value = totalLevel;
    document.getElementById('selected-level-count').innerText = totalLevel;
    
    const slider = document.getElementById('level-slider');
    const display = document.getElementById('selected-level-count');
    slider.oninput = () => display.innerText = slider.value;
    switchPage('level-select-page');
}

// ===================== 随机选项抽取函数 =====================
function getRandomOptions(optionPool) {
    const correctOptions = optionPool.filter(opt => opt.type === 'correct');
    const minorWrongOptions = optionPool.filter(opt => opt.type === 'minor_wrong');
    const majorWrongOptions = optionPool.filter(opt => opt.type === 'major_wrong');
    const deadlyOptions = optionPool.filter(opt => opt.type === 'deadly');
    const nonDeadlyWrongOptions = [...minorWrongOptions, ...majorWrongOptions];

    if (correctOptions.length === 0 || nonDeadlyWrongOptions.length < OPTION_DRAW_COUNT - 1) {
        console.error("选项池格式错误，使用备用选项");
        return optionPool.slice(0, OPTION_DRAW_COUNT);
    }

    const selectedCorrect = correctOptions[Math.floor(Math.random() * correctOptions.length)];
    const needWrongCount = OPTION_DRAW_COUNT - 1;
    let selectedWrong = [];

    const shouldIncludeDeadly = deadlyOptions.length > 0 && Math.random() < DEADLY_OPTION_CHANCE;
    if (shouldIncludeDeadly) {
        const selectedDeadly = deadlyOptions[Math.floor(Math.random() * deadlyOptions.length)];
        const shuffledNonDeadly = shuffleArray(nonDeadlyWrongOptions);
        selectedWrong = [selectedDeadly, ...shuffledNonDeadly.slice(0, needWrongCount - 1)];
    } else {
        const shuffledWrong = shuffleArray(nonDeadlyWrongOptions);
        selectedWrong = shuffledWrong.slice(0, needWrongCount);
    }

    const finalOptions = [selectedCorrect, ...selectedWrong];
    return shuffleArray(finalOptions);
}

// ===================== 倒计时系统（渐进式扣血） =====================
// 渐进式扣血配置：超时后每段时间的扣血速度
const PROGRESIVE_DAMAGE_CONFIG = {
    phases: [
        { duration: 5, damagePerSecond: 1 },    // 前5秒：每秒扣1点
        { duration: 5, damagePerSecond: 2 },    // 接下来5秒：每秒扣2点
        { duration: 5, damagePerSecond: 3 },    // 接下来5秒：每秒扣3点
        { duration: Infinity, damagePerSecond: 5 } // 之后：每秒扣5点（逐渐加速到致命）
    ]
};

function startCountdown() {
    clearCountdown();
    const timeConfig = getCurrentTimeConfig();
    appState.countdown.currentConfig = timeConfig;
    appState.countdown.remainingTime = timeConfig.baseTime;
    appState.countdown.isRunning = true;
    appState.countdown.isPaused = false;
    appState.countdown.overTimeSeconds = 0; // 超时秒数
    appState.countdown.totalDamage = 0;     // 累计超时扣血

    updateCountdownUI();

    appState.countdown.timerId = setInterval(() => {
        if (appState.countdown.isPaused) return;

        appState.countdown.remainingTime -= 1;
        updateCountdownUI();

        if (appState.countdown.remainingTime < 0) {
            // 渐进式扣血
            appState.countdown.overTimeSeconds++;
            const damage = calculateProgressiveDamage(appState.countdown.overTimeSeconds);
            appState.countdown.totalDamage += damage;
            
            const result = updateAttribute('health', -damage);
            updateHealthUI();

            // 显示扣血动画
            showDamageAnimation(damage);

            // 【修复Bug】生命值归零时立即结束游戏
            if (appState.gameState.health <= 0) {
                clearCountdown();
                // 强制设置health为0
                appState.gameState.health = 0;
                updateHealthUI();
                gameEnd(false, "你答题超时，耗尽了所有生命值，在历史的长河中黯然落幕。");
                return;
            }
        }
    }, 1000);
}

// 计算渐进式扣血值
function calculateProgressiveDamage(overTimeSeconds) {
    const phases = PROGRESIVE_DAMAGE_CONFIG.phases;
    let accumulatedTime = 0;
    
    for (const phase of phases) {
        if (overTimeSeconds < accumulatedTime + phase.duration) {
            return phase.damagePerSecond;
        }
        accumulatedTime += phase.duration;
    }
    return phases[phases.length - 1].damagePerSecond;
}

// 显示扣血动画
function showDamageAnimation(damage) {
    const healthText = document.getElementById('health-text');
    if (healthText) {
        healthText.classList.add('damage-flash');
        setTimeout(() => healthText.classList.remove('damage-flash'), 300);
    }
}

function updateCountdownUI() {
    const countdownText = document.getElementById('countdown-text');
    const remainingTime = appState.countdown.remainingTime;
    const timeConfig = appState.countdown.currentConfig;

    countdownText.classList.remove('warning', 'danger');
    
    if (remainingTime >= 0) {
        countdownText.innerText = `${remainingTime}s`;
        if (remainingTime <= timeConfig.baseTime * 0.3) {
            countdownText.classList.add('warning');
        }
    } else {
        // 超时状态：显示超时秒数和当前扣血速度
        const currentDamage = calculateProgressiveDamage(appState.countdown.overTimeSeconds || 1);
        countdownText.innerText = `超时 ${Math.abs(remainingTime)}s [-${currentDamage}/s]`;
        countdownText.classList.add('danger');
    }
}

function pauseCountdown() {
    appState.countdown.isPaused = true;
}

function resumeCountdown() {
    appState.countdown.isPaused = false;
}

function clearCountdown() {
    if (appState.countdown.timerId) {
        clearInterval(appState.countdown.timerId);
        appState.countdown.timerId = null;
    }
    appState.countdown.isRunning = false;
    appState.countdown.isPaused = false;
    appState.countdown.remainingTime = 0;
    appState.countdown.currentConfig = null;
    appState.countdown.overTimeSeconds = 0;
    appState.countdown.totalDamage = 0;
}

// ===================== 游戏核心逻辑 =====================
function startGame() {
    const selectedLevelCount = parseInt(document.getElementById('level-slider')?.value || appState.gameState.userSelectedLevelCount);
    const totalLevel = appState.gameState.currentIdentity.levelList.length;
    const finalLevelCount = Math.max(1, Math.min(selectedLevelCount, totalLevel));

    if (!appState.gameState.isFromSave) {
        appState.gameState = initGameState();
        appState.triggeredEventIds = [];
        // 重置当前学识积分
        knowledgeState.currentPoints = 0;
        appState.gameState.currentPack = appState.selectedPack;
        appState.gameState.currentVolume = appState.selectedVolume;
        appState.gameState.currentIdentity = appState.selectedVolume.identityList.find(
            id => id.id === document.querySelector('.identity-card.selected')?.dataset.identityId
        ) || appState.selectedVolume.identityList[0];
        appState.gameState.totalLevel = totalLevel;
        appState.gameState.userSelectedLevelCount = finalLevelCount;
    }

    updateGameUI();
    loadLevel(appState.gameState.currentLevel);
    switchPage('game-page');
}

async function loadLevel(levelNum) {
    const levelList = appState.gameState.currentIdentity.levelList;
    if (levelNum > appState.gameState.userSelectedLevelCount) {
        gameEnd(appState.gameState.health > 0, appState.gameState.health > 0 
            ? `你成功走完了${appState.gameState.userSelectedLevelCount}关的${appState.gameState.currentVolume.dynasty}人生历程，凭借对历史、制度、规则的精准把握，顺利通关！`
            : "你虽然走完了所选关卡，但生命值耗尽，最终没能安享晚年，抱憾而终。"
        );
        return;
    }

    // 负面状态扣血
    if (appState.gameState.debuff > 0) {
        const debuffDamage = appState.gameState.debuff * 5;
        updateAttribute('health', -debuffDamage);
        updateHealthUI();

        if (appState.gameState.health <= 0) {
            gameEnd(false, "你长期做出错误的选择，负面状态不断叠加，最终耗尽了生机，人生提前落幕。");
            return;
        }
    }

    const currentLevelData = levelList.find(item => item.level === levelNum);
    if (!currentLevelData) {
        alert("关卡数据错误！");
        return;
    }

    // 选项处理
    let finalOptions = [];
    if (!appState.gameState.isFromSave && appState.gameState.currentOptions.length === 0) {
        if (currentLevelData.optionPool && Array.isArray(currentLevelData.optionPool) && currentLevelData.optionPool.length >= 3) {
            finalOptions = getRandomOptions(currentLevelData.optionPool);
        } else {
            finalOptions = shuffleArray(currentLevelData.options);
        }
    } else {
        finalOptions = appState.gameState.currentOptions;
        appState.gameState.isFromSave = false;
    }

    appState.gameState.currentOptions = finalOptions;

    // 更新UI
    document.getElementById('volume-text').innerText = appState.gameState.currentVolume.name;
    document.getElementById('story-text').innerText = currentLevelData.story;
    document.getElementById('level-text').innerText = `${levelNum}/${appState.gameState.userSelectedLevelCount}`;
    document.getElementById('progress-fill').style.width = `${(levelNum / appState.gameState.userSelectedLevelCount) * 100}%`;
    
    // 【美化版】渲染选项
    const optionsBox = document.getElementById('options-box');
    optionsBox.innerHTML = '';
    finalOptions.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.optionIndex = index;

        const letter = optionLetters[index];
        
        // 【美化】重构的HTML结构
        let htmlContent = '';
        
        // 1. 选项头部（字母+文字）
        htmlContent += '<div class="option-header">';
        htmlContent += `<span class="option-letter">${letter}</span>`;
        
        // 如果不是仅图片模式，显示文字
        if (!option.imageOnly || option.imageOnly !== true) {
            htmlContent += `<span class="option-text">${option.text}</span>`;
        }
        htmlContent += '</div>';
        
        // 2. 如果有图片，显示图片
        if (option.image && option.image.trim() !== '') {
            htmlContent += `
                <div class="option-image-wrapper">
                    <img 
                        src="${option.image}" 
                        alt="选项${letter}" 
                        class="option-image"
                        onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'option-image-fallback\\'>🖼️ 图片加载失败<br><span style=\\'font-size:0.9rem\\'>请根据文字选项选择</span></div>';"
                    >
                </div>
            `;
        }
        
        // 3. 如果是仅图片模式，在图片下方也显示一点提示文字
        if (option.imageOnly === true && option.image && option.image.trim() !== '') {
            htmlContent += `<div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-top: -8px;">（点击图片选择）</div>`;
        }
        
        btn.innerHTML = htmlContent;
        btn.onclick = () => selectOption(option, index, currentLevelData);
        optionsBox.appendChild(btn);
    });




    // 触发关卡开始前的事件
    await checkAndTriggerEvents('beforeLevelStart');

    // 启动倒计时
    startCountdown();
}

async function selectOption(option, index, levelData) {
    if (appState.gameState.selectedOption) return;
    clearCountdown();
    appState.gameState.selectedOption = option;

    // 初始化音效系统（需要用户交互后才能播放）
    AudioSystem.init();
    
    // 禁用所有选项
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.optionIndex == index) {
            btn.classList.add(option.isCorrect ? 'correct' : 'wrong');
        }
    });
    
    // 播放音效
    if (option.isCorrect) {
        AudioSystem.play('correct');
    } else if (option.endGame) {
        AudioSystem.play('fail');
    } else {
        AudioSystem.play('wrong');
    }

    // 记录闯关数据
    const correctOption = appState.gameState.currentOptions.find(opt => opt.isCorrect);
    appState.gameState.gameRecord.push({
        level: appState.gameState.currentLevel,
        volume: appState.gameState.currentVolume.name,
        story: levelData.story,
        knowledgeTag: levelData.knowledgeTag || [],
        allOptions: JSON.parse(JSON.stringify(appState.gameState.currentOptions)),
        userOption: JSON.parse(JSON.stringify(option)),
        correctOption: JSON.parse(JSON.stringify(correctOption)),
        isCorrect: option.isCorrect,
        answerTime: new Date().toLocaleString(),
        timeUsed: getCurrentTimeConfig().baseTime - appState.countdown.remainingTime
    });

    // 必死选项判定
    if (option.endGame) {
        appState.gameState.pendingDeathOption = option;
        showDeathModal(option);
        return;
    }

    // 【修复】处理普通选项，不使用 await，避免阻塞
    processNormalOption(option);
}


function processNormalOption(option) {
    // 使用通用属性更新函数
    if (option.healthChange !== undefined) {
        updateAttribute('health', option.healthChange);
    }
    if (option.debuffChange !== undefined) {
        updateAttribute('debuff', option.debuffChange);
    }
    if (option.wealthChange !== undefined) {
        updateAttribute('wealth', option.wealthChange);
    }
    if (option.officialRankChange !== undefined) {
        updateAttribute('officialRank', option.officialRankChange);
    }
    if (option.satietyChange !== undefined) {
        updateAttribute('satiety', option.satietyChange);
    }
    if (option.moraleChange !== undefined) {
        updateAttribute('morale', option.moraleChange);
    }

    // 连续答题正确计数
    let healthRecovered = 0;
    let recoverText = "";
    if (option.isCorrect) {
        appState.gameState.consecutiveCorrect++;
        appState.gameState.levelPassed++;
        
        // 每日任务：答对计数
        addDailyCorrectCount();
        
        // 计算学识积分
        const timeUsed = getCurrentTimeConfig().baseTime - appState.countdown.remainingTime;
        const knowledgePoints = calculateKnowledgeForAnswer(
            true,
            timeUsed,
            appState.gameState.consecutiveCorrect,
            true
        );
        const knowledgeGained = addKnowledgePoints(knowledgePoints, 'answer');
        
        if (appState.gameState.consecutiveCorrect >= 4) {
            const recoverResult = updateAttribute('health', 10);
            healthRecovered = recoverResult.newValue - recoverResult.oldValue;
            recoverText = recoverResult.isFull ? "生命值已满，无法继续恢复" : `恢复10点生命值`;
        } else if (appState.gameState.consecutiveCorrect >= 3) {
            const recoverResult = updateAttribute('health', 5);
            healthRecovered = recoverResult.newValue - recoverResult.oldValue;
            recoverText = recoverResult.isFull ? "生命值已满，无法继续恢复" : `恢复5点生命值`;
        }
    } else {
        appState.gameState.consecutiveCorrect = 0;
        // 答错也扣学识积分
        addKnowledgePoints(KNOWLEDGE_CONFIG.wrong, 'wrong_answer');
    }

    updateGameUI();

    // 【修复Bug】死亡判定：生命值归零时立即结束游戏
    if (appState.gameState.health <= 0) {
        appState.gameState.health = 0;
        updateHealthUI();
        // 立即结束游戏，不等待
        gameEnd(false, "你耗尽了所有生命值，在历史的长河中黯然落幕。");
        return;
    }

    // 直接弹出知识点弹窗，不等待事件
    setTimeout(() => {
        const title = option.isCorrect ? "选择正确！" : "选择错误";
        let content = option.isCorrect 
            ? `<div class="success-box">${option.result}</div><br><strong>历史知识点：</strong>${option.history}`
            : `<div class="warning-box">${option.result}</div><br><strong>历史知识点：</strong>${option.history}`;
        
        if (option.isCorrect && appState.gameState.consecutiveCorrect >= 3) {
            content = `<div class="success-box">${option.result}</div>
                <div class="tip-box">
                    <strong>🎉 连续${appState.gameState.consecutiveCorrect}次答题正确！</strong><br>
                    ${recoverText}
                </div>
                <br><strong>历史知识点：</strong>${option.history}`;
        }
        
        showHistoryModal(title, content);
    }, 500);
}


function showDeathModal(option) {
    const deathModal = document.getElementById('death-modal');
    const deathModalText = document.getElementById('death-modal-text');
    const deathModalButtons = document.getElementById('death-modal-buttons');
    
    let content = `<div class="warning-box">${option.result}</div>`;
    
    if (appState.gameState.helpTimes > 0) {
        content += `
            <div class="tip-box">
                <strong>你还有 <span style="color: var(--primary); font-size: 1.3rem;">${appState.gameState.helpTimes}</span> 次求救机会！</strong><br>
                使用求救机会可以：<br>
                1. 消耗1次求救机会<br>
                2. 生命值降低到1点<br>
                3. 继续当前游戏
            </div>
            <p>你要使用求救机会，还是放弃？</p>
        `;
        
        deathModalButtons.innerHTML = `
            <button class="btn btn-success" onclick="useDeathHelp()">使用求救机会（消耗1次）</button>
            <button class="btn btn-danger" onclick="acceptDeath()">放弃，结束游戏</button>
        `;
    } else {
        content += `
            <div class="warning-box">
                <strong>你已经没有求救机会了...</strong>
            </div>
            <p><strong>为什么这个选择是致命的：</strong></p>
            <p>${option.endDesc || "这个选择在当时的历史背景下是致命的错误，违反了当时的法律和规则，最终导致了你的死亡。"}</p>
        `;
        
        deathModalButtons.innerHTML = `
            <button class="btn btn-danger" onclick="acceptDeath()">查看结局</button>
        `;
    }
    
    deathModalText.innerHTML = content;
    deathModal.classList.add('active');
}

function useDeathHelp() {
    document.getElementById('death-modal').classList.remove('active');
    
    updateAttribute('helpTimes', -1);
    appState.gameState.health = 1;
    appState.gameState.consecutiveCorrect = 0;
    appState.gameState.debuff = 0;
    updateGameUI();
    
    const option = appState.gameState.pendingDeathOption;
    const title = "死里逃生！";
    const content = `
        <div class="warning-box">
            <strong>⚠️ 这个选择原本是致命的！</strong><br>
            ${option.result}
        </div>
        <div class="tip-box">
            <strong>你使用了1次求救机会，死里逃生！</strong><br>
            - 消耗1次求救机会<br>
            - 生命值降低到1点<br>
            - 清除所有负面状态<br>
            - 连续正确计数重置<br>
            <br>
            <strong>请谨慎选择，继续前行！</strong>
        </div>
        <br><strong>历史知识点：</strong>${option.history}
    `;
    
    appState.gameState.pendingDeathOption = null;
    showHistoryModal(title, content);
}

function acceptDeath() {
    document.getElementById('death-modal').classList.remove('active');
    const option = appState.gameState.pendingDeathOption;
    const endDesc = option.endDesc || "这个选择在当时的历史背景下是致命的错误。";
    appState.gameState.pendingDeathOption = null;
    setTimeout(() => {
        gameEnd(false, endDesc);
    }, 500);
}

function useHelp() {
    if (appState.gameState.helpTimes <= 0) {
        alert("你的求救机会已经用完了！");
        return;
    }
    if (appState.gameState.selectedOption) {
        alert("你已经做出了选择，无法再使用求救机会！");
        return;
    }

    const correctOption = appState.gameState.currentOptions.find(opt => opt.isCorrect);
    updateAttribute('helpTimes', -1);
    appState.gameState.debuff = 0;
    updateAttribute('health', 20);
    appState.gameState.consecutiveCorrect = 0;
    updateGameUI();

    // 使用求救后，重置倒计时
    startCountdown();

    showHistoryModal("求救成功", 
        `<div class="tip-box">
            当地的资深人士给了你关键提示：<br><br>
            <strong>正确的选择，与「${correctOption.text.split('，')[0]}」有关。</strong>
        </div>
        <p>你清除了所有负面状态，恢复了20点生命值，还剩${appState.gameState.helpTimes}次求救机会。</p>`
    );
}

function showHistoryModal(title, text) {
    document.getElementById('history-modal-title').innerText = title;
    document.getElementById('history-modal-text').innerHTML = text;
    document.getElementById('history-modal').classList.add('active');
    if (appState.countdown.isRunning && getCurrentTimeConfig().freezeOnModal) {
        pauseCountdown();
    }
}

// 【修复】closeHistoryModal改为async，正确处理await
// 【终极修复】确保100%能进入下一关
function closeHistoryModal() {
    // 1. 关闭弹窗
    const historyModal = document.getElementById('history-modal');
    historyModal.classList.remove('active');

    // 2. 恢复倒计时
    if (appState.countdown.isPaused) {
        resumeCountdown();
    }

    // 3. 【关键修复】完全重置状态，确保下一关能正常加载
    const nextLevel = appState.gameState.currentLevel + 1;
    
    // 强制清空所有临时状态
    appState.gameState.currentOptions = [];
    appState.gameState.selectedOption = null;
    
    // 使用 setTimeout 确保 DOM 更新完成
    setTimeout(() => {
        // 重新初始化部分状态
        appState.gameState.currentLevel = nextLevel;
        loadLevel(nextLevel);
    }, 200);
}



function updateGameUI() {
    document.getElementById('identity-text').innerText = appState.gameState.currentIdentity.name;
    document.getElementById('help-text').innerText = `${appState.gameState.helpTimes}次`;
    const debuffTag = document.getElementById('debuff-tag');
    debuffTag.innerHTML = appState.gameState.debuff > 0 ? `<span class="debuff-tag">负面状态 x${appState.gameState.debuff}</span>` : '';
    const streakTag = document.getElementById('streak-tag');
    streakTag.innerHTML = appState.gameState.consecutiveCorrect >= 3 ? `<span class="streak-tag">连胜 x${appState.gameState.consecutiveCorrect}</span>` : '';
    if (appState.gameState.currentLevel % 3 === 0 && appState.gameState.currentLevel > 0 && !appState.gameState.selectedOption) {
        updateAttribute('helpTimes', 1);
    }
    updateHealthUI();
}

function updateHealthUI() {
    const health = appState.gameState.health;
    document.getElementById('health-text').innerText = health;
    document.getElementById('health-fill').style.width = `${health}%`;
    const healthFill = document.getElementById('health-fill');
    if (health > 60) {
        healthFill.style.backgroundColor = '#2e7d32';
    } else if (health > 30) {
        healthFill.style.backgroundColor = '#ef6c00';
    } else {
        healthFill.style.backgroundColor = '#c62828';
    }
}

// ===================== 成绩评定与薄弱分析 =====================
function getDefaultScoreConfig() {
    return {
        "dimensions": [
            {"name": "最终生命值", "field": "finalHealth", "weight": 0.3, "max": 100},
            {"name": "答题正确率", "field": "correctRate", "weight": 0.4, "max": 1},
            {"name": "关卡完成度", "field": "levelCompleteRate", "weight": 0.2, "max": 1},
            {"name": "剩余求救次数", "field": "remainingHelpTimes", "weight": 0.1, "max": 3}
        ],
        "levels": [
            {"id": "excellent", "name": "状元及第", "desc": "你对本朝代的历史知识了如指掌，堪称当世鸿儒！", "minTotalScore": 90, "mustPass": true},
            {"id": "good", "name": "榜眼及第", "desc": "你对本朝代的历史知识掌握扎实，是难得的人才！", "minTotalScore": 80, "mustPass": true},
            {"id": "pass", "name": "进士及第", "desc": "你顺利通过了本次考验，对本朝代的历史有基本的掌握。", "minTotalScore": 60, "mustPass": true},
            {"id": "fail", "name": "名落孙山", "desc": "你没能通过本次考验，对本朝代的历史知识掌握不足，还需继续努力。", "minTotalScore": 0, "mustPass": false}
        ]
    };
}

function calculateScore(gameState, isSuccess) {
    const pack = gameState.currentPack;
    const volume = gameState.currentVolume;
    const scoreConfig = volume.scoreConfig || pack.scoreConfig || getDefaultScoreConfig();
    const totalLevel = gameState.userSelectedLevelCount;
    const answeredLevel = gameState.gameRecord.length;

    const dimensionData = {
        finalHealth: gameState.health,
        correctRate: answeredLevel > 0 ? gameState.levelPassed / answeredLevel : 0,
        levelCompleteRate: isSuccess ? 1 : answeredLevel / totalLevel,
        remainingHelpTimes: gameState.helpTimes
    };

    let totalScore = 0;
    scoreConfig.dimensions.forEach(dim => {
        const value = dimensionData[dim.field] || 0;
        const normalizedScore = (value / dim.max) * 100;
        totalScore += normalizedScore * dim.weight;
    });
    totalScore = Math.round(totalScore);

    const sortedLevels = scoreConfig.levels.sort((a, b) => b.minTotalScore - a.minTotalScore);
    let matchedLevel = sortedLevels[sortedLevels.length - 1];
    for (let level of sortedLevels) {
        if (totalScore >= level.minTotalScore) {
            if (level.mustPass && !isSuccess) continue;
            matchedLevel = level;
            break;
        }
    }

    return { totalScore, level: matchedLevel, dimensionData, config: scoreConfig };
}

function analyzeWeakness(gameRecord) {
    const tagStats = {};
    gameRecord.forEach(record => {
        const allTags = [...(record.knowledgeTag || []), ...(record.userOption.knowledgeTag || [])];
        const uniqueTags = [...new Set(allTags)];
        
        uniqueTags.forEach(tag => {
            if (!tagStats[tag]) tagStats[tag] = { total: 0, wrong: 0, wrongRate: 0 };
            tagStats[tag].total += 1;
            if (!record.isCorrect) tagStats[tag].wrong += 1;
            tagStats[tag].wrongRate = tagStats[tag].wrong / tagStats[tag].total;
        });
    });

    const sortedTags = Object.entries(tagStats)
        .map(([tag, stats]) => ({ tag, ...stats }))
        .sort((a, b) => b.wrongRate - a.wrongRate);
    
    const weaknessList = sortedTags.filter(item => item.wrongRate >= WEAKNESS_THRESHOLD);
    return { allTagStats: sortedTags, weaknessList };
}

// ===================== 游戏结束逻辑 =====================
function gameEnd(isSuccess, desc) {
    clearCountdown();
    clearGameProgress();
    
    // 提取知识点到数据库
    if (appState.gameState.gameRecord && appState.gameState.gameRecord.length > 0) {
        extractKnowledgeFromGame(appState.gameState.gameRecord);
    }
    
    // 更新排行榜
    updateLeaderboard(appState.gameState, isSuccess);
    
    // 播放结局音效
    AudioSystem.init();
    if (isSuccess) {
        AudioSystem.play('success');
    } else {
        AudioSystem.play('fail');
    }
    
    // 检查并解锁成就
    checkAndUnlockAchievements(appState.gameState, isSuccess);
    
    // 【修复】通关时解锁下一卷
    if (isSuccess) {
        const packId = appState.selectedPackType === 'default' ? 'default_pack' : 'custom_pack';
        const volumeList = appState.gameState.currentPack.volumeList || [];
        const currentVolumeId = appState.gameState.currentVolume.id;
        const currentIndex = volumeList.findIndex(v => v.id === currentVolumeId);
        
        // 解锁下一卷（如果存在）
        if (currentIndex >= 0 && currentIndex < volumeList.length - 1) {
            const nextVolume = volumeList[currentIndex + 1];
            unlockVolume(packId, nextVolume.id);
        }
        
        // 【世代传承】保存通关数据
        const totalKnowledge = knowledgeState.totalPoints;
        const completedIdentity = appState.gameState.currentIdentity?.id;
        saveCompletionForInheritance(currentVolumeId, totalKnowledge, completedIdentity);
    }
    
    // 计算学识积分
    const knowledgeGained = appState.gameState.currentKnowledge || 0;
    
    const scoreResult = calculateScore(appState.gameState, isSuccess);
    const weaknessResult = analyzeWeakness(appState.gameState.gameRecord);
    
    // 获取结局
    const ending = determineEnding(appState.gameState, isSuccess);
    
    // 获取爵位信息
    const rankInfo = getRankInfo(knowledgeState.currentRank);
    
    document.getElementById('end-title').innerText = isSuccess ? "恭喜你，通关成功！" : "游戏结束";
    document.getElementById('end-title').className = isSuccess ? "end-title end-success" : "end-title end-fail";
    
    // 显示结局信息
    const endingHtml = `
        <div class="ending-display" style="text-align: center; margin-bottom: 20px;">
            <div class="ending-icon" style="font-size: 4rem; margin-bottom: 10px;">${ending.icon}</div>
            <div class="ending-name" style="font-size: 1.5rem; color: ${ending.color}; font-weight: bold;">${ending.name}</div>
            <div class="ending-desc" style="color: var(--text-muted); margin-top: 10px;">${ending.description}</div>
        </div>
    `;
    document.getElementById('end-desc').innerHTML = endingHtml + `<p style="margin-top: 15px;">${desc}</p>`;
    
    // 显示爵位信息
    const rankHtml = `
        <div class="rank-display" style="text-align: center; margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%); border-radius: 12px;">
            <div style="font-size: 2.5rem; margin-bottom: 5px;">${rankInfo.icon}</div>
            <div style="font-size: 1.2rem; color: var(--primary); font-weight: bold;">当前爵位：${rankInfo.name}</div>
            <div style="font-size: 0.9rem; color: var(--text-muted);">${rankInfo.title}</div>
            <div style="margin-top: 10px;">
                <span style="color: var(--success);">+${knowledgeGained}</span> 学识
                <span style="color: var(--text-muted); margin-left: 15px;">累计：${knowledgeState.totalPoints}</span>
            </div>
        </div>
    `;
    
    document.getElementById('score-level').innerText = scoreResult.level.name;
    document.getElementById('score-desc').innerText = scoreResult.level.desc;
    document.getElementById('total-score').innerText = scoreResult.totalScore;
    
    document.getElementById('end-stats').innerHTML = `
        ${rankHtml}
        <p><strong>剧本名称：</strong>${appState.gameState.currentPack.packInfo.packName}</p>
        <p><strong>游戏篇章：</strong>${appState.gameState.currentVolume.name}</p>
        <p><strong>朝代背景：</strong>${appState.gameState.currentVolume.dynasty}</p>
        <p><strong>最终身份：</strong>${appState.gameState.currentIdentity.name}</p>
        <p><strong>结局：</strong><span style="color: ${ending.color};">${ending.icon} ${ending.name}</span></p>
        <p><strong>选择关卡数：</strong>${appState.gameState.userSelectedLevelCount} / 总关卡数${appState.gameState.totalLevel}</p>
        <p><strong>答题总数：</strong>${appState.gameState.gameRecord.length} 题</p>
        <p><strong>正确答题数：</strong>${appState.gameState.levelPassed} 题</p>
        <p><strong>答题正确率：</strong>${(scoreResult.dimensionData.correctRate * 100).toFixed(1)}%</p>
        <p><strong>最终生命值：</strong>${appState.gameState.health}</p>
        <p><strong>剩余求救机会：</strong>${appState.gameState.helpTimes}次</p>
        <p><strong>最高连续正确：</strong>${appState.gameState.consecutiveCorrect} 次</p>
        `;

    const weaknessBox = document.getElementById('weakness-box');
    const weaknessList = document.getElementById('weakness-list');
    if (weaknessResult.weaknessList.length > 0) {
        weaknessBox.style.display = 'block';
        weaknessList.innerHTML = '';
        weaknessResult.weaknessList.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'weakness-item';
            itemEl.innerHTML = `
                <span class="weakness-tag">${item.tag}</span>
                <span class="weakness-rate">错误率：${(item.wrongRate * 100).toFixed(0)}%（${item.wrong}/${item.total}题）</span>
            `;
            weaknessList.appendChild(itemEl);
        });
    } else {
        weaknessBox.style.display = 'none';
    }

    // 【新增】通关成功且有下一卷时，添加"进入下一卷"按钮
    const endControlBox = document.getElementById('end-control-box');
    if (isSuccess) {
        const volumeList = appState.gameState.currentPack.volumeList || [];
        const currentVolumeId = appState.gameState.currentVolume.id;
        const currentIndex = volumeList.findIndex(v => v.id === currentVolumeId);
        
        if (currentIndex >= 0 && currentIndex < volumeList.length - 1) {
            const nextVolume = volumeList[currentIndex + 1];
            const nextVolumeUnlocked = isVolumeUnlocked(
                appState.selectedPackType === 'default' ? 'default_pack' : 'custom_pack',
                nextVolume.id,
                volumeList
            );
            
            if (nextVolumeUnlocked) {
                endControlBox.innerHTML = `
                    <button class="btn btn-success" onclick="enterNextVolume()">进入下一卷：${nextVolume.name}</button>
                    <button class="btn btn-info" onclick="goToReview()">查看完整闯关复盘</button>
                    <button class="btn btn-secondary" onclick="exitToHome()">结束游戏，返回首页</button>
                `;
                switchPage('end-page');
                return;
            }
        }
    }
    
    switchPage('end-page');
}

// 【新增】进入下一卷
function enterNextVolume() {
    const volumeList = appState.gameState.currentPack.volumeList || [];
    const currentVolumeId = appState.gameState.currentVolume.id;
    const currentIndex = volumeList.findIndex(v => v.id === currentVolumeId);
    
    if (currentIndex < 0 || currentIndex >= volumeList.length - 1) {
        alert("没有下一卷可以进入！");
        return;
    }
    
    const nextVolume = volumeList[currentIndex + 1];
    
    // 重置游戏状态
    appState.gameState = initGameState();
    appState.gameState.currentPack = appState.selectedPack;
    appState.selectedVolume = nextVolume;
    appState.gameState.currentVolume = nextVolume;
    appState.triggeredEventIds = [];
    
    // 跳转到关卡选择页面（如果有多个身份则先选身份）
    if (nextVolume.identityList.length === 1) {
        appState.gameState.currentIdentity = nextVolume.identityList[0];
        goToLevelSelectDirectly();
    } else {
        renderIdentityList();
        document.getElementById('identity-subtitle').innerText = `当前篇章：${nextVolume.name} | 剧本：${appState.selectedPack.packInfo.packName}`;
        switchPage('identity-page');
    }
}

// ===================== 复盘页面渲染 =====================
function goToReview() {
    const reviewContent = document.getElementById('review-content');
    const gameRecord = appState.gameState.gameRecord;

    reviewContent.innerHTML = '';
    gameRecord.forEach((record, index) => {
        const levelCard = document.createElement('div');
        levelCard.className = 'review-level-card';

        const levelHeader = document.createElement('div');
        levelHeader.className = 'review-level-header';
        levelHeader.innerHTML = `
            <div class="review-level-num">
                第${record.level}关
                ${record.knowledgeTag.map(tag => `<span class="review-tag">${tag}</span>`).join('')}
            </div>
            <div class="review-level-result ${record.isCorrect ? 'result-correct' : 'result-wrong'}">
                ${record.isCorrect ? '回答正确' : '回答错误'}
            </div>
        `;
        levelCard.appendChild(levelHeader);

        const storyEl = document.createElement('div');
        storyEl.className = 'review-story';
        storyEl.innerText = record.story;
        levelCard.appendChild(storyEl);

        record.allOptions.forEach((option, optIndex) => {
            const isUserSelected = record.userOption.id === option.id;
            const isCorrect = option.isCorrect;
            let optionClass = 'option-normal';
            if (isCorrect) optionClass = 'option-correct';
            if (isUserSelected && !isCorrect) optionClass = 'option-user-wrong';

            const optionEl = document.createElement('div');
            optionEl.className = `review-option-item ${optionClass}`;
            
            const optionHeader = document.createElement('div');
            optionHeader.className = 'review-option-header';
            optionHeader.innerHTML = `
                <span>${optionLetters[optIndex]}. ${option.text}</span>
                <span>
                    ${isCorrect ? '✅ 正确答案' : ''}
                    ${isUserSelected ? '👤 你的选择' : ''}
                </span>
            `;
            optionEl.appendChild(optionHeader);

            const optionResult = document.createElement('div');
            optionResult.className = 'review-option-result';
            optionResult.innerText = option.result;
            optionEl.appendChild(optionResult);

            const optionHistory = document.createElement('div');
            optionHistory.className = 'review-option-history';
            optionHistory.innerHTML = `<strong>历史知识点：</strong>${option.history}`;
            optionEl.appendChild(optionHistory);

            levelCard.appendChild(optionEl);
        });

        reviewContent.appendChild(levelCard);
    });

    switchPage('review-page');
}

function restartGame() {
    appState.gameState.isFromSave = false;
    appState.gameState.currentOptions = [];
    appState.triggeredEventIds = [];
    goToLevelSelect();
}

function exitToHome() {
    appState.gameState = initGameState();
    appState.selectedVolume = null;
    appState.triggeredEventIds = [];
    clearCountdown();
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.querySelectorAll('.identity-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.volume-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('.pack-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('confirm-identity-btn').disabled = true;
    document.getElementById('confirm-volume-btn').disabled = true;
    document.getElementById('confirm-pack-btn').disabled = true;
    
    // 更新首页爵位显示
    loadKnowledgeState();
    updateWelcomeRankDisplay();
    
    switchPage('welcome-page');
}

// ===================== 存档核心函数 =====================
function saveGameProgress() {
    if (!appState.gameState.currentPack || !appState.gameState.currentVolume || !appState.gameState.currentIdentity || appState.gameState.selectedOption) {
        alert("当前状态无法保存！请在关卡答题前保存进度。");
        return;
    }

    const saveData = {
        gameState: JSON.parse(JSON.stringify(appState.gameState)),
        triggeredEventIds: appState.triggeredEventIds,
        selectedPackType: appState.selectedPackType,
        selectedVolumeId: appState.selectedVolume.id,
        saveTime: new Date().toLocaleString(),
        packName: appState.gameState.currentPack.packInfo.packName,
        volumeName: appState.gameState.currentVolume.name,
        identityName: appState.gameState.currentIdentity.name
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        alert(`进度保存成功！\n存档信息：${saveData.packName} - ${saveData.volumeName} - ${saveData.identityName} 第${appState.gameState.currentLevel}关\n保存时间：${saveData.saveTime}`);
        updateSaveButtonStatus();
    } catch (err) {
        alert("保存失败！浏览器存储空间不足或不支持本地存储。");
        console.error("保存失败：", err);
    }
}

async function loadGameProgress() {
    try {
        const saveDataStr = localStorage.getItem(SAVE_KEY);
        if (!saveDataStr) {
            alert("暂无可用存档！");
            return;
        }

        const saveData = JSON.parse(saveDataStr);
        if (!saveData.gameState || !saveData.gameState.currentPack) {
            alert("存档已损坏，无法读取！");
            clearGameProgress();
            return;
        }

        if (!appState.defaultPack) await loadDefaultPack();

        let packToUse = null;
        if (saveData.selectedPackType === 'default') {
            packToUse = appState.defaultPack;
        } else {
            const savedCustomPack = localStorage.getItem(CUSTOM_PACK_KEY);
            packToUse = savedCustomPack ? JSON.parse(savedCustomPack) : saveData.gameState.currentPack;
            if (!savedCustomPack && packToUse) {
                appState.customPack = packToUse;
                renderCustomPackCard(packToUse);
            }
        }

        if (!packToUse) {
            alert("存档对应的剧本已丢失，无法读取！");
            clearGameProgress();
            return;
        }

        // 兼容旧剧本，自动生成卷
        if (!packToUse.volumeList || packToUse.volumeList.length === 0) {
            packToUse.volumeList = [
                {
                    id: "default",
                    name: "默认篇章",
                    identityList: packToUse.identityList || []
                }
            ];
        }

        // 恢复选中的卷
        const selectedVolume = packToUse.volumeList.find(v => v.id === saveData.selectedVolumeId) || packToUse.volumeList[0];
        appState.selectedVolume = selectedVolume;
        appState.gameState = saveData.gameState;
        appState.gameState.currentPack = packToUse;
        appState.gameState.currentVolume = selectedVolume;
        appState.gameState.isFromSave = true;
        appState.selectedPackType = saveData.selectedPackType;
        appState.selectedPack = packToUse;
        appState.triggeredEventIds = saveData.triggeredEventIds || [];

        updateGameUI();
        loadLevel(appState.gameState.currentLevel);
        switchPage('game-page');
        alert(`存档读取成功！\n${saveData.packName} - ${saveData.volumeName} - ${saveData.identityName}\n当前进度：第${appState.gameState.currentLevel}关 / 共${appState.gameState.userSelectedLevelCount}关\n保存时间：${saveData.saveTime}`);
    } catch (err) {
        alert("存档读取失败！存档格式错误或已损坏。");
        console.error("读取失败：", err);
        clearGameProgress();
    }
}

function clearGameProgress() {
    localStorage.removeItem(SAVE_KEY);
    updateSaveButtonStatus();
}

function updateSaveButtonStatus() {
    const loadSaveBtn = document.getElementById('load-save-btn');
    const hasSave = localStorage.getItem(SAVE_KEY) !== null;
    loadSaveBtn.disabled = !hasSave;
    loadSaveBtn.innerText = hasSave ? "读取存档" : "暂无存档";
}

// ===================== 页面加载初始化 =====================
window.onload = async () => {
    appState.gameState = initGameState();
    await loadDefaultPack();
    
    // 【修改】初始化时渲染所有自定义剧本
    renderCustomPackCards();
    
    bindPackCardEvents();
    updateSaveButtonStatus();
    
    // 初始化新手引导
    initTutorial();
    
    // 初始化音效系统（延迟初始化，需要用户交互）
    setTimeout(() => AudioSystem.init(), 1000);
    
    // 加载学识积分和爵位状态
    loadKnowledgeState();
    
    // 加载成就状态
    loadAchievementState();
    
    // 初始化每日任务
    loadDailyTaskState();
    checkAndCompleteDailyTasks();
    
    // 初始化知识点系统
    loadKnowledgeDbState();
    
    // 初始化排行榜系统
    loadLeaderboardState();
    
    // 更新首页爵位显示
    updateWelcomeRankDisplay();
    
    // 添加全局按钮点击音效
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn')) {
            AudioSystem.init();
            AudioSystem.play('click');
        }
    }, true);
};

// ===================== 新手引导系统 =====================
function initTutorial() {
    const tutorialCompleted = localStorage.getItem(TUTORIAL_KEY);
    if (!tutorialCompleted) {
        appState.tutorial.isActive = false;
        appState.tutorial.currentStep = 0;
        appState.tutorial.isCompleted = false;
    } else {
        appState.tutorial.isCompleted = true;
    }
}

function startTutorial() {
    if (appState.tutorial.isCompleted) return;
    
    appState.tutorial.isActive = true;
    appState.tutorial.currentStep = 0;
    
    // 显示遮罩
    document.getElementById('tutorial-overlay').style.display = 'block';
    
    showTutorialStep(0);
}

function showTutorialStep(stepIndex) {
    if (stepIndex >= TUTORIAL_STEPS.length) {
        completeTutorial();
        return;
    }
    
    const step = TUTORIAL_STEPS[stepIndex];
    const contentEl = document.getElementById('tutorial-content');
    const progressEl = document.getElementById('tutorial-progress');
    const tooltipEl = document.getElementById('tutorial-tooltip');
    const highlightEl = document.getElementById('tutorial-highlight');
    
    // 更新内容
    contentEl.innerHTML = step.content;
    progressEl.innerText = `${stepIndex + 1} / ${TUTORIAL_STEPS.length}`;
    
    // 定位高亮
    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
        // 元素不存在，跳过这一步
        nextTutorialStep();
        return;
    }
    
    const rect = targetEl.getBoundingClientRect();
    const padding = step.highlightPadding || 0;
    
    highlightEl.style.left = `${rect.left - padding}px`;
    highlightEl.style.top = `${rect.top - padding}px`;
    highlightEl.style.width = `${rect.width + padding * 2}px`;
    highlightEl.style.height = `${rect.height + padding * 2}px`;
    
    // 定位提示框 - 先设置为可见以获取正确的高度
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.style.display = 'block';
    tooltipEl.className = 'tutorial-tooltip';
    
    const tooltipHeight = tooltipEl.offsetHeight;
    const tooltipWidth = tooltipEl.offsetWidth;
    
    let tooltipLeft = rect.left + rect.width / 2;
    let tooltipTop;
    
    if (step.position === 'bottom') {
        tooltipTop = rect.bottom + padding + 15;
        tooltipEl.classList.add('tutorial-tooltip-bottom');
    } else if (step.position === 'top') {
        tooltipTop = rect.top - padding - tooltipHeight - 15;
        tooltipEl.classList.add('tutorial-tooltip-top');
    } else if (step.position === 'center') {
        tooltipTop = window.innerHeight / 2 - tooltipHeight / 2;
        tooltipLeft = window.innerWidth / 2;
        tooltipEl.classList.add('tutorial-tooltip-center');
    }
    
    // 调整位置确保不超出屏幕
    tooltipTop = Math.max(10, Math.min(tooltipTop, window.innerHeight - tooltipHeight - 10));
    tooltipLeft = Math.max(tooltipWidth / 2, Math.min(tooltipLeft, window.innerWidth - tooltipWidth / 2));
    
    tooltipEl.style.left = `${tooltipLeft}px`;
    tooltipEl.style.top = `${tooltipTop}px`;
    tooltipEl.style.transform = 'translateX(-50%)';
    tooltipEl.style.visibility = 'visible';
    
    appState.tutorial.currentStep = stepIndex;
}

function nextTutorialStep() {
    const nextIndex = appState.tutorial.currentStep + 1;
    if (nextIndex >= TUTORIAL_STEPS.length) {
        completeTutorial();
    } else {
        showTutorialStep(nextIndex);
    }
}

function skipTutorial() {
    completeTutorial();
}

function completeTutorial() {
    document.getElementById('tutorial-overlay').style.display = 'none';
    appState.tutorial.isActive = false;
    appState.tutorial.isCompleted = true;
    localStorage.setItem(TUTORIAL_KEY, 'true');
}

function resetTutorial() {
    localStorage.removeItem(TUTORIAL_KEY);
    appState.tutorial.isCompleted = false;
    appState.tutorial.isActive = false;
    appState.tutorial.currentStep = 0;
}


