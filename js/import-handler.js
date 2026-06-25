// Excel导入处理 - 支持自定义格式
class ImportHandler {
    constructor(database) {
        this.db = database;
        this.currentFile = null;
        this.parsedData = [];
        this.headers = [];
        this.mappings = {};
        this.validatedData = null;
        this.defaultGrades = [7]; // 默认年级
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('excel-file-input');
        
        if (uploadArea) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFile(e.dataTransfer.files[0]);
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) this.handleFile(e.target.files[0]);
            });
        }

        this.bindBtn('start-import-btn', () => this.startImport());
        this.bindBtn('clear-import-btn', () => this.clearImport());
        this.bindBtn('confirm-import-btn', () => this.confirmImport());
        this.bindBtn('cancel-import-btn', () => this.cancelImport());
        this.bindBtn('download-template-btn', () => this.downloadTemplate());
        this.bindBtn('close-mapping-modal', () => this.hideMappingModal());
        this.bindBtn('confirm-mapping-btn', () => this.confirmMapping());
        this.bindBtn('cancel-mapping-btn', () => this.hideMappingModal());

        // 默认年级选择
        document.querySelectorAll('.default-grade-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                this.defaultGrades = [];
                document.querySelectorAll('.default-grade-checkbox:checked').forEach(c => {
                    this.defaultGrades.push(parseInt(c.value));
                });
            });
        });
    }

    bindBtn(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    }

    handleFile(file) {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
            alert('请上传Excel文件（.xlsx, .xls）或CSV文件（.csv）');
            return;
        }
        this.currentFile = file;
        this.readFile(file);
    }

    readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length < 2) {
                    alert('文件内容为空或格式不正确');
                    return;
                }
                
                this.headers = jsonData[0].map(h => String(h || '').trim());
                this.parsedData = jsonData.slice(1).filter(row => 
                    row.some(cell => cell !== null && cell !== undefined && cell !== '')
                );
                
                // 显示识别到的列名
                console.log('识别到的列名:', this.headers);
                
                document.getElementById('preview-filename').textContent = file.name;
                document.getElementById('preview-total').textContent = this.parsedData.length;
                document.getElementById('start-import-btn').disabled = false;
                
                // 显示提示信息
                const tipEl = document.getElementById('upload-tip');
                if (tipEl) tipEl.style.display = 'block';
                
                // 显示识别信息
                this.showFileInfo();
            } catch (error) {
                alert('解析文件失败：' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    showFileInfo() {
        const infoDiv = document.getElementById('file-info') || this.createFileInfoDiv();
        infoDiv.innerHTML = `
            <p><strong>识别到的列：</strong>${this.headers.join(', ')}</p>
            <p><strong>数据行数：</strong>${this.parsedData.length}</p>
        `;
        infoDiv.style.display = 'block';
    }

    createFileInfoDiv() {
        const div = document.createElement('div');
        div.id = 'file-info';
        div.className = 'file-info';
        const uploadSection = document.querySelector('.import-upload');
        if (uploadSection) {
            uploadSection.insertBefore(div, uploadSection.firstChild);
        }
        return div;
    }

    startImport() {
        if (this.parsedData.length === 0) {
            alert('没有可导入的数据');
            return;
        }

        // 检测列名并自动映射
        this.autoDetectMapping();
        
        // 显示映射确认弹窗
        this.showMappingModal();
    }

    autoDetectMapping() {
        this.mappings = {};
        
        // 支持的列名映射
        const fieldPatterns = {
            'title': ['书名', '标题', '名称', '书目名称'],
            'author': ['作者', '著者', '作者名'],
            'category': ['分类', '类别', '类型', '分类法'],
            'publisher': ['出版社', '出版单位'],
            'isbn': ['isbn', 'ISBN', '书号'],
            'description': ['简介', '内容简介', '描述', '备注'],
            'pages': ['页数', '总页数']
        };

        for (const [field, patterns] of Object.entries(fieldPatterns)) {
            for (const pattern of patterns) {
                const index = this.headers.findIndex(h => 
                    h.toLowerCase().includes(pattern.toLowerCase())
                );
                if (index !== -1) {
                    this.mappings[field] = index;
                    break;
                }
            }
        }

        console.log('自动映射结果:', this.mappings);
    }

    showMappingModal() {
        const selectContainer = document.getElementById('mapping-selects');
        if (!selectContainer) return;

        selectContainer.innerHTML = '';

        // 添加必填字段映射
        const requiredFields = [
            { field: 'title', label: '书名（必填）', required: true },
            { field: 'author', label: '作者（必填）', required: true }
        ];

        const optionalFields = [
            { field: 'category', label: '分类' },
            { field: 'publisher', label: '出版社' },
            { field: 'isbn', label: 'ISBN' },
            { field: 'description', label: '简介' },
            { field: 'pages', label: '页数' }
        ];

        [...requiredFields, ...optionalFields].forEach(({ field, label, required }) => {
            const row = document.createElement('div');
            row.className = 'mapping-row';
            
            const select = document.createElement('select');
            select.id = `map-${field}`;
            select.className = 'mapping-select';
            
            if (!required) {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '-- 不映射 --';
                select.appendChild(emptyOption);
            }
            
            this.headers.forEach((header, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = header;
                if (this.mappings[field] === index) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            
            row.appendChild(labelEl);
            row.appendChild(select);
            selectContainer.appendChild(row);
        });

        // 添加默认年级选择
        const gradeRow = document.createElement('div');
        gradeRow.className = 'mapping-row';
        gradeRow.innerHTML = `
            <label>默认年级（当Excel无年级列时使用）：</label>
            <div class="checkbox-group">
                <label><input type="checkbox" class="default-grade-checkbox" value="6" ${this.defaultGrades.includes(6) ? 'checked' : ''}> 六年级</label>
                <label><input type="checkbox" class="default-grade-checkbox" value="7" ${this.defaultGrades.includes(7) ? 'checked' : ''}> 七年级</label>
                <label><input type="checkbox" class="default-grade-checkbox" value="8" ${this.defaultGrades.includes(8) ? 'checked' : ''}> 八年级</label>
                <label><input type="checkbox" class="default-grade-checkbox" value="9" ${this.defaultGrades.includes(9) ? 'checked' : ''}> 九年级</label>
            </div>
        `;
        selectContainer.appendChild(gradeRow);

        // 添加默认难度选择
        const difficultyRow = document.createElement('div');
        difficultyRow.className = 'mapping-row';
        difficultyRow.innerHTML = `
            <label>默认难度：</label>
            <select id="default-difficulty" class="mapping-select">
                <option value="中等" selected>中等</option>
                <option value="较易">较易</option>
                <option value="较难">较难</option>
            </select>
        `;
        selectContainer.appendChild(difficultyRow);

        // 绑定年级复选框事件
        gradeRow.querySelectorAll('.default-grade-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                this.defaultGrades = [];
                gradeRow.querySelectorAll('.default-grade-checkbox:checked').forEach(c => {
                    this.defaultGrades.push(parseInt(c.value));
                });
            });
        });

        document.getElementById('mapping-modal').style.display = 'block';
    }

    confirmMapping() {
        this.mappings = {};
        
        ['title', 'author', 'category', 'publisher', 'isbn', 'description', 'pages'].forEach(field => {
            const select = document.getElementById(`map-${field}`);
            if (select && select.value !== '') {
                this.mappings[field] = parseInt(select.value);
            }
        });

        // 检查必填字段
        if (this.mappings.title === undefined || this.mappings.author === undefined) {
            alert('请至少映射书名和作者两个必填字段');
            return;
        }

        // 检查默认年级
        if (this.defaultGrades.length === 0) {
            alert('请至少选择一个默认年级');
            return;
        }

        this.hideMappingModal();
        this.showPreview();
    }

    hideMappingModal() {
        document.getElementById('mapping-modal').style.display = 'none';
    }

    showPreview() {
        const validatedData = this.validateData();
        document.getElementById('preview-valid').textContent = validatedData.valid.length;
        document.getElementById('preview-duplicate').textContent = validatedData.duplicate.length;
        
        let html = '';
        validatedData.valid.forEach((item, index) => {
            const isDup = validatedData.duplicate.some(d => 
                d.title === item.title && d.author === item.author
            );
            html += `<tr class="${isDup ? 'status-duplicate' : 'status-new'}">
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>${item.author}</td>
                <td>${item.gradeText}</td>
                <td>${item.category || '-'}</td>
                <td>${item.difficulty}</td>
                <td>${isDup ? '重复' : '新增'}</td>
            </tr>`;
        });
        document.getElementById('preview-tbody').innerHTML = html;
        document.getElementById('import-preview').style.display = 'block';
        this.validatedData = validatedData;
    }

    validateData() {
        const valid = [], duplicate = [];
        const existingBooks = this.db.getBooks();
        const defaultDifficulty = document.getElementById('default-difficulty')?.value || '中等';
        
        this.parsedData.forEach((row, rowIndex) => {
            try {
                const title = this.getCell(row, this.mappings.title);
                const author = this.getCell(row, this.mappings.author);
                
                if (!title) return;
                if (!author) {
                    this.getCell(row, this.mappings.author) || '';
                }
                
                let grades = [...this.defaultGrades];
                const category = this.getCell(row, this.mappings.category) || '';
                const publisher = this.getCell(row, this.mappings.publisher) || '';
                const isbn = this.getCell(row, this.mappings.isbn) || '';
                const description = this.getCell(row, this.mappings.description) || '';
                const pages = parseInt(this.getCell(row, this.mappings.pages)) || 0;
                
                const item = {
                    title, author: author || '未知', grades,
                    gradeText: grades.map(g => g + '年级').join(','),
                    category, difficulty: defaultDifficulty,
                    publisher, isbn, description,
                    chapters: Math.ceil(pages / 20)
                };
                
                if (isbn && existingBooks.some(b => b.isbn === isbn)) {
                    duplicate.push(item);
                }
                valid.push(item);
            } catch (e) {
                console.warn(`行${rowIndex + 1}解析失败:`, e);
            }
        });
        
        return { valid, duplicate };
    }

    getCell(row, index) {
        if (index === undefined || index === null) return '';
        return String(row[index] || '').trim();
    }

    confirmImport() {
        if (!this.validatedData) return;
        let success = 0, skip = 0, fail = 0;
        const details = [];
        
        this.validatedData.valid.forEach(item => {
            try {
                if (item.isbn && this.db.getBooks().some(b => b.isbn === item.isbn)) {
                    skip++;
                    details.push({ title: item.title, status: '跳过（ISBN重复）' });
                    return;
                }
                this.db.addBook({
                    title: item.title,
                    author: item.author,
                    category: item.category,
                    publisher: item.publisher,
                    isbn: item.isbn,
                    description: item.description,
                    totalChapters: item.chapters,
                    applicableGrades: item.grades,
                    overallDifficulty: item.difficulty,
                    reviewStatus: '待审核'
                });
                success++;
                details.push({ title: item.title, status: '成功' });
            } catch (e) {
                fail++;
                details.push({ title: item.title, status: '失败: ' + e.message });
            }
        });
        
        document.getElementById('result-success').textContent = success;
        document.getElementById('result-skip').textContent = skip;
        document.getElementById('result-fail').textContent = fail;
        document.getElementById('result-details').innerHTML = details.map(d => 
            `<p>${d.title} - ${d.status}</p>`
        ).join('');
        
        document.getElementById('import-preview').style.display = 'none';
        document.getElementById('import-result').style.display = 'block';
        
        alert(`导入完成！成功 ${success} 本，跳过 ${skip} 本，失败 ${fail} 本`);
    }

    clearImport() {
        this.currentFile = null;
        this.parsedData = [];
        this.headers = [];
        this.mappings = {};
        this.validatedData = null;
        document.getElementById('excel-file-input').value = '';
        document.getElementById('start-import-btn').disabled = true;
        document.getElementById('import-preview').style.display = 'none';
        document.getElementById('import-result').style.display = 'none';
        const fileInfo = document.getElementById('file-info');
        if (fileInfo) fileInfo.style.display = 'none';
    }

    cancelImport() {
        this.clearImport();
    }

    downloadTemplate() {
        const csvContent = '\uFEFF书名,作者,分类,出版社,ISBN,简介,页数\n' +
            '"天贼","[美] 奥森·斯科特·卡德","外国文学","浙江文艺出版社","9787533900000","科幻小说","352"\n' +
            '"八月的星期天","(法)帕特里克·莫迪亚诺","外国文学","人民文学出版社","9787020090000","法国文学","157"\n' +
            '"巨流河","齐邦媛","中国文学","生活·读书·新知三联书店","9787108000000","自传体小说","398"';
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '书目导入模板.csv';
        link.click();
    }
}