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
  return data;
}

const dataArray = async(userSearch) => {
  const data = await getData(userSearch);
  const arrayOfObj = [];
  data.features.forEach(item => {
    const originsObj = {
      latitude: item.center[1],
      longitude: item.center[0],
      name: item.text,
      address: item.properties.address ?? item.place_name,
    }
    arrayOfObj.push(originsObj);
  });
  return arrayOfObj;
}

const html = (element) => {
  return `
  <li data-long="${element.longitude}" data-lat="${element.latitude}" class="">
    <div class="name">${element.name}</div>
    <div>${element.address}</div>
  </li>`
}

const renderOrigin = (originArray) => {
  const origins = document.querySelector('.origins');
  origins.innerHTML = '';
  if (originArray.length === 0) return origins.innerHTML = 'NOT FOUND';
  originArray.forEach(element => {
    const htmlString = html(element);
    origins.insertAdjacentHTML('beforeend', htmlString);
  });
}

const renderDestination = (destinationsArray) => {
  const destinations = document.querySelector('.destinations');
  destinations.innerHTML = '';
  if (destinationsArray.length === 0) return destinations.innerHTML = 'NOT FOUND';
  destinationsArray.forEach(element => {
    const htmlString = html(element);
    destinations.insertAdjacentHTML('beforeend', htmlString);
  });
}

const render = async(userSearch, inputName) => {
  if (userSearch === '') return document.querySelector('.my-trip').innerHTML = 'Type to search';
  const arrayOfObj = await dataArray(userSearch);
  if (inputName === 'origins') return renderOrigin(arrayOfObj);
  renderDestination(arrayOfObj);
}

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const handleSelected = (e) => {
  const eventTarget = e.target;
  if (eventTarget.nodeName === 'LI' || eventTarget.nodeName === 'DIV') {
    removeSelected(eventTarget);
    addSelected(eventTarget);
  }
}
const addSelected = (eventTarget) => {
  if (!eventTarget.dataset.long) {
    eventTarget.parentElement.classList.add('selected'); 
  }
  eventTarget.classList.add('selected');
}

const removeSelected = (eventTarget) => {
  if (eventTarget.closest('ul').className === 'origins') return removeSelectedUl('origins');
  removeSelectedUl('destinations');
}

const removeSelectedUl = (ulName) => {
  document.querySelectorAll(`.${ulName} li`).forEach(li => {
    li.classList.remove('selected');
  });
}

const handleInputEvent = (e) => {
  e.preventDefault();
  const eventTarget = e.target;
  const userSearch = eventTarget.firstElementChild.value;
  const ulName = `${eventTarget.className.slice(0, -5)}s`;
  render (userSearch, ulName);
  document.querySelector(`.${ulName}`).addEventListener('click', handleSelected);
}

originForm.addEventListener('submit', handleInputEvent);
destinationForm.addEventListener('submit', handleInputEvent);
