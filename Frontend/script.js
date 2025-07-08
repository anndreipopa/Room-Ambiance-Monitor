const socket = io("https://room-ambiance-monitor.onrender.com"); // initializez socket.io client
//const socket = io("http://localhost:3000");
const temperatura = document.getElementById('valTemp');
const umiditate = document.getElementById('valUmid');
const lumina = document.getElementById('valLum');
const lastUpdated = document.getElementById('lastUpdated');
const BACKEND_URL = "https://room-ambiance-monitor.onrender.com/api/history"; // URL-ul backend-ului

let lastTimeStamp = null;

socket.on('sensorData', (data) => {
    console.log('Datele primite de la server:', data);

    lastTimeStamp = Date.now();

    if(data.temperatura !== undefined) {
        temperatura.textContent = data.temperatura.toFixed(1);
    }
    if(data.umiditate !== undefined) {
        umiditate.textContent = data.umiditate.toFixed(1);
    }
    if(data.lumina !== undefined) {
        lumina.textContent = data.lumina;

    }

});

setInterval(() => {
    if(!lastTimeStamp) 
        {
            return;
        }

    const now = Date.now();
    const secondsAgo = Math.floor((now - lastTimeStamp ) / 1000);
    if(secondsAgo === 0){
        lastUpdated.textcontent = 'just now';
    } else if (secondsAgo === 1) {
        lastUpdated.textContent = '1 second ago';
    }
    else {
        lastUpdated.textContent = `${secondsAgo} seconds ago`;
    }
}, 1000);

function createChartConfig(label, yAxisText, color) {
    return {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                borderWidth: 2,
                tension: 0.2,
                pointRadius: 1,
                pointBackgroundColor: 'rgba(255, 255, 255, 0.1)',
                pointBorderColor: 'rgba(255, 255, 255, 0.1)',
                pointHoverradius: 3,
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'minute', tooltipFormat: 'HH:mm:ss' },
                    title: { display: true, text: "Time" }
                },
                y: {
                    title: { display: true, text: yAxisText }
                }
            }
        }
    };
}

// Create the three charts
const tempChart = new Chart(document.getElementById('tempChart').getContext('2d'), createChartConfig('Temperature', 'Temperature (°C)', 'rgba(255, 99, 132, 1)'));
const humChart = new Chart(document.getElementById('humChart').getContext('2d'), createChartConfig('Humidity', 'Humidity (%)', 'rgba(54, 162, 235, 1)'));
const lightChart = new Chart(document.getElementById('lightChart').getContext('2d'), createChartConfig('Light', 'Light (%)', 'rgba(255, 206, 86, 1)'));


// --- DATA FETCHING AND CHART POPULATION ---

// Helper function to determine segment colors based on data trend
function getSegmentColors(data) {
    const colors = [];
    for (let i = 0; i < data.length - 1; i++) {
        if (data[i + 1] > data[i]) {
            colors.push('rgba(255, 99, 132, 0.8)'); // Red for increase
        } else if (data[i + 1] < data[i]) {
            colors.push('rgba(54, 162, 235, 0.8)'); // Blue for decrease
        } else {
            colors.push('rgba(200, 200, 200, 0.8)'); // Gray for stable
        }
    }
    return colors;
}

// Main function to fetch history and populate all charts
async function fetchAndDisplayHistory() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/history`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let historyData = await response.json();
        historyData.reverse();

        const labels = historyData.map(d => new Date(d.created_at));
        
        // --- Populate Temperature Chart ---
        const tempData = historyData.map(d => d.temperature);
        tempChart.data.labels = labels;
        tempChart.data.datasets[0].data = tempData;
        tempChart.data.datasets[0].segment = { borderColor: ctx => getSegmentColors(tempData)[ctx.p0DataIndex] };
        
        // --- Populate Humidity Chart ---
        const humData = historyData.map(d => d.humidity);
        humChart.data.labels = labels; // Use the same labels for all charts
        humChart.data.datasets[0].data = humData;
        humChart.data.datasets[0].segment = { borderColor: ctx => getSegmentColors(humData)[ctx.p0DataIndex] };

        // --- Populate Light Chart ---
        const lightData = historyData.map(d => d.light);
        lightChart.data.labels = labels;
        lightChart.data.datasets[0].data = lightData;
        lightChart.data.datasets[0].segment = { borderColor: ctx => getSegmentColors(lightData)[ctx.p0DataIndex] };

        // Update all charts
        tempChart.update();
        humChart.update();
        lightChart.update();

    } catch (error) {
        console.error('Error fetching or displaying history:', error);
    }
}
function updateChartsWithLiveData(data) {
    const maxDataPoints = 100;

    // Helper function to update a single chart
    function updateSingleChart(chart, newDataPoint) {
        if (newDataPoint === undefined) return;

        // Add new data
        chart.data.labels.push(new Date());
        chart.data.datasets[0].data.push(newDataPoint);

        // Limit data points
        if (chart.data.labels.length > maxDataPoints) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        // Recalculate colors for the entire dataset
        const currentData = chart.data.datasets[0].data;
        chart.data.datasets[0].segment = { borderColor: ctx => getSegmentColors(currentData)[ctx.p0DataIndex] };
        
        chart.update('none'); // Update without animation
    }

    // Call the helper for each chart
    updateSingleChart(tempChart, data.temperatura);
    updateSingleChart(humChart, data.umiditate);
    updateSingleChart(lightChart, data.lumina);
}
setInterval(fetchAndDisplayHistory, 60*1000);
fetchAndDisplayHistory();