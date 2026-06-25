class App {
    constructor() {
        this.currentTab = 'books';
        this.aiAnalyses = null;
        this.aiReport = null;
        this.init();
    }

    init() {
        this.bindNavTabs();
        this.bindBooksTab();
        this.bindChaptersTab();
        this.bindRulesTab();
        this.bindFilterTab();
        this.bindModals();
        this.renderBooks();
        this.populateChapterFilters();
    }

    bindNavTabs() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }

    switchTab(name) {
        this.currentTab = name;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(name + '-tab').classList.add('active');
        if (name === 'books') this.renderBooks();
        if (name === 'chapters') { this.populateChapterFilters(); this.renderChapters(); }
        if (name === 'rules') this.renderRules();
        if (name === 'filter') this.renderExportPreview();
    }

    bindBooksTab() {
        this.bind('add-book-btn', () => this.showBookModal());
        this.bind('ai-review-btn', () => this.startAIReview());
        this.bind('batch-evaluate-btn', () => this.batchEvaluate());
        this.bind('book-grade-filter', () => this.renderBooks());
        this.bind('book-status-filter', () => this.renderBooks());
        this.bind('book-search', () => this.renderBooks());
    }

    bindChaptersTab() {
        this.bind('batch-review-btn', () => this.batchReview());
        this.bind('export-review-btn', () => this.exportReviewResults());
        this.bind('chapter-book-filter', () => this.renderChapters());
        this.bind('chapter-status-filter', () => this.renderChapters());
    }

    bindRulesTab() {
        this.bind('add-rule-btn', () => this.showRuleModal());
        this.bind('test-rule-btn', () => this.testRule());
    }

    bindFilterTab() {
        this.bind('export-safe-btn', () => this.exportSafeBooks());
        this.bind('export-warning-btn', () => this.exportOverLevelBooks());
        this.bind('ai-search-btn', () => this.aiSearchBook());
        this.bind('camera-btn', () => camera.openCamera());
    }

    bindModals() {
        this.bind('close-book-modal', () => this.hideModal('book-modal'));
        this.bind('cancel-book', () => this.hideModal('book-modal'));
        this.bind('close-chapter-modal', () => this.hideModal('chapter-modal'));
        this.bind('cancel-chapter', () => this.hideModal('chapter-modal'));
        this.bind('close-rule-modal', () => this.hideModal('rule-modal'));
        this.bind('cancel-rule', () => this.hideModal('rule-modal'));
        this.bind('close-ai-modal', () => this.hideModal('ai-review-modal'));
        this.bind('close-ai-btn', () => this.hideModal('ai-review-modal'));
        this.bind('export-ai-result-btn', () => this.exportAIReviewResult());
        this.bind('confirm-mapping-btn', () => importHandler.confirmMapping());
        this.bind('cancel-mapping-btn', () => importHandler.hideMappingModal());
        this.bind('close-mapping-modal', () => importHandler.hideMappingModal());
        this.bind('book-form', (e) => this.saveBook(e), 'submit');
        this.bind('chapter-form', (e) => this.saveChapter(e), 'submit');
        this.bind('rule-form', (e) => this.saveRule(e), 'submit');
        this.bind('chapter-overlevel', (e) => {
            const show = e.target.checked ? 'block' : 'none';
            document.getElementById('overlevel-type-group').style.display = show;
            document.getElementById('overlevel-desc-group').style.display = show;
        });
    }

    bind(id, fn, event) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event || 'click', fn);
    }

    showModal(id) { document.getElementById(id).style.display = 'block'; }
    hideModal(id) { document.getElementById(id).style.display = 'none'; }

    renderBooks() {
        const gf = document.getElementById('book-grade-filter').value;
        const sf = document.getElementById('book-status-filter').value;
        const st = document.getElementById('book-search').value.toLowerCase().trim();
        let books = db.getBooks();
        if (gf !== 'all') books = books.filter(b => b.applicableGrades.includes(parseInt(gf)));
        if (sf !== 'all') books = books.filter(b => b.reviewStatus === sf);
        if (st) books = books.filter(b => b.title.toLowerCase().includes(st) || b.author.toLowerCase().includes(st));

        if (!this.bookPage) this.bookPage = 1;
        this.bookPageSize = 50;
        const totalPages = Math.ceil(books.length / this.bookPageSize);
        if (this.bookPage > totalPages) this.bookPage = totalPages || 1;
        const start = (this.bookPage - 1) * this.bookPageSize;
        const pageBooks = books.slice(start, start + this.bookPageSize);

        const c = document.getElementById('books-list');
        if (!books.length) { c.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">暂无书目数据</p>'; return; }

        let html = `<div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:13px;">共 ${books.length} 本，显示第 ${start+1}-${Math.min(start+this.bookPageSize,books.length)} 本</span>
            <div style="display:flex;gap:8px;align-items:center;">
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.goBookPage(${this.bookPage-1})" ${this.bookPage<=1?'disabled':''}>上一页</button>
                <span style="font-size:13px;">${this.bookPage}/${totalPages}</span>
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.goBookPage(${this.bookPage+1})" ${this.bookPage>=totalPages?'disabled':''}>下一页</button>
            </div>
        </div>`;

        html += pageBooks.map(b => {
            const g = b.applicableGrades.map(x => x + '年级').join('、');
            const sc = b.reviewStatus === '已通过' ? '#28a745' : b.reviewStatus === '有超纲' ? '#dc3545' : '#6c757d';
            
            // 获取AI审核结果
            const aiResult = this.getAIReviewResult(b);
            const aiScore = aiResult ? aiResult.score : null;
            const aiRisk = aiResult ? aiResult.riskLevel : null;
            const aiLevel = aiResult ? aiResult.level : null;
            
            const scoreColor = aiScore >= 80 ? '#28a745' : aiScore >= 60 ? '#ffc107' : '#dc3545';
            const riskColor = aiRisk === '高' ? '#dc3545' : aiRisk === '中' ? '#ffc107' : '#28a745';
            
            return `<div class="book-item" style="padding:16px;border:1px solid #e8ecf1;border-radius:10px;margin-bottom:12px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <h3 style="margin:0 0 8px;color:#1a1a2e;">${b.title}</h3>
                        <div style="margin-bottom:8px;">
                            <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;background:#667eea;color:#fff;margin-right:6px;">${b.category||''}</span>
                            <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;background:#ffc107;color:#333;margin-right:6px;">${b.overallDifficulty}</span>
                            <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;background:${sc};color:#fff;">${b.reviewStatus}</span>
                        </div>
                        <p style="margin:4px 0;color:#666;font-size:13px;">作者：${b.author} · 适用：${g}</p>
                    </div>
                    ${aiScore !== null ? `
                    <div style="text-align:center;padding:12px;background:${riskColor === '#dc3545' ? '#fff5f5' : riskColor === '#ffc107' ? '#fffdf0' : '#f0fff4'};border-radius:10px;min-width:100px;margin-left:12px;">
                        <div style="font-size:24px;font-weight:700;color:${scoreColor};">${aiScore}</div>
                        <div style="font-size:11px;color:#666;">AI评分</div>
                        <div style="font-size:12px;color:${riskColor};font-weight:500;margin-top:4px;">风险：${aiRisk}</div>
                        <button class="btn btn-secondary" style="margin-top:8px;padding:4px 10px;font-size:11px;" onclick="app.editAIReview(${b.id})">编辑</button>
                    </div>
                    ` : `
                    <div style="text-align:center;padding:12px;background:#f8f9fa;border-radius:10px;min-width:100px;margin-left:12px;">
                        <div style="font-size:12px;color:#999;">未审核</div>
                        <button class="btn btn-primary" style="margin-top:8px;padding:4px 10px;font-size:11px;" onclick="app.reviewSingleBook(${b.id})">审核</button>
                    </div>
                    `}
                </div>
                <div style="margin-top:10px;display:flex;gap:8px;">
                    <button class="btn btn-primary" style="padding:6px 14px;font-size:12px;" onclick="app.showBookModal(${b.id})">编辑书目</button>
                    <button class="btn btn-danger" style="padding:6px 14px;font-size:12px;" onclick="app.deleteBook(${b.id})">删除</button>
                </div>
            </div>`;
        }).join('');

        html += `<div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:13px;">共 ${books.length} 本</span>
            <div style="display:flex;gap:8px;align-items:center;">
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.goBookPage(${this.bookPage-1})" ${this.bookPage<=1?'disabled':''}>上一页</button>
                <span style="font-size:13px;">${this.bookPage}/${totalPages}</span>
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.goBookPage(${this.bookPage+1})" ${this.bookPage>=totalPages?'disabled':''}>下一页</button>
            </div>
        </div>`;

        c.innerHTML = html;
    }

    // 获取AI审核结果
    getAIReviewResult(book) {
        const cache = this.aiReviewCache || {};
        return cache[book.id] || null;
    }

    // 缓存AI审核结果
    setAIReviewCache(bookId, result) {
        if (!this.aiReviewCache) this.aiReviewCache = {};
        this.aiReviewCache[bookId] = result;
    }

    // 单本书AI审核
    reviewSingleBook(bookId) {
        const book = db.getBookById(bookId);
        if (!book) return;
        
        const analysis = aiReviewEngine.analyzeBook(book);
        this.setAIReviewCache(bookId, analysis);
        this.renderBooks();
    }

    // 批量AI审核所有书目
    batchAIReview() {
        const books = db.getBooks();
        if (!books.length) { alert('请先导入书目数据'); return; }
        
        let count = 0;
        books.forEach(b => {
            const analysis = aiReviewEngine.analyzeBook(b);
            this.setAIReviewCache(b.id, analysis);
            count++;
        });
        
        alert(`已完成 ${count} 本书的AI审核`);
        this.renderBooks();
    }

    // 编辑AI审核结果
    editAIReview(bookId) {
        const book = db.getBookById(bookId);
        if (!book) return;
        
        const cached = this.getAIReviewResult(book);
        const currentScore = cached ? cached.score : 50;
        const currentRisk = cached ? cached.riskLevel : '中';
        
        const newScore = prompt(`《${book.title}》\n当前AI评分：${currentScore}\n请输入新评分（0-100）：`, currentScore);
        if (newScore === null) return;
        
        const score = parseInt(newScore);
        if (isNaN(score) || score < 0 || score > 100) {
            alert('请输入0-100之间的数字');
            return;
        }
        
        let riskLevel = '低';
        if (score < 40) riskLevel = '高';
        else if (score < 70) riskLevel = '中';
        
        const newAnalysis = {
            score: score,
            riskLevel: riskLevel,
            level: score >= 80 ? '适合' : score >= 60 ? '需要审核' : score >= 40 ? '不建议' : '禁止',
            reason: '教师手动调整'
        };
        
        this.setAIReviewCache(bookId, newAnalysis);
        
        // 更新书目的审核状态
        let reviewStatus = '待审核';
        if (score >= 80) reviewStatus = '已通过';
        else if (score < 40) reviewStatus = '有超纲';
        
        db.updateBook(bookId, { reviewStatus: reviewStatus });
        this.renderBooks();
    }

    goBookPage(p) {
        const books = db.getBooks();
        const tp = Math.ceil(books.length / this.bookPageSize);
        if (p < 1 || p > tp) return;
        this.bookPage = p;
        this.renderBooks();
    }

    renderChapters() {
        const bf = document.getElementById('chapter-book-filter').value;
        const sf = document.getElementById('chapter-status-filter').value;
        let chs = db.getChapters();
        if (bf !== 'all') chs = chs.filter(c => c.bookId === parseInt(bf));
        if (sf === '有超纲') chs = chs.filter(c => c.isOverLevel);
        else if (sf !== 'all') chs = chs.filter(c => c.reviewStatus === sf);
        
        // 更新超纲汇总
        this.updateOverLevelSummary();
        
        const c = document.getElementById('chapters-list');
        if (!chs.length) { c.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">暂无章节数据，点击"AI分析章节"生成</p>'; return; }
        
        c.innerHTML = chs.map(ch => {
            const book = db.getBookById(ch.bookId);
            const overLevelClass = ch.isOverLevel ? 'overlevel' : '';
            const overLevelStyle = ch.isOverLevel ? 'border-color:#dc3545;background:#fff5f5;' : '';
            const statusColor = ch.isOverLevel ? '#dc3545' : ch.reviewStatus === '已审核' ? '#28a745' : '#ffc107';
            
            return `<div class="chapter-item ${overLevelClass}" style="padding:16px;border:1px solid #e8ecf1;border-radius:10px;margin-bottom:12px;background:#fff;${overLevelStyle}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <h3 style="margin:0 0 8px;font-size:15px;">${book?book.title:'未知'} - 第${ch.chapterNumber}章：${ch.title}</h3>
                        <p style="margin:4px 0;color:#666;font-size:13px;">${ch.summary||'暂无摘要'}</p>
                        ${ch.keywords && ch.keywords.length ? `<p style="margin:4px 0;color:#999;font-size:12px;">关键词：${ch.keywords.join('、')}</p>` : ''}
                    </div>
                    <div style="text-align:center;padding:8px 12px;background:${statusColor}10;border-radius:8px;margin-left:12px;">
                        <div style="font-size:12px;color:${statusColor};font-weight:500;">${ch.isOverLevel ? '超纲' : ch.reviewStatus}</div>
                        ${ch.isOverLevel ? `<div style="font-size:11px;color:#dc3545;margin-top:4px;">${ch.overLevelType||'超纲内容'}</div>` : ''}
                    </div>
                </div>
                <div style="margin-top:10px;display:flex;gap:8px;">
                    <button class="btn btn-primary" style="padding:6px 14px;font-size:12px;" onclick="app.showChapterModal(${ch.id})">编辑</button>
                    <button class="btn btn-success" style="padding:6px 14px;font-size:12px;" onclick="app.approveChapter(${ch.id})">通过</button>
                    <button class="btn btn-danger" style="padding:6px 14px;font-size:12px;" onclick="app.rejectChapter(${ch.id})">标记超纲</button>
                </div>
            </div>`;
        }).join('');
    }

    // 更新超纲汇总
    updateOverLevelSummary() {
        const books = db.getBooks();
        const chapters = db.getChapters();
        
        let totalChapters = chapters.length;
        let overLevelChapters = chapters.filter(c => c.isOverLevel).length;
        let booksWithOverLevel = new Set(chapters.filter(c => c.isOverLevel).map(c => c.bookId)).size;
        
        const statsDiv = document.getElementById('overlevel-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div style="background:#fff;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#667eea;">${books.length}</div>
                    <div style="font-size:12px;color:#666;">总书目数</div>
                </div>
                <div style="background:#fff;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#667eea;">${totalChapters}</div>
                    <div style="font-size:12px;color:#666;">总章节数</div>
                </div>
                <div style="background:#fff;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#dc3545;">${overLevelChapters}</div>
                    <div style="font-size:12px;color:#666;">超纲章节</div>
                </div>
                <div style="background:#fff;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#dc3545;">${booksWithOverLevel}</div>
                    <div style="font-size:12px;color:#666;">含超纲书目</div>
                </div>
            `;
        }
        
        // 显示超纲书目列表
        const bookListDiv = document.getElementById('overlevel-book-list');
        if (bookListDiv) {
            const overLevelBooks = books.filter(b => {
                const bookChapters = chapters.filter(c => c.bookId === b.id);
                return bookChapters.some(c => c.isOverLevel);
            });
            
            if (overLevelBooks.length > 0) {
                bookListDiv.innerHTML = `
                    <h4 style="margin:0 0 8px;color:#dc3545;font-size:14px;">含超纲内容的书目：</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${overLevelBooks.map(b => {
                            const overCount = chapters.filter(c => c.bookId === b.id && c.isOverLevel).length;
                            return `<span style="background:#dc354510;border:1px solid #dc354530;color:#dc3545;padding:4px 12px;border-radius:16px;font-size:12px;cursor:pointer;" onclick="app.filterChaptersByBook(${b.id})">${b.title} (${overCount}章)</span>`;
                        }).join('')}
                    </div>
                `;
            } else {
                bookListDiv.innerHTML = '<p style="color:#28a745;font-size:13px;">✅ 暂无超纲内容</p>';
            }
        }
    }

    // 按书目筛选章节
    filterChaptersByBook(bookId) {
        const filter = document.getElementById('chapter-book-filter');
        if (filter) {
            filter.value = bookId;
            this.renderChapters();
        }
    }

    // AI分析所有章节
    analyzeAllChapters() {
        const books = db.getBooks();
        if (!books.length) { alert('请先导入书目数据'); return; }
        
        let totalChapters = 0;
        let overLevelCount = 0;
        
        books.forEach(book => {
            // 为每本书生成章节（如果还没有的话）
            const existingChapters = db.getChaptersByBookId(book.id);
            if (existingChapters.length === 0) {
                // 生成默认章节
                const chapterCount = book.totalChapters || 10;
                for (let i = 1; i <= Math.min(chapterCount, 20); i++) {
                    const isOverLevel = this.checkChapterOverLevel(book, i);
                    db.addChapter({
                        bookId: book.id,
                        chapterNumber: i,
                        title: `第${i}章`,
                        summary: isOverLevel ? '此章节可能包含超纲内容' : '正常章节内容',
                        keywords: isOverLevel ? ['超纲', '敏感'] : [],
                        estimatedDifficulty: book.overallDifficulty || '中等',
                        isOverLevel: isOverLevel,
                        overLevelType: isOverLevel ? 'AI检测' : null,
                        overLevelDescription: isOverLevel ? 'AI检测到可能包含不适合初中生的内容' : null,
                        reviewStatus: '待审核'
                    });
                    totalChapters++;
                    if (isOverLevel) overLevelCount++;
                }
            }
        });
        
        alert(`AI分析完成！\n生成 ${totalChapters} 个章节\n其中 ${overLevelCount} 个超纲章节`);
        this.renderChapters();
    }

    // 检查章节是否超纲
    checkChapterOverLevel(book, chapterNumber) {
        const text = `${book.title} ${book.description || ''} ${book.category || ''}`.toLowerCase();
        
        // 检查敏感词
        for (const [category, words] of Object.entries(aiReviewEngine.sensitiveWords)) {
            for (const [level, wordList] of Object.entries(words)) {
                if (Array.isArray(wordList)) {
                    const found = wordList.filter(w => text.includes(w.toLowerCase()));
                    if (found.length > 0) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    renderRules() {
        const rules = db.getRules();
        const c = document.getElementById('rules-list');
        if (!rules.length) { c.innerHTML = '<p style="text-align:center;color:#999;">暂无规则</p>'; return; }
        c.innerHTML = rules.map(r => `<div class="rule-item" style="padding:16px;border:1px solid #e8ecf1;border-radius:10px;margin-bottom:12px;background:#fff;">
            <h3 style="margin:0 0 8px;">${r.name}</h3>
            <p style="margin:4px 0;color:#666;font-size:13px;">${r.description||''}</p>
            <p style="margin:4px 0;color:#666;font-size:13px;">关键词：${r.keywords}</p>
            <div style="margin-top:10px;display:flex;gap:8px;">
                <button class="btn btn-primary" style="padding:6px 14px;font-size:12px;" onclick="app.showRuleModal(${r.id})">编辑</button>
                <button class="btn btn-danger" style="padding:6px 14px;font-size:12px;" onclick="app.deleteRule(${r.id})">删除</button>
            </div>
        </div>`).join('');
    }

    populateChapterFilters() {
        const s = document.getElementById('chapter-book-filter');
        if (!s) return;
        const v = s.value;
        s.innerHTML = '<option value="all">全部书目</option>';
        db.getBooks().forEach(b => { s.innerHTML += `<option value="${b.id}">${b.title}</option>`; });
        s.value = v;
    }

    evaluateBook(id) {
        const results = ruleEngine.evaluateBook(id);
        const n = results.filter(r => r.evaluation.isOverLevel).length;
        alert(n > 0 ? `评估完成！发现 ${n} 个超纲章节。` : '评估完成！未发现超纲内容。');
        this.renderBooks();
    }

    batchEvaluate() {
        const books = db.getBooks();
        let n = 0;
        books.forEach(b => { n += ruleEngine.evaluateBook(b.id).filter(r => r.evaluation.isOverLevel).length; });
        alert(`批量评估完成！共 ${books.length} 本，发现 ${n} 个超纲章节。`);
        this.renderBooks();
    }

    deleteBook(id) {
        if (confirm('确定删除此书目？')) { db.deleteBook(id); this.renderBooks(); }
    }

    approveChapter(id) {
        const ch = db.getChapterById(id);
        if (ch) { db.updateChapter(id, { reviewStatus: '已审核', isOverLevel: false }); db.updateBookReviewStatus(ch.bookId); this.renderChapters(); }
    }

    rejectChapter(id) {
        const reason = prompt('请输入超纲原因：');
        if (reason) {
            const ch = db.getChapterById(id);
            if (ch) { db.updateChapter(id, { reviewStatus: '已审核', isOverLevel: true, overLevelType: '其他', overLevelDescription: reason }); db.updateBookReviewStatus(ch.bookId); this.renderChapters(); }
        }
    }

    batchReview() {
        const chs = db.getChapters().filter(c => c.reviewStatus === '待审核');
        if (!chs.length) { alert('没有待审核的章节'); return; }
        if (confirm(`批量通过 ${chs.length} 个章节？`)) {
            chs.forEach(ch => { db.updateChapter(ch.id, { reviewStatus: '已审核', isOverLevel: false }); db.updateBookReviewStatus(ch.bookId); });
            this.renderChapters();
        }
    }

    showBookModal(bookId) {
        const form = document.getElementById('book-form');
        form.reset();
        document.getElementById('book-id').value = '';
        document.querySelectorAll('input[name="grade"]').forEach(c => c.checked = false);
        if (bookId) {
            const b = db.getBookById(bookId);
            if (b) {
                document.getElementById('modal-title').textContent = '编辑书目';
                document.getElementById('book-id').value = b.id;
                document.getElementById('book-title').value = b.title;
                document.getElementById('book-author').value = b.author;
                document.getElementById('book-category').value = b.category;
                document.getElementById('book-publisher').value = b.publisher || '';
                document.getElementById('book-isbn').value = b.isbn || '';
                document.getElementById('book-description').value = b.description || '';
                document.getElementById('book-chapters').value = b.totalChapters || '';
                document.getElementById('book-difficulty').value = b.overallDifficulty;
                document.querySelectorAll('input[name="grade"]').forEach(c => { c.checked = b.applicableGrades.includes(parseInt(c.value)); });
            }
        } else {
            document.getElementById('modal-title').textContent = '添加书目';
        }
        this.showModal('book-modal');
    }

    saveBook(e) {
        e.preventDefault();
        const id = document.getElementById('book-id').value;
        const grades = [];
        document.querySelectorAll('input[name="grade"]:checked').forEach(c => grades.push(parseInt(c.value)));
        const data = {
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            category: document.getElementById('book-category').value,
            publisher: document.getElementById('book-publisher').value,
            isbn: document.getElementById('book-isbn').value,
            description: document.getElementById('book-description').value,
            totalChapters: parseInt(document.getElementById('book-chapters').value) || 0,
            applicableGrades: grades,
            overallDifficulty: document.getElementById('book-difficulty').value,
            reviewStatus: '待审核'
        };
        id ? db.updateBook(parseInt(id), data) : db.addBook(data);
        this.hideModal('book-modal');
        this.renderBooks();
    }

    showChapterModal(chapterId) {
        const form = document.getElementById('chapter-form');
        form.reset();
        document.getElementById('chapter-id').value = '';
        document.getElementById('chapter-book-id').value = '';
        document.getElementById('overlevel-type-group').style.display = 'none';
        document.getElementById('overlevel-desc-group').style.display = 'none';
        if (chapterId) {
            const ch = db.getChapterById(chapterId);
            if (ch) {
                document.getElementById('chapter-modal-title').textContent = '编辑章节';
                document.getElementById('chapter-id').value = ch.id;
                document.getElementById('chapter-book-id').value = ch.bookId;
                document.getElementById('chapter-number').value = ch.chapterNumber;
                document.getElementById('chapter-title').value = ch.title;
                document.getElementById('chapter-summary').value = ch.summary || '';
                document.getElementById('chapter-keywords').value = ch.keywords.join(', ');
                document.getElementById('chapter-difficulty').value = ch.estimatedDifficulty;
                document.getElementById('chapter-overlevel').checked = ch.isOverLevel;
                if (ch.isOverLevel) {
                    document.getElementById('overlevel-type-group').style.display = 'block';
                    document.getElementById('overlevel-desc-group').style.display = 'block';
                    document.getElementById('chapter-overlevel-type').value = ch.overLevelType || '其他';
                    document.getElementById('chapter-overlevel-desc').value = ch.overLevelDescription || '';
                }
            }
        }
        this.showModal('chapter-modal');
    }

    saveChapter(e) {
        e.preventDefault();
        const id = document.getElementById('chapter-id').value;
        const data = {
            bookId: parseInt(document.getElementById('chapter-book-id').value),
            chapterNumber: parseInt(document.getElementById('chapter-number').value),
            title: document.getElementById('chapter-title').value,
            summary: document.getElementById('chapter-summary').value,
            keywords: document.getElementById('chapter-keywords').value.split(',').map(k => k.trim()).filter(k => k),
            estimatedDifficulty: document.getElementById('chapter-difficulty').value,
            isOverLevel: document.getElementById('chapter-overlevel').checked,
            overLevelType: document.getElementById('chapter-overlevel').checked ? document.getElementById('chapter-overlevel-type').value : null,
            overLevelDescription: document.getElementById('chapter-overlevel').checked ? document.getElementById('chapter-overlevel-desc').value : null,
            reviewStatus: '已审核'
        };
        id ? db.updateChapter(parseInt(id), data) : db.addChapter(data);
        if (data.bookId) db.updateBookReviewStatus(data.bookId);
        this.hideModal('chapter-modal');
        this.renderChapters();
    }

    showRuleModal(ruleId) {
        const form = document.getElementById('rule-form');
        form.reset();
        document.getElementById('rule-id').value = '';
        if (ruleId) {
            const r = db.getRuleById(ruleId);
            if (r) {
                document.getElementById('rule-modal-title').textContent = '编辑规则';
                document.getElementById('rule-id').value = r.id;
                document.getElementById('rule-name').value = r.name;
                document.getElementById('rule-description').value = r.description || '';
                document.getElementById('rule-keywords').value = r.keywords;
                document.getElementById('rule-risk').value = r.riskLevel;
                document.getElementById('rule-active').checked = r.isActive;
            }
        } else {
            document.getElementById('rule-modal-title').textContent = '添加规则';
        }
        this.showModal('rule-modal');
    }

    saveRule(e) {
        e.preventDefault();
        const id = document.getElementById('rule-id').value;
        const data = {
            name: document.getElementById('rule-name').value,
            description: document.getElementById('rule-description').value,
            keywords: document.getElementById('rule-keywords').value,
            riskLevel: document.getElementById('rule-risk').value,
            isActive: document.getElementById('rule-active').checked,
            gradeRestrictions: { "6": "需审核", "7": "需审核", "8": "需审核", "9": "需审核" }
        };
        id ? db.updateRule(parseInt(id), data) : db.addRule(data);
        this.hideModal('rule-modal');
        this.renderRules();
    }

    deleteRule(id) { if (confirm('确定删除此规则？')) { db.deleteRule(id); this.renderRules(); } }

    testRule() {
        const text = document.getElementById('test-content').value;
        if (!text.trim()) { alert('请输入测试文本'); return; }
        const results = ruleEngine.testRule(text, 7);
        const c = document.getElementById('rule-test-result');
        if (!results.length) { c.innerHTML = '<h4>测试结果</h4><p>未匹配到任何规则</p>'; return; }
        c.innerHTML = '<h4>测试结果</h4><ul>' + results.map(r => `<li><strong>${r.rule.name}</strong> (${r.riskLevel}风险) - 匹配：${r.matches.join(', ')}</li>`).join('') + '</ul>';
    }

    renderExportPreview() {
        const g = document.getElementById('export-grade').value;
        const d = document.getElementById('export-difficulty').value;
        const s = document.getElementById('export-status').value;
        let books = db.getBooks();
        if (g !== 'all') books = books.filter(b => b.applicableGrades.includes(parseInt(g)));
        if (d !== 'all') books = books.filter(b => b.overallDifficulty === d);
        if (s !== 'all') books = books.filter(b => b.reviewStatus === s);
        const c = document.getElementById('export-preview');
        if (!books.length) { c.innerHTML = '<p style="text-align:center;color:#999;">没有符合条件的书目</p>'; return; }
        c.innerHTML = `<h3>导出预览 (${books.length} 本)</h3><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f7fa;"><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd;">书名</th><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd;">作者</th><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd;">年级</th><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd;">难度</th><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd;">状态</th></tr></thead><tbody>${books.map(b => `<tr><td style="padding:10px;border-bottom:1px solid #eee;">${b.title}</td><td style="padding:10px;border-bottom:1px solid #eee;">${b.author}</td><td style="padding:10px;border-bottom:1px solid #eee;">${b.applicableGrades.join(',')}</td><td style="padding:10px;border-bottom:1px solid #eee;">${b.overallDifficulty}</td><td style="padding:10px;border-bottom:1px solid #eee;">${b.reviewStatus}</td></tr>`).join('')}</tbody></table>`;
    }

    exportSafeBooks() {
        const books = db.getBooks().filter(b => b.reviewStatus === '已通过');
        this.exportToCSV(books.map(b => ({ 书名: b.title, 作者: b.author, 年级: b.applicableGrades.join(','), 难度: b.overallDifficulty })), '安全书目');
    }

    exportOverLevelBooks() {
        const books = db.getBooks().filter(b => b.reviewStatus === '有超纲');
        this.exportToCSV(books.map(b => ({ 书名: b.title, 作者: b.author, 年级: b.applicableGrades.join(','), 难度: b.overallDifficulty })), '超纲书目');
    }

    exportReviewResults() {
        const chs = db.getChapters();
        this.exportToCSV(chs.map(ch => { const b = db.getBookById(ch.bookId); return { 书名: b?b.title:'', 章节: ch.title, 难度: ch.estimatedDifficulty, 超纲: ch.isOverLevel?'是':'否', 状态: ch.reviewStatus }; }), '章节审核结果');
    }

    exportToCSV(data, name) {
        if (!data.length) { alert('没有数据'); return; }
        const h = Object.keys(data[0]);
        const csv = '\uFEFF' + [h.join(','), ...data.map(r => h.map(k => '"' + String(r[k]||'').replace(/"/g, '""') + '"').join(','))].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        a.download = name + '_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
    }

    startAIReview() {
        const books = db.getBooks();
        if (!books.length) { alert('请先导入书目数据'); return; }
        const sl = document.getElementById('ai-review-summary');
        const ll = document.getElementById('ai-review-list');
        sl.innerHTML = '<p style="text-align:center;grid-column:1/-1;">🤖 AI正在严格审核 ' + books.length + ' 本书，请稍候...</p>';
        ll.innerHTML = '';
        this.showModal('ai-review-modal');

        const analyses = aiReviewEngine.analyzeBooks(books);
        const report = aiReviewEngine.generateReport(analyses);
        this.aiAnalyses = analyses;
        this.aiReport = report;
        this.aiCurrentPage = 1;
        this.aiPageSize = 100;

        sl.innerHTML = `
            <div class="ai-summary-item"><div class="number">${report.total}</div><div class="label">总计书目</div></div>
            <div class="ai-summary-item"><div class="number" style="color:#28a745">${report.suitable}</div><div class="label">适合阅读</div></div>
            <div class="ai-summary-item"><div class="number" style="color:#ffc107">${report.needsReview}</div><div class="label">需要审核</div></div>
            <div class="ai-summary-item"><div class="number" style="color:#dc3545">${report.notSuitable}</div><div class="label">不建议</div></div>
            <div class="ai-summary-item"><div class="number" style="color:#000">${report.banned}</div><div class="label">禁止</div></div>`;

        if (report.severeWarnings.length > 0) {
            sl.innerHTML += `
                <div style="grid-column:1/-1;background:#f8d7da;border:1px solid #dc3545;border-radius:8px;padding:12px;margin-top:12px;">
                    <h4 style="margin:0 0 8px;color:#721c24;">🚨 严重风险警告：${report.severeWarnings.length} 本书被标记为禁止推荐</h4>
                    <ul style="margin:0;padding-left:20px;color:#721c24;font-size:13px;">
                        ${report.severeWarnings.slice(0, 10).map(w => `<li>${w.title}</li>`).join('')}
                        ${report.severeWarnings.length > 10 ? `<li>...还有 ${report.severeWarnings.length - 10} 本</li>` : ''}
                    </ul>
                </div>`;
        }

        this.renderAIPage();
    }

    renderAIPage() {
        const ll = document.getElementById('ai-review-list');
        const analyses = this.aiAnalyses;
        const page = this.aiCurrentPage;
        const pageSize = this.aiPageSize;
        const totalPages = Math.ceil(analyses.length / pageSize);
        const start = (page - 1) * pageSize;
        const end = Math.min(start + pageSize, analyses.length);
        const pageData = analyses.slice(start, end);

        let html = `<div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:13px;">显示 ${start+1}-${end} / 共 ${analyses.length} 本</span>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.aiGoPage(${page-1})" ${page<=1?'disabled':''}>上一页</button>
                <span style="padding:6px 12px;font-size:13px;">${page} / ${totalPages}</span>
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.aiGoPage(${page+1})" ${page>=totalPages?'disabled':''}>下一页</button>
            </div>
        </div>`;

        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#f5f7fa;"><th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;width:30px;">#</th><th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">书名</th><th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">作者</th><th style="padding:8px;text-align:center;border-bottom:2px solid #ddd;">分数</th><th style="padding:8px;text-align:center;border-bottom:2px solid #ddd;">评级</th><th style="padding:8px;text-align:center;border-bottom:2px solid #ddd;">风险</th><th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">敏感内容</th></tr></thead><tbody>';

        pageData.forEach(({ book, analysis }, i) => {
            const sc = analysis.score >= 80 ? '#28a745' : analysis.score >= 60 ? '#ffc107' : '#dc3545';
            const lc = analysis.level === '适合' ? '#28a745' : analysis.level === '需要审核' ? '#ffc107' : '#dc3545';
            const rc = analysis.riskLevel === '高' ? '#dc3545' : analysis.riskLevel === '中' ? '#ffc107' : '#28a745';
            const sensitiveInfo = analysis.sensitiveWordsFound.length > 0 
                ? analysis.sensitiveWordsFound.map(s => `<span style="color:${s.level==='严重_直接不适'?'#dc3545':s.level==='明显_需要审核'?'#ffc107':'#666'};font-size:11px;">${s.category}</span>`).join(' ')
                : '<span style="color:#28a745;font-size:11px;">无</span>';
            html += `<tr style="background:${analysis.riskLevel==='高'?'#fff5f5':analysis.riskLevel==='中'?'#fffdf0':'#fff'};">
                <td style="padding:8px;border-bottom:1px solid #eee;color:#999;">${start+i+1}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;font-weight:500;">${book.title}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;color:#666;">${book.author}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;font-weight:700;color:${sc};">${analysis.score}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;color:${lc};font-weight:500;">${analysis.level}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;color:${rc};font-weight:500;">${analysis.riskLevel}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;font-size:11px;">${sensitiveInfo}</td>
            </tr>`;
        });

        html += '</tbody></table>';

        html += `<div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#666;font-size:13px;">显示 ${start+1}-${end} / 共 ${analyses.length} 本</span>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.aiGoPage(${page-1})" ${page<=1?'disabled':''}>上一页</button>
                <span style="padding:6px 12px;font-size:13px;">${page} / ${totalPages}</span>
                <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="app.aiGoPage(${page+1})" ${page>=totalPages?'disabled':''}>下一页</button>
            </div>
        </div>`;

        ll.innerHTML = html;
    }

    aiGoPage(page) {
        const totalPages = Math.ceil(this.aiAnalyses.length / this.aiPageSize);
        if (page < 1 || page > totalPages) return;
        this.aiCurrentPage = page;
        this.renderAIPage();
    }

    exportAIReviewResult() {
        if (!this.aiAnalyses) { alert('请先进行AI审核'); return; }
        const data = this.aiAnalyses.map(({ book, analysis }) => ({
            书名: book.title,
            作者: book.author,
            分类: book.category || '未分类',
            分数: analysis.score,
            评级: analysis.level,
            风险等级: analysis.riskLevel,
            适用年龄: analysis.ageRange.join('-'),
            敏感内容: analysis.sensitiveWordsFound.map(s => `${s.category}: ${s.words.join('、')}`).join('; '),
            风险警告: analysis.warnings.join('; '),
            AI建议: analysis.suggestions.join('; ')
        }));
        this.exportToCSV(data, 'AI审核报告');
    }

    aiSearchBook() {
        const input = document.getElementById('ai-search-input');
        const rd = document.getElementById('ai-search-result');
        const name = input.value.trim();
        if (!name) { alert('请输入书名'); return; }
        rd.style.display = 'block';
        rd.innerHTML = '<div class="ai-search-loading"><div class="spinner"></div><p>🤖 AI正在严格分析《' + name + '》...</p></div>';
        setTimeout(() => {
            const localBook = db.getBooks().find(b => b.title.includes(name));
            const book = localBook || this.getKnownBook(name);
            const analysis = aiReviewEngine.analyzeBook(book);
            const sc = analysis.score >= 80 ? 'score-excellent' : analysis.score >= 60 ? 'score-good' : analysis.score >= 40 ? 'score-warning' : 'score-danger';
            const lc = analysis.score >= 80 ? '#28a745' : analysis.score >= 60 ? '#ffc107' : '#dc3545';
            const rc = analysis.riskLevel === '高' ? '#dc3545' : analysis.riskLevel === '中' ? '#ffc107' : '#28a745';
            
            let sensitiveHtml = '';
            if (analysis.sensitiveWordsFound.length > 0) {
                sensitiveHtml = '<div class="ai-search-analysis" style="background:#f8d7da;border:1px solid #dc3545;"><h4 style="color:#721c24;">🚨 敏感内容检测</h4><ul style="color:#721c24;">';
                analysis.sensitiveWordsFound.forEach(s => {
                    sensitiveHtml += `<li><strong>${s.category}</strong> (${s.level})：<span style="color:#dc3545;">${s.words.slice(0, 8).join('、')}</span></li>`;
                });
                sensitiveHtml += '</ul></div>';
            }

            rd.innerHTML = `<div class="ai-search-book">
                <div class="ai-search-book-header"><div><h3 class="ai-search-book-title">${book.title}</h3><p class="ai-search-book-author">${book.author}</p></div><div class="score-badge ${sc}">${analysis.score}分</div></div>
                <div class="ai-search-score" style="background:${analysis.riskLevel==='高'?'linear-gradient(135deg, #dc3545 0%, #c82333 100%)':analysis.riskLevel==='中'?'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)':'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}"><div class="score-number" style="color:white">${analysis.score}</div><div class="score-label">适宜性评分 · ${analysis.level}</div></div>
                <div class="ai-search-details">
                    <div class="ai-search-detail-card"><div class="detail-value">${analysis.difficulty}</div><div class="detail-label">阅读难度</div></div>
                    <div class="ai-search-detail-card"><div class="detail-value">${analysis.ageRange.length > 0 ? analysis.ageRange.join('-') + '岁' : '不适合'}</div><div class="detail-label">适用年龄</div></div>
                    <div class="ai-search-detail-card"><div class="detail-value" style="color:${rc}">${analysis.riskLevel}</div><div class="detail-label">风险等级</div></div>
                    <div class="ai-search-detail-card"><div class="detail-value">${book.category||'未分类'}</div><div class="detail-label">分类</div></div>
                </div>
                ${sensitiveHtml}
                ${analysis.warnings.length ? '<div class="ai-search-analysis"><h4>⚠️ 风险警告</h4><ul>' + analysis.warnings.map(w => '<li>' + w + '</li>').join('') + '</ul></div>' : ''}
                ${analysis.suggestions.length ? '<div class="ai-search-analysis" style="background:#d4edda;border:1px solid #28a745;"><h4 style="color:#155724;">💡 AI建议</h4><ul style="color:#155724;">' + analysis.suggestions.map(s => '<li>' + s + '</li>').join('') + '</ul></div>' : ''}
                <div class="ai-search-actions"><button class="btn btn-secondary" onclick="document.getElementById('ai-search-result').style.display='none'">关闭</button><button class="btn btn-primary" onclick="app.addSearchedBook('${book.title.replace(/'/g,"\\'")}','${book.author.replace(/'/g,"\\'")}')">+ 添加到书目库</button></div>
            </div>`;
        }, 800);
    }

    getKnownBook(title) {
        const db2 = {
            '三体': { author: '刘慈欣', category: '科幻', description: '地球文明向宇宙发出的第一声啼鸣', difficulty: '较难' },
            '活着': { author: '余华', category: '文学', description: '讲述了农村人福贵悲惨的人生遭遇', difficulty: '中等' },
            '围城': { author: '钱钟书', category: '文学', description: '描写了抗日战争时期中国知识分子的群像', difficulty: '较难' },
            '平凡的世界': { author: '路遥', category: '文学', description: '以70年代到80年代为背景', difficulty: '较难' },
            '红楼梦': { author: '曹雪芹', category: '古典小说', description: '中国古典四大名著之首', difficulty: '较难' },
            '三国演义': { author: '罗贯中', category: '古典小说', description: '中国古典四大名著之一', difficulty: '较难' },
            '水浒传': { author: '施耐庵', category: '古典小说', description: '中国古典四大名著之一', difficulty: '较难' },
            '西游记': { author: '吴承恩', category: '古典小说', description: '中国古典四大名著之一', difficulty: '中等' },
            '朝花夕拾': { author: '鲁迅', category: '散文', description: '鲁迅的回忆性散文集', difficulty: '中等' },
            '骆驼祥子': { author: '老舍', category: '文学', description: '讲述北平人力车夫祥子的悲剧命运', difficulty: '中等' },
            '海底两万里': { author: '凡尔纳', category: '科幻', description: '法国科幻小说家凡尔纳的代表作', difficulty: '中等' },
            '红星照耀中国': { author: '斯诺', category: '纪实', description: '美国记者斯诺记录中国革命的纪实作品', difficulty: '较难' },
            '钢铁是怎样炼成的': { author: '奥斯特洛夫斯基', category: '文学', description: '苏联作家的自传体小说', difficulty: '中等' },
            '简爱': { author: '夏洛蒂·勃朗特', category: '文学', description: '英国作家的代表作', difficulty: '中等' },
            '城南旧事': { author: '林海音', category: '文学', description: '描写了小英子的童年生活', difficulty: '较易' },
            '小王子': { author: '圣埃克苏佩里', category: '童话', description: '以一位飞行员作为故事叙述者', difficulty: '较易' },
            '草房子': { author: '曹文轩', category: '文学', description: '讲述了男孩桑桑的六年小学生活', difficulty: '较易' },
            '呐喊': { author: '鲁迅', category: '文学', description: '鲁迅的第一本短篇小说集', difficulty: '中等' },
            '边城': { author: '沈从文', category: '文学', description: '描绘了湘西地区特有的风土人情', difficulty: '中等' },
            '白鹿原': { author: '陈忠实', category: '文学', description: '讲述白姓和鹿姓两大家族的故事', difficulty: '较难' },
            '蛙': { author: '莫言', category: '文学', description: '讲述乡村女医生的人生经历', difficulty: '中等' },
            '傅雷家书': { author: '傅雷', category: '书信', description: '傅雷写给儿子的家书', difficulty: '中等' },
            '艾青诗选': { author: '艾青', category: '诗歌', description: '中国现代诗人艾青的诗歌选集', difficulty: '中等' },
            '儒林外史': { author: '吴敬梓', category: '古典小说', description: '中国古代讽刺小说的巅峰之作', difficulty: '较难' },
            '格列佛游记': { author: '斯威夫特', category: '文学', description: '英国作家的讽刺小说', difficulty: '中等' },
            '昆虫记': { author: '法布尔', category: '科普', description: '法国昆虫学家的科普著作', difficulty: '中等' },
            '伊索寓言': { author: '伊索', category: '寓言', description: '古希腊寓言故事集', difficulty: '较易' },
            '京华烟云': { author: '林语堂', category: '文学', description: '描写了三大家族的悲欢离合', difficulty: '较难' },
            '我与地坛': { author: '史铁生', category: '散文', description: '表达了对母亲的怀念和对生命的思考', difficulty: '中等' },
            '撒哈拉的故事': { author: '三毛', category: '散文', description: '三毛在撒哈拉沙漠生活时的所见所闻', difficulty: '较易' },
            '盗墓笔记': { author: '南派三叔', category: '悬疑', description: '描写了盗墓的故事', difficulty: '中等' },
            '鬼吹灯': { author: '天下霸唱', category: '悬疑', description: '描写了盗墓探险的故事', difficulty: '中等' },
            '琅琊榜': { author: '海宴', category: '历史', description: '描写了梅长苏的复仇故事', difficulty: '中等' },
            '甄嬛传': { author: '流潋紫', category: '历史', description: '描写了后宫争斗的故事', difficulty: '中等' },
            '庆余年': { author: '猫腻', category: '历史', description: '描写了范闲的故事', difficulty: '中等' },
            '雪中悍刀行': { author: '烽火戏诸侯', category: '武侠', description: '描写了江湖武侠的故事', difficulty: '中等' },
            '斗破苍穹': { author: '天蚕土豆', category: '玄幻', description: '描写了斗气大陆的故事', difficulty: '中等' },
            '完美世界': { author: '辰东', category: '玄幻', description: '描写了修仙的故事', difficulty: '中等' },
            '人世间': { author: '梁晓声', category: '文学', description: '讲述了周家三代人的生活变迁', difficulty: '中等' },
            '繁花': { author: '金宇澄', category: '文学', description: '用上海话写出了上海人的日常', difficulty: '较难' },
            '秋园': { author: '杨本芬', category: '文学', description: '一位八旬老人讲述她和她妈妈的故事', difficulty: '中等' },
            '海洋中的性与爱': { author: '未知', category: '科普', description: '一本关于海洋生物性与爱的科普书籍，包含大量性相关内容', difficulty: '中等' },
            '金瓶梅': { author: '兰陵笑笑生', category: '古典小说', description: '明代小说，包含大量性描写', difficulty: '较难' },
            '肉蒲团': { author: '李渔', category: '古典小说', description: '明代小说，包含大量性描写', difficulty: '较难' },
            '废都': { author: '贾平凹', category: '文学', description: '当代小说，包含性描写', difficulty: '较难' },
            '白鹿原': { author: '陈忠实', category: '文学', description: '当代小说，包含暴力内容', difficulty: '较难' },
            '红高粱': { author: '莫言', category: '文学', description: '当代小说，包含暴力内容', difficulty: '中等' },
            '丰乳肥臀': { author: '莫言', category: '文学', description: '当代小说，包含暴力内容', difficulty: '中等' },
            '蛙': { author: '莫言', category: '文学', description: '当代小说，涉及敏感话题', difficulty: '中等' },
            '活着': { author: '余华', category: '文学', description: '当代小说，包含暴力内容', difficulty: '中等' },
            '许三观卖血记': { author: '余华', category: '文学', description: '当代小说，包含敏感内容', difficulty: '中等' },
            '兄弟': { author: '余华', category: '文学', description: '当代小说，包含成人内容', difficulty: '中等' },
            '霸王别姬': { author: '李碧华', category: '文学', description: '当代小说，包含敏感内容', difficulty: '中等' },
            '色戒': { author: '张爱玲', category: '文学', description: '当代小说，包含成人内容', difficulty: '中等' },
            '倾城之恋': { author: '张爱玲', category: '文学', description: '当代小说，包含成人内容', difficulty: '中等' },
            '半生缘': { author: '张爱玲', category: '文学', description: '当代小说，包含成人内容', difficulty: '中等' },
            '金锁记': { author: '张爱玲', category: '文学', description: '当代小说，包含敏感内容', difficulty: '中等' },
            '沉沦': { author: '郁达夫', category: '文学', description: '现代小说，包含敏感内容', difficulty: '中等' },
            '春风沉醉的晚上': { author: '郁达夫', category: '文学', description: '现代小说，包含敏感内容', difficulty: '中等' },
            '迟桂花': { author: '郁达夫', category: '文学', description: '现代小说，包含敏感内容', difficulty: '中等' },
            '官场现形记': { author: '李宝嘉', category: '古典小说', description: '晚清小说，包含敏感内容', difficulty: '较难' },
            '二十年目睹之怪现状': { author: '吴趼人', category: '古典小说', description: '晚清小说，包含敏感内容', difficulty: '较难' },
            '老残游记': { author: '刘鹗', category: '古典小说', description: '晚清小说，包含敏感内容', difficulty: '较难' },
            '孽海花': { author: '曾朴', category: '古典小说', description: '晚清小说，包含敏感内容', difficulty: '较难' }
        };
        const n = title.replace(/[《》]/g, '');
        for (const [k, v] of Object.entries(db2)) { if (n.includes(k) || k.includes(n)) return { title, ...v }; }
        return { title, author: '未知', category: '未分类', description: '暂无详细信息', difficulty: '中等' };
    }

    addSearchedBook(title, author) {
        db.addBook({ title, author, category: '未分类', publisher: '', isbn: '', description: '', totalChapters: 0, applicableGrades: [7, 8], overallDifficulty: '中等', reviewStatus: '待审核' });
        alert('《' + title + '》已添加到书目库');
    }
}

// 等待IndexedDB就绪后再初始化应用
document.addEventListener('DOMContentLoaded', () => {
    db.ready.then(() => {
        window.app = new App();
        window.importHandler = new ImportHandler(db);
    });
});