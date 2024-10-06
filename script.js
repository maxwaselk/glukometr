let glucoseChart;

// Inicjalizacja wykresu
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
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'mg/dL'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data i Czas'
                    }
                }
            }
        }
    });
}

// Dodawanie wyniku do tabeli i wykresu
function addResultToTable(date, time, glucose, timing) {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    savedResults.push({ date, time, glucose, timing });
    localStorage.setItem('glucoseResults', JSON.stringify(savedResults));
    loadResults();
}

// Ładowanie wyników z LocalStorage
function loadResults() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    const resultsTableBody = document.querySelector('#results-table tbody');
    resultsTableBody.innerHTML = '';

    glucoseChart.data.labels = [];
    glucoseChart.data.datasets[0].data = [];

    savedResults.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.date}</td>
            <td>${result.time}</td>
            <td>${result.glucose}</td>
            <td>${result.timing}</td>
            <td>
                <button onclick="deleteResult(${index})">Usuń</button>
            </td>
        `;
        resultsTableBody.appendChild(row);

        // Dodaj dane do wykresu
        glucoseChart.data.labels.push(`${result.date} ${result.time}`);
        glucoseChart.data.datasets[0].data.push(result.glucose);
    });

    glucoseChart.update(); // Zaktualizuj wykres
}

// Usuwanie wyniku
function deleteResult(index) {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    savedResults.splice(index, 1); // Usuń element
    localStorage.setItem('glucoseResults', JSON.stringify(savedResults));
    loadResults(); // Załaduj wyniki ponownie
}

// Funkcja do drukowania wyników
function printResults() {
    const originalContents = document.body.innerHTML;

    // Ustaw zawartość do wydruku
    const printContents = `
        <h1>Wyniki pomiaru glukozy</h1>
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Czas</th>
                    <th>Poziom glukozy (mg/dL)</th>
                    <th>Moment badania</th>
                </tr>
            </thead>
            <tbody>
                ${generateTableRows()}
            </tbody>
        </table>
        <canvas id="print-chart"></canvas>
    `;
    
    document.body.innerHTML = printContents;

    // Inicjalizuj wykres do wydruku
    const printChartCtx = document.getElementById('print-chart').getContext('2d');
    const labels = glucoseChart.data.labels;
    const data = glucoseChart.data.datasets[0].data;

    const printChart = new Chart(printChartCtx, {
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
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'mg/dL'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data i Czas'
                    }
                }
            }
        }
    });

    // Drukowanie
    window.print();
    document.body.innerHTML = originalContents; // Przywróć oryginalną zawartość
}

// Funkcja generująca wiersze tabeli do druku
function generateTableRows() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    return savedResults.map(result => `
        <tr>
            <td>${result.date}</td>
            <td>${result.time}</td>
            <td>${result.glucose}</td>
            <td>${result.timing}</td>
        </tr>
    `).join('');
}

// Obsługa formularza
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const glucose = document.getElementById('glucose').value;
    const timing = document.getElementById('glucose-timing').value;
    
    addResultToTable(date, time, glucose, timing);
    this.reset(); // Resetuj formularz
});

// Obsługa przycisku drukowania
document.getElementById('print-button').addEventListener('click', printResults);

// Ładuj wyniki przy starcie
loadResults();
initializeChart();