let glucoseChart;
const glucoseData = JSON.parse(localStorage.getItem('glucoseResults')) || [];

// Inicjalizacja wykresu Chart.js
function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: glucoseData.map(entry => `${entry.date} ${entry.time}`),
            datasets: [{
                label: 'Poziom glukozy (mg/dL)',
                data: glucoseData.map(entry => entry.glucose),
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
                        text: 'Data i Czas'
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

// Funkcja dodawania wyniku do tabeli
function addResultToTable(date, time, glucose, measurementType, index) {
    const tableBody = document.querySelector('#glucose-table tbody');
    const row = document.createElement('tr');
    const glucoseValidity = checkGlucoseValidity(glucose);

    row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${glucose} mg/dL</td>
        <td>${measurementType}</td>
        <td class="${glucoseValidity.isValid ? 'good' : 'bad'}">${glucoseValidity.message}</td>
        <td><button class="delete-button" data-index="${index}">Usuń</button></td>
    `;
    tableBody.appendChild(row);
}

// Funkcja sprawdzająca prawidłowość wyniku glukozy
function checkGlucoseValidity(glucose) {
    glucose = parseFloat(glucose);
    let isValid = false;
    let message = "Nieprawidłowy";

    if (glucose >= 70 && glucose <= 90) {
        isValid = true;
        message = "Prawidłowy";
    } else if (glucose < 70) {
        message = "Niski poziom";
    } else if (glucose > 90) {
        message = "Wysoki poziom";
    }

    return { isValid, message };
}

// Funkcja zapisywania wyniku w LocalStorage
function saveResult() {
    localStorage.setItem('glucoseResults', JSON.stringify(glucoseData));
}

// Funkcja obsługi formularza
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const glucose = document.getElementById('glucose').value;
    const measurementType = document.getElementById('measurement-type').value;

    const index = glucoseData.length; // Indeks do dodawania do tabeli
    addResultToTable(date, time, glucose, measurementType, index);
    glucoseData.push({ date, time, glucose, measurementType });
    saveResult();

    this.reset();
    glucoseChart.data.labels.push(`${date} ${time}`);
    glucoseChart.data.datasets[0].data.push(glucose);
    glucoseChart.update();
});

// Funkcja do usuwania wyniku
function deleteResult(index) {
    glucoseData.splice(index, 1);
    saveResult();
    updateTable();
    updateChart();
}

// Funkcja aktualizująca tabelę
function updateTable() {
    const tableBody = document.querySelector('#glucose-table tbody');
    tableBody.innerHTML = ''; // Wyczyść tabelę
    glucoseData.forEach((result, index) => addResultToTable(result.date, result.time, result.glucose, result.measurementType, index));
}

// Funkcja aktualizująca wykres
function updateChart() {
    glucoseChart.data.labels = glucoseData.map(entry => `${entry.date} ${entry.time}`);
    glucoseChart.data.datasets[0].data = glucoseData.map(entry => entry.glucose);
    glucoseChart.update();
}

// Ładowanie zapisanych wyników i konfiguracja nasłuchiwania zdarzeń po załadowaniu strony
window.onload = function() {
    glucoseData.forEach((result, index) => addResultToTable(result.date, result.time, result.glucose, result.measurementType, index));
    initializeChart();
};

// Obsługa usuwania wyników
document.getElementById('glucose-table').addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-button')) {
        const index = event.target.getAttribute('data-index');
        deleteResult(index);
    }
});

// Funkcja do drukowania wyników
document.getElementById('print-button').addEventListener('click', function() {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Wyniki pomiarów glukozy</title>');
    printWindow.document.write('<link rel="stylesheet" href="styles.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Wyniki pomiarów glukozy</h1>');
    printWindow.document.write('<table border="1" style="width:100%; border-collapse:collapse;">');
    printWindow.document.write('<tr><th>Data</th><th>Czas</th><th>Poziom glukozy</th><th>Typ pomiaru</th><th>Ważność</th></tr>');

    glucoseData.forEach(entry => {
        const glucoseValidity = checkGlucoseValidity(entry.glucose);
        printWindow.document.write(`
            <tr>
                <td>${entry.date}</td>
                <td>${entry.time}</td>
                <td>${entry.glucose} mg/dL</td>
                <td>${entry.measurementType}</td>
                <td class="${glucoseValidity.isValid ? 'good' : 'bad'}">${glucoseValidity.message}</td>
            </tr>
        `);
    });
    
    printWindow.document.write('</table>');
    printWindow.document.write('<h2>Wykres poziomu glukozy</h2>');
    printWindow.document.write('<canvas id="print-chart"></canvas>');
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.onload = function() {
        const printCtx = printWindow.document.getElementById('print-chart').getContext('2d');
        new Chart(printCtx, {
            type: 'line',
            data: {
                labels: glucoseData.map(entry => `${entry.date} ${entry.time}`),
                datasets: [{
                    label: 'Poziom glukozy (mg/dL)',
                    data: glucoseData.map(entry => entry.glucose),
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
                            text: 'Data i Czas'
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
    };

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
});