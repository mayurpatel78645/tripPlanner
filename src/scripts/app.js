// url "https://api.mapbox.com/geocoding/v5/mapbox.places/starbucks.json?bbox=-77.083056,38.908611,-76.997778,38.959167&access_token=pk.eyJ1IjoibWF5dXJwYXRlbDc4NjQ1IiwiYSI6ImNrcDVrYjh0cjF5azAyb3RhbjBnOWN6ajIifQ.MS0bHsUsb-hMZ1dABPcqHQ"

const urlObj = () => {
  const accessToken = "pk.eyJ1IjoibWF5dXJwYXRlbDc4NjQ1IiwiYSI6ImNrcDdhMmhkbjBlMGMyd3FlYm14NG00cDYifQ.5WNbqYVG6bA7x6UJ9CZfNA";
  const bBox = "-97.325875, 49.766204, -96.953987, 49.99275";
  const baseUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
  return {accessToken, bBox, baseUrl};
}

const getData = async(userSearch) => {
  const {accessToken, bBox, baseUrl} = urlObj();
  const url = `${baseUrl}${userSearch}.json?bbox=${bBox}&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
  return data;
}

const originsDataArray = async(userSearch) => {
  const data = await getData(userSearch);
  const originsArray = [];
  data.features.forEach(item => {
    const originsObj = {
      latitude: item.center[1],
      longitude: item.center[0],
      name: item.text,
      address: item.properties.address ?? '',
    }
    originsArray.push(originsObj);
  });
  return originsArray;
}

const originsHtml = (element) => {
  return `<li data-long="${element.longitude}" data-lat="${element.latitude}" class="">
      <div class="name">${element.name}</div>
      <div>${element.address}</div>
  </li>`
}

function renderOrigin(originsArray) {
  const origins = document.querySelector('.origins');
  origins.innerHTML = '';
  originsArray.forEach(element => {
    const htmlString = originsHtml(element);
    origins.insertAdjacentHTML('beforeend', htmlString);
  });
}

function renderDestination(originsArray) {
  console.log('reaching');
  const destinations = document.querySelector('.destinations');
  destinations.innerHTML = '';
  originsArray.forEach(element => {
    const htmlString = originsHtml(element);
    destinations.insertAdjacentHTML('beforeend', htmlString);
  });
}

const render = async(userSearch, inputName) => {
  const originsArray = await originsDataArray(userSearch);
  if (inputName === 'Origin') return renderOrigin(originsArray);
  console.log('pass here')
  if (inputName === 'Destinations') return renderDestination(originsArray);
}

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const handleSelected = (e) => {
  const eventTarget = e.target;
  removeSelected();
  if (eventTarget.nodeName === 'LI' || eventTarget.nodeName === 'DIV') {
    addSelected(eventTarget);
  }
}

function addSelected(eventTarget) {
  if (eventTarget.dataset.long) {
    console.log(eventTarget);
    eventTarget.classList.add('selected');
  } else {
    console.log(eventTarget);
    eventTarget.parentElement.classList.toggle('selected');
  }
}

function removeSelected() {
  document.querySelectorAll('li').forEach(li => {
    li.classList.remove('selected');
  });
}

const handleOriginInput = (e) => {
  e.preventDefault();
  const eventTarget = e.target;
  const userSearch = eventTarget.firstElementChild.value;
  render(userSearch, 'Origin');
  const origins = document.querySelector('.origins');
  origins.addEventListener('click', handleSelected);
}

const handleDestinationInput = (e) => {
  e.preventDefault();
  const eventTarget = e.target;
  const userSearch = eventTarget.firstElementChild.value;
  console.log(userSearch);
  render(userSearch, 'Destinations');
  const destinations = document.querySelector('.destinations');
  destinations.addEventListener('click', handleSelected);
}

originForm.addEventListener('submit', handleOriginInput);
destinationForm.addEventListener('submit', handleDestinationInput);