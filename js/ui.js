// ui.js – управление интерфейсом и обработчики событий
const ui = {
    // Переключение вкладок Console / Visual
    initTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                tabContents.forEach(c => c.classList.remove('active'));
                document.getElementById(target).classList.add('active');
            });
        });
    },

    // Генерация ссылки для просмотра только вывода (с хэшем)
    generateViewURL(code) {
        const compressed = LZString.compressToEncodedURIComponent(code);
        const url = new URL(window.location);
        url.hash = compressed;
        return url.toString();
    },

    // Загрузка и запуск кода из хэша (режим просмотра)
    async loadFromHash() {
        const hash = window.location.hash.slice(1);
        if (!hash) return false;
        try {
            const code = LZString.decompressFromEncodedURIComponent(hash);
            if (code) {
                document.body.classList.add('view-mode');
                await window.loadPyodide();
                await runner.run(code);
                return true;
            }
        } catch (e) {}
        return false;
    },

    // Выход из режима просмотра
    exitViewMode() {
        document.body.classList.remove('view-mode');
        window.location.hash = '';
    },

    // События кнопок и клавиатуры
    bindEvents() {
        const codeArea = document.getElementById('code');
        document.getElementById('run-btn').addEventListener('click', () => {
            runner.run(codeArea.value);
        });
        document.getElementById('share-btn').addEventListener('click', () => {
            const url = this.generateViewURL(codeArea.value);
            window.open(url, '_blank');
        });

        // Ctrl+Enter
        codeArea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runner.run(codeArea.value);
            }
            // Табуляция
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeArea.selectionStart;
                const end = codeArea.selectionEnd;
                codeArea.value = codeArea.value.substring(0, start) + '    ' + codeArea.value.substring(end);
                codeArea.selectionStart = codeArea.selectionEnd = start + 4;
            }
        });

        // Загрузка файлов
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files.length) return;
            try {
                const added = await fileManager.addFiles(files);
                this.refreshFileList();
            } catch (err) {
                alert('Ошибка загрузки файлов: ' + err.message);
            }
            fileInput.value = ''; // сброс
        });

        document.getElementById('clear-files-btn').addEventListener('click', () => {
            fileManager.clearAll();
            this.refreshFileList();
        });
    },

    // Обновление списка загруженных файлов
    refreshFileList() {
        const listEl = document.getElementById('file-list');
        const files = fileManager.listFiles();
        listEl.innerHTML = files.map(name => `
            <div class="file-item">
                <span>📄 ${name}</span>
                <span class="remove-file" data-filename="${name}">×</span>
            </div>
        `).join('');

        // Удаление по клику
        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filename = e.target.dataset.filename;
                fileManager.removeFile(filename);
                this.refreshFileList();
            });
        });
    }
};

// Глобальная функция выхода из режима просмотра (нужна для кнопки в HTML)
function exitViewMode() {
    ui.exitViewMode();
}
