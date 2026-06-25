// 规则引擎
class RuleEngine {
    constructor(database) {
        this.db = database;
    }

    // 评估文本内容
    evaluateText(text, grade) {
        const rules = this.db.getRules().filter(rule => rule.isActive);
        const results = [];

        for (const rule of rules) {
            const matches = this.checkRule(text, rule);
            if (matches.length > 0) {
                const restriction = rule.gradeRestrictions[grade.toString()];
                results.push({
                    rule: rule,
                    matches: matches,
                    gradeRestriction: restriction,
                    riskLevel: rule.riskLevel
                });
            }
        }

        return results;
    }

    // 检查规则匹配
    checkRule(text, rule) {
        const matches = [];
        const keywords = rule.keywords.split(',').map(k => k.trim());
        
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                matches.push(keyword);
            }
        }
        
        return matches;
    }

    // 评估章节
    evaluateChapter(chapter) {
        const text = `${chapter.title} ${chapter.summary} ${chapter.keywords.join(' ')}`;
        const grade = this.getChapterGrade(chapter);
        
        if (!grade) {
            return {
                isOverLevel: false,
                reason: '无法确定年级',
                matches: []
            };
        }

        const results = this.evaluateText(text, grade);
        
        // 检查是否有禁止的内容
        const prohibitedMatches = results.filter(r => r.gradeRestriction === '禁止');
        const reviewMatches = results.filter(r => r.gradeRestriction === '需审核');
        
        if (prohibitedMatches.length > 0) {
            return {
                isOverLevel: true,
                reason: '包含禁止内容',
                matches: prohibitedMatches,
                riskLevel: '高'
            };
        }
        
        if (reviewMatches.length > 0) {
            return {
                isOverLevel: true,
                reason: '需要审核',
                matches: reviewMatches,
                riskLevel: '中'
            };
        }
        
        return {
            isOverLevel: false,
            reason: '符合要求',
            matches: []
        };
    }

    // 获取章节适用的年级
    getChapterGrade(chapter) {
        const book = this.db.getBookById(chapter.bookId);
        if (book && book.applicableGrades.length > 0) {
            // 返回最小年级
            return Math.min(...book.applicableGrades);
        }
        return null;
    }

    // 批量评估书目
    evaluateBook(bookId) {
        const chapters = this.db.getChaptersByBookId(bookId);
        const results = [];
        
        for (const chapter of chapters) {
            const evaluation = this.evaluateChapter(chapter);
            results.push({
                chapter: chapter,
                evaluation: evaluation
            });
            
            // 更新章节评估结果
            this.db.updateChapter(chapter.id, {
                isOverLevel: evaluation.isOverLevel,
                overLevelType: evaluation.isOverLevel ? this.getOverLevelType(evaluation.matches) : null,
                overLevelDescription: evaluation.isOverLevel ? evaluation.reason : null,
                estimatedDifficulty: this.estimateDifficulty(chapter)
            });
        }
        
        // 更新书目审核状态
        this.db.updateBookReviewStatus(bookId);
        
        return results;
    }

    // 获取超纲类型
    getOverLevelType(matches) {
        if (matches.length === 0) return null;
        
        const firstMatch = matches[0];
        const rule = firstMatch.rule;
        
        // 根据规则名称推断超纲类型
        if (rule.name.includes('政治')) return '政治敏感';
        if (rule.name.includes('暴力')) return '暴力血腥';
        if (rule.name.includes('性')) return '性教育';
        if (rule.name.includes('文言')) return '文言文过难';
        if (rule.name.includes('专业')) return '专业术语过多';
        if (rule.name.includes('迷信')) return '封建迷信';
        
        return '其他';
    }

    // 估算难度
    estimateDifficulty(chapter) {
        const text = `${chapter.title} ${chapter.summary} ${chapter.keywords.join(' ')}`;
        let score = 0;
        
        // 基于文本长度
        if (text.length > 100) score += 1;
        if (text.length > 200) score += 1;
        
        // 基于关键词数量
        if (chapter.keywords.length > 3) score += 1;
        if (chapter.keywords.length > 5) score += 1;
        
        // 基于规则匹配
        const evaluation = this.evaluateChapter(chapter);
        if (evaluation.matches.length > 0) score += 1;
        if (evaluation.riskLevel === '高') score += 1;
        
        // 返回难度等级
        if (score <= 2) return '较易';
        if (score <= 4) return '中等';
        return '较难';
    }

    // 测试规则
    testRule(text, grade) {
        return this.evaluateText(text, grade);
    }

    // 获取规则统计信息
    getRuleStatistics() {
        const rules = this.db.getRules();
        const chapters = this.db.getChapters();
        
        const stats = {
            totalRules: rules.length,
            activeRules: rules.filter(r => r.isActive).length,
            totalChapters: chapters.length,
            reviewedChapters: chapters.filter(c => c.reviewStatus === '已审核').length,
            overLevelChapters: chapters.filter(c => c.isOverLevel).length
        };
        
        return stats;
    }
}

// 创建全局规则引擎实例
const ruleEngine = new RuleEngine(db);