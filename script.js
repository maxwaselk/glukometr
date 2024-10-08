// script.js

// Inicjalizacja wykresów Chart.js
let glucoseChart;
let averageGlucoseChart;
let glucoseData = JSON.parse(localStorage.getItem('glucoseData')) || [];

// Funkcja inicjalizująca główny wykres glukozy
function initializeGlucoseChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    const labels = glucoseData.map(item => `${item.date} ${item.time}`);
    const data = glucoseData.map(item => parseFloat(item.glucose));

    if (glucoseChart) {
        glucoseChart.destroy(); // Zniszcz poprzedni wykres, jeśli istnieje
    }

    glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Poziom glukozy (mg/dL)',
                data: data,
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
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Data i godzina pomiaru'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Poziom glukozy (mg/dL)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Funkcja inicjalizująca wykres średniego poziomu glukozy
function initializeAverageGlucoseChart() {
    const ctx = document.getElementById('average-glucose-chart').getContext('2d');

    // Grupowanie danych po dacie
    const averages = {};
    glucoseData.forEach(item => {
        if (!averages[item.date]) {
            averages[item.date] = [];
        }
        averages[item.date].push(parseFloat(item.glucose));
    });

    const labels = Object.keys(averages);
    const averageData = labels.map(date => {
        const sum = averages[date].reduce((a, b) => a + b, 0);
        return (sum / averages[date].length).toFixed(2);
    });

    if (averageGlucoseChart) {
        averageGlucoseChart.destroy(); // Zniszcz poprzedni wykres, jeśli istnieje
    }

    averageGlucoseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Średni poziom glukozy (mg/dL)',
                data: averageData,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Data pomiarów'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Średni poziom glukozy (mg/dL)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Funkcja aktualizująca statystyki
function updateStatistics() {
    if (glucoseData.length === 0) {
        document.getElementById('average-glucose').textContent = "Średni poziom glukozy: -- mg/dL";
        document.getElementById('min-glucose').textContent = "Minimalny poziom glukozy: -- mg/dL";
        document.getElementById('max-glucose').textContent = "Maksymalny poziom glukozy: -- mg/dL";
        return;
    }

    const glucoseLevels = glucoseData.map(item => parseFloat(item.glucose)).filter(n => !isNaN(n));
    if (glucoseLevels.length === 0) {
        document.getElementById('average-glucose').textContent = "Średni poziom glukozy: -- mg/dL";
        document.getElementById('min-glucose').textContent = "Minimalny poziom glukozy: -- mg/dL";
        document.getElementById('max-glucose').textContent = "Maksymalny poziom glukozy: -- mg/dL";
        return;
    }

    const average = (glucoseLevels.reduce((a, b) => a + b, 0) / glucoseLevels.length).toFixed(2);
    const min = Math.min(...glucoseLevels).toFixed(2);
    const max = Math.max(...glucoseLevels).toFixed(2);

    document.getElementById('average-glucose').textContent = `Średni poziom glukozy: ${average} mg/dL`;
    document.getElementById('min-glucose').textContent = `Minimalny poziom glukozy: ${min} mg/dL`;
    document.getElementById('max-glucose').textContent = `Maksymalny poziom glukozy: ${max} mg/dL`;
}

// Funkcja sprawdzająca prawidłowość wyniku glukozy
function checkGlucoseValidity(glucose, timing) {
    glucose = parseFloat(glucose);
    let message = "Nieprawidłowy";

    if (timing === "Na czczo" || timing === "Wieczorem") {
        if (glucose >= 60 && glucose <= 90) {
            message = "Prawidłowy";
        }
    } else if (timing === "1 godzina po posiłku") {
        if (glucose < 140) {
            message = "Prawidłowy";
        }
    } else if (timing === "2 godziny po posiłku") {
        if (glucose < 120) {
            message = "Prawidłowy";
        }
    } else if (timing === "Noc (2-3)") {
        if (glucose >= 60) {
            message = "Prawidłowy";
        }
    }

    return message;
}

// Funkcja aktualizująca tabelę wyników
function updateResultsTable() {
    const tableBody = document.querySelector('#results-table tbody');
    tableBody.innerHTML = ''; // Czyść poprzednie dane

    glucoseData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date} ${item.time}</td>
            <td>${item.glucose} mg/dL</td>
            <td>${item.timing}</td>
            <td>${item.validity}</td>
            <td>
                <button class="action-button delete-button" onclick="deleteResult(${index})">Usuń</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Aktualizuj statystyki i wykresy
    updateStatistics();
    initializeGlucoseChart();
    initializeAverageGlucoseChart();
}

// Funkcja usuwająca wynik
function deleteResult(index) {
    if (index > -1 && index < glucoseData.length) {
        glucoseData.splice(index, 1);
        localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
        updateResultsTable();
    }
}

// Funkcja eksportująca dane do pliku CSV
function exportToCSV() {
    if (glucoseData.length === 0) {
        alert("Brak danych do eksportu!");
        return;
    }

    const headers = ["Data i godzina", "Poziom glukozy (mg/dL)", "Moment badania", "Norma"];
    const rows = glucoseData.map(item => [
        `${item.date} ${item.time}`,
        item.glucose,
        item.timing,
        item.validity
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach(rowArray => {
        let row = rowArray.map(field => `"${field}"`).join(",");
        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const currentDate = new Date().toISOString().slice(0,10);
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `glucose_data_${currentDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Funkcja do drukowania wyników z wykresem
document.getElementById('print-button').addEventListener('click', function() {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Drukuj wyniki</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; background-color: #ffffff; color: #000000; padding: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }');
    printWindow.document.write('th, td { padding: 10px; border: 1px solid #444; text-align: center; }');
    printWindow.document.write('th { background-color: #2a2a2a; color: #00bcd4; }');
    printWindow.document.write('h1, h2 { text-align: center; color: #00bcd4; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Wyniki pomiarów glukozy</h1>');
    printWindow.document.write(document.querySelector('#results-table').outerHTML);
    printWindow.document.write('<h2>Wykres poziomu glukozy</h2>');
    const canvas = document.getElementById('glucose-chart');
    const chartImage = canvas.toDataURL('image/png');
    printWindow.document.write(`<img src="${chartImage}" alt="Wykres poziomu glukozy" style="max-width:100%;">`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});

// Funkcja eksportująca dane do pliku CSV
document.getElementById('export-button').addEventListener('click', exportToCSV);

// Obsługa formularza
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Zapobiega przeładowaniu strony

    const glucose = document.getElementById('glucose').value;
    const timing = document.getElementById('timing').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    // Sprawdzenie prawidłowości wyniku
    const validity = checkGlucoseValidity(glucose, timing);

    // Dodaj wynik do tablicy danych (niezależnie od prawidłowości)
    glucoseData.push({
        glucose: parseFloat(glucose),
        timing: timing,
        date: date,
        time: time,
        validity: validity
    });

    // Zapisz do localStorage
    localStorage.setItem('glucoseData', JSON.stringify(glucoseData));

    // Aktualizuj tabelę i wykresy
    updateResultsTable();

    // Resetuj formularz
    this.reset();

    // Wyczyść komunikat walidacji
    document.getElementById('validation-message').textContent = '';
});

// Funkcja ładowania danych z localStorage
function loadFromLocalStorage() {
    const data = localStorage.getItem('glucoseData');
    if (data) {
        try {
            glucoseData = JSON.parse(data).map(item => ({
                glucose: parseFloat(item.glucose),
                timing: item.timing,
                date: item.date,
                time: item.time,
                validity: item.validity
            }));
        } catch (e) {
            console.error("Błąd podczas parsowania danych z localStorage:", e);
            glucoseData = [];
        }
    } else {
        glucoseData = [];
    }
    updateResultsTable();
}

// Inicjalizacja po załadowaniu strony
window.onload = loadFromLocalStorage;
