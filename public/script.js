document.getElementById('vehicleType').addEventListener('change', (event) => {
	document.getElementById('vehicleName').setAttribute('disabled', 'disabled');
	const selectedType = event.target.value;
	fetch(`/vehicleModels?type=${selectedType}`)
		.then((response) => response.json())
		.then((data) => {
			const vehicleNameSelect = document.getElementById('vehicleName');
			vehicleNameSelect.innerHTML = '';
			data.forEach((model) => {
				const option = document.createElement('option');
				option.value = model.id;
				option.text = `${model.make} ${model.model}`;
				vehicleNameSelect.add(option);
				document.getElementById('vehicleName').removeAttribute('disabled');
			});
		})
		.catch((error) => console.error('Error fetching vehicle models:', error));
});
