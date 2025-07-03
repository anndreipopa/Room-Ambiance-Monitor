require('dotenv').config();

const express = require('express'); //  import librarie express in variabila nemodificabila express
const http = require('http') // import librarie http in variabila nemodificabila http
const { Server } = require('socket.io'); // import doar componenta Server din libraria socket.io

const mqtt = require('mqtt'); // import libraria mqtt pentru a putea comunica cu brokerul MQTT

const app = express();
const server = http.createServer(app); // creăm un server HTTP folosind express
const io = new Server(server,{
    cors: {
        origin: "https://ramdashboard.netlify.app",
        methods: ["GET", "POST"],
    }
}); // initializez io ca o noua instanta a clasei Server, folosing serverul express ca argument
const webPort = provess.env.PORT;;
const path = require('path'); // import libraria path pentru a gestiona căile fișierelor
const cors = require('cors'); // import libraria cors pentru a permite cereri cross-origin

app.use(cors({
    origin: "https://ramdashboard.netlify.app", // specificăm origin-ul de unde sunt permise cererile
})); // folosesc cors pentru a permite cereri cross-origin

const host = process.env.MQTT_HOST;
const port = process.env.MQTT_PORT;
const clientID = `qqtt_${Math.random().toString(16).slice(3)}`;
const connectURL = `mqtts://${host}:${port}`; // mqtts pentru securitate

const client = mqtt.connect(connectURL, {
    clientID,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 1000,
});

const topic = process.env.MQTT_TOPIC;

client.on('connect', () => {
    console.log('Conectat la MQTT!');
    client.subscribe([topic], () => {
        console.log(`Abonat la topic: ${topic}`);
    })
});

client.on('message', (topic, message) => {
    console.log(`Mesaj primit pe topic ${topic}`);
    console.log(`Conținut: ${message.toString()}`);

    const data = JSON.parse(message.toString());
    io.emit('sensorData', data); // trimite datele către toți clienții conectați prin WebSocket
});

server.listen(webPort, () => {
    console.log(`Dashboard-ul este pe localhost: ${webPort}`);
});
console.log("Se incearcă conectarea la brokerul MQTT...");