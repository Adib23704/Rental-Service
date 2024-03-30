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

if (!discountID.value || discountID.value < 0) {
	discountID.value = 0;
}

const dtToday = new Date();
const month = (dtToday.getMonth() + 1).toString().padStart(2, '0');
const day = dtToday.getDate().toString().padStart(2, '0');
const year = dtToday.getFullYear();
const maxDate = `${year}-${month}-${day}`;
pickupDateID.setAttribute('min', maxDate);
returnDateID.setAttribute('min', maxDate);

const icon = {
	success: '<span class="material-symbols-outlined">task_alt</span>',
	danger: '<span class="material-symbols-outlined">error</span>',
	warning: '<span class="material-symbols-outlined">warning</span>',
	info: '<span class="material-symbols-outlined">info</span>',
};

const showToast = (
	message = 'Sample Message',
	toastType = 'info',
	duration = 5000,
) => {
	if (!icon[toastType]) {
		toastType = 'info';
	}

	const box = document.createElement('div');
	box.classList.add('toast', `toast-${toastType}`);
	box.innerHTML = `
		<div class="toast-content-wrapper">
			<div class="toast-icon">
				${icon[toastType]}
			</div>
			<div class="toast-message">${message}</div>
			<div class="toast-progress"></div>
		</div>
	`;
	duration = duration || 5000;
	box.querySelector('.toast-progress').style.animationDuration = `${duration / 1000}s`;

	const toastAlready = document.body.querySelector('.toast');
	if (toastAlready) {
		toastAlready.remove();
	}

	document.body.appendChild(box);
};

[
	pickupDateID,
	returnDateID,
	discountID,
	colDmgID,
	insuranceID,
	rentalTaxID,
	vehName,
].forEach((element) => {
	element.addEventListener('change', async () => {
		const pickupDate = new Date(pickupDateID.value);
		const returnDate = new Date(returnDateID.value);
		const today = new Date();

		if (pickupDate <= today) {
			showToast('Pickup date must be in the future', 'warning', 5000);
			return;
		}

		if (returnDate < pickupDate) {
			showToast('Return date must be after pickup date', 'warning', 5000);
			return;
		}

		const options = {
			pickupDate: pickupDateID.value,
			returnDate: returnDateID.value,
			discount: discountID.value ?? 0,
			colDmg: colDmgID.checked,
			insurance: insuranceID.checked,
			rentalTax: rentalTaxID.checked,
			vehicleID: vehName.value,
		};

		try {
			const response = await fetch('/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(options),
			});

			if (response.ok) {
				const data = await response.json();
				dailyRate.innerHTML = `$${data.dailyRate}`;
				dailyTotal.innerHTML = `$${data.dailyTotal}`;
				dailyUnit.innerHTML = `${data.dailyUnit}`;
				totalSummery.innerHTML = `$${data.totalSummery}`;
				durationID.value = `${data.duration}`;

				const addRow = (id, charge, total) => {
					if (!document.getElementById(id)) {
						const newRow = document.createElement('tr');
						newRow.setAttribute('id', id);
						newRow.innerHTML = `
							<td>${charge}</td>
							<td></td>
							<td></td>
							<td>${total}</td>
						`;
						const dailyRow = document.getElementById('dailyRow');
						tableBody.insertBefore(newRow, dailyRow.nextSibling);
					}
				};

				const removeRow = (id) => {
					const row = document.getElementById(id);
					if (row) {
						row.remove();
					}
				};

				if (insuranceID.checked) {
					addRow('insuranceNode', 'Liability Insurance', '$15.00');
				} else {
					removeRow('insuranceNode');
				}

				if (colDmgID.checked) {
					addRow('colDmgNode', 'Collision Damage Waiver', '$9.00');
				} else {
					removeRow('colDmgNode');
				}

				if (rentalTaxID.checked) {
					addRow(
						'rentalTaxNode',
						'Rental Tax (11.5%)',
						`$${data.rentalTaxAmount}`,
					);
				} else {
					removeRow('rentalTaxNode');
				}

				if (discountID.value > 0) {
					const discountedPrice = (parseInt(data.totalSummery.replace('$', ''), 10)
						* discountID.value)
						/ 100;
					if (document.getElementById('discountedNode')) {
						document
							.getElementById('discountedNode')
							.querySelector('td:last-child').innerHTML = `-$${discountedPrice.toFixed(2)}`;
					} else {
						addRow(
							'discountedNode',
							'Discount',
							`-$${discountedPrice.toFixed(2)}`,
						);
					}
				} else {
					removeRow('discountedNode');
				}
			}
		} catch (error) {
			console.error('An error occurred:', error);
		}
	});
});

vehType.addEventListener('change', async (event) => {
	vehName.setAttribute('disabled', 'disabled');
	try {
		const response = await fetch(
			`/vehicleModels?type=${event.target.value}`,
		);
		if (response.ok) {
			const data = await response.json();
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
		} else {
			console.error('Error fetching vehicle models:', response.status);
		}
	} catch (error) {
		console.error('Error fetching vehicle models:', error);
	}
});

printButton.addEventListener('click', async (e) => {
	e.preventDefault();
	printButton.setAttribute('disabled', 'disabled');
	const options = {
		rsvpID: rsvpID.value,
		pickupDate: pickupDateID.value,
		returnDate: returnDateID.value,
		discount: discountID.value ?? 0,
		firstName: firstNameID.value,
		lastName: lastNameID.value,
		email: emailID.value,
		phone: phoneID.value,
		colDmg: colDmgID.checked,
		insurance: insuranceID.checked,
		rentalTax: rentalTaxID.checked,
		vehicleID: vehName.value,
		vehicleType: vehType.value,
		total: totalSummery.innerHTML,
		dailyUnit: dailyUnit.innerHTML,
		dailyRate: dailyRate.innerHTML,
		dailyTotal: dailyTotal.innerHTML,
		rentalTaxAmount: document.getElementById('rentalTaxNode')
			? document
				.getElementById('rentalTaxNode')
				.querySelector('td:last-child').innerHTML
			: 0,
	};

	try {
		const response = await fetch('/submit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(options),
		});

		if (response.ok) {
			const data = await response.json();
			printButton.removeAttribute('disabled');
			showToast('Invoice Generated Successfully', 'success', 5000);
			window.open(data.path, '_blank');
		} else if (response.status === 400) {
			const errorData = await response.json();
			printButton.removeAttribute('disabled');
			showToast(errorData.error, 'danger', 5000);
		} else {
			printButton.removeAttribute('disabled');
			showToast('An error occurred', 'danger', 5000);
		}
	} catch (error) {
		printButton.removeAttribute('disabled');
		showToast(error.error, 'danger', 5000);
	}
});
