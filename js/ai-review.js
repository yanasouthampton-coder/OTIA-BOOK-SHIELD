// AI智能审核引擎 - 严格版
class AIReviewEngine {
    constructor() {
        // 严格敏感词库 - 基于初中生标准
        this.sensitiveWords = {
            '性相关内容': {
                '严重_直接不适': ['做爱', '性交', '阴茎', '阴道', '性行为', '性爱', '3P', '三人行', '群交', '滥交', '淫乱', '淫荡', '色情', '性欲', '性瘾', '性奴', '性虐', '强奸', '轮奸', '迷奸', '诱奸', '鸡奸', '肛交', '口交', '自慰', '手淫', '裸体', '裸照', '性器官', '生殖器', '阴毛', '乳房', '屁股', '臀部', '大腿根', '插', '操', '干', '日'],
                '明显_需要审核': ['爱情', '恋爱', '接吻', '拥抱', '同居', '怀孕', '堕胎', '性教育', '荷尔蒙', '情欲', '欲望', '诱惑', '调情', '暧昧', '出轨', '外遇', '偷情', '一夜情', '约会', '求爱', '求婚', '结婚', '离婚', '分手', '失恋', '暗恋', '单恋', '相恋', '热恋', '苦恋', '畸恋', '忘年恋', '师生恋', '禁忌恋', '婚外情', '三角恋', '多角恋', '虐恋', '殉情', '小三', '二奶', '情妇', '情夫', '偷人', '偷腥', '劈腿', '红杏出墙'],
                '轻微_注意': ['美丽', '漂亮', '英俊', '帅气', '迷人', '魅力', '性感', '妩媚', '妖娆', '婀娜', '苗条', '丰满', '曲线', '身材', '容貌', '长相', '相貌', '模样', '姿态', '风姿', '风采', '风韵', '气质', '神韵', '吸引力', '诱惑力', '迷惑', '勾引', '引诱', '挑逗', '撩拨', '招惹', '招蜂引蝶', '花枝招展', '浓妆艳抹', '涂脂抹粉', '搔首弄姿', '顾盼生辉', '眉目传情', '暗送秋波', '含情脉脉', '脉脉含情', '情意绵绵', '柔情似水', '温情脉脉', '深情款款', '款款深情', '一往情深', '情有独钟', '一见钟情', '两情相悦', '心心相印', '情投意合', '意合情投']
            },
            '暴力相关内容': {
                '严重_直接不适': ['肢解', '碎尸', '砍杀', '刺杀', '枪杀', '射杀', '绞杀', '勒死', '掐死', '闷死', '溺死', '烧死', '毒死', '电死', '摔死', '打死', '踢死', '踹死', '砍死', '刺死', '捅死', '割喉', '割腕', '上吊', '跳楼', '卧轨', '服毒', '自刎', '自尽', '自杀', '寻死', '轻生', '寻短见', '投河', '投井', '撞墙', '割脉', '放血', '大出血', '血流如注', '血肉模糊', '血肉横飞', '血肉淋漓', '鲜血淋漓', '鲜血直流', '鲜血四溅', '鲜血喷涌', '鲜血迸流', '鲜血迸溅', '尸首', '尸体', '尸骨', '白骨', '骷髅', '死尸', '死人', '死鬼', '死亡', '惨死', '横死', '非命'],
                '明显_需要审核': ['杀人', '杀人放火', '杀人越货', '杀人灭口', '杀人偿命', '杀人不眨眼', '杀人如麻', '战争', '战斗', '战役', '军队', '武器', '枪支', '子弹', '刀剑', '匕首', '棍棒', '殴打', '打架', '斗殴', '搏斗', '格斗', '厮打', '厮杀', '拼杀', '搏杀', '格杀', '击打', '敲打', '捶打', '捶击', '打击', '攻击', '袭击', '攻打', '进攻', '冲击', '冲锋', '突击', '突袭', '偷袭', '伏击', '截击', '追击', '反击', '抗击', '抵抗', '反抗', '抗争', '斗争', '奋战', '激战', '血战', '恶战', '苦战', '死战', '决战', '鏖战', '混战', '内战', '抗战', '暗杀', '谋杀', '仇杀', '情杀', '凶杀', '屠杀', '杀戮', '杀生', '杀戒', '杀气', '杀手', '刺客', '杀手', '凶手', '凶手', '暴徒', '歹徒', '恶棍', '恶人', '坏人', '恶霸', '流氓', '无赖', '痞子', '混混', '二流子'],
                '轻微_注意': ['痛', '疼', '伤', '血', '血迹', '血痕', '血印', '血泊', '血污', '血腥', '血债', '血仇', '血恨', '血泪', '血海', '血战', '血拼', '血洗', '血淋淋', '鲜血', '流血', '出血', '吐血', '咳血', '呕血', '便血', '尿血', '鼻血', '牙龈出血', '皮下出血', '内出血', '外伤', '内伤', '重伤', '轻伤', '刀伤', '枪伤', '烧伤', '烫伤', '冻伤', '咬伤', '抓伤', '打伤', '踢伤', '撞伤', '摔伤', '砸伤', '压伤', '挤伤', '磨伤', '擦伤', '挫伤', '扭伤', '拉伤', '撕裂伤', '贯通伤', '穿透伤', '开放性骨折', '闭合性骨折']
            },
            '毒品相关内容': {
                '严重_直接不适': ['吸毒', '贩毒', '制毒', '毒品', '海洛因', '冰毒', '大麻', '可卡因', '鸦片', '吗啡', '摇头丸', 'K粉', '合成毒品', '新型毒品', '传统毒品', '软性毒品', '硬性毒品', '毒品交易', '毒品犯罪', '毒品走私', '毒品买卖', '毒品贩卖', '毒品制造', '毒品运输', '毒品持有', '毒品吸食', '毒品注射', '毒贩', '毒枭', '毒窝', '毒巢', '毒窟', '毒源', '毒道', '毒路', '毒网', '毒链', '毒圈', '毒品链', '毒品网', '毒品圈', '毒品道', '毒品路', '毒品源', '毒品窝', '毒品巢', '毒品窟'],
                '明显_需要审核': ['毒瘾', '戒毒', '禁毒', '缉毒', '以毒攻毒', '五毒', '毒蛇', '毒虫', '毒草', '毒药', '毒酒', '毒水', '毒气', '毒雾', '毒粉', '毒液', '毒素', '毒害', '毒打', '毒骂', '毒计', '毒谋', '毒手', '毒招', '毒辣', '狠毒', '恶毒', '阴毒', '歹毒', '刻毒', '剧毒', '剧毒'],
                '轻微_注意': ['药', '药物', '药品', '医药', '中药', '西药', '处方药', '非处方药', '保健品', '补品', '营养品', '维生素', '抗生素', '消炎药', '止痛药', '退烧药', '感冒药', '咳嗽药', '胃药', '肠药', '肝药', '肾药', '心脏药', '血压药', '血糖药', '胰岛素', '激素']
            },
            '政治敏感': {
                '严重_直接不适': ['法轮功', '六四', '天安门事件', '文革', '反右', '大跃进', '人民公社', '文化大革命', '十年浩劫', '反右运动', '反右派运动', '反右倾运动', '阶级斗争', '路线斗争', '两条路线斗争', '两个阶级两条路线斗争', '无产阶级和资产阶级的斗争', '社会主义和资本主义的两条道路斗争', '无产阶级司令部和资产阶级司令部的斗争', '毛主席革命路线和刘少奇反革命修正主义路线的斗争'],
                '明显_需要审核': ['革命', '政治运动', '反动派', '国民党', '共产党', '资本主义', '社会主义', '共产主义', '法西斯', '纳粹', '希特勒', '墨索里尼', '东条英机', '军国主义', '帝国主义', '殖民主义', '霸权主义', '沙文主义', '大国沙文主义', '种族主义', '分裂主义', '恐怖主义', '极端主义', '原教旨主义', '宗教极端主义', '民族分裂主义', '国家分裂主义'],
                '轻微_注意': ['民族主义', '政府', '国家', '社会', '历史', '战争', '政治']
            },
            '宗教争议': {
                '严重_直接不适': ['邪教', '异端', '极端宗教', '宗教极端主义', '原教旨主义', '恐怖主义', '极端主义', '分裂主义', '民族分裂主义', '国家分裂主义'],
                '明显_需要审核': ['宗教', '信仰', '上帝', '佛祖', '真主', '耶稣', '基督', '穆罕默德', '释迦牟尼', '天堂', '地狱', '炼狱', '轮回', '转世', '投胎', '超度', '往生', '涅槃', '极乐世界'],
                '轻微_注意': ['寺庙', '教堂', '清真寺', '道观', '神社', '神宫', '神殿', '神庙', '祠堂']
            },
            '恐怖内容': {
                '严重_直接不适': ['恐怖袭击', '恐怖爆炸', '恐怖绑架', '恐怖劫持', '恐怖暗杀', '恐怖谋杀', '恐怖屠杀', '恐怖主义', '恐怖组织', '恐怖活动', '恐怖分子', '恐怖威胁'],
                '明显_需要审核': ['恐怖', '鬼', '幽灵', '灵魂', '魂魄', '亡灵', '死灵', '怨灵', '恶灵', '厉鬼', '冤魂', '冤鬼', '恶鬼', '饿鬼', '色鬼', '酒鬼', '烟鬼', '赌鬼', '懒鬼', '胆小鬼', '冒失鬼', '机灵鬼', '讨厌鬼', '淘气鬼', '小鬼', '鬼魂', '鬼怪', '妖怪', '妖精', '精灵', '僵尸', '吸血鬼', '狼人', '木乃伊', '恶魔', '魔鬼', '撒旦', '地狱'],
                '轻微_注意': ['神', '仙', '佛', '菩萨', '罗汉', '金刚', '天王', '力士', '护法', '伽蓝', '韦驮']
            },
            '赌博相关内容': {
                '严重_直接不适': ['赌博', '赌场', '赌钱', '赌局', '赌注', '赌本', '赌资', '赌债', '赌徒', '赌鬼', '赌棍', '赌王', '赌圣', '赌侠', '赌霸', '赌魔', '赌仙', '赌神', '赌命', '赌石', '赌石', '赌球', '赌马', '赌狗', '赌鸡', '赌拳', '赌命', '赌身家', '赌身家性命'],
                '明显_需要审核': ['赌', '博彩', '彩票', '老虎机', '百家乐', '轮盘', '骰子', '牌九', '麻将', '扑克', '梭哈', '德州扑克', '21点', '轮盘赌', '百家乐'],
                '轻微_注意': ['游戏', '娱乐', '消遣', '玩']
            },
            '烟酒相关内容': {
                '严重_直接不适': ['吸烟', '抽烟', '香烟', '卷烟', '雪茄', '烟斗', '烟嘴', '烟丝', '烟叶', '烟草', '烟瘾', '戒烟', '二手烟', '三手烟', '电子烟', '烟油', '烟弹', '烟盒', '烟灰', '烟头', '烟蒂', '烟圈', '烟雾', '烟霾'],
                '明显_需要审核': ['烟', '酒', '喝酒', '饮酒', '酗酒', '醉酒', '酒鬼', '酒徒', '酒鬼', '酒疯子', '酒后', '酒驾', '醉驾', '酒精', '啤酒', '白酒', '红酒', '葡萄酒', '威士忌', '白兰地', '伏特加', '朗姆酒', '龙舌兰', '清酒', '米酒', '黄酒', '果酒', '鸡尾酒', '利口酒', '苦艾酒'],
                '轻微_注意': ['抽烟', '喝酒', '烟酒']
            },
            '不良行为': {
                '严重_直接不适': ['偷窃', '抢劫', '诈骗', '敲诈', '勒索', '绑架', '拐卖', '拐骗', '诱拐', '拐带', '拐子', '人贩子', '买媳妇', '买老婆', '买孩子', '买儿子', '买女儿', '买卖人口', '人口买卖', '贩卖人口', '人口贩卖'],
                '明显_需要审核': ['偷', '盗', '抢', '骗', '拐', '卖', '嫖', '赌', '毒', '黄', '黑', '匪', '寇', '贼', '盗贼', '强盗', '土匪', '山贼', '马贼', '海盗', '海盗', '飞贼', '惯偷', '小偷', '扒手', '窃贼', '贼人', '贼子', '贼寇', '贼兵', '贼将', '贼帅', '贼王', '贼首', '贼头', '贼窝', '贼巢', '贼窟', '贼窝', '贼窝'],
                '轻微_注意': ['坏', '恶', '邪', '奸', '狡', '诈', '猾', '阴', '险', '毒', '狠', '辣', '凶', '暴', '虐', '残', '忍', '酷', '厉', '猛', '烈', '刚', '强', '硬', '软', '弱', '虚', '假', '伪', '冒', '伪', '假', '冒', '伪']
            }
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

        // 需要特别审核的书目（基于标题判断）- 扩展版
        this.warningBooks = [
            // 古典文学中的成人内容
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
            '四十一炮', '檀香刑', '蛙', '红高粱',
            // 暴力/犯罪
            '坏蛋是怎样炼成的', '黑道悲情', '东北往事', '黑道风云20年',
            '狼牙', '利刃出鞘', '绝对权力', '国家公诉', '突出重围',
            '亮剑', '历史的天空', '激情燃烧的岁月', '中国式关系',
            // 言情/成人
            '我的前半生', '甄嬛传', '如懿传', '延禧攻略', '芈月传',
            '三生三世十里桃花', '花千骨', '楚乔传', '锦绣未央',
            '琅琊榜', '庆余年', '雪中悍刀行', '斗破苍穹',
            '完美世界', '遮天', '神墓', '长生界', '帝霸',
            // 悬疑/恐怖
            '盗墓笔记', '鬼吹灯', '茅山后裔', '民调局异闻录',
            '心理罪', '法医秦明', '十宗罪', '暗黑者', '死亡通知单',
            // 其他不适合
            '废都', '白鹿原', '尘埃落定', '长恨歌', '繁花',
            '推拿', '秦腔', '古炉', '生死疲劳', '蛙',
            // 武侠（部分可能不适合）
            '射雕英雄传', '神雕侠侣', '倚天屠龙记', '天龙八部',
            '笑傲江湖', '鹿鼎记', '书剑恩仇录', '雪山飞狐',
            '飞狐外传', '连城诀', '侠客行', '碧血剑', '鸳鸯刀'
        ];

        // 分类黑名单 - 这些分类的书籍需要特别注意
        this.categoryWarning = {
            '高风险': ['言情', '都市', '玄幻', '修仙', '耽美', '同人', '虐恋', '穿越', '重生'],
            '中风险': ['武侠', '悬疑', '推理', '惊悚', '恐怖', '灵异', '鬼怪', '盗墓', '黑道'],
            '低风险': ['历史', '军事', '政治', '传记', '纪实']
        };
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
            sensitiveWordsFound: [],
            riskLevel: '低'
        };

        const allText = `${book.title || ''} ${book.author || ''} ${book.description || ''} ${book.category || ''}`.toLowerCase();

        // 1. 检查是否为已知安全书目
        if (this.knownSafeBooks.some(s => book.title && book.title.includes(s))) {
            result.reasons.push('✅ 经典必读书目，教育部门推荐');
            result.score = Math.min(result.score + 10, 100); // 降低加分
        }

        // 2. 深度检查敏感内容（更严格）
        this.checkSensitiveContent(allText, result);

        // 3. 检查书名是否包含敏感词
        this.checkTitleSensitive(book.title, result);

        // 4. 检查是否为需要特别审核的书目
        if (this.warningBooks.some(w => book.title && book.title.includes(w))) {
            result.warnings.push('⚠️ 该书目被标记为需要教师特别审核');
            result.score -= 30; // 更严格的扣分
        }

        // 5. 基于分类分析（更严格）
        this.analyzeByCategory(book.category, result);

        // 6. 综合评估
        this.comprehensiveEvaluation(result);

        // 7. 确定适用年龄
        this.determineAgeRange(result);

        // 8. 评估难度
        this.assessDifficulty(book, result);

        // 9. 计算最终评级
        this.calculateFinalRating(result);

        return result;
    }

    checkSensitiveContent(text, result) {
        let totalFound = 0;
        let severeFound = 0;
        let obviousFound = 0;

        for (const [category, levels] of Object.entries(this.sensitiveWords)) {
            for (const [level, words] of Object.entries(levels)) {
                if (Array.isArray(words)) {
                    const found = words.filter(w => text.includes(w.toLowerCase()));
                    if (found.length > 0) {
                        totalFound += found.length;
                        const uniqueFound = [...new Set(found)];
                        result.sensitiveWordsFound.push({
                            category,
                            level,
                            words: uniqueFound.slice(0, 15)
                        });

                        if (level === '严重_直接不适') {
                            severeFound += found.length;
                            result.score -= 50; // 严重内容大幅扣分
                            result.overLevelRisk = '高';
                            result.riskLevel = '高';
                            result.warnings.push(`🚨 发现${category}严重敏感内容：${uniqueFound.slice(0, 8).join('、')}`);
                        } else if (level === '明显_需要审核') {
                            obviousFound += found.length;
                            result.score -= 30; // 明显内容中等扣分
                            if (result.overLevelRisk !== '高') {
                                result.overLevelRisk = '中';
                                result.riskLevel = '中';
                            }
                            result.warnings.push(`⚠️ 发现${category}敏感内容：${uniqueFound.slice(0, 8).join('、')}`);
                        } else {
                            result.score -= 10; // 轻微内容轻微扣分
                        }
                    }
                }
            }
        }

        if (totalFound === 0) {
            result.reasons.push('✅ 未检测到敏感内容');
        } else {
            result.reasons.push(`发现 ${totalFound} 个敏感词（严重：${severeFound}，明显：${obviousFound}）`);
        }
    }

    checkTitleSensitive(title, result) {
        if (!title) return;

        const titleLower = title.toLowerCase();
        
        // 检查书名是否包含敏感词
        for (const [category, levels] of Object.entries(this.sensitiveWords)) {
            for (const [level, words] of Object.entries(levels)) {
                if (Array.isArray(words)) {
                    const found = words.filter(w => titleLower.includes(w.toLowerCase()));
                    if (found.length > 0) {
                        result.score -= 20; // 书名敏感词额外扣分
                        result.warnings.push(`⚠️ 书名包含${category}敏感词：${found.join('、')}`);
                    }
                }
            }
        }

        // 特殊书名检查
        const specialWarnings = [
            '金瓶梅', '肉蒲团', '灯草和尚', '痴婆子', '如意君传',
            '玉蒲团', '绣榻野史', '株林野史', '浪史', '弁而钗',
            '品花宝鉴', '青楼梦', '花月痕', '海上花列传', '九尾龟',
            '孽海花', '官场现形记', '二十年目睹之怪现状', '老残游记',
            '残春', '沉沦', '春风沉醉的晚上', '迟桂花',
            '红玫瑰与白玫瑰', '金锁记', '半生缘', '倾城之恋',
            '色戒', '小团圆', '同学少年都不贱', '郁金香',
            '霸王别姬', '活着', '许三观卖血记', '兄弟',
            '丰乳肥臀', '檀香刑', '蛙', '红高粱',
            '生死疲劳', '酒国', '天堂蒜薹之歌', '食草家族',
            '四十一炮', '檀香刑', '蛙', '红高粱'
        ];

        if (specialWarnings.some(w => title.includes(w))) {
            result.score -= 40; // 特殊书名大幅扣分
            result.warnings.push(`🚨 该书目被标记为不适合初中生阅读`);
            result.overLevelRisk = '高';
            result.riskLevel = '高';
        }
    }

    analyzeByCategory(category, result) {
        if (!category) return;

        const categoryLower = category.toLowerCase();

        // 高风险分类
        if (this.categoryWarning['高风险'].some(c => categoryLower.includes(c))) {
            result.score -= 25;
            result.warnings.push(`⚠️ 该书目分类「${category}」属于高风险类型，需要特别审核`);
            if (result.overLevelRisk !== '高') result.overLevelRisk = '中';
        }
        // 中风险分类
        else if (this.categoryWarning['中风险'].some(c => categoryLower.includes(c))) {
            result.score -= 15;
            result.warnings.push(`⚠️ 该书目分类「${category}」属于中风险类型，建议审核`);
            if (result.overLevelRisk === '低') result.overLevelRisk = '低';
        }
        // 低风险分类
        else if (this.categoryWarning['低风险'].some(c => categoryLower.includes(c))) {
            result.score -= 5;
        }
        // 安全分类
        else if (['童话', '寓言', '科普', '诗歌', '散文', '传记'].some(c => categoryLower.includes(c))) {
            result.score += 5;
            result.reasons.push('分类为适合青少年的类型');
        }
    }

    comprehensiveEvaluation(result) {
        // 综合评估：如果有多个敏感内容，额外扣分
        if (result.sensitiveWordsFound.length >= 3) {
            result.score -= 15;
            result.warnings.push('⚠️ 发现多种敏感内容，综合风险较高');
        }

        // 如果有严重敏感内容，直接标记为不建议
        if (result.sensitiveWordsFound.some(s => s.level === '严重_直接不适')) {
            result.overLevelRisk = '高';
            result.riskLevel = '高';
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
            result.level = '适合';
        } else if (result.score >= 60) {
            result.level = '需要审核';
        } else if (result.score >= 40) {
            result.level = '不建议';
        } else {
            result.level = '禁止';
        }

        // 更新建议
        if (result.warnings.length > 0) {
            result.suggestions.unshift('⚠️ 建议教师先仔细审核内容后再推荐给学生');
        } else if (result.ageRange.length < 4) {
            result.suggestions.unshift('⚠️ 该书目适合年龄偏大的学生，建议高年级使用');
        } else {
            result.suggestions.unshift('✅ 该书目适合初中生阅读');
        }

        // 根据风险等级调整建议
        if (result.riskLevel === '高') {
            result.suggestions.unshift('🚨 该书目存在严重不适合初中生的内容，强烈不建议推荐');
        } else if (result.riskLevel === '中') {
            result.suggestions.unshift('⚠️ 该书目部分内容可能不适合初中生，建议教师审核后使用');
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
            banned: 0,
            byAge: { 12: 0, 13: 0, 14: 0, 15: 0 },
            byDifficulty: { '较易': 0, '中等': 0, '较难': 0 },
            byRisk: { '低': 0, '中': 0, '高': 0 },
            warnings: [],
            severeWarnings: []
        };

        analyses.forEach(({ analysis }) => {
            if (analysis.level === '适合') {
                report.suitable++;
            } else if (analysis.level === '需要审核') {
                report.needsReview++;
            } else if (analysis.level === '不建议') {
                report.notSuitable++;
            } else {
                report.banned++;
            }

            analysis.ageRange.forEach(age => {
                if (report.byAge[age] !== undefined) report.byAge[age]++;
            });

            if (report.byDifficulty[analysis.difficulty] !== undefined) {
                report.byDifficulty[analysis.difficulty]++;
            }

            if (report.byRisk[analysis.riskLevel] !== undefined) {
                report.byRisk[analysis.riskLevel]++;
            }

            if (analysis.warnings.length > 0) {
                report.warnings.push(...analysis.warnings);
            }

            if (analysis.riskLevel === '高') {
                report.severeWarnings.push({
                    title: analysis.level,
                    warnings: analysis.warnings
                });
            }
        });

        return report;
    }
}

const aiReviewEngine = new AIReviewEngine();