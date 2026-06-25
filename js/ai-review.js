// AI智能审核引擎 - 简化版
class AIReviewEngine {
    constructor() {
        // 敏感词库
        this.sensitiveWords = {
            '性相关内容': ['性', '爱情', '恋爱', '接吻', '拥抱', '同居', '怀孕', '堕胎', '性教育', '性爱', '性行为', '性交', '做爱', '阴茎', '阴道', '乳房', '屁股', '臀部', '大腿根', '裸体', '裸照', '性器官', '生殖器', '阴毛', '自慰', '手淫', '强奸', '轮奸', '迷奸', '诱奸', '鸡奸', '肛交', '口交', '淫乱', '淫荡', '色情', '性欲', '性瘾', '性奴', '性虐', '3P', '三人行', '群交', '滥交', '出轨', '外遇', '偷情', '一夜情', '婚外情', '三角恋', '多角恋', '虐恋', '殉情'],
            '暴力相关内容': ['杀人', '肢解', '碎尸', '砍杀', '刺杀', '枪杀', '射杀', '绞杀', '勒死', '掐死', '闷死', '溺死', '烧死', '毒死', '电死', '摔死', '打死', '踢死', '踹死', '砍死', '刺死', '捅死', '割喉', '割腕', '上吊', '跳楼', '卧轨', '服毒', '自刎', '自尽', '自杀', '寻死', '轻生', '寻短见', '战争', '战斗', '战役', '军队', '武器', '枪支', '子弹', '刀剑', '匕首', '棍棒', '殴打', '打架', '斗殴', '搏斗', '格斗', '厮打', '厮杀', '拼杀', '搏杀', '格杀', '击打', '敲打', '捶打', '捶击', '打击', '攻击', '袭击', '攻打', '进攻', '冲击', '冲锋', '突击', '突袭', '偷袭', '伏击', '截击', '追击', '反击', '抗击', '抵抗', '反抗', '抗争', '斗争', '奋战', '激战', '血战', '恶战', '苦战', '死战', '决战', '鏖战', '混战', '内战', '抗战'],
            '毒品相关内容': ['吸毒', '贩毒', '制毒', '毒品', '海洛因', '冰毒', '大麻', '可卡因', '鸦片', '吗啡', '摇头丸', 'K粉', '毒瘾', '戒毒', '禁毒', '缉毒'],
            '政治敏感': ['法轮功', '六四', '天安门事件', '文革', '反右', '大跃进', '人民公社', '文化大革命', '十年浩劫', '反右运动', '反右派运动', '反右倾运动', '阶级斗争', '路线斗争', '两条路线斗争', '两个阶级两条路线斗争', '无产阶级和资产阶级的斗争', '社会主义和资本主义的两条道路斗争', '无产阶级司令部和资产阶级司令部的斗争', '毛主席革命路线和刘少奇反革命修正主义路线的斗争', '革命', '政治运动', '反动派', '国民党', '共产党', '资本主义', '社会主义', '共产主义', '法西斯', '纳粹', '希特勒', '墨索里尼', '东条英机', '军国主义', '帝国主义', '殖民主义', '霸权主义', '沙文主义', '大国沙文主义', '民族主义', '种族主义', '分裂主义', '恐怖主义', '极端主义', '原教旨主义', '宗教极端主义', '民族分裂主义', '国家分裂主义', '地区分裂主义', '国际分裂主义', '国内分裂主义', '政治分裂主义', '经济分裂主义', '文化分裂主义', '社会分裂主义', '军事分裂主义', '外交分裂主义', '法律分裂主义', '道德分裂主义', '伦理分裂主义', '哲学分裂主义', '宗教分裂主义', '历史分裂主义', '地理分裂主义', '语言分裂主义', '文字分裂主义', '艺术分裂主义', '文学分裂主义', '科学分裂主义', '技术分裂主义', '教育分裂主义'],
            '宗教争议': ['邪教', '异端', '极端宗教', '宗教极端主义', '原教旨主义', '恐怖主义', '极端主义', '分裂主义', '民族分裂主义', '国家分裂主义', '地区分裂主义', '国际分裂主义', '国内分裂主义', '政治分裂主义', '经济分裂主义', '文化分裂主义', '社会分裂主义', '军事分裂主义', '外交分裂主义', '法律分裂主义', '道德分裂主义', '伦理分裂主义', '哲学分裂主义', '宗教分裂主义', '历史分裂主义', '地理分裂主义', '语言分裂主义', '文字分裂主义', '艺术分裂主义', '文学分裂主义', '科学分裂主义', '技术分裂主义', '教育分裂主义'],
            '恐怖内容': ['恐怖袭击', '恐怖爆炸', '恐怖绑架', '恐怖劫持', '恐怖暗杀', '恐怖谋杀', '恐怖屠杀', '恐怖恐怖', '恐怖主义', '鬼', '幽灵', '灵魂', '魂魄', '亡灵', '死灵', '怨灵', '恶灵', '厉鬼', '冤魂', '冤鬼', '厉鬼', '恶鬼', '饿鬼', '色鬼', '酒鬼', '烟鬼', '赌鬼', '懒鬼', '胆小鬼', '冒失鬼', '机灵鬼', '讨厌鬼', '淘气鬼', '小鬼', '鬼魂', '鬼怪', '妖怪', '妖精', '精灵']
        };

        // 已知适合初中生的经典书目
        this.knownSafeBooks = [
            '伊索寓言', '安徒生童话', '格林童话', '稻草人', '小王子',
            '夏洛的网', '窗边的小豆窗', '爱的教育', '昆虫记',
            '草房子', '青铜葵花', '山羊不吃天堂草', '城南旧事',
            '朝花夕拾', '西游记', '骆驼祥子', '海底两万里',
            '红星照耀中国', '傅雷家书', '钢铁是怎样炼成的',
            '简爱', '格列佛游记', '名人传', '艾青诗选',
            '水浒传', '儒林外史', '三国演义', '红楼梦',
            '呐喊', '彷徨', '边城', '京华烟云',
            '我与地坛', '目送', '撒哈拉的故事', '文化苦旅',
            '平凡的世界', '人世间', '秋园', '繁花',
            '许三观卖血记', '活着', '围城', '白鹿原'
        ];

        // 需要特别审核的书目（基于标题判断）
        this.warningBooks = [
            '金瓶梅', '肉蒲团', '灯草和尚', '痴婆子', '如意君传',
            '玉蒲团', '绣榻野史', '株林野史', '浪史', '弁而钗',
            '龙阳逸史', '品花宝鉴', '青楼梦', '花月痕', '海上花列传',
            '九尾龟', '孽海花', '官场现形记', '二十年目睹之怪现状',
            '老残游记', '残春', '沉沦', '春风沉醉的晚上', '迟桂花',
            '红玫瑰与白玫瑰', '金锁记', '半生缘', '倾城之恋',
            '色戒', '小团圆', '同学少年都不贱', '郁金香',
            '霸王别姬', '活着', '许三观卖血记', '兄弟',
            '丰乳肥臀', '檀香刑', '蛙', '红高粱',
            '生死疲劳', '酒国', '天堂蒜薹之歌', '食草家族',
            '四十一炮', '檀香刑', '蛙', '红高粱'
        ];
    }

    analyzeBook(book) {
        const result = {
            score: 100,
            level: '适合',
            reasons: [],
            warnings: [],
            suggestions: [],
            ageRange: [],
            difficulty: book.overallDifficulty || '中等',
            overLevelRisk: '低',
            sensitiveWordsFound: []
        };

        const allText = `${book.title || ''} ${book.author || ''} ${book.description || ''} ${book.category || ''}`.toLowerCase();

        // 1. 检查是否为已知安全书目
        if (this.knownSafeBooks.some(s => book.title && book.title.includes(s))) {
            result.reasons.push('✅ 经典必读书目，教育部门推荐');
            result.score = Math.min(result.score + 20, 100);
        }

        // 2. 深度检查敏感内容
        this.checkSensitiveContent(allText, result);

        // 3. 检查是否为需要特别审核的书目
        if (this.warningBooks.some(w => book.title && book.title.includes(w))) {
            result.warnings.push('⚠️ 该书目需要教师特别审核后才能推荐给学生');
            result.score -= 20;
        }

        // 4. 基于分类分析
        this.analyzeByCategory(book.category, result);

        // 5. 确定适用年龄
        this.determineAgeRange(result);

        // 6. 评估难度
        this.assessDifficulty(book, result);

        // 7. 计算最终评级
        this.calculateFinalRating(result);

        return result;
    }

    checkSensitiveContent(text, result) {
        let totalFound = 0;

        for (const [category, words] of Object.entries(this.sensitiveWords)) {
            if (Array.isArray(words)) {
                const found = words.filter(w => text.includes(w.toLowerCase()));
                if (found.length > 0) {
                    totalFound += found.length;
                    const uniqueFound = [...new Set(found)];
                    result.sensitiveWordsFound.push({
                        category,
                        words: uniqueFound.slice(0, 10)
                    });

                    // 根据敏感词数量扣分
                    if (found.length >= 5) {
                        result.score -= 40;
                        result.overLevelRisk = '高';
                        result.warnings.push(`发现大量${category}敏感内容：${uniqueFound.slice(0, 5).join('、')}`);
                    } else if (found.length >= 3) {
                        result.score -= 25;
                        if (result.overLevelRisk !== '高') result.overLevelRisk = '中';
                        result.warnings.push(`发现部分${category}敏感内容：${uniqueFound.slice(0, 5).join('、')}`);
                    } else {
                        result.score -= 10;
                        if (result.overLevelRisk === '低') result.overLevelRisk = '低';
                    }
                }
            }
        }

        if (totalFound === 0) {
            result.reasons.push('✅ 未检测到敏感内容');
        }
    }

    analyzeByCategory(category, result) {
        const safeCategories = ['童话', '寓言', '科普', '诗歌', '散文', '传记', '历史'];
        const warningCategories = ['武侠', '悬疑', '言情', '都市', '玄幻', '修仙', '军事'];

        if (safeCategories.some(c => (category || '').includes(c))) {
            result.score += 10;
            result.reasons.push('分类为适合青少年的类型');
        }

        if (warningCategories.some(c => (category || '').includes(c))) {
            result.score -= 5;
            result.suggestions.push('该分类书籍可能包含不适合内容，建议先审核');
        }
    }

    determineAgeRange(result) {
        if (result.score >= 80) {
            result.ageRange = [12, 13, 14, 15];
        } else if (result.score >= 60) {
            result.ageRange = [13, 14, 15];
        } else if (result.score >= 40) {
            result.ageRange = [14, 15];
        } else {
            result.ageRange = [];
        }
    }

    assessDifficulty(book, result) {
        if (book.overallDifficulty) {
            result.difficulty = book.overallDifficulty;
        } else if (book.description && book.description.length > 200) {
            result.difficulty = '较难';
        } else if (book.description && book.description.length < 50) {
            result.difficulty = '较易';
        }
    }

    calculateFinalRating(result) {
        result.score = Math.max(0, Math.min(100, result.score));

        if (result.score >= 80) {
            result.level = '非常适合';
        } else if (result.score >= 60) {
            result.level = '适合';
        } else if (result.score >= 40) {
            result.level = '需要审核';
        } else {
            result.level = '不建议';
        }

        if (result.warnings.length > 0) {
            result.suggestions.unshift('⚠️ 建议教师先仔细审核内容后再推荐给学生');
        } else if (result.ageRange.length < 4) {
            result.suggestions.unshift('⚠️ 该书目适合年龄偏大的学生，建议高年级使用');
        } else {
            result.suggestions.unshift('✅ 该书目适合初中生阅读');
        }
    }

    analyzeBooks(books) {
        return books.map(book => ({
            book,
            analysis: this.analyzeBook(book)
        }));
    }

    generateReport(analyses) {
        const report = {
            total: analyses.length,
            suitable: 0,
            needsReview: 0,
            notSuitable: 0,
            byAge: { 12: 0, 13: 0, 14: 0, 15: 0 },
            byDifficulty: { '较易': 0, '中等': 0, '较难': 0 },
            warnings: []
        };

        analyses.forEach(({ analysis }) => {
            if (analysis.level === '非常适合' || analysis.level === '适合') {
                report.suitable++;
            } else if (analysis.level === '需要审核') {
                report.needsReview++;
            } else {
                report.notSuitable++;
            }

            analysis.ageRange.forEach(age => {
                if (report.byAge[age] !== undefined) report.byAge[age]++;
            });

            if (report.byDifficulty[analysis.difficulty] !== undefined) {
                report.byDifficulty[analysis.difficulty]++;
            }

            if (analysis.warnings.length > 0) {
                report.warnings.push(...analysis.warnings);
            }
        });

        return report;
    }
}

const aiReviewEngine = new AIReviewEngine();