import express from 'express';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

const app = express();
const port = process.env.PORT;

app.use(express.static('./public'));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index');
});

async function main() {
	app.listen(port, () => {
		console.log(`Running on port http://localhost:${port}`);
	});
}

main();
