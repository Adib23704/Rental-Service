import express from 'express';
import dotenvFlow from 'dotenv-flow';
import axios from 'axios';
import bodyParser from 'body-parser';
import calculateDuration from './utils.js';

dotenvFlow.config();

const app = express();
const port = process.env.PORT;
const fields = [
	{ field: 'rsvpID', name: 'RSVP ID' },
	{ field: 'pickupDate', name: 'Pickup Date' },
	{ field: 'returnDate', name: 'Return Date' },
	{ field: 'discount', name: 'Discount' },
	{ field: 'firstName', name: 'First Name' },
	{ field: 'lastName', name: 'Last Name' },
	{ field: 'email', name: 'Email' },
	{ field: 'phone', name: 'Phone' },
	{ field: 'colDmg', name: 'Collision Damage Waiver' },
	{ field: 'insurance', name: 'Insurance' },
	{ field: 'rentalTax', name: 'Rental Tax' },
	{ field: 'vehicleID', name: 'Vehicle Name' },
	{ field: 'vehicleType', name: 'Vehicle Type' },
];

app.use(express.static('./public'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.get('/', async (req, res) => {
	const { data: response } = await axios.get('https://exam-server-7c41747804bf.herokuapp.com/carsList');
	const types = [];
	response.data.forEach((car) => {
		if (!types.some((type) => type.type === car.type)) {
			types.push({
				id: car.id,
				type: car.type,
			});
		}
	});
	res.render('index', { types });
});

app.get('/vehicleModels', async (req, res) => {
	const { type } = req.query;
	if (!type) {
		return res.status(400).send('Missing type parameter');
	}

	const { data: response } = await axios.get('https://exam-server-7c41747804bf.herokuapp.com/carsList');
	const types = [];
	response.data.forEach((car) => {
		if (car.type === type) {
			types.push({
				id: car.id,
				make: car.make,
				model: car.model,
			});
		}
	});
	return res.status(200).json(types);
});

app.post('/calculate', async (req, res) => {
	const {
		vehicleID,
		pickupDate,
		returnDate,
	} = req.body || {};
	let {
		colDmg,
		insurance,
		rentalTax,
		discount,
	} = req.body || {};
	if ((vehicleID === undefined || vehicleID === '' || vehicleID === null)
		|| (pickupDate === undefined || pickupDate === '' || pickupDate === null)
		|| (returnDate === undefined || returnDate === '' || returnDate === null)) {
		return res.status(404).send('Missing parameters');
	}

	if (colDmg === undefined || colDmg === '' || colDmg === null) colDmg = false;
	if (insurance === undefined || insurance === '' || insurance === null) insurance = false;
	if (rentalTax === undefined || rentalTax === '' || rentalTax === null) rentalTax = false;
	if (discount === undefined || discount === '' || discount === null) discount = 0;

	const { data: response } = await axios.get('https://exam-server-7c41747804bf.herokuapp.com/carsList');
	response.data.forEach((car) => {
		if (car.id === vehicleID) {
			const duration = calculateDuration(new Date(returnDate), new Date(pickupDate));
			let durationInDays = Math.ceil((new Date(returnDate) - new Date(pickupDate))
				/ (1000 * 60 * 60 * 24));
			if (durationInDays === 0) durationInDays = 1;

			const dailyRate = car.rates.daily;
			const dailyTotal = dailyRate * durationInDays;
			const total = dailyTotal;
			const totalWithDiscount = total - ((total * discount) / 100);

			const rentalTaxAmount = totalWithDiscount * 0.115;

			const totalSummery = totalWithDiscount + ((colDmg === true) ? (9) : (0))
				+ ((insurance === true) ? (15) : (0)) + ((rentalTax === true) ? (rentalTaxAmount) : (0));

			return res.status(200).json({
				dailyRate: dailyRate.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				dailyTotal: dailyTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				dailyUnit: durationInDays.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				totalSummery: totalSummery.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				duration,
				rentalTaxAmount: rentalTaxAmount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
			});
		}
		return true;
	});
	return true;
});

app.post('/submit', async (req, res) => {
	const missingFields = fields.filter((field) => {
		const fieldValue = req.body[field.field];
		return fieldValue === undefined || fieldValue === '' || fieldValue === null;
	});

	if (missingFields.length > 0) {
		const missingFieldNames = missingFields.map((field) => field.name);
		return res.status(400).json({ error: `${missingFields.length} Missing fields: ${missingFieldNames.join(', ')}` });
	}

	return res.status(200).json({ message: 'Success' });
});

async function main() {
	app.listen(port, () => {
		console.log(`Running on port http://localhost:${port}`);
	});
}

main();
