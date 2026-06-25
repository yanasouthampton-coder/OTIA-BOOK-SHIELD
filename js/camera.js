// 拍照识书功能
class CameraRecognition {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.stream = null;
        this.modalOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const cameraBtn = document.getElementById('camera-btn');
        const photoInput = document.getElementById('photo-input');

        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => this.openCamera());
        }

        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
        }
    }

    openCamera() {
        if (this.modalOpen) return;
        
        // 直接打开文件选择器（兼容性更好）
        document.getElementById('photo-input').click();
    }

    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.processImage(e.target.result);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    }

    processImage(imageData) {
        const resultDiv = document.getElementById('camera-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="ai-search-loading">
                <div class="spinner"></div>
                <p>🔍 正在识别书名...</p>
            </div>
        `;

        // 使用本地OCR识别
        this.recognizeText(imageData)
            .then(text => {
                if (text && text.trim().length >= 2) {
                    const bookTitle = this.extractBookTitle(text);
                    if (bookTitle) {
                        this.searchAndAnalyze(bookTitle);
                    } else {
                        this.showManualInput(resultDiv, text);
                    }
                } else {
                    this.showManualInput(resultDiv, text || '未能识别');
                }
            })
            .catch(err => {
                this.showManualInput(resultDiv, err.message);
            });
    }

    showManualInput(resultDiv, recognizedText) {
        resultDiv.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <p style="color:#666;font-size:14px;margin-bottom:12px;">识别到的文字：${recognizedText.substring(0, 100)}</p>
                <p style="color:#666;font-size:13px;margin-bottom:16px;">请手动输入书名：</p>
                <div style="display:flex;gap:8px;justify-content:center;">
                    <input type="text" id="manual-book-title" placeholder="输入书名..." style="flex:1;max-width:300px;padding:10px;border:1px solid #ddd;border-radius:6px;">
                    <button class="btn btn-primary" onclick="camera.searchManualInput()">搜索</button>
                </div>
                <button class="btn btn-secondary" style="margin-top:12px;" onclick="document.getElementById('camera-result').style.display='none'">关闭</button>
            </div>
        `;
    }

    searchManualInput() {
        const input = document.getElementById('manual-book-title');
        if (input && input.value.trim()) {
            this.searchAndAnalyze(input.value.trim());
        }
    }

    recognizeText(imageData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // 简单的图像分析 - 提取可能的文字区域
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // 由于浏览器端OCR需要大型库，返回null让用户手动输入
                resolve(null);
            };
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = imageData;
        });
    }

    extractBookTitle(text) {
        if (!text) return null;
        
        const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9《》]/g, '').trim();
        
        const bookMatch = cleaned.match(/《([^》]+)》/);
        if (bookMatch) {
            return bookMatch[1];
        }
        
        const chineseMatch = cleaned.match(/[\u4e00-\u9fa5]{2,20}/);
        if (chineseMatch) {
            return chineseMatch[0];
        }
        
        return null;
    }

    searchAndAnalyze(title) {
        const resultDiv = document.getElementById('camera-result');
        
        const localBook = db.getBooks().find(b => b.title.includes(title) || title.includes(b.title));
        
        if (localBook) {
            const analysis = aiReviewEngine.analyzeBook(localBook);
            this.displayResult(localBook, analysis, resultDiv);
        } else {
            let knownBook;
            try {
                knownBook = (typeof window !== 'undefined' && window.app && window.app.getKnownBook) 
                    ? window.app.getKnownBook(title) 
                    : null;
            } catch(e) {
                knownBook = null;
            }
            
            if (!knownBook) {
                knownBook = { title, author: '未知', category: '未分类', description: '暂无详细信息', overallDifficulty: '中等' };
            }
            
            const analysis = aiReviewEngine.analyzeBook(knownBook);
            this.displayResult(knownBook, analysis, resultDiv);
        }
    }

    displayResult(book, analysis, resultDiv) {
        const sc = analysis.score >= 80 ? 'score-excellent' : analysis.score >= 60 ? 'score-good' : analysis.score >= 40 ? 'score-warning' : 'score-danger';
        const rc = analysis.riskLevel === '高' ? '#dc3545' : analysis.riskLevel === '中' ? '#ffc107' : '#28a745';
        
        let sensitiveHtml = '';
        if (analysis.sensitiveWordsFound.length > 0) {
            sensitiveHtml = '<div style="background:#f8d7da;border:1px solid #dc3545;border-radius:8px;padding:12px;margin:12px 0;"><h4 style="color:#721c24;margin:0 0 8px;">🚨 敏感内容</h4><ul style="color:#721c24;margin:0;padding-left:20px;">';
            analysis.sensitiveWordsFound.forEach(s => {
                sensitiveHtml += `<li>${s.category}：<span style="color:#dc3545;">${s.words.slice(0, 5).join('、')}</span></li>`;
            });
            sensitiveHtml += '</ul></div>';
        }

        resultDiv.innerHTML = `
            <div style="padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <div>
                        <h3 style="margin:0;font-size:18px;">${book.title}</h3>
                        <p style="margin:4px 0 0;color:#666;font-size:13px;">${book.author}</p>
                    </div>
                    <div class="score-badge ${sc}" style="font-size:18px;padding:8px 16px;">${analysis.score}分</div>
                </div>
                <div style="background:${rc === '#dc3545' ? '#fff5f5' : rc === '#ffc107' ? '#fffdf0' : '#f0fff4'};border-radius:8px;padding:12px;margin-bottom:12px;">
                    <div style="display:flex;gap:16px;flex-wrap:wrap;">
                        <div><strong>评级：</strong><span style="color:${rc}">${analysis.level}</span></div>
                        <div><strong>风险：</strong><span style="color:${rc}">${analysis.riskLevel}</span></div>
                        <div><strong>难度：</strong>${analysis.difficulty}</div>
                        <div><strong>年龄：</strong>${analysis.ageRange.length > 0 ? analysis.ageRange.join('-') + '岁' : '不适合'}</div>
                    </div>
                </div>
                ${sensitiveHtml}
                ${analysis.warnings.length ? '<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px;margin-bottom:12px;"><h4 style="color:#856404;margin:0 0 8px;">⚠️ 警告</h4><ul style="color:#856404;margin:0;padding-left:20px;">' + analysis.warnings.map(w => '<li>' + w + '</li>').join('') + '</ul></div>' : ''}
                ${analysis.suggestions.length ? '<div style="background:#d4edda;border:1px solid #28a745;border-radius:8px;padding:12px;margin-bottom:12px;"><h4 style="color:#155724;margin:0 0 8px;">💡 建议</h4><p style="color:#155724;margin:0;">' + analysis.suggestions[0] + '</p></div>' : ''}
                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
                    <button class="btn btn-secondary" onclick="document.getElementById('camera-result').style.display='none'">关闭</button>
                    <button class="btn btn-primary" onclick="camera.searchManualInput()">重新搜索</button>
                </div>
            </div>
        `;
    }
}

const camera = new CameraRecognition();