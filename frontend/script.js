function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.style.display = 'none';
    });

    // Show the selected section
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }

    // Reset buttons and results
    if (section === 'home') {
        const medicinesTable = document.getElementById('prescriptionMedicinesTable');
        const generateButton = document.getElementById('generateBillButton');
        const result = document.getElementById('result');

        if (medicinesTable) medicinesTable.style.display = 'none';
        if (generateButton) generateButton.style.display = 'none';
        if (result) result.innerHTML = '';
    }
}

function fetchMedicinesData() {
    console.log("Fetching medicines data...");
    fetch('/get_all_medicines')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const medicinesTable = document.getElementById('medicinesTable');
            const inventoryMessage = document.getElementById('inventoryMessage');
            const tbody = medicinesTable.querySelector('tbody');

            console.log('Fetched data:', data.medicines);

            if (data.medicines && data.medicines.length > 0) {
                tbody.innerHTML = ''; // Clear existing rows
                console.log('Table body cleared.');
                
                data.medicines.forEach(medicine => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${medicine.medicine_id}</td>
                        <td>${medicine.name}</td>
                        <td>${medicine.cost}</td>
                        <td>${medicine.quantity}</td>
                    `;
                    tbody.appendChild(row);
                });

                console.log('Table body after adding rows:', tbody.innerHTML);
                medicinesTable.style.display = 'table';
                inventoryMessage.style.display = 'none';
                document.getElementById('inventory').style.display = 'block';
            } else {
                console.log('No medicines found.');
                medicinesTable.style.display = 'none';
                inventoryMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching medicines data:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {



    
    // Fetch button functionality
    document.getElementById('fetchButton').addEventListener('click', () => {
        const prescriptionId = document.getElementById('prescriptionId').value.trim();
        console.log("Fetch button clicked. Prescription ID:", prescriptionId);
        
        if (!prescriptionId) {
            alert('Please enter a Prescription ID.');
            return;
        }

        fetch('/fetch_prescription_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prescription_id: prescriptionId })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);

            if (data.error) {
                alert(data.error);
                document.getElementById('prescriptionMedicinesTable').style.display = 'none';
                return;
            }

            const tableBody = document.getElementById('prescriptionMedicinesTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear previous table content

            if (data.prescriptions.length === 0) {
                alert('No prescriptions found with the given ID.');
                document.getElementById('prescriptionMedicinesTable').style.display = 'none';
                return;
            }

            data.prescriptions.forEach(prescription => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = prescription.doctor_id || 'N/A';
                row.insertCell(1).textContent = prescription.patient_id || 'N/A';
                row.insertCell(2).textContent = prescription.medicine_name || 'N/A';
                row.insertCell(3).textContent = prescription.dosage || 'N/A';
                row.insertCell(4).textContent = prescription.frequency || 'N/A';
                row.insertCell(5).textContent = prescription.start_date || 'N/A';
                row.insertCell(6).textContent = prescription.end_date || 'N/A';
            });

            document.getElementById('prescriptionMedicinesTable').style.display = 'table';
            document.getElementById('generateBillButton').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching prescription data:', error);
            alert('An error occurred while fetching the data. Please try again.');
        });
    });

    // Load Medicines button functionality
    document.getElementById('loadMedicinesButton').addEventListener('click', () => {
        console.log('Load Medicines button clicked');
        fetchMedicinesData();
    });


    document.getElementById('generateBillButton').addEventListener('click', () => {
        const prescriptionId = document.getElementById('prescriptionId').value.trim();
        console.log("Generate Bill button clicked. Prescription ID:", prescriptionId);
        
        if (!prescriptionId) {
            alert('Please enter a Prescription ID.');
            return;
        }
    
        fetch('/fetch_bill_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prescription_id: prescriptionId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Bill data received:', data);
            
            // Display the bill data in the billTable
            const billTableBody = document.getElementById('billTable').getElementsByTagName('tbody')[0];
            billTableBody.innerHTML = ''; // Clear previous content
    
            let totalCost = 0;
    
            // Iterate over fetched bill data to build the table
            data.bill.forEach(item => {
                const row = billTableBody.insertRow();
                row.insertCell(0).textContent = item.medicine_name || 'N/A';
                row.insertCell(1).textContent = item.quantity || 'N/A';
                row.insertCell(2).textContent = item.cost || 'N/A';
                
                const itemTotalCost = parseFloat(item.cost) * parseInt(item.quantity);
                row.insertCell(3).textContent = itemTotalCost.toFixed(2) || 'N/A'; // Total cost
                
                totalCost += itemTotalCost; // Accumulate total cost
            });
    
            // Display the total price
            document.getElementById('totalCost').textContent = totalCost.toFixed(2) || '0.00';
            document.getElementById('billTable').style.display = 'table';
        })
        .catch(error => {
            console.error('Error fetching bill data:', error);
            alert('An error occurred while generating the bill. Please try again.');
        });
    });
    

});

