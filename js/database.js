// 数据库操作
class Database {
    constructor() {
        this.data = null;
        this.loadData();
    }

    // 加载数据
    loadData() {
        try {
            const savedData = localStorage.getItem('bookReviewSystem');
            if (savedData) {
                this.data = JSON.parse(savedData);
                // 验证数据完整性
                if (!this.data.books || !Array.isArray(this.data.books)) {
                    throw new Error('数据格式不正确');
                }
            } else {
                // 使用内置默认数据
                this.data = this.getDefaultData();
                this.saveData();
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.data = this.getDefaultData();
        }
    }

    // 获取内置默认数据
    getDefaultData() {
        return {
            books: [
                {"id":1,"title":"朝花夕拾","author":"鲁迅","category":"散文集","publisher":"人民文学出版社","isbn":"978-7-0200-0289-1","description":"鲁迅的回忆性散文集，记录了作者从童年到青年的生活经历。","totalChapters":10,"applicableGrades":[7],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":2,"title":"西游记","author":"吴承恩","category":"古典小说","publisher":"人民文学出版社","isbn":"978-7-0200-0289-2","description":"中国古典四大名著之一，讲述唐僧师徒西天取经的故事。","totalChapters":100,"applicableGrades":[7,8],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":3,"title":"骆驼祥子","author":"老舍","category":"长篇小说","publisher":"人民文学出版社","isbn":"978-7-0200-0289-3","description":"老舍代表作，讲述北平人力车夫祥子的悲剧命运。","totalChapters":24,"applicableGrades":[8],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":4,"title":"海底两万里","author":"凡尔纳","category":"科幻小说","publisher":"译林出版社","isbn":"978-7-0200-0289-4","description":"法国科幻小说家凡尔纳的代表作，讲述海底探险的故事。","totalChapters":47,"applicableGrades":[7,8],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":5,"title":"红星照耀中国","author":"埃德加·斯诺","category":"纪实文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-5","description":"美国记者斯诺记录中国革命的纪实作品。","totalChapters":12,"applicableGrades":[8,9],"overallDifficulty":"较难","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":6,"title":"钢铁是怎样炼成的","author":"奥斯特洛夫斯基","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-6","description":"苏联作家的自传体小说，讲述保尔·柯察金的成长故事。","totalChapters":18,"applicableGrades":[8,9],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":7,"title":"简爱","author":"夏洛蒂·勃朗特","category":"文学","publisher":"译林出版社","isbn":"978-7-0200-0289-7","description":"英国作家的代表作，讲述女主人公简爱的成长故事。","totalChapters":38,"applicableGrades":[9],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":8,"title":"城南旧事","author":"林海音","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-8","description":"描写了小英子的童年生活，展现老北京的风土人情。","totalChapters":12,"applicableGrades":[7],"overallDifficulty":"较易","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":9,"title":"小王子","author":"圣埃克苏佩里","category":"童话","publisher":"人民文学出版社","isbn":"978-7-0200-0289-9","description":"以一位飞行员作为故事叙述者，讲述了小王子从自己星球出发前往地球的过程。","totalChapters":27,"applicableGrades":[7],"overallDifficulty":"较易","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":10,"title":"草房子","author":"曹文轩","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-10","description":"讲述了男孩桑桑的六年小学生活。","totalChapters":10,"applicableGrades":[7,8],"overallDifficulty":"较易","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":11,"title":"呐喊","author":"鲁迅","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-11","description":"鲁迅的第一本短篇小说集，收录了《狂人日记》等名篇。","totalChapters":14,"applicableGrades":[8],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":12,"title":"边城","author":"沈从文","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-12","description":"描绘了湘西地区特有的风土人情。","totalChapters":21,"applicableGrades":[8,9],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":13,"title":"昆虫记","author":"法布尔","category":"科普","publisher":"人民文学出版社","isbn":"978-7-0200-0289-13","description":"法国昆虫学家的科普著作，记录昆虫的生活习性。","totalChapters":10,"applicableGrades":[7],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":14,"title":"伊索寓言","author":"伊索","category":"寓言","publisher":"人民文学出版社","isbn":"978-7-0200-0289-14","description":"古希腊寓言故事集，包含许多富有哲理的故事。","totalChapters":100,"applicableGrades":[6,7],"overallDifficulty":"较易","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":15,"title":"傅雷家书","author":"傅雷","category":"书信","publisher":"人民文学出版社","isbn":"978-7-0200-0289-15","description":"傅雷写给儿子的家书，展现了深厚的父子情。","totalChapters":10,"applicableGrades":[8],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":16,"title":"艾青诗选","author":"艾青","category":"诗歌","publisher":"人民文学出版社","isbn":"978-7-0200-0289-16","description":"中国现代诗人艾青的诗歌选集。","totalChapters":50,"applicableGrades":[9],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":17,"title":"水浒传","author":"施耐庵","category":"古典小说","publisher":"人民文学出版社","isbn":"978-7-0200-0289-17","description":"中国古典四大名著之一，讲述梁山好汉的故事。","totalChapters":120,"applicableGrades":[8,9],"overallDifficulty":"较难","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":18,"title":"儒林外史","author":"吴敬梓","category":"古典小说","publisher":"人民文学出版社","isbn":"978-7-0200-0289-18","description":"中国古代讽刺小说的巅峰之作。","totalChapters":56,"applicableGrades":[9],"overallDifficulty":"较难","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":19,"title":"三国演义","author":"罗贯中","category":"古典小说","publisher":"人民文学出版社","isbn":"978-7-0200-0289-19","description":"中国古典四大名著之一，讲述三国时期的历史故事。","totalChapters":120,"applicableGrades":[8,9],"overallDifficulty":"较难","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":20,"title":"红楼梦","author":"曹雪芹","category":"古典小说","publisher":"人民文学出版社","isbn":"978-7-0200-0289-20","description":"中国古典四大名著之首，描写了贾宝玉和林黛玉的爱情悲剧。","totalChapters":120,"applicableGrades":[9],"overallDifficulty":"较难","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":21,"title":"格列佛游记","author":"斯威夫特","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-21","description":"英国作家的讽刺小说，讲述格列佛的奇幻旅行。","totalChapters":4,"applicableGrades":[8],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":22,"title":"京华烟云","author":"林语堂","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-22","description":"描写了三大家族的悲欢离合。","totalChapters":45,"applicableGrades":[9],"overallDifficulty":"较难","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":23,"title":"我与地坛","author":"史铁生","category":"散文","publisher":"人民文学出版社","isbn":"978-7-0200-0289-23","description":"表达了对母亲的怀念和对生命的思考。","totalChapters":7,"applicableGrades":[8],"overallDifficulty":"中等","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":24,"title":"撒哈拉的故事","author":"三毛","category":"散文","publisher":"人民文学出版社","isbn":"978-7-0200-0289-24","description":"三毛在撒哈拉沙漠生活时的所见所闻。","totalChapters":10,"applicableGrades":[8],"overallDifficulty":"较易","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":25,"title":"平凡的世界","author":"路遥","category":"文学","publisher":"人民文学出版社","isbn":"978-7-0200-0289-25","description":"以70年代到80年代为背景，讲述了普通人的生活。","totalChapters":52,"applicableGrades":[8,9],"overallDifficulty":"较难","reviewStatus":"待审核","createdAt":"2024-01-01","updatedAt":"2024-01-01"}
            ],
            chapters: [
                {"id":1,"bookId":1,"chapterNumber":1,"title":"狗·猫·鼠","summary":"描述作者对猫的厌恶和对鼠的同情","keywords":["猫","鼠","童年"],"estimatedDifficulty":"较易","isOverLevel":false,"overLevelType":null,"overLevelDescription":null,"reviewer":null,"reviewStatus":"待审核","reviewNotes":null,"createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":2,"bookId":1,"chapterNumber":2,"title":"阿长与《山海经》","summary":"回忆保姆长妈妈，讲述她为作者购买《山海经》的故事","keywords":["长妈妈","山海经","童年"],"estimatedDifficulty":"较易","isOverLevel":false,"overLevelType":null,"overLevelDescription":null,"reviewer":null,"reviewStatus":"待审核","reviewNotes":null,"createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":3,"bookId":1,"chapterNumber":3,"title":"二十四孝图","summary":"批判封建孝道，讲述二十四孝图中的故事","keywords":["孝道","封建","批判"],"estimatedDifficulty":"中等","isOverLevel":false,"overLevelType":null,"overLevelDescription":null,"reviewer":null,"reviewStatus":"待审核","reviewNotes":null,"createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":4,"bookId":1,"chapterNumber":4,"title":"五猖会","summary":"描述作者儿时盼望观看五猖会的经历","keywords":["五猖会","童年","民俗"],"estimatedDifficulty":"较易","isOverLevel":false,"overLevelType":null,"overLevelDescription":null,"reviewer":null,"reviewStatus":"待审核","reviewNotes":null,"createdAt":"2024-01-01","updatedAt":"2024-01-01"},
                {"id":5,"bookId":1,"chapterNumber":5,"title":"无常","summary":"描述迎神赛会中的无常形象","keywords":["无常","民俗","鬼神"],"estimatedDifficulty":"中等","isOverLevel":false,"overLevelType":null,"overLevelDescription":null,"reviewer":null,"reviewStatus":"待审核","reviewNotes":null,"createdAt":"2024-01-01","updatedAt":"2024-01-01"}
            ],
            rules: [
                {"id":1,"name":"政治敏感内容","description":"涉及政治敏感话题、历史事件的不当描述","keywords":"政治,革命,反动,右派,文革","gradeRestrictions":{"6":"禁止","7":"需审核","8":"需审核","9":"允许"},"riskLevel":"高","isActive":true},
                {"id":2,"name":"暴力血腥内容","description":"涉及暴力、血腥、恐怖场景","keywords":"杀,血,死,暴力,恐怖,鬼","gradeRestrictions":{"6":"禁止","7":"需审核","8":"需审核","9":"需审核"},"riskLevel":"高","isActive":true},
                {"id":3,"name":"性教育相关内容","description":"涉及性教育、成人情感内容","keywords":"性,爱情,婚姻,情欲,床","gradeRestrictions":{"6":"禁止","7":"禁止","8":"需审核","9":"需审核"},"riskLevel":"中","isActive":true},
                {"id":4,"name":"文言文难度","description":"涉及文言文、古文内容，可能超出学生理解能力","keywords":"文言,古文,之乎者也,矣,兮","gradeRestrictions":{"6":"需审核","7":"需审核","8":"允许","9":"允许"},"riskLevel":"中","isActive":true},
                {"id":5,"name":"专业术语密度","description":"涉及专业术语、学术内容，可能超出学生理解能力","keywords":"理论,主义,哲学,逻辑,辩证","gradeRestrictions":{"6":"禁止","7":"需审核","8":"需审核","9":"允许"},"riskLevel":"中","isActive":true},
                {"id":6,"name":"封建迷信内容","description":"涉及封建迷信、鬼神、命运等内容","keywords":"迷信,命运,风水,算命,鬼神","gradeRestrictions":{"6":"禁止","7":"需审核","8":"需审核","9":"需审核"},"riskLevel":"中","isActive":true}
            ],
            overLevelTypes: [
                {"id":1,"name":"政治敏感","description":"涉及政治敏感内容","riskLevel":"高"},
                {"id":2,"name":"暴力血腥","description":"涉及暴力、血腥内容","riskLevel":"高"},
                {"id":3,"name":"性教育","description":"涉及性教育、成人情感内容","riskLevel":"中"},
                {"id":4,"name":"文言文过难","description":"文言文难度超出学生理解能力","riskLevel":"中"},
                {"id":5,"name":"专业术语过多","description":"专业术语密度过高","riskLevel":"中"},
                {"id":6,"name":"封建迷信","description":"涉及封建迷信内容","riskLevel":"中"},
                {"id":7,"name":"其他","description":"其他类型的超纲内容","riskLevel":"低"}
            ]
        };
    }

    // 保存数据
    saveData() {
        try {
            const jsonStr = JSON.stringify(this.data);
            localStorage.setItem('bookReviewSystem', jsonStr);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                // 数据量过大，尝试精简保存（去掉章节的冗长描述）
                try {
                    const reduced = JSON.parse(JSON.stringify(this.data));
                    reduced.chapters = reduced.chapters.map(ch => ({
                        ...ch,
                        summary: (ch.summary || '').substring(0, 50),
                        overLevelDescription: (ch.overLevelDescription || '').substring(0, 50)
                    }));
                    const jsonStr = JSON.stringify(reduced);
                    localStorage.setItem('bookReviewSystem', jsonStr);
                    console.warn('数据量过大，已精简章节描述后保存');
                    return true;
                } catch (e2) {
                    alert('⚠️ 存储空间不足！数据已加载但无法保存到本地。\n\n建议：\n1. 导出当前数据备份\n2. 清除浏览器缓存后重新导入\n\n错误详情：' + e2.message);
                    return false;
                }
            }
            return false;
        }
    }

    // 导入默认数据
    importDefaultData(defaultData) {
        this.data = defaultData;
        this.saveData();
    }

    // 获取所有书目
    getBooks() {
        return this.data.books;
    }

    // 根据ID获取书目
    getBookById(id) {
        return this.data.books.find(book => book.id === id);
    }

    // 添加书目
    addBook(book) {
        const newId = Math.max(...this.data.books.map(b => b.id), 0) + 1;
        const newBook = {
            ...book,
            id: newId,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        this.data.books.push(newBook);
        this.saveData();
        return newBook;
    }

    // 更新书目
    updateBook(id, updates) {
        const index = this.data.books.findIndex(book => book.id === id);
        if (index !== -1) {
            this.data.books[index] = {
                ...this.data.books[index],
                ...updates,
                updatedAt: new Date().toISOString().split('T')[0]
            };
            this.saveData();
            return this.data.books[index];
        }
        return null;
    }

    // 删除书目
    deleteBook(id) {
        this.data.books = this.data.books.filter(book => book.id !== id);
        // 同时删除相关章节
        this.data.chapters = this.data.chapters.filter(chapter => chapter.bookId !== id);
        this.saveData();
    }

    // 获取所有章节
    getChapters() {
        return this.data.chapters;
    }

    // 根据书目ID获取章节
    getChaptersByBookId(bookId) {
        return this.data.chapters.filter(chapter => chapter.bookId === bookId);
    }

    // 根据ID获取章节
    getChapterById(id) {
        return this.data.chapters.find(chapter => chapter.id === id);
    }

    // 添加章节
    addChapter(chapter) {
        const newId = Math.max(...this.data.chapters.map(c => c.id), 0) + 1;
        const newChapter = {
            ...chapter,
            id: newId,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        this.data.chapters.push(newChapter);
        this.saveData();
        return newChapter;
    }

    // 更新章节
    updateChapter(id, updates) {
        const index = this.data.chapters.findIndex(chapter => chapter.id === id);
        if (index !== -1) {
            this.data.chapters[index] = {
                ...this.data.chapters[index],
                ...updates,
                updatedAt: new Date().toISOString().split('T')[0]
            };
            this.saveData();
            return this.data.chapters[index];
        }
        return null;
    }

    // 删除章节
    deleteChapter(id) {
        this.data.chapters = this.data.chapters.filter(chapter => chapter.id !== id);
        this.saveData();
    }

    // 获取所有规则
    getRules() {
        return this.data.rules;
    }

    // 根据ID获取规则
    getRuleById(id) {
        return this.data.rules.find(rule => rule.id === id);
    }

    // 添加规则
    addRule(rule) {
        const newId = Math.max(...this.data.rules.map(r => r.id), 0) + 1;
        const newRule = {
            ...rule,
            id: newId
        };
        this.data.rules.push(newRule);
        this.saveData();
        return newRule;
    }

    // 更新规则
    updateRule(id, updates) {
        const index = this.data.rules.findIndex(rule => rule.id === id);
        if (index !== -1) {
            this.data.rules[index] = {
                ...this.data.rules[index],
                ...updates
            };
            this.saveData();
            return this.data.rules[index];
        }
        return null;
    }

    // 删除规则
    deleteRule(id) {
        this.data.rules = this.data.rules.filter(rule => rule.id !== id);
        this.saveData();
    }

    // 获取超纲类型
    getOverLevelTypes() {
        return this.data.overLevelTypes;
    }

    // 根据书目ID获取超纲章节
    getOverLevelChaptersByBookId(bookId) {
        return this.data.chapters.filter(chapter => 
            chapter.bookId === bookId && chapter.isOverLevel
        );
    }

    // 获取指定年级的安全书目
    getSafeBooksForGrade(grade) {
        return this.data.books.filter(book => {
            // 检查书目是否适用于该年级
            if (!book.applicableGrades.includes(parseInt(grade))) {
                return false;
            }

            // 检查是否有超纲章节
            const chapters = this.getChaptersByBookId(book.id);
            const hasOverLevel = chapters.some(chapter => chapter.isOverLevel);
            
            return !hasOverLevel;
        });
    }

    // 获取指定年级的超纲书目
    getOverLevelBooksForGrade(grade) {
        return this.data.books.filter(book => {
            // 检查书目是否适用于该年级
            if (!book.applicableGrades.includes(parseInt(grade))) {
                return false;
            }

            // 检查是否有超纲章节
            const chapters = this.getChaptersByBookId(book.id);
            const overLevelChapters = chapters.filter(chapter => chapter.isOverLevel);
            
            return overLevelChapters.length > 0;
        });
    }

    // 更新书目审核状态
    updateBookReviewStatus(bookId) {
        const chapters = this.getChaptersByBookId(bookId);
        const hasOverLevel = chapters.some(chapter => chapter.isOverLevel);
        const allReviewed = chapters.every(chapter => chapter.reviewStatus === '已审核');
        
        let status = '待审核';
        if (allReviewed) {
            status = hasOverLevel ? '有超纲' : '已通过';
        } else if (chapters.some(chapter => chapter.reviewStatus === '已审核')) {
            status = '审核中';
        }
        
        this.updateBook(bookId, { reviewStatus: status });
        return status;
    }

    // 导出数据备份
    exportBackup() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `书盾数据备份_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 导入数据备份
    importBackup(jsonStr) {
        try {
            const imported = JSON.parse(jsonStr);
            if (imported.books && Array.isArray(imported.books)) {
                this.data = imported;
                this.saveData();
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    // 获取存储使用情况
    getStorageUsage() {
        try {
            const dataStr = localStorage.getItem('bookReviewSystem') || '';
            const usedBytes = new Blob([dataStr]).size;
            const maxBytes = 5 * 1024 * 1024; // 5MB
            return {
                used: usedBytes,
                max: maxBytes,
                percentage: Math.round((usedBytes / maxBytes) * 100),
                books: this.data.books.length
            };
        } catch (e) {
            return { used: 0, max: 5 * 1024 * 1024, percentage: 0, books: this.data.books.length };
        }
    }
}

// 创建全局数据库实例
const db = new Database();