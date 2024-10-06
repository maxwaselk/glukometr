// script.js

// Inicjalizacja wykresu Chart.js
let glucoseChart;
let glucoseData = JSON.parse(localStorage.getItem('glucoseData')) || [];

// Funkcja inicjalizująca wykres
function initializeChart() {
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
}

// Funkcja usuwająca wynik
function deleteResult(index) {
    if (index > -1 && index < glucoseData.length) {
        glucoseData.splice(index, 1);
        localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
        updateResultsTable();
        initializeChart();
    }
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
    printWindow.document.write(`<img src="${chartImage}" alt="Wykres poziomu glukozy">`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});

// Obsługa formularza
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Zapobiega przeładowaniu strony

    const glucose = document.getElementById('glucose').value;
    const timing = document.getElementById('timing').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    // Sprawdzenie prawidłowości wyniku
    const validity = checkGlucoseValidity(glucose, timing);

    if (validity !== "Prawidłowy") {
        document.getElementById('validation-message').textContent = `Nieprawidłowy wynik glukozy dla "${timing}". Proszę sprawdzić normy.`;
        return;
    } else {
        document.getElementById('validation-message').textContent = '';
    }

    // Dodaj wynik do tablicy danych
    glucoseData.push({
        glucose: parseFloat(glucose),
        timing: timing,
        date: date,
        time: time,
        validity: validity
    });

    // Zapisz do localStorage
    localStorage.setItem('glucoseData', JSON.stringify(glucoseData));

    // Aktualizuj tabelę i wykres
    updateResultsTable();
    initializeChart();

    // Resetuj formularz
    this.reset();
});

// Funkcja ładowania danych z localStorage
function loadFromLocalStorage() {
    glucoseData = JSON.parse(localStorage.getItem('glucoseData')) || [];
    updateResultsTable();
    initializeChart();
}

// Inicjalizacja po załadowaniu strony
window.onload = loadFromLocalStorage;