let glucoseChart;
const glucoseData = JSON.parse(localStorage.getItem('glucoseResults')) || [];

// Inicjalizacja wykresu Chart.js
function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: glucoseData.map(entry => `${entry.date} ${entry.time}`), // Daty i czasy pomiarów
            datasets: [{
                label: 'Poziom glukozy (mg/dL)',
                data: glucoseData.map(entry => entry.glucose), // Poziomy glukozy
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
function addResultToTable(date, time, glucose, measurementType) {
    const tableBody = document.querySelector('#glucose-table tbody');
    const row = document.createElement('tr');
    const glucoseValidity = checkGlucoseValidity(glucose);
    
    row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${glucose} mg/dL</td>
        <td>${measurementType}</td>
        <td class="${glucoseValidity.isValid ? 'good' : 'bad'}">${glucoseValidity.message}</td>
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
function saveResult(date, time, glucose, measurementType) {
    glucoseData.push({ date, time, glucose, measurementType });
    localStorage.setItem('glucoseResults', JSON.stringify(glucoseData));
}

// Funkcja obsługi formularza
document.getElementById('glucose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const glucose = document.getElementById('glucose').value;
    const measurementType = document.getElementById('measurement-type').value;

    addResultToTable(date, time, glucose, measurementType);
    saveResult(date, time, glucose, measurementType);

    // Resetowanie formularza
    this.reset();
    // Aktualizacja wykresu
    glucoseChart.data.labels.push(`${date} ${time}`);
    glucoseChart.data.datasets[0].data.push(glucose);
    glucoseChart.update();
});

// Ładowanie zapisanych wyników i konfiguracja nasłuchiwania zdarzeń po załadowaniu strony
window.onload = function() {
    glucoseData.forEach(result => addResultToTable(result.date, result.time, result.glucose, result.measurementType));
    initializeChart();
};