// const loader = document.querySelector("#loader");

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NWIzYTk4OS1jZGM4LTRmZjItYmEwYy0xMjIwZDkxMmQ5NDIiLCJpZCI6NTEyMDksImlhdCI6MTYxNzk3MjMxOH0.kltIRFJqjBCcB-IOtqOa08MEJMNYhmptbYJyWBQNwUc";

//initialize map
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: Cesium.createWorldTerrain(),
});

//initially this function fetches all the active sat data
getSatTles().then((data) => {
  sessionStorage.setItem("data", JSON.stringify(data));
  setLocation(data);
  fillNoradTable(data);
});

//function to fetch data related to the satellites
async function getSatTles(
  url = "http://localhost:3000/active"
) {
  const response = await fetch(url);
  const tleData = await response.json();
  return tleData;
}

function setLocation(data) {
  // loader.classList.add("show");
  viewer.entities.removeAll();
  total = data.length;
  count = 1;

  data.forEach((sat) => {
    setTimeout(setPointOnMap, 0, sat, count++, total);
  });
}

function setPointOnMap(sat, count, total) {
  // console.log(`loading ${((count / total) * 100).toFixed(1)} %`);
  // if (count === total) {
  //   loader.classList.remove("show");
  // }
  try {
    const satrec = satellite.twoline2satrec(sat.tleLine1, sat.tleLine2);

    //cesium clock settings
    const totalSeconds = 60 * 60;
    const timestepInSeconds = 10;
    const start = Cesium.JulianDate.fromDate(new Date());
    const stop = Cesium.JulianDate.addSeconds(
      start,
      totalSeconds,
      new Cesium.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.timeline.zoomTo(start, stop);

    //setting the cesium default speed = 40
    viewer.clock.multiplier = 40;
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

    const positionsOverTime = new Cesium.SampledPositionProperty();

    //calculating positions over time
    for (let i = 0; i < totalSeconds; i += timestepInSeconds) {
      const time = Cesium.JulianDate.addSeconds(
        start,
        i,
        new Cesium.JulianDate()
      );
      const jsDate = Cesium.JulianDate.toDate(time);

      //calculating coordinates acoording to the given time
      var positionAndVelocity = satellite.propagate(satrec, jsDate);
      const gmst = satellite.gstime(jsDate);
      const p = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      const position = Cesium.Cartesian3.fromRadians(
        p.longitude,
        p.latitude,
        p.height * 1000
      );

      //adding the generated position sample to the positionsovertime object
      positionsOverTime.addSample(time, position);
    }

    //adding the point to the map
    const satellitePoint = viewer.entities.add({
      name: sat.officialSatelliteName,
      description: generateDescription(sat, positionAndVelocity.velocity),
      position: positionsOverTime,
      point: { pixelSize: 5, color: Cesium.Color.RED },
    });
  } catch (err) {}
}

//function to generate description of the satellite
function generateDescription(sat, velocity) {
  return `
  <table border=1 width=100%>
    <tr>
      <td>Name</td>
      <td align="right">${sat.officialSatelliteName}</td>
    </tr>
    <tr>
      <td>Country</td>
      <td align="right">${sat.countryOfOperator}</td>
    </tr>
    <tr>
      <td>Operator</td>
      <td align="right">${sat.operator}</td>
    </tr>
    <tr>
      <td>Norad ID</td>
      <td align="right">${sat.noradNumber}</td>
    </tr>
    <tr>
      <td>COSPAR ID</td>
      <td align="right">${sat.cosparNumber}</td>
    </tr>
    <tr>
      <td>Launch Date</td>
      <td align="right">${sat.dateOfLaunch.slice(0, 10)}</td>
    </tr>
    <tr>
      <td>Launch Site</td>
      <td align="right">${sat.launchSite}</td>
    </tr>
    <tr>
      <td>Launch Vehicle</td>
      <td align="right">${sat.launchVehicle}</td>
    </tr>
    <tr>
      <td>Purpose</td>
      <td align="right">${sat.purpose}</td>
    </tr>
    <tr>
      <td>Eccentricity</td>
      <td align="right">${+sat.eccentricity.toFixed(5)}</td>
    </tr>
    <tr>
      <td>Inclination</td>
      <td align="right">${+sat.inclinationInDeg.toFixed(1)}&deg;</td>
    </tr>
    <tr>
      <td>Period</td>
      <td align="right">${+sat.periodInMin.toFixed(1)} minutes</td>
    </tr>
    <tr>
      <td>Speed</td>
      <td align="right">${Math.sqrt(
        velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
      ).toFixed(2)} km/s</td>
    </tr>
    
    
  </table>
  `;
}
