let glucoseChart;

// Inicjalizacja wykresu
function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Poziom glukozy (mg/dL)',
                data: [],
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

// Funkcja sprawdzająca prawidłowość wyniku glukozy
function checkGlucoseValidity(glucose, timing) {
    glucose = parseFloat(glucose);
    let isValid = false;
    let message = "Nieprawidłowy";

    if (timing === "Na czczo") {
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
    } else if (timing === "Wieczorem") {
        if (glucose >= 60 && glucose <= 105) {
            isValid = true;
            message = "Prawidłowy";
        }
    } else if (timing === "Noc (3-4)") {
        if (glucose > 60) {
            isValid = true;
            message = "Prawidłowy";
        }
    }

    return { isValid, message };
}

// Dodawanie wyniku do tabeli i wykresu
function addResultToTable(date, time, glucose, timing) {
    const validationMessageElement = document.getElementById('validation-message');
    const { isValid, message } = checkGlucoseValidity(glucose, timing);
    
    if (!isValid) {
        validationMessageElement.textContent = message;
        return;
    } else {
        validationMessageElement.textContent = ''; // Wyczyszczenie komunikatu o błędzie
    }

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

    // Wydrukuj zawartość
    window.print();

    // Przywróć oryginalną zawartość
    document.body.innerHTML = originalContents;
}

// Generuj wiersze tabeli do wydruku
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

// Obsługa zdarzenia przesyłania formularza
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Zapobiegaj przeładowaniu strony
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const glucose = document.getElementById('glucose').value;
    const timing = document.getElementById('glucose-timing').value;

    addResultToTable(date, time, glucose, timing); // Dodaj wynik
    this.reset(); // Resetuj formularz
});

// Inicjalizacja wykresu i załaduj wyniki przy starcie
window.onload = function() {
    initializeChart();
    loadResults();
    document.getElementById('print-button').addEventListener('click', printResults); // Przypisz funkcję do przycisku drukowania
};