import L from './leaflet';

const iconURL = new URL('../images/colectivo-base.png', import.meta.url).href;

export const busIcon = L.icon({
	iconUrl: iconURL,
	iconSize: [20, 20],
	iconAnchor: [10, 20],
	popupAnchor: [0, -20]
});
