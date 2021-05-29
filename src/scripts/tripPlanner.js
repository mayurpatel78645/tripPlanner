const getCoords = (elementName) => {
  const element = document.querySelectorAll(`.${elementName} li`);
  let latitude, longitude;
  element.forEach(item => {
    if (item.classList.contains('selected')) {
      latitude = item.dataset.lat;
      longitude = item.dataset.long;
    }
  });
  if (latitude === undefined || longitude === undefined) return document.querySelector('.my-trip').innerHTML = 'location not found';
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
  console.log(originCoords, destCoords)
  const url = `${baseUrl}api-key=${apiKey}&origin=geo/${originCoords[0]},${originCoords[1]}&destination=geo/${destCoords[0]},${destCoords[1]}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }catch(err) {document.querySelector('.my-trip').innerHTML = 'currently no buses available';}
}

const getIcons = () => {
  const walkingIcon = `fas fa-walking`;
  const rideIcon = `fas fa-bus`;
  const transferIcon = `fas fa-ticket-alt`;
  return {walkingIcon, rideIcon, transferIcon};
}

const renderTransitHtml = (plan) => {
  const {walkingIcon, rideIcon, transferIcon} = getIcons();
  const myTrip = document.querySelector('.my-trip');
  myTrip.innerHTML = '';
  plan.segments.forEach(segment => {
    switch (segment.type) {
      case 'walk':
        myTrip.insertAdjacentHTML('beforeend', 
        `
        <li>
          <i class="${walkingIcon}" aria-hidden="true"></i>Walk for ${segment.times.durations.total} minutes
          to stop #${(((segment || {}).to || {}).stop || {}).key?? 'destination'} - ${(((segment || {}).to || {}).stop || {}).name?? 'destination'}
        </li>
        `
        );
        break;
      case 'ride':
        myTrip.insertAdjacentHTML('beforeend', 
        `
        <li>
          <i class="${rideIcon}" aria-hidden="true"></i>Ride the ${((segment || {}).route || {}).name?? ((segment || {}).route || {}).number} 
          for ${segment.times.durations.total} minutes.
        </li>
        `
        );
        break;
      case 'transfer':
        myTrip.insertAdjacentHTML('beforeend', 
        `
        <li>
          <i class="${transferIcon}" aria-hidden="true"></i>Transfer from stop
          #${segment.from.stop.key} - ${segment.from.stop.name} to stop #${(segment.to.stop || {}).key} - ${(segment.to.stop || {}).name}
        </li>
        `
        );
        break;
      default:
    }
  });
}

const generateTripPlansArray = async() => {
  const tripPlansData = await getPlansData();
  console.log(tripPlansData);
  if (tripPlansData.plans.length === 0) return document.querySelector('.my-trip').innerHTML = 'TIME OT TAKE A CAB';
  tripPlansData.plans.forEach(plan => {
    renderTransitHtml(plan);
  });
}

/*
plansObj = {
WalkDuration: segment.times.durations.total,
stopNumber: (((segment || {}).to || {}).stop || {}).key?? 'destination',
stopName: (((segment || {}).to || {}).stop || {}).name?? 'destination',
} 

plansObj = {
route: ((segment || {}).route || {}).name?? ((segment || {}).route || {}).number,
rideDuration: segment.times.durations.total,
} 

plansObj = {
fromStopNumber: segment.from.stop.key,
fromStopName: segment.from.stop.name,
toStopNumber: (segment.to.stop || {}).key,
toStopName: (segment.to.stop || {}).name,
}
*/ 
/*const checkSelected = () => {
  const originsLists = document.querySelectorAll('.origins li');
  const destinationsLists = document.querySelectorAll('.destinations li');
  const originSelected = originsLists.forEach(li => {
    li.classList.contains('selected');
  });
  if (!originSelected) return document.querySelector('.my-trip').innerHTML = 'Select origin and destination';
}*/

const planTripButton = document.querySelector('.plan-trip');

const handleButton = (e) => {
  const eventTarget = e.target;
  //checkSelected();
  generateTripPlansArray();
}

planTripButton.addEventListener('click', handleButton);
