const fs = require("fs");

let countries = new Set();
let orbit = new Set();
let purpose = new Set();

fs.readFile("./activeSatellites.txt", "utf-8", (err, data) => {
  if (err) throw err;
  data = JSON.parse(data);
  data.forEach((satellite) => {
    countries.add(satellite.countryOfOperator);
    orbit.add(satellite.classOfOrbit);
    purpose.add(satellite.purpose);
  });

  const writeData = {
    countries: Array.from(countries),
    orbits: Array.from(orbit),
    purpose: Array.from(purpose),
  };
  fs.writeFile("./categories.txt", JSON.stringify(writeData), () => {
    console.log("done....");
  });
});
