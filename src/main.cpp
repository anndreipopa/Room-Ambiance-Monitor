#include <Arduino.h>
#include <Wire.h>
#include <SHT2x.h>
#include <BH1750.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <secrets.h>
#include <string>
using namespace std;
// config retea si MQTT
const char* ssid = WIFI_SSID;
const char* wifiPassword = WIFI_PASSWORD;
const char* mqttServer = MQTT_HOST;
const int mqttPort = MQTT_PORT;
const char* mqttUser = MQTT_USER;
const char* mqttPassword = MQTT_PASSWORD;

//topic MQTT
const char* mqttTopic = MQTT_TOPIC;
const char* caCert = aCACert;

WiFiClientSecure espClient;
PubSubClient client(espClient);


SHT2x senzorAer;
BH1750 senzorLumina;

//initializare pini si date pentru senzorul de lumina si LED
const int sensorPin = 34;
const int valoareIntuneric = 4095;
const int valoareLuminaMaxima = 0;
const float reglajTemp = -1.2;

const int ledPin = 17;

/*
const int sensorPinSol = 35;
const int valoareSolUscat = 4095;
const int valoareSolUmed = 0;
*/

struct DateAer{
  float temperatura;
  float umiditate;
  bool citireReusita;
};

int  getLumina(){
    // Citire senzor lumina
  float valoareLumina = senzorLumina.readLightLevel();
  // Verificam daca citirea a fost reusita
  if(valoareLumina < 0){
    Serial.println("Eroare la citirea senzorului de lumina!");
    return -1; // eroare
  }
  return valoareLumina; // returnam valoarea luminii;
}
string getDescriereLumina(float valoareLumina){
  if(valoareLumina < 5){
    return "🌑 Pitch Black";
  }
  if(valoareLumina < 30){
    return "🌙 Very Dim Light";
  }
  if(valoareLumina < 120){
    return "🌆 Ambient Light";
  }
  if(valoareLumina < 300){
    return "💡 Normal Light";
  }
  if(valoareLumina < 500){
    return "🔆 Bright Light";
  }
  return "☀️ Very Bright Light";
}

  DateAer getDateAer(){
  DateAer date;
 
  date.citireReusita = senzorAer.read();
  if(date.citireReusita){
    date.temperatura = senzorAer.getTemperature() + reglajTemp; // ajustam temperatura cu un reglaj
    date.umiditate = senzorAer.getHumidity();
  } else {
    date.temperatura = 0.0; // eroare
    date.umiditate = 0.0; // eroare
  }
  return date;
}



/*void citesteUmiditateSol(){
int valoareSol = analogRead(sensorPinSol);
int procentajUmiditate = map(valoareSol, valoareSolUscat, valoareSolUmed, 0, 100);
  procentajUmiditate = constrain(procentajUmiditate, 0, 100);
  Serial.print("Valoare umiditate sol: ");
  Serial.print(valoareSol);
  Serial.println("%");

} */
// setup WiFi
void wifiSetup(){
  Serial.print("Conectare la retea WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, wifiPassword);
  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("Wi-Fi conectat! IP:");
  Serial.println(WiFi.localIP());
}
// setup MQTT
void mqttSetup(){
  Serial.print("Conectare la broker MQTT: ");
  String clientID = "ESP32Client-"; //ID UNIC pentru client
  clientID += String(random(0xffff), HEX);
  if(client.connect(clientID.c_str(), mqttUser, mqttPassword)){
    Serial.println("Conectat la broker MQTT!");
  }else{
    Serial.print("Eroare la conectarea la broker MQTT: ");
    Serial.println(client.state());
    Serial.println(" Reincercare in 5 secunde...");
    delay(5000);
  }
  }

void setup() {
  // put your setup code here, to run once:
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
  delay(1000);
  Wire.begin(21, 22);
  senzorAer.begin();
  senzorLumina.begin();

  wifiSetup();
  espClient.setCACert(caCert); // setam certificatul CA pentru conexiunea securizata
  client.setServer(mqttServer, mqttPort);
  
  if(senzorAer.read()){
    Serial.println("Senzor aer initializat cu succes!");
  } else {
    Serial.println("Eroare la initializarea senzorului de aer!");
  }
  if(senzorLumina.begin()){
    Serial.println("Senzor lumina initializat cu succes!");
  } else {
    Serial.println("Eroare la initializarea senzorului de lumina!");
  }
}

void loop(){
  // put your main code here, to run repeatedly:
  if(!client.connected()){
    mqttSetup();
  }
  client.loop(); // mentinem conexiunea MQTT activa
  
  int lumina = getLumina();
  string descriere = getDescriereLumina(lumina);
  DateAer dateAer = getDateAer();

  // cod pentru a aprinde LED-ul daca senzorii functioneaza corect.
  if(senzorAer.read()){
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
  } else{
    digitalWrite(ledPin, LOW);
  }

  Serial.print("Lumina: ");
  Serial.print(lumina);
  Serial.println("%");

  Serial.print("Descriere lumina: ");
  Serial.println(descriere.c_str());

  if(dateAer.citireReusita){
    Serial.print("Temperatura: ");
    Serial.print(dateAer.temperatura, 1);
    Serial.println(" C");

    Serial.print("Umiditate: ");
    Serial.print(dateAer.umiditate, 1);
    Serial.println("%");
    Serial.println(" ");
  } else {
    Serial.println("Eroare la citirea datelor de la senzorul de aer!");
  }
    String mesaj = "{";
    mesaj += "\"lumina\":" + String(lumina) + ",";
    mesaj += "\"descriereLumina\":\"" + String(descriere.c_str()) + "\",";
    mesaj += "\"temperatura\":" + String(dateAer.temperatura, 1) + ",";
    mesaj += "\"umiditate\":" + String(dateAer.umiditate, 1);
    mesaj += "}";

    Serial.print("Publicare mesaj: ");
    Serial.println(mesaj);
    client.publish(mqttTopic, mesaj.c_str());
    delay(5000); // asteptam 5 secunde inainte de urmato
  
  
}
