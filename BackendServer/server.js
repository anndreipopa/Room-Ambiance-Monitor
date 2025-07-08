require('dotenv').config();

const express = require('express'); //  import librarie express in variabila nemodificabila express
const http = require('http') // import librarie http in variabila nemodificabila http
const { Server } = require('socket.io'); // import doar componenta Server din libraria socket.io
const mqtt = require('mqtt'); // import libraria mqtt pentru a putea comunica cu brokerul MQTT
const {Pool} = require('pg'); // import librariile Pool si Client din libraria pg pentru a putea comunica cu baza de date PostgreSQL
const cors = require('cors'); // import libraria cors pentru a permite cereri cross-origin
const path = require('path'); // import libraria path pentru a gestiona căile fișierelor

const app = express();
const server = http.createServer(app); // creăm un server HTTP folosind express
const webPort = process.env.PORT;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // folosim variabila de mediu pentru
    ssl:{
        rejectUnauthorized: false // dezactivăm verificarea SSL pentru a evita erorile de certificare
    }
});

const io = new Server(server,{
    cors: {
        origin: "https://ramdashboard.netlify.app",
        methods: ["GET", "POST"],
    }
}); // initializez io ca o noua instanta a clasei Server, folosing serverul express ca argument


app.use(cors({
    origin: "https://ramdashboard.netlify.app", // specificăm origin-ul de unde sunt permise cererile
})); // folosesc cors pentru a permite cereri cross-origin

let latestReadings = null;
const savingInterval = 60 * 5000; // intervalul de salvare a datelor în baza de date (5 minute)

app.get('/api/hisory', async (req, res) => {
    try {
        console.log("Cerere GET la /api/history");
        const query = 'SELECT temperature, humidity, light, created_at FROM sensor_data ORDER BY created_at DESC LIMIT 100';
        const {rows} = await pool.query(query);
        res.json(rows); // trimitem ultimele 100 de înregistrări ca răspuns
    } catch (err) {
        console.error("Eroare la obținerea datelor din baza de date:", err);
    }
})

async function initDatabase(){
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        temperature REAL,
        humidity REAL,
        light INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;

    try {
        await pool.query(createTableQuery);
        console.log("Tabelul 'sensor_data' a fost creat");
    } catch (err) {
        console.error("Eroare la crearea tabelului 'sensor_data':", err);
        process.exit(1); // închidem aplicația dacă nu putem crea tabelul
    }
}

async function logDataToDatabase() {
    if(latestReadings) {
        console.log(`Se pregateste salvarea datelor:`,latestReadings);
        const { temperatura, umiditate, lumina } = latestReadings;
        const query = 'INSERT INTO sensor_data (temperature, humidity, light) VALUES ($1, $2, $3)';

        try {
            await pool.query(query, [temperatura, umiditate, lumina]);
            console.log("Datele au fost salvate în baza de date");
        } catch (err) {
            console.error("Eroare la salvarea datelor în baza de date:", err);
        }
    } else {
        console.log("Nu sunt date de salvat în baza de date");
    }
}







async function start() {

    await initDatabase(); // inițializăm baza de date și creăm tabelul dacă nu există

    setInterval(logDataToDatabase, savingInterval); // setăm un interval pentru a salva datele în baza de date la fiecare 5 minute

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
    latestReadings = data;
    io.emit('sensorData', data); // trimite datele către toți clienții conectați prin WebSocket
});

server.listen(webPort, () => {
    console.log(`Dashboard-ul este pe localhost: ${webPort}`);
});
console.log("Se incearcă conectarea la brokerul MQTT...");
}

start();