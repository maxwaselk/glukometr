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
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// Funkcja dodawania wyników
function addResultToTable(date, time, glucose, timing) {
    const tableBody = document.querySelector('#glucose-table tbody');
    const row = document.createElement('tr');
    const glucoseValidity = checkGlucoseValidity(glucose, timing);
    
    row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${glucose} mg/dL</td>
        <td>${timing}</td>
        <td class="${glucoseValidity.isValid ? 'good' : 'bad'}">${glucoseValidity.message}</td>
        <td><button onclick="deleteResult(this)">Usuń</button></td>
    `;
    tableBody.appendChild(row);

    // Dodaj dane do wykresu
    glucoseChart.data.labels.push(`${date} ${time}`);
    glucoseChart.data.datasets[0].data.push(glucose);
    glucoseChart.update();

    // Zapisz wynik w LocalStorage
    saveResult(date, time, glucose, timing);
}

// Funkcja do sprawdzania ważności poziomu glukozy
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

// Funkcja do usuwania wyniku
function deleteResult(button) {
    const row = button.parentNode.parentNode;
    row.remove();

    // Zaktualizuj dane wykresu
    const glucoseIndex = glucoseChart.data.labels.indexOf(`${row.children[0].textContent} ${row.children[1].textContent}`);
    if (glucoseIndex > -1) {
        glucoseChart.data.labels.splice(glucoseIndex, 1);
        glucoseChart.data.datasets[0].data.splice(glucoseIndex, 1);
        glucoseChart.update();
    }

    // Usunięcie wyniku z LocalStorage
    removeResultFromLocalStorage(`${row.children[0].textContent} ${row.children[1].textContent}`);
}

// Funkcja do usuwania wyniku z LocalStorage
function removeResultFromLocalStorage(dateTime) {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    const updatedResults = savedResults.filter(result => !(result.date + ' ' + result.time === dateTime));
    localStorage.setItem('glucoseResults', JSON.stringify(updatedResults));
}

// Funkcja do zapisywania wyników
function saveResult(date, time, glucose, timing) {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    savedResults.push({ date, time, glucose, timing });
    localStorage.setItem('glucoseResults', JSON.stringify(savedResults));
}

// Funkcja do ładowania zapisanych wyników
function loadResults() {
    const savedResults = JSON.parse(localStorage.getItem('glucoseResults')) || [];
    savedResults.forEach(result => addResultToTable(result.date, result.time, result.glucose, result.timing));
}

// Funkcja konfigurująca nasłuchiwanie zdarzeń
function setupEventListeners() {
    document.getElementById('glucose-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const glucose = document.getElementById('glucose').value;
        const timing = document.getElementById('glucose-timing').value;
        addResultToTable(date, time, glucose, timing);
        this.reset(); // Resetuj formularz po