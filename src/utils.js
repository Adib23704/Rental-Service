function calculateDuration(returnDate, pickupDate) {
	let durationInDays = Math.ceil(
		(returnDate - pickupDate) / (1000 * 60 * 60 * 24),
	);
	if (durationInDays === 0) durationInDays = 1;
	const weeks = Math.floor(durationInDays / 7);
	const days = durationInDays % 7;
	let durationString = '';
	if (weeks > 0) {
		durationString += `${weeks} week${weeks > 1 ? 's' : ''}`;
	}
	if (days > 0) {
		durationString += `${weeks > 0 ? ' ' : ''}${days} day${days > 1 ? 's' : ''}`;
	}
	return durationString.trim();
}

export default calculateDuration;
