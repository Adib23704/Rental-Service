const vehType = document.getElementById('vehicleType');
const vehName = document.getElementById('vehicleName');
const printButton = document.getElementById('printButton');
const rsvpID = document.getElementById('rsvpID');
const pickupDateID = document.getElementById('pickupDateID');
const returnDateID = document.getElementById('returnDateID');
const durationID = document.getElementById('durationID');
const discountID = document.getElementById('discountID');
const firstNameID = document.getElementById('firstNameID');
const lastNameID = document.getElementById('lastNameID');
const emailID = document.getElementById('emailID');
const phoneID = document.getElementById('phoneID');
const colDmgID = document.getElementById('colDmgID');
const insuranceID = document.getElementById('insuranceID');
const rentalTaxID = document.getElementById('rentalTaxID');

const dailyRate = document.getElementById('dailyRate');
const dailyTotal = document.getElementById('dailyTotal');
const dailyUnit = document.getElementById('dailyUnit');

const totalSummery = document.getElementById('totalSummery');
const tableBody = document.getElementById('tableBody');

[
	pickupDateID, returnDateID, discountID,
	colDmgID, insuranceID, rentalTaxID, vehName,
].forEach((element) => {
	element.addEventListener('change', async () => {
		const options = {
			pickupDate: pickupDateID.value,
			returnDate: returnDateID.value,
			discount: discountID.value,
			colDmg: colDmgID.checked,
			insurance: insuranceID.checked,
			rentalTax: rentalTaxID.checked,
			vehicleID: vehName.value,
		};
		const response = await fetch('/calculate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(options),
		});
		if (response.status === 200) {
			const data = await response.json();
			dailyRate.innerHTML = `$${data.dailyRate}`;
			dailyTotal.innerHTML = `$${data.dailyTotal}`;
			dailyUnit.innerHTML = `${data.dailyUnit}`;
			totalSummery.innerHTML = `$${data.totalSummery}`;
			durationID.value = `${data.duration}`;

			if (insuranceID.checked && !document.getElementById('insuranceNode')) {
				const newRow = document.createElement('tr');
				const chargeCell = document.createElement('td');
				const unitCell = document.createElement('td');
				const rateCell = document.createElement('td');
				const totalCell = document.createElement('td');

				chargeCell.innerHTML = 'Liability Insurance';
				unitCell.innerHTML = '';
				rateCell.innerHTML = '';
				totalCell.innerHTML = '$15.00';

				newRow.appendChild(chargeCell);
				newRow.appendChild(unitCell);
				newRow.appendChild(rateCell);
				newRow.appendChild(totalCell);

				const dailyRow = document.getElementById('dailyRow');
				newRow.setAttribute('id', 'insuranceNode');
				tableBody.insertBefore(newRow, dailyRow.nextSibling);
			}

			if (!insuranceID.checked && document.getElementById('insuranceNode')) document.getElementById('insuranceNode').remove();

			if (colDmgID.checked && !document.getElementById('colDmgNode')) {
				const newRow = document.createElement('tr');
				const chargeCell = document.createElement('td');
				const unitCell = document.createElement('td');
				const rateCell = document.createElement('td');
				const totalCell = document.createElement('td');

				chargeCell.innerHTML = 'Collision Damage Waiver';
				unitCell.innerHTML = '';
				rateCell.innerHTML = '';
				totalCell.innerHTML = '$9.00';

				newRow.appendChild(chargeCell);
				newRow.appendChild(unitCell);
				newRow.appendChild(rateCell);
				newRow.appendChild(totalCell);

				const dailyRow = document.getElementById('dailyRow');
				newRow.setAttribute('id', 'colDmgNode');
				tableBody.insertBefore(newRow, dailyRow.nextSibling);
			}

			if (!colDmgID.checked && document.getElementById('colDmgNode')) document.getElementById('colDmgNode').remove();

			if (rentalTaxID.checked && !document.getElementById('rentalTaxNode')) {
				const newRow = document.createElement('tr');
				const chargeCell = document.createElement('td');
				const unitCell = document.createElement('td');
				const rateCell = document.createElement('td');
				const totalCell = document.createElement('td');

				chargeCell.innerHTML = 'Rental Tax (11.5%)';
				unitCell.innerHTML = '';
				rateCell.innerHTML = '';
				totalCell.innerHTML = `$${data.rentalTaxAmount}`;

				newRow.appendChild(chargeCell);
				newRow.appendChild(unitCell);
				newRow.appendChild(rateCell);
				newRow.appendChild(totalCell);

				const dailyRow = document.getElementById('dailyRow');
				newRow.setAttribute('id', 'rentalTaxNode');
				tableBody.insertBefore(newRow, dailyRow.nextSibling);
			}

			if (!rentalTaxID.checked && document.getElementById('rentalTaxNode')) document.getElementById('rentalTaxNode').remove();
		}
	});
});

vehType.addEventListener('change', (event) => {
	vehName.setAttribute('disabled', 'disabled');
	fetch(`/vehicleModels?type=${event.target.value}`)
		.then((response) => response.json())
		.then((data) => {
			vehName.innerHTML = '';
			const option = document.createElement('option');
			option.value = '';
			option.text = 'Select Vehicle';
			option.disabled = true;
			option.selected = true;
			vehName.add(option);
			data.forEach((model) => {
				const option = document.createElement('option');
				option.value = model.id;
				option.text = `${model.make} ${model.model}`;
				vehName.add(option);
				vehName.removeAttribute('disabled');
			});
		})
		.catch((error) => console.error('Error fetching vehicle models:', error));
});

const icon = {
	success:
		'<span class="material-symbols-outlined">task_alt</span>',
	danger:
		'<span class="material-symbols-outlined">error</span>',
	warning:
		'<span class="material-symbols-outlined">warning</span>',
	info:
		'<span class="material-symbols-outlined">info</span>',
};

const showToast = (message = 'Sample Message', toastType = 'info', duration = 5000) => {
	if (!Object.keys(icon).includes(toastType)) toastType = 'info';

	const box = document.createElement('div');
	box.classList.add('toast', `toast-${toastType}`);
	box.innerHTML = ` <div class="toast-content-wrapper"> 
                      <div class="toast-icon"> 
                      ${icon[toastType]} 
                      </div> 
                      <div class="toast-message">${message}</div> 
                      <div class="toast-progress"></div> 
                      </div>`;
	duration = duration || 5000;
	box.querySelector('.toast-progress').style.animationDuration = `${duration / 1000}s`;

	const toastAlready = document.body.querySelector('.toast');
	if (toastAlready) {
		toastAlready.remove();
	}

	document.body.appendChild(box);
};

printButton.addEventListener('click', (e) => {
	e.preventDefault();
	printButton.setAttribute('disabled', 'disabled');
	const options = {
		rsvpID: rsvpID.value,
		vehicleID: vehName.value,
		pickupDate: pickupDateID.value,
		returnDate: returnDateID.value,
		discount: discountID.value,
		firstName: firstNameID.value,
		lastName: lastNameID.value,
		email: emailID.value,
		phone: phoneID.value,
		colDmg: colDmgID.value,
		insurance: insuranceID.value,
		rentalTax: rentalTaxID.value,
	};
	fetch('/submit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(options),
	})
		.then((response) => response.json())
		.then((data) => {
			printButton.removeAttribute('disabled');
			console.log(data);
			showToast('Article Submitted Successfully', 'success', 5000);
		}).catch((error) => {
			printButton.removeAttribute('disabled');
			console.error('Error submitting article:', error);
			showToast('Error submitting article', 'danger', 5000);
		});
});
