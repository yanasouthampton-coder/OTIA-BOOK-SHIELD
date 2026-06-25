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
            } else {
                // 使用默认数据
                this.data = {
                    books: [],
                    chapters: [],
                    rules: [],
                    overLevelTypes: []
                };
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.data = {
                books: [],
                chapters: [],
                rules: [],
                overLevelTypes: []
            };
        }
    }

    // 保存数据
    saveData() {
        try {
            localStorage.setItem('bookReviewSystem', JSON.stringify(this.data));
        } catch (error) {
            console.error('保存数据失败:', error);
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
}

// 创建全局数据库实例
const db = new Database();