import express from 'express';
import dotenvFlow from 'dotenv-flow';
import axios from 'axios';

dotenvFlow.config();

const app = express();
const port = process.env.PORT;

app.use(express.static('./public'));
app.set('views', './views');
app.set('view engine', 'ejs');

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

async function main() {
	app.listen(port, () => {
		console.log(`Running on port http://localhost:${port}`);
	});
}

main();
