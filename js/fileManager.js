// fileManager.js – управление загруженными файлами в виртуальной ФС Pyodide
const fileManager = {
    workDir: '/files',   // рабочая папка для пользовательских файлов

    // Проверяем готовность Pyodide
    ready() {
        return window.pyodide && window.pyodide.runPython;
    },

    // Инициализация (вызывается после загрузки Pyodide)
    init() {
        if (!this.ready()) return;
        window.pyodide.runPython(`
import os
try:
    os.makedirs('${this.workDir}', exist_ok=True)
except:
    pass
        `);
    },

    // Добавить файлы из input[type=file]
    async addFiles(fileList) {
        if (!this.ready()) throw new Error('Pyodide ещё не загружен');
        const fs = window.pyodide.FS;
        const added = [];
        for (const file of fileList) {
            const path = this.workDir + '/' + file.name;
            const arrayBuffer = await file.arrayBuffer();
            const uint8View = new Uint8Array(arrayBuffer);
            fs.writeFile(path, uint8View);
            added.push(file.name);
        }
        return added;
    },

    // Удалить файл по имени
    removeFile(filename) {
        if (!this.ready()) return;
        const fs = window.pyodide.FS;
        const path = this.workDir + '/' + filename;
        try { fs.unlink(path); } catch (e) {}
    },

    // Очистить все загруженные файлы
    clearAll() {
        if (!this.ready()) return;
        const list = this.listFiles();
        list.forEach(f => this.removeFile(f));
    },

    // Получить список имён файлов в рабочей папке
    listFiles() {
        if (!this.ready()) return [];
        try {
            const result = window.pyodide.runPython(`
import os
os.listdir('${this.workDir}')
            `);
            return result.toJs ? result.toJs() : result;
        } catch (e) {
            return [];
        }
    }
};
