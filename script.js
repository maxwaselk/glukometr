// Inicjalizacja wykresu Chart.js
let glucoseChart;
let glucoseData = [];
let labels = [];

function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Poziom glukozy (mg/dL)',
                data: glucoseData,
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
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Poziom glukozy (mg/dL)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Czas'
                    }
                }
            }
        }
    });
}

function addResultToTable(glucose, timing, validity) {
    const tableBody = document.querySelector('#results-table tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${glucose}</td>
        <td>${timing}</td>
        <td>${validity}</td>
        <td><button class="action-button delete-button">Usuń</button></td>
    `;

    row.querySelector('.delete-button').addEventListener('click', function () {
        tableBody.removeChild(row);
        removeResult(glucose, timing);
        updateChart();
    });

    tableBody.appendChild(row);
}

function removeResult(glucose, timing) {
    const index = glucoseData.findIndex(data => data.glucose === glucose && data.timing === timing);
    if (index !== -1) {
        glucoseData.splice(index, 1);
        labels.splice(index, 1);
        saveToLocalStorage();
        updateChart();
    }
}

function updateChart() {
    glucoseChart.data.labels = labels;
    glucoseChart.data.datasets[0].data = glucoseData.map(data => data.glucose);
    glucoseChart.update();
}

function saveToLocalStorage() {
    localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
}

function loadFromLocalStorage() {
    const storedData = JSON.parse(localStorage.getItem('glucoseData'));
    if (storedData) {
        glucoseData = storedData;
        glucoseData.forEach(data => {
            addResultToTable(data.glucose, data.timing, data.validity);
            labels.push(new Date().toLocaleString()); // Dodaj daty do etykiet
        });
        updateChart();
    }
}

// Funkcja sprawdzająca prawidłowość wyniku glukozy
function checkGlucoseValidity(glucose, timing) {
    glucose = parseFloat(glucose);
    let isValid = false;
    let message = "Nieprawidłowy";

    if (timing === "na czczo") {
        if (glucose >= 60 && glucose <= 90) {
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
    } else if (timing === "wieczorem") {
        if (glucose >= 60 && glucose <= 105) {
            isValid = true;
            message = "Prawidłowy";
        }
    } else if (timing === "noc (3-4)") {
        if (glucose >= 60) {
            isValid = true;
            message = "Prawidłowy";
        }
    }

    return message;
}

// Dodawanie wyników
document.getElementById('glucose-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const glucoseLevel = document.getElementById('glucose-level').value;
    const timing = document.getElementById('timing').value;

    const validity = checkGlucoseValidity(glucoseLevel, timing);
    addResultToTable(glucoseLevel, timing, validity);

    glucoseData.push({
        glucose: parseFloat(glucoseLevel),
        timing: timing,
        validity: validity
    });
    labels.push(new Date().toLocaleString());
    saveToLocalStorage();
    updateChart();

    document.getElementById('glucose-level').value = ''; // Resetowanie pola
    document.getElementById('validation-message').textContent = ''; // Resetowanie komunikatu
});

// Funkcja drukująca wyniki
document.getElementById('print-button').addEventListener('click', function () {
    const printWindow = window.open('', '_blank');
    const tableHTML = document.querySelector('#results-table').outerHTML;
    const chartCanvas = document.getElementById('glucose-chart');
    const chartImage = chartCanvas.toDataURL('image/png');

    printWindow.document.write(`
        <html>
            <head>
                <title>Drukowanie wyników</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 12px; border: 1px solid #444; }
                    th { background-color: #f2f2f2; }
                    img { max-width: 100%; }
                </style>
            </head>
            <body>
                <h1>Wyniki pomiarów glukozy</h1>
                ${tableHTML}
                <h2>Wykres poziomu glukozy</h2>
                <img src="${chartImage}" alt="Wykres poziomu glukozy">
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
});

// Ładowanie danych z LocalStorage po załadowaniu strony
window.onload = loadFromLocalStorage;
initializeChart();