/** Angle between two [lat, lng] points, normalized to [0, 360). */
export function calculateAngle([x1, y1], [x2, y2]) {
	const angle = Math.atan2(y2 - y1, x2 - x1);
	return ((angle * 180) / Math.PI + 360) % 360;
}

/** Coordinates of the two arrow wings for an arrow pointing from `tail` to `tip`. */
export function arrowWings(tip, tail, wingLength = 0.00045) {
	const angle = calculateAngle(tail, tip);
	const [lat, lon] = tip;
	const wing = (degrees) => {
		const radians = (degrees * Math.PI) / 180;
		return [lat + wingLength * Math.cos(radians), lon + wingLength * Math.sin(radians)];
	};
	return [wing(angle - 145), wing(angle + 145)];
}

/**
 * Split raw route points into consecutive groups that share the same flag,
 * skipping ignored flags. Returns arrays of [lat, lng] pairs.
 */
export function groupPointsByFlag(points, ignoredFlags = []) {
	const groups = [];
	let current = null;

	for (const point of points) {
		if (ignoredFlags.includes(point.abreviaturaBanderaSMP)) continue;

		if (!current || current.flag !== point.abreviaturaBanderaSMP) {
			current = { flag: point.abreviaturaBanderaSMP, points: [] };
			groups.push(current.points);
		}
		current.points.push([point.latitud, point.longitud]);
	}

	return groups;
}
