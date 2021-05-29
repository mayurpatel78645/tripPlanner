const getCoords = (elementName) => {
  const element = document.querySelectorAll(`.${elementName} li`);
  let latitude, longitude;
  element.forEach(item => {
    if (item.classList.contains('selected')) {
      latitude = item.dataset.lat ?? handleEdgeCase('location not found');
      longitude = item.dataset.long ?? handleEdgeCase('location not found');
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
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }catch(err) {handleEdgeCase('Try selecting unique origin and destination or currently no buses are available')}
}

const getIcons = () => {
  const walkingIcon = `fas fa-walking`;
  const rideIcon = `fas fa-bus`;
  const transferIcon = `fas fa-ticket-alt`;
  return {walkingIcon, rideIcon, transferIcon};
}

const renderTransitHtml = (plan, myTrip) => {
  const {walkingIcon, rideIcon, transferIcon} = getIcons();
  plan.segments.forEach(segment => {
    switch (segment.type) {
      case 'walk':
        myTrip.insertAdjacentHTML('beforeend', 
        walkHtml(walkingIcon, segment)
        );
        break;
      case 'ride':
        myTrip.insertAdjacentHTML('beforeend', 
        rideHtml(rideIcon, segment)
        );
        break;
      case 'transfer':
        myTrip.insertAdjacentHTML('beforeend', 
        transferHtml(transferIcon, segment)
        );
        break;
      default:
    }
  });
}

const insertSegmentHtml = (myTrip, index) =>{
  myTrip.insertAdjacentHTML('beforeend', `
  <h2>Route ${index === 0 ? index = 'Recommended' : index = `Alternative ${index}`}<br>
  `);
  return index;
}

const transferHtml = (transferIcon, segment) => {
  const { stopName, stopNumber, fromStopNumber, fromStopName } = tripPlansObj(segment);
  return `
  <li>
    <i class="${transferIcon}" aria-hidden="true"></i>
    Transfer from stop
    #${fromStopNumber} - ${fromStopName} to stop #${stopNumber} - ${stopName}
  </li>
  `;
}

const rideHtml = (rideIcon, segment) => {
  const { duration,routeName, routNumber } = tripPlansObj(segment);
  return `
  <li>
    <i class="${rideIcon}" aria-hidden="true"></i>
    Ride the ${ routeName ?? routNumber} 
    for ${duration} minutes.
  </li>
  `
}

const walkHtml = (walkingIcon, segment) => {
  const { duration, stopName, stopNumber } = tripPlansObj(segment);
  if (stopNumber ?? 'destination' !== 'destination') {
    return `
    <li>
      <i class="${walkingIcon}" aria-hidden="true"></i>
      Walk for ${duration === 1 ? `${duration} minute` : `${duration} minutes`} 
      to stop #${stopNumber ?? 'destination'} - ${stopName ?? 'destination'}
    </li>
    `
  }
  return `
  <li>
    <i class="${walkingIcon}" aria-hidden="true"></i>
    Walk for ${duration === 1 ? `${duration} minute` : `${duration} minutes`}
    to ${stopName ?? 'destination'}
  </li>
  `
}

const handleEdgeCase = (edgeCase) => {
  const myTrip = document.querySelector('.my-trip');
  myTrip.innerHTML = '';
  myTrip.innerHTML = edgeCase;
  return myTrip.innerHTML;
}

const tripPlansObj = (segment) => {
  const plansObj = {};
  plansObj.duration = segment.times.durations.total;
  plansObj.stopName = (((segment ?? {}).to ?? {}).stop ?? {}).name;
  plansObj.StopNumber = (((segment ?? {}).to ?? {}).stop ?? {}).key;
  plansObj.routeName = ((segment ?? {}).route ?? {}).name;
  plansObj.routNumber = ((segment ?? {}).route ?? {}).number;
  plansObj.fromStopNumber = (((segment ?? {}).from ?? {}).stop ?? {}).key;
  plansObj.fromStopName = (((segment ?? {}).from ?? {}).stop ?? {}).name;
  return plansObj;
}

const renderData = async() => {
  const tripPlansData = await getPlansData();
  if (tripPlansData.plans.length === 0) return handleEdgeCase('TIME OT TAKE A CAB');
  const myTrip = document.querySelector('.my-trip');
  myTrip.innerHTML = '';
  tripPlansData.plans.forEach((plan, index) => {
    index = insertSegmentHtml(myTrip, index);
    renderTransitHtml(plan, myTrip);
  });
}

const planTripButton = document.querySelector('.plan-trip');

const handleButton = () => {
  renderData();
}

planTripButton.addEventListener('click', handleButton);
