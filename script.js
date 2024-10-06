// Inicjalizacja wykresu Chart.js
let glucoseChart;
let glucoseData = JSON.parse(localStorage.getItem('glucoseData')) || [];

// Funkcja inicjalizująca wykres
function initializeChart() {
    const ctx = document.getElementById('glucose-chart').getContext('2d');
    const labels = glucoseData.map(item => item.date + ' ' + item.time);
    const data = glucoseData.map(item => item.glucose);

    if (glucoseChart) {
        glucoseChart.destroy(); // Zniszcz poprzedni wykres
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
    
    // Dodaj wynik do tablicy
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
    let message = "Nieprawidłowy";

    if (timing === "na czczo" || timing === "wieczorem") {
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
    } else if (timing === "noc (3-4)") {
        if (glucose >= 60 && glucose <= 90) {
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

// Funkcja drukująca wyniki
document.getElementById('print-button').addEventListener('click', function() {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Drukuj wyniki</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Wyniki pomiarów glukozy</h1>');
    printWindow.document.write(document.getElementById('results-table').outerHTML);
    printWindow.document.write('<h2>Wykres poziomu glukozy</h2>');
    const canvas = document.getElementById('glucose-chart');
    printWindow.document.write(canvas.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});

// Inicjalizacja
initializeChart();
updateResultsTable();