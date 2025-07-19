const socket = io("https://room-ambiance-monitor.onrender.com"); // initializez socket.io client
//const socket = io("http://localhost:3000");
const temperatura = document.getElementById('valTemp');
const umiditate = document.getElementById('valUmid');
const lumina = document.getElementById('valLum');
const lumDescription = document.getElementById('valLumDesc'); // element for light description
const lastUpdated = document.getElementById('lastUpdated');
const BACKEND_URL = "https://room-ambiance-monitor.onrender.com"; // URL-ul backend-ului

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
    if(data.descriereLumina !== undefined) {
        lumDescription.textContent = data.descriereLumina;
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
                borderWidth: 4,
                tension: 0.2,
                pointRadius: 1,
                pointBackgroundColor: 'rgba(255, 255, 255, 0.1)',
                pointBorderColor: 'rgba(0, 0, 0, 0.2)',
                pointHoverradius: 3,
                hitRadius: 10,
            }]
        },
        options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    }
                },
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
const lightChart = new Chart(document.getElementById('lightChart').getContext('2d'), createChartConfig('Light', 'Light (lx)', 'rgba(255, 206, 86, 1)'));


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
fetchAndDisplayHistory();
setInterval(fetchAndDisplayHistory, 30*60*1000); // Refresh history every 30 minutes

const currentTemp = document.querySelector('.temp-txt');
const feelsLikeTemp = document.getElementById('feelslike-temp');
const descriptionText = document.getElementById('weather-desc');

// Weather icon mapping based on OpenWeatherMap descriptions
// This mapping is used to determine which icon to display based on the weather description and time of day
// Icons are stored in the 'weather' directory
const weatherIconMap = {
  "clear sky": { day: "sunny.svg", night: "clear_alt.svg" },
  "few clouds": { day: "partly_cloudy.svg", night: "partly_clear_alt.svg" },
  "scattered clouds": { day: "mostly_sunny.svg", night: "mostly_clear_alt.svg" },
  "broken clouds": { day: "mostly_cloudy.svg", night: "mostly_cloudy_night_alt.svg" },
  "overcast clouds": { day: "cloudy.svg", night: "cloudy.svg" },

  "light rain": { day: "drizzle.svg", night: "drizzle.svg" },
  "moderate rain": { day: "scattered_showers.svg", night: "scattered_showers.svg" },
  "heavy intensity rain": { day: "showers.svg", night: "showers.svg" },
  "light intensity shower rain": { day: "scattered_showers", night: "scattered_showers.svg" },
  "shower rain": { day: "showers.svg", night: "showers.svg" },

  "drizzle": { day: "drizzle.svg", night: "drizzle.svg" },

  "thunderstorm": { day: "isolated_tstorms.svg", night: "isolated_tstorms.svg" },
  "thunderstorm with heavy rain": { day: "strong_tstorms.svg", night: "strong_tstorms.svg" },

  "light snow": { day: "flurries.svg", night: "flurries.svg" },
  "snow": { day: "scattered_snow.svg", night: "scattered_snow.svg" },
  "heavy snow": { day: "heavy_snow.svg", night: "heavy_snow.svg" },
  "snow showers": { day: "snow_showers.svg", night: "snow_showers.svg" },
  "blizzard": { day: "blizzard.svg", night: "blizzard.svg" },
  "sleet": { day: "icy.svg", night: "icy.svg" },

  "mist": { day: "mist.svg", night: "mist.svg" },
  "fog": { day: "fog.svg", night: "fog.svg" },
  "haze": { day: "fog.svg", night: "fog.svg" },
  "dust": { day: "dust.svg", night: "dust.svg" },
  "smoke": { day: "mist.svg", night: "mist.svg" },

  "tornado": { day: "wind.svg", night: "wind.svg" },
  "squall": { day: "wind.svg", night: "wind.svg" }
};
// Function to get the appropriate weather icon based on description and time of day
function getWeatherIcon(description, isNight) {
  const desc = description.toLowerCase();
  const iconData = weatherIconMap[desc];

  if (iconData) {
    return isNight ? iconData.night : iconData.day;
  }

  // fallback
  return isNight ? "mostly_clear_alt.svg" : "sunny.svg";
}

    fetch(`${BACKEND_URL}/weather`)
    .then(response => response.json())
    .then(weatherData => {
        console.log('Weather data:', weatherData);
        currentTemp.textContent = `${Math.round(weatherData.current.temp)}°C`;
        feelsLikeTemp.textContent = `${Math.round(weatherData.current.feels_like)}°C`;
        const description = weatherData.current.weather[0].description;
        descriptionText.textContent = description.charAt(0).toUpperCase() + description.slice(1);
        const { dt, sunrise, sunset, weather } = weatherData.current;
        const night = dt < sunrise || dt > sunset;
        const icon = getWeatherIcon(weather[0].description, night);
        document.querySelector(".weather-icon").src = `weather/${icon}`;

        // Displaying hourly forecast for the next 12 hours
        const hourlyContainer = document.querySelector('.todayForecast');
        hourlyContainer.innerHTML = ''; 

        // Slicing our hourly data to get the next 12 hours
        const hourlyForecasts = weatherData.hourly.slice(1, 16).filter((_, index) => (index + 1) % 3 === 0);
 
        hourlyForecasts.forEach(forecast => {
            const item = document.createElement('div');
            item.className = 'todayForecast-contents';
            // Formatting date for a readable format
            const date = new Date(forecast.dt * 1000);
            const timeString = date.toLocaleTimeString('ro-RO', { hour: 'numeric', minute: '2-digit' });

            // Determine if it's night or day for the icon
            const forecastHour = new Date(forecast.dt * 1000).getHours();
            const isNight = forecastHour < 6 || forecastHour >= 21;
            const icon = getWeatherIcon(forecast.weather[0].description, isNight);
            // Setting the inner HTML for the item
            item.innerHTML = `
                <h3 class="weathertime">${timeString}</h3>
                <img src="weather/${icon}" alt="Weather Icon" class="weather-icon-small">
                <h3 class="dailytemp">${Math.round(forecast.temp)}°C</h3>
            `;
            hourlyContainer.appendChild(item);
        });


        // forecasting the next 5 days
        const dailyContainer = document.querySelector('.weeklyForecast');
        dailyContainer.innerHTML = ''; // empty HTML container

        // Slicing our daily data to get the next 5 days
        // We skip the first day (today) and take the next 5 days
        const dailyForecasts = weatherData.daily.slice(1, 6);

        dailyForecasts.forEach(day => {
            const item = document.createElement('div');
            item.className = 'weeklyForecast-contents';

            // Formatting date for a readable format
            const date = new Date(day.dt * 1000);
            const dayString = date.toLocaleDateString('en-EN', { weekday: 'short' });

            // for the icon, it's always set as daytime
            const icon = getWeatherIcon(day.weather[0].description, false);
            // Setting the inner HTML for the item
            item.innerHTML = `
                <h3 class="weatherday">${dayString}</h3>
                <img src="weather/${icon}" alt="Weather Icon" class="weather-icon-small">
                <h3 class="dailytemp">${Math.round(day.temp.max)}°C</h3>
            `;
            dailyContainer.appendChild(item);
        });

    })
    .catch(error => {
        console.error('Eroare la obținerea sau afișarea datelor meteo:', error);
    });