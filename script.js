// Inicjalizacja Chart.js
let glucoseChart;

function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Data i Czas
            datasets: [{
                label: 'Poziom glukozy (mg/dL)',
                data: [], // Glukoza
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
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
                    beginAtZero: true
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

// Funkcja ładowania zapisanych wyników z LocalStorage
function loadResults() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    console.log("Loaded results:", savedResults);
    savedResults.forEach(result => addResultToTable(result.date, result.time, result.glucose, result.timing, result.notes));
    updateChart();
}

// Funkcja dodająca wynik do tabeli
function addResultToTable(date, time, glucose, timing, notes = "") {
    const tableBody = document.querySelector('#glucose-table tbody');
    const row = document.createElement('tr');
    const glucoseValidity = checkGlucoseValidity(glucose, timing);
    
    row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${glucose} mg/dL</td>
        <td>${timing}</td>
        <td>${notes}</td>
        <td><span class="${glucoseValidity.isValid ? 'good' : 'bad'}">${glucoseValidity.message}</span></td>
        <td><button class="action-button" onclick="deleteResult(this)" aria-label="Usuń wynik">🗑️</button></td>
    `;
    tableBody.appendChild(row);
}

// Funkcja sprawdzająca prawidłowość wyniku glukozy
function checkGlucoseValidity(glucose, timing) {
    glucose = parseFloat(glucose);
    let isValid = false;
    let message = "Nieprawidłowy";

    if (timing === "na czczo" || timing === "wieczorem") {
        if (glucose >= 70 && glucose <= 90) {
            isValid = true;
            message = "Prawidłowy";
        }
    } else if (timing === "1 godzina po posiłku") {
        if (glucose < 140) {
            isValid = true;
            message = "Prawidłowy";
        }
    } else if (timing === "2 godziny po posiłku") {
        if (glucose < 120) {
            isValid = true;
            message = "Prawidłowy";
        }
    } else if (timing === "noc (3-4)") {
        if (glucose >= 70 && glucose <= 90) {
            isValid = true;
            message = "Prawidłowy";
        }
    }

    return { isValid, message };
}

// Funkcja zapisywania wyniku w LocalStorage
function saveResult(date, time, glucose, timing, notes) {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    const newResult = { date, time, glucose, timing, notes };
    savedResults.push(newResult);
    localStorage.setItem('glucoseResults', JSON.stringify(savedResults));
    console.log("Saved results:", savedResults);
}

// Funkcja usuwania wyniku z LocalStorage i tabeli
function deleteResult(button) {
    const row = button.parentNode.parentNode;
    const date = row.children[0].textContent;
    const time = row.children[1].textContent;
    const glucose = row.children[2].textContent.replace(' mg/dL', '');
    const timing = row.children[3].textContent;
    const notes = row.children[4].textContent;

    console.log("Deleting result:", { date, time, glucose, timing, notes });

    // Usuwanie z LocalStorage
    let savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    savedResults = savedResults.filter(result => !(result.date === date && result.time === time && result.glucose == glucose && result.timing === timing && result.notes === notes));
    localStorage.setItem('glucoseResults', JSON.stringify(savedResults));

    console.log("Updated saved results:", savedResults);

    // Usuwanie wiersza z tabeli
    row.remove();
    updateChart();
}

// Funkcja drukowania wyników
function printResults() {
    const printContents = document.querySelector('.container').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;

    // Przywróć obsługę interakcji po wydrukowaniu
    loadResults();
    setupEventListeners();
}

// Funkcja eksportująca dane do CSV
function exportToCSV() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    if (savedResults.length === 0) {
        alert('Brak danych do eksportu.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Data,Czas,Glukoza (mg/dL),Moment,Notatki\n";
    savedResults.forEach(result => {
        // Użycie cudzysłowów dla pól zawierających przecinki
        const data = `"${result.date}","${result.time}","${result.glucose}","${result.timing}","${result.notes.replace(/"/g, '""')}"`;
        csvContent += `${data}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "glucose_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Funkcja pobierania danych jako plik JSON
function downloadData() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    if (savedResults.length === 0) {
        alert('Brak danych do pobrania.');
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedResults, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "glucose_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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

// Funkcja konfigurująca nasłuchiwanie zdarzeń
function setupEventListeners() {
    // Obsługa formularza
    document.getElementById('glucose-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const glucose = document.getElementById('glucose').value;
        const timing = document.getElementById('glucose-timing').value;
        const notes = document.getElementById('notes').value;

        console.log("Form submitted with:", { date, time, glucose, timing, notes });

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

        if (!timing) {
            showError('timing', 'Proszę wybrać moment badania.');
            isValid = false;
        } else {
            hideError('timing');
            markValid('timing');
        }

        if (!isValid) {
            console.log("Form validation failed.");
            return;
        }

        // Dodanie wyniku do tabeli i zapisanie
        addResultToTable(date, time, glucose, timing, notes);
        saveResult(date, time, glucose, timing, notes);
        updateChart();

        // Czyszczenie formularza
        document.getElementById('glucose-form').reset();
        clearValidation();
    });

    // Obsługa przełącznika trybu ciemnego
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

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
    const fields = ['date', 'time', 'glucose', 'glucose-timing'];
    fields.forEach(field => {
        document.getElementById(field).classList.remove('valid');
    });
}

// Funkcja inicjująca aplikację
window.onload = function() {
    initializeChart();
    loadResults();
    setupEventListeners();
    loadSettings();
}

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

// Funkcja eksportująca dane do CSV
function exportToCSV() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    if (savedResults.length === 0) {
        alert('Brak danych do eksportu.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Data,Czas,Glukoza (mg/dL),Moment,Notatki\n";
    savedResults.forEach(result => {
        // Użycie cudzysłowów dla pól zawierających przecinki
        const data = `"${result.date}","${result.time}","${result.glucose}","${result.timing}","${result.notes.replace(/"/g, '""')}"`;
        csvContent += `${data}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "glucose_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Funkcja pobierania danych jako plik JSON
function downloadData() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    if (savedResults.length === 0) {
        alert('Brak danych do pobrania.');
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedResults, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "glucose_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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

// Funkcja konfigurująca personalizację interfejsu
function applySettings() {
    const fontSelect = document.getElementById('font-select').value;
    const colorPicker = document.getElementById('color-picker').value;

    // Zmiana czcionki
    document.body.style.fontFamily = fontSelect;

    // Zmiana koloru motywu
    document.documentElement.style.setProperty('--primary-color', colorPicker);
    document.documentElement.style.setProperty('--secondary-color', shadeColor(colorPicker, -20));

    // Zapis ustawień w LocalStorage
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    settings.font = fontSelect;
    settings.color = colorPicker;
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

// Funkcja ładowania ustawień personalizacji
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings) {
        // Zastosowanie czcionki
        document.body.style.fontFamily = settings.font || 'Roboto, Arial, sans-serif';

        // Zastosowanie koloru motywu
        if (settings.color) {
            document.documentElement.style.setProperty('--primary-color', settings.color);
            document.documentElement.style.setProperty('--secondary-color', shadeColor(settings.color, -20));
            document.getElementById('color-picker').value = settings.color;
        }

        // Zastosowanie trybu ciemnego
        if (settings.darkMode) {
            document.documentElement.classList.add('dark-mode');
            document.getElementById('theme-toggle').textContent = '☀️';
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.getElementById('theme-toggle').textContent = '🌙';
        }

        // Zastosowanie czcionki w formularzu
        if (settings.font) {
            document.getElementById('font-select').value = settings.font;
        }
    }
}

// Funkcja pomocnicza do przyciemniania koloru
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    const RR = ((R.toString(16).length==1)?'0'+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?'0'+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?'0'+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}
