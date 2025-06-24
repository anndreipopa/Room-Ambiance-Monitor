#include <Arduino.h>
#include <Wire.h>
#include <SHT2x.h>

SHT2x senzorAer;

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

int  getProcentajLumina(){
    // Citire senzor lumina
  int valoareLumina = analogRead(sensorPin);
  
  int procentajLumina = map(valoareLumina, valoareIntuneric, valoareLuminaMaxima, 0, 100);
  procentajLumina = constrain(procentajLumina, 0, 100);

  return procentajLumina;
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
void setup() {
  // put your setup code here, to run once:
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
  delay(1000);
  Wire.begin(21, 22);
  senzorAer.begin();
  
  if(senzorAer.read()){
    Serial.println("Senzor aer initializat cu succes!");
  } else {
    Serial.println("Eroare la initializarea senzorului de aer!");
  }
}

void loop(){
  // put your main code here, to run repeatedly:
  int lumina = getProcentajLumina();
  DateAer dateAer = getDateAer();

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

  
  delay(3000); // asteptam 3 secunde inainte de a citi din nou
}
