// Inicjalizacja wykresu Chart.js
let glucoseChart;
let glucoseData = JSON.parse(localStorage.getItem('glucoseData')) || [];

// Funkcja inicjalizująca wykres
function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    const labels = glucoseData.map(item => item.date + ' ' + item.time);
    const data = glucoseData.map(item => item.glucose);

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
                    }
                }
            }
        }
    });
}

// Funkcja dodająca wynik
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const glucoseInput = document.getElementById('glucose').value;
    const timingInput = document.getElementById('timing').value;
    const dateInput = document.getElementById('date').value;
    const timeInput = document.getElementById('time').value;
    
    // Sprawdzenie prawidłowości wyniku
    const validity = checkGlucoseValidity(glucoseInput, timingInput);
    glucoseData.push({
        glucose: glucoseInput,
        timing: timingInput,
        date: dateInput,
        time: timeInput,
        validity: validity
    });
    
    localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
    updateResultsTable();
    initializeChart();
    this.reset(); // Resetowanie formularza
});

// Funkcja sprawdzająca prawidłowość wyniku glukozy
function checkGlucoseValidity(glucose, timing) {
    glucose = parseFloat(glucose);
    let isValid = false;
    let message = "Nieprawidłowy";

    if (timing === "na czczo" || timing === "wieczorem") {
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
    } else if (timing === "noc (3-4)") {
        if (glucose >= 60 && glucose <= 90) {
            isValid = true;
            message = "Prawidłowy";
        }
    }

    return message;
}

// Funkcja aktualizująca tabelę wyników
function updateResultsTable() {
    const resultsTableBody = document.getElementById('results-table').querySelector('tbody');
    resultsTableBody.innerHTML = ''; // Czyść poprzednie dane

    glucoseData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date} ${item.time}</td>
            <td>${item.glucose} mg/dL</td>
            <td>${item.validity}</td>
            <td>
                <button class="delete-button" onclick="deleteResult(${index})">Usuń</button>
            </td>
        `;
        resultsTableBody.appendChild(row);
    });
}

// Funkcja usuwająca wynik
function deleteResult(index) {
    glucoseData.splice(index, 1);
    localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
    updateResultsTable();
    initializeChart();
}

// Funkcja do drukowania wyników z wykresem
document.getElementById('print-button').addEventListener('click', function () {
    const printContent = document.querySelector('.container').innerHTML;
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head>
                <title>Wyniki pomiarów</title>
                <style>
                    body { font-family: 'Roboto', sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; border: 1px solid #444; text-align: center; }
                    th { background-color: #2a2a2a; color: #00bcd4; }
                    h1 { text-align: center; color: #00bcd4; }
                </style>
            </head>
            <body>
                <h1>Wyniki pomiarów</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Data i godzina</th>
                            <th>Poziom glukozy (mg/dL)</th>
                            <th>Norma</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${glucoseData.map(item => `
                            <tr>
                                <td>${item.date} ${item.time}</td>
                                <td>${item.glucose} mg/dL</td>
                                <td>${item.validity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <canvas id="print-chart"></canvas>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script>
                    const ctx = document.getElementById('print-chart').getContext('2d');
                    const labels = ${JSON.stringify(glucoseData.map(item => item.date + ' ' + item.time))};
                    const data = ${JSON.stringify(glucoseData.map(item => item.glucose))};

                    new Chart(ctx, {
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
                                    }
                                }
                            }
                        }
                    });
                </script>
            </body>
        </html>
    `);
    newWindow.document.close();
    newWindow.print();
});
initializeChart();
updateResultsTable();