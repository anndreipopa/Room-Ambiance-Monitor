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
const webPort = process.env.PORT || 3000; // portul pe care va asculta serverul, dacă nu este specificat în variabilele de mediu, va folosi 3000
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // folosim variabila de mediu pentru
    ssl:{
        rejectUnauthorized: false // dezactivăm verificarea SSL pentru a evita erorile de certificare
    }
});

const allowedOrigins = [
    "https://ramdashboard.netlify.app", // Pentru productie
    "http://127.0.0.1:5500",           // Pentru testare locala cu Live Server
    "http://localhost:5500"             // O alternativa pentru Live Server
];

// 2. Definim o singura data optiunile de configurare
const corsOptions = {
    origin: function (origin, callback) {
        // Permite cererile daca originea este in lista sau daca nu exista origine (ex: Postman)
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST"],
};

// 3. Aplicam ACEEASI configurare si la Express si la Socket.IO
app.use(cors(corsOptions));

const io = new Server(server, {
    cors: corsOptions
});

let latestReadings = null;
const savingInterval = 30 * 60 * 1000; // intervalul de salvare a datelor în baza de date (30 minute)

app.get('/api/history', async (req, res) => {
    try {
        console.log("Cerere GET la /api/history");
        const query = `SELECT temperature, humidity, light, created_at FROM sensor_data WHERE created_at >= NOW() - INTERVAL '24 hours' ORDER BY created_at DESC`;
        const {rows} = await pool.query(query);
        res.json(rows); // trimitem ultimele 48 de înregistrări ca răspuns
    } catch (err) {
        console.error("Eroare la obținerea datelor din baza de date:", err);
        res.status(500).json({ error: "Eroare la interogarea bazei de date" }); // Trimite un raspuns de eroare!
        }
    });

app.get('/api/keep-alive', (req, res) => {
    console.log("Cerere /api/keep-alive primita");
    res.status(200).json({ status: "Keep server ON" });
});

app.get('/weather', async (req, res) => {
    const lat = 44.85;
    const lon = 24.88;
    const weatherAPI = process.env.WEATHER_API_KEY;
    
    
    const weatherURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${weatherAPI}&units=metric`;

    try{
        const response = await fetch(weatherURL);
        const weatherData = await response.json();
        res.json(weatherData);
        console.log("Cerere GET la /weather a fost procesata cu succes folosind ${weatherAPI}");
    }
    catch (error) {
        console.error("Eroare la obținerea datelor meteo:", error);
        res.status(500).json({ error: "Eroare la obținerea datelor meteo" });
    }
});

/*async function initDatabase(){
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
} */







async function start() {

    //await initDatabase(); // inițializăm baza de date și creăm tabelul dacă nu există

    //setInterval(logDataToDatabase, savingInterval); // setăm un interval pentru a salva datele în baza de date la fiecare 5 minute

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