const socket = io(); // initializez socket.io client
const temperatura = document.getElementById('valTemp');
const umiditate = document.getElementById('valUmid');
const lumina = document.getElementById('valLum');
const lastUpdated = document.getElementById('lastUpdated');

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
        lastTimeStamp.textcontent = 'just now';
    } else if (secondsAgo === 1) {
        lastUpdated.textContent = '1 second ago';
    }
    else {
        lastUpdated.textContent = `${secondsAgo} seconds ago`;
    }
}, 1000);
