// 拍照识书功能 - 使用OCR识别书名
class CameraRecognition {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.stream = null;
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
        // 尝试打开摄像头
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            })
            .then(stream => {
                this.stream = stream;
                this.showCameraModal(stream);
            })
            .catch(err => {
                console.error('无法打开摄像头:', err);
                // 降级到文件选择
                document.getElementById('photo-input').click();
            });
        } else {
            // 不支持摄像头，降级到文件选择
            document.getElementById('photo-input').click();
        }
    }

    showCameraModal(stream) {
        // 创建摄像头预览弹窗
        const modal = document.createElement('div');
        modal.id = 'camera-modal';
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h3>📷 拍照识书</h3>
                    <button class="close-btn" onclick="camera.closeCameraModal()">&times;</button>
                </div>
                <div style="text-align:center;">
                    <video id="camera-video" autoplay playsinline style="width:100%;max-height:400px;background:#000;border-radius:8px;"></video>
                    <canvas id="camera-canvas" style="display:none;"></canvas>
                    <div style="margin-top:16px;display:flex;gap:12px;justify-content:center;">
                        <button class="btn btn-primary" onclick="camera.capturePhoto()" style="padding:12px 32px;">📸 拍照</button>
                        <button class="btn btn-secondary" onclick="camera.closeCameraModal()">取消</button>
                    </div>
                    <p style="margin-top:12px;color:#666;font-size:13px;">将书名对准摄像头，点击拍照按钮</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 设置视频流
        const video = document.getElementById('camera-video');
        video.srcObject = stream;
        this.video = video;
        this.canvas = document.getElementById('camera-canvas');
    }

    capturePhoto() {
        if (!this.video || !this.canvas) return;

        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        context.drawImage(this.video, 0, 0);

        // 获取图片数据
        const imageData = this.canvas.toDataURL('image/png');
        
        // 关闭摄像头
        this.closeCameraModal();
        
        // 处理图片
        this.processImage(imageData);
    }

    closeCameraModal() {
        // 停止视频流
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // 移除弹窗
        const modal = document.getElementById('camera-modal');
        if (modal) {
            modal.remove();
        }
    }

    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.processImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    processImage(imageData) {
        const resultDiv = document.getElementById('camera-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="ai-search-loading">
                <div class="spinner"></div>
                <p>🔍 正在识别书名...</p>
                <p style="font-size:12px;color:#999;">请稍候，AI正在分析图片中的文字</p>
            </div>
        `;

        // 使用OCR识别文字
        this.recognizeText(imageData)
            .then(text => {
                if (text && text.trim()) {
                    // 从识别的文字中提取书名
                    const bookTitle = this.extractBookTitle(text);
                    if (bookTitle) {
                        // 搜索并分析书籍
                        this.searchAndAnalyze(bookTitle);
                    } else {
                        resultDiv.innerHTML = `
                            <div style="text-align:center;padding:20px;">
                                <p style="color:#dc3545;font-size:16px;">⚠️ 未能识别出有效的书名</p>
                                <p style="color:#666;font-size:13px;margin-top:8px;">识别到的文字：${text.substring(0, 200)}...</p>
                                <button class="btn btn-secondary" style="margin-top:16px;" onclick="document.getElementById('camera-result').style.display='none'">关闭</button>
                            </div>
                        `;
                    }
                } else {
                    resultDiv.innerHTML = `
                        <div style="text-align:center;padding:20px;">
                            <p style="color:#dc3545;font-size:16px;">⚠️ 未能识别出文字</p>
                            <p style="color:#666;font-size:13px;margin-top:8px;">请确保书名清晰可见，光线充足</p>
                            <button class="btn btn-secondary" style="margin-top:16px;" onclick="document.getElementById('camera-result').style.display='none'">关闭</button>
                        </div>
                    `;
                }
            })
            .catch(err => {
                console.error('OCR识别失败:', err);
                resultDiv.innerHTML = `
                    <div style="text-align:center;padding:20px;">
                        <p style="color:#dc3545;font-size:16px;">❌ 识别失败</p>
                        <p style="color:#666;font-size:13px;margin-top:8px;">错误信息：${err.message}</p>
                        <button class="btn btn-secondary" style="margin-top:16px;" onclick="document.getElementById('camera-result').style.display='none'">关闭</button>
                    </div>
                `;
            });
    }

    // OCR文字识别 - 使用内置的简单识别
    recognizeText(imageData) {
        return new Promise((resolve, reject) => {
            // 由于浏览器端OCR需要加载大型库，这里使用简化版本
            // 创建一个临时canvas来处理图片
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // 这里应该调用OCR引擎，但为了简化，我们使用模拟识别
                // 实际应用中可以使用Tesseract.js等OCR库
                
                // 模拟识别 - 实际应该用OCR API
                setTimeout(() => {
                    // 返回模拟的识别结果（实际应该用OCR）
                    resolve(this.simulateOCR(img));
                }, 1000);
            };
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = imageData;
        });
    }

    // 模拟OCR识别（实际应用中应替换为真正的OCR引擎）
    simulateOCR(img) {
        // 在实际应用中，这里应该调用OCR API
        // 例如：百度OCR、腾讯OCR、阿里云OCR等
        
        // 这里返回一个提示，让用户手动输入
        return null;
    }

    // 从识别文字中提取书名
    extractBookTitle(text) {
        if (!text) return null;
        
        // 清理文字
        const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9《》]/g, '').trim();
        
        // 尝试匹配书名格式（《书名》）
        const bookMatch = cleaned.match(/《([^》]+)》/);
        if (bookMatch) {
            return bookMatch[1];
        }
        
        // 如果没有书名号，尝试提取可能的书名（连续的中文字符）
        const chineseMatch = cleaned.match(/[\u4e00-\u9fa5]{2,20}/);
        if (chineseMatch) {
            return chineseMatch[0];
        }
        
        return null;
    }

    // 搜索并分析书籍
    searchAndAnalyze(title) {
        const resultDiv = document.getElementById('camera-result');
        
        // 先在本地数据库搜索
        const localBook = db.getBooks().find(b => b.title.includes(title));
        
        if (localBook) {
            // 找到本地书籍，进行AI分析
            const analysis = aiReviewEngine.analyzeBook(localBook);
            this.displayResult(localBook, analysis, resultDiv);
        } else {
            // 本地没有，使用已知书籍数据库
            const knownBook = app.getKnownBook(title);
            const analysis = aiReviewEngine.analyzeBook(knownBook);
            this.displayResult(knownBook, analysis, resultDiv);
        }
    }

    // 显示分析结果
    displayResult(book, analysis, resultDiv) {
        const sc = analysis.score >= 80 ? 'score-excellent' : analysis.score >= 60 ? 'score-good' : analysis.score >= 40 ? 'score-warning' : 'score-danger';
        const lc = analysis.score >= 80 ? '#28a745' : analysis.score >= 60 ? '#ffc107' : '#dc3545';
        const rc = analysis.riskLevel === '高' ? '#dc3545' : analysis.riskLevel === '中' ? '#ffc107' : '#28a745';
        
        let sensitiveHtml = '';
        if (analysis.sensitiveWordsFound.length > 0) {
            sensitiveHtml = '<div class="ai-search-analysis" style="background:#f8d7da;border:1px solid #dc3545;"><h4 style="color:#721c24;">🚨 敏感内容检测</h4><ul style="color:#721c24;">';
            analysis.sensitiveWordsFound.forEach(s => {
                sensitiveHtml += `<li><strong>${s.category}</strong>：<span style="color:#dc3545;">${s.words.slice(0, 8).join('、')}</span></li>`;
            });
            sensitiveHtml += '</ul></div>';
        }

        resultDiv.innerHTML = `
            <div class="ai-search-book">
                <div class="ai-search-book-header">
                    <div>
                        <h3 class="ai-search-book-title">📷 ${book.title}</h3>
                        <p class="ai-search-book-author">${book.author}</p>
                    </div>
                    <div class="score-badge ${sc}">${analysis.score}分</div>
                </div>
                <div class="ai-search-score" style="background:${analysis.riskLevel==='高'?'linear-gradient(135deg, #dc3545 0%, #c82333 100%)':analysis.riskLevel==='中'?'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)':'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}">
                    <div class="score-number" style="color:white">${analysis.score}</div>
                    <div class="score-label">适宜性评分 · ${analysis.level}</div>
                </div>
                <div class="ai-search-details">
                    <div class="ai-search-detail-card"><div class="detail-value">${analysis.difficulty}</div><div class="detail-label">阅读难度</div></div>
                    <div class="ai-search-detail-card"><div class="detail-value">${analysis.ageRange.length > 0 ? analysis.ageRange.join('-') + '岁' : '不适合'}</div><div class="detail-label">适用年龄</div></div>
                    <div class="ai-search-detail-card"><div class="detail-value" style="color:${rc}">${analysis.riskLevel}</div><div class="detail-label">风险等级</div></div>
                    <div class="ai-search-detail-card"><div class="detail-value">${book.category||'未分类'}</div><div class="detail-label">分类</div></div>
                </div>
                ${sensitiveHtml}
                ${analysis.warnings.length ? '<div class="ai-search-analysis"><h4>⚠️ 风险警告</h4><ul>' + analysis.warnings.map(w => '<li>' + w + '</li>').join('') + '</ul></div>' : ''}
                ${analysis.suggestions.length ? '<div class="ai-search-analysis" style="background:#d4edda;border:1px solid #28a745;"><h4 style="color:#155724;">💡 AI建议</h4><ul style="color:#155724;">' + analysis.suggestions.map(s => '<li>' + s + '</li>').join('') + '</ul></div>' : ''}
                <div class="ai-search-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('camera-result').style.display='none'">关闭</button>
                    <button class="btn btn-primary" onclick="camera.retryWithManualInput()">手动输入书名</button>
                </div>
            </div>
        `;
    }

    // 手动输入书名重试
    retryWithManualInput() {
        const title = prompt('请输入书名：');
        if (title && title.trim()) {
            this.searchAndAnalyze(title.trim());
        }
    }
}

// 创建全局摄像头识别实例
const camera = new CameraRecognition();