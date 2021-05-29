const getCoords = (elementName) => {
  const element = document.querySelectorAll(`.${elementName} li`);
  let latitude, longitude;
  element.forEach(item => {
    if (item.classList.contains('selected')) {
      latitude = item.dataset.lat;
      longitude = item.dataset.long;
    }
  });
  return [latitude, longitude];
}

const tripPlannerUrl = () => {
  const baseUrl = `https://api.winnipegtransit.com/v3/trip-planner.json?`
  const apiKey = `1FyswLynq7PUOTS5dzBJ`;
  return {baseUrl, apiKey};
}

const getPlansData = async() => {
  const {baseUrl, apiKey} = tripPlannerUrl();
  const originCoords = getCoords(`origins`);
  const destCoords = getCoords('destinations');
  const url = `${baseUrl}api-key=${apiKey}&origin=geo/${originCoords[0]},${originCoords[1]}&destination=geo/${destCoords[0]},${destCoords[1]}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
  return data;
}



const planTripButton = document.querySelector('.plan-trip');

const handleButton = (e) => {
  const eventTarget = e.target;
  getPlansData();
}

planTripButton.addEventListener('click', handleButton);