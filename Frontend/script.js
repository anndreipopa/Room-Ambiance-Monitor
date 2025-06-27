const socket = io(); // initializez socket.io client
const temperatura = document.getElementById('valTemp');
const umiditate = document.getElementById('valUmid');
const lumina = document.getElementById('valLum');

socket.on('sensorData', (data) => {
    console.log('Datele primite de la server:', data);

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