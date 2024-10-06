// Inicjalizacja wykresu Chart.js
let glucoseChart;

function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Daty i czasy pomiarów
            datasets: [{
                label: 'Poziom glukozy (mg/dL)',
                data: [], // Poziomy glukozy
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'DD-MM-YYYY HH:mm'
                    },
                    title: {
                        display: true,
                        text: 'Data i Czas'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Glukoza (mg/dL)'
                    },
                    beginAtZero: false,
                    min: 50,
                    max: 200
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Funkcja dodająca wynik do tabeli
function addResultToTable(date, time, glucose) {
    const tableBody = document.querySelector('#glucose-table tbody');
    const row = document.createElement('tr');
    const glucoseStatus = checkGlucoseStatus(glucose);
    
    row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${glucose} mg/dL</td>
        <td class="${glucoseStatus.isValid ? 'good' : 'bad'}">${glucoseStatus.message}</td>
    `;
    tableBody.appendChild(row);
}

// Funkcja sprawdzająca prawidłowość wyniku glukozy
function checkGlucoseStatus(glucose) {
    glucose = parseFloat(glucose);
    let isValid = glucose >= 70 && glucose <= 120;
    let message = isValid ? "Prawidłowy" : "Nieprawidłowy";
    return { isValid, message };
}

// Funkcja zapisywania wyniku w LocalStorage
function saveResult(date, time, glucose) {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    savedResults.push({ date, time, glucose });
    localStorage.setItem('glucoseResults', JSON.stringify(savedResults));
    updateChart();
}

// Funkcja ładowania zapisanych wyników
function loadResults() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    savedResults.forEach(result => addResultToTable(result.date, result.time, result.glucose));
    updateChart();
}

// Obsługa formularza
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const glucose = document.getElementById('glucose').value;

    // Walidacja formularza
    let isValid = true;

    if (!date) {
        showError('date', 'Proszę wybrać datę.');
        isValid = false;
    } else {
        hideError('date');
        markValid('date');
    }

    if (!time) {
        showError('time', 'Proszę wybrać godzinę.');
        isValid = false;
    } else {
        hideError('time');
        markValid('time');
    }

    if (!glucose || glucose < 40 || glucose > 400) {
        showError('glucose', 'Proszę wprowadzić prawidłowy poziom glukozy.');
        isValid = false;
    } else {
        hideError('glucose');
        markValid('glucose');
    }

    if (!isValid) return;

    // Dodanie wyniku do tabeli i zapisanie
    addResultToTable(date, time, glucose);
    saveResult(date, time, glucose);

    // Czyszczenie formularza
    document.getElementById('glucose-form').reset();
    clearValidation();
});

// Funkcje walidacji formularza
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById(fieldId).classList.add('invalid');
}

function hideError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    errorElement.style.display = 'none';
    document.getElementById(fieldId).classList.remove('invalid');
}

function markValid(fieldId) {
    document.getElementById(fieldId).classList.add('valid');
}

function clearValidation() {
    const fields = ['date', 'time', 'glucose'];
    fields.forEach(field => {
        document.getElementById(field).classList.remove('valid');
    });
}

// Funkcja inicjująca aplikację
window.onload = function() {
    initializeChart();
    loadResults();
    setupEventListeners();
};

// Funkcja przełączająca tryb jasny/ciemny
function toggleTheme() {
    document.documentElement.classList.toggle('dark-mode');
    const themeToggle = document.getElementById('theme-toggle');
    if (document.documentElement.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }

    // Zapis ustawień w LocalStorage
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    settings.darkMode = isDarkMode;
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

// Funkcja konfigurująca nasłuchiwanie zdarzeń
function setupEventListeners() {
    // Obsługa przełącznika trybu ciemnego
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

// Funkcja aktualizująca wykres
function updateChart() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    // Sortowanie wyników według daty i czasu
    savedResults.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    const labels = savedResults.map(result => `${result.date} ${result.time}`);
    const data = savedResults.map(result => parseFloat(result.glucose));

    glucoseChart.data.labels = labels;
    glucoseChart.data.datasets[0].data = data;
    glucoseChart.update();
}
