// main.js – инициализация приложения после загрузки страницы
window.pythonLoaded = false;

// Загрузка Pyodide
window.loadPyodide = async function() {
    if (window.pythonLoaded) return;
    document.getElementById('loader').style.display = 'block';
    window.pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
    runner.registerDisplay();
    fileManager.init();
    window.pythonLoaded = true;
    document.getElementById('loader').style.display = 'none';
};

window.addEventListener('DOMContentLoaded', async () => {
    ui.initTabs();
    ui.bindEvents();

    // Пытаемся загрузить код из хэша
    const viewLoaded = await ui.loadFromHash();
    if (!viewLoaded) {
        // Обычный режим – фоновую загрузку Pyodide
        window.loadPyodide();
        // При готовности обновим список файлов (если уже были)
        // Пока файлов нет, список пуст
        ui.refreshFileList();
    }
});
