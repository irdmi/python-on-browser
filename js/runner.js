// runner.js – выполнение Python-кода и сбор статистики
const runner = {
    displayCount: 0,
    executionStart: 0,

    // Регистрируем функцию display() в глобальном пространстве Pyodide
    registerDisplay() {
        window.pyodide.globals.set("display", (html) => {
            document.getElementById('visual').innerHTML += html;
            this.displayCount++;
        });
    },

    // Основной метод запуска
    async run(code) {
        if (!window.pythonLoaded) {
            await window.loadPyodide();   // определена в main.js
        }

        const consoleDiv = document.getElementById('console');
        const visualDiv = document.getElementById('visual');

        // Очистка предыдущего вывода
        consoleDiv.textContent = '';
        visualDiv.innerHTML = '';
        this.displayCount = 0;

        // Перехват stdout
        await window.pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
        `);

        // Устанавливаем рабочую папку (чтобы open('file.txt') работал)
        await window.pyodide.runPythonAsync(`
import os
os.chdir('${fileManager.workDir}')
        `);

        // Запускаем код пользователя
        this.executionStart = performance.now();
        let success = true;
        try {
            await window.pyodide.runPythonAsync(code);
            const stdout = window.pyodide.runPython('sys.stdout.getvalue()');
            consoleDiv.textContent = stdout;
        } catch (err) {
            consoleDiv.textContent = '❌ Ошибка:\n' + err;
            success = false;
        }
        const elapsed = Math.round(performance.now() - this.executionStart);

        // Обновляем статистику
        document.getElementById('time').textContent = elapsed + ' мс';
        document.getElementById('chars').textContent = code.length;
        document.getElementById('lines').textContent = code.split(/\r?\n/).length;
        document.getElementById('displays').textContent = this.displayCount;
        document.getElementById('status').textContent = success ? '✅ Успех' : '❌ Ошибка';
    }
};
