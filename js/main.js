// js/main.js – инициализация приложения
window.pythonLoaded = false;

// Сохраняем оригинальную функцию loadPyodide, загруженную из CDN,
// чтобы избежать рекурсии при переопределении.
const originalLoadPyodide = loadPyodide;

// Переопределяем глобальную функцию, используя сохранённый оригинал.
window.loadPyodide = async function () {
    if (window.pythonLoaded) return;
    document.getElementById('loader').style.display = 'block';

    // Вызываем настоящую loadPyodide из скрипта Pyodide
    window.pyodide = await originalLoadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });

    // Инициализация отображения и файлового менеджера
    runner.registerDisplay();
    fileManager.init();
    window.pythonLoaded = true;
    document.getElementById('loader').style.display = 'none';
};

window.addEventListener('DOMContentLoaded', async () => {
    // Настройка интерфейса и обработчиков
    ui.initTabs();
    ui.bindEvents();

    // Пытаемся загрузить код из хэша (режим просмотра)
    const viewLoaded = await ui.loadFromHash();
    if (!viewLoaded) {
        // Обычный режим – запускаем фоновую загрузку Pyodide
        window.loadPyodide();
        // Обновляем список файлов (пока пустой)
        ui.refreshFileList();
    }
});
