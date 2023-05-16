const search = document.querySelector("#search");
const filters = document.querySelector(".filters");
const closeFilters = document.querySelector("#close-filters");

const norad = document.querySelector("#norad");
const noradSearch = document.querySelector("#noradSearch");
const country = document.querySelector("#country");
const orbit = document.querySelector("#orbit");

// livefeed modal
const liveFeed = document.getElementById("live-feed");
const modal = document.querySelector(".modal");
const backdrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".close-modal");
// norad list modal
const noradTableBody = document.querySelector("#noradTableBody");
const noradBtn = document.querySelector(".norad-list-btn");
const noradModal = document.querySelector(".norad-list");
const noradBackdrop = document.querySelector(".norad-backdrop");
const closeNorad = document.querySelector(".close-norad");
//about modal
const aboutBtn = document.querySelector(".about-btn");
const aboutModal = document.querySelector(".about-modal");
const aboutBackdrop = document.querySelector(".about-backdrop");
const closeAbout = document.querySelector(".close-about");

//fetching the filters category list
fetch("http://localhost:3000/categories")
  .then((response) => response.json())
  .then((data) => {
    generateOptions(country, data.countries);
    generateOptions(orbit, data.orbits);
    country.selectedIndex = 1;
    orbit.selectedIndex = 1;
  });

//filling the norad table
function fillNoradTable(data) {
  data.forEach((sat) => {
    const tr = document.createElement("tr");
    const noradNum = document.createElement("td");
    const name = document.createElement("td");
    noradNum.textContent = sat.noradNumber;
    name.textContent = sat.officialSatelliteName;
    tr.appendChild(noradNum);
    tr.appendChild(name);
    noradTableBody.appendChild(tr);
  });
}

//function to generate options menu
function generateOptions(target, data) {
  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    target.appendChild(option);
  });
}

function fetchUrl(e) {
  fetchData(country.value, orbit.value);
}

//function to filter data according to the selected option
function fetchData(countryName, orbitName) {
  const country = countryName;
  const orbit = orbitName;

  let data = JSON.parse(sessionStorage.getItem("data"));

  if (country == "all" && orbit == "all") {
    setLocation(data);
  } else if (country === "all" && orbit != "all") {
    filteredData = data.filter((item) => item.classOfOrbit === orbit);
    setLocation(filteredData);
  } else if (country != "all" && orbit === "all") {
    filteredData = data.filter((item) => item.countryOfOperator === country);
    // console.log(filteredData.length);
    setLocation(filteredData);
  } else {
    filteredData = data.filter(
      (item) =>
        item.countryOfOperator === country && item.classOfOrbit === orbit
    );
    setLocation(filteredData);
  }
}

//function to search satellite by its NORAD ID
function searchByNorad() {
  getSatTles(
    `https://localhost:3000/active?norad=${norad.value}`
  ).then((data) => {
    setLocation(data);
  });
  norad.value = "";
  country.selectedIndex = 0;
  orbit.selectedIndex = 0;
}

//Function to display modal
function showModal() {
  modal.classList.add("show");
}
//function to remove modal
function removeModal() {
  modal.classList.remove("show");
}

//show norad table
function showNoradTable() {
  noradModal.classList.add("show");
}
//close norad modal
function closeNoradTable(e) {
  if (e.target.classList.contains("hideTable")) {
    noradModal.classList.remove("show");
  }
}
//show about
function showAbout() {
  aboutModal.classList.add("show");
}
//close about
function removeAbout(e) {
  if (e.target.classList.contains("close")) {
    aboutModal.classList.remove("show");
  }
}

//event listeners
liveFeed.addEventListener("click", showModal);
backdrop.addEventListener("click", removeModal);
closeModal.addEventListener("click", removeModal);

search.addEventListener("click", () => {
  filters.classList.add("show");
});
closeFilters.addEventListener("click", () => {
  filters.classList.remove("show");
});
country.addEventListener("change", fetchUrl);
orbit.addEventListener("change", fetchUrl);
noradSearch.addEventListener("click", searchByNorad);
noradBtn.addEventListener("click", showNoradTable);
closeNorad.addEventListener("click", closeNoradTable);
noradBackdrop.addEventListener("click", closeNoradTable);
aboutBtn.addEventListener("click", showAbout);
closeAbout.addEventListener("click", removeAbout);
aboutBackdrop.addEventListener("click", removeAbout);
