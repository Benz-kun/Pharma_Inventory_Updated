{/* <script> */}
    function showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    }

    // async function fetchSalesData(pharmacyName) {
    //     if (!pharmacyName) {
    //         alert("Please select a pharmacy.");
    //         return;
    //     }

    //     try {
    //         const response = await fetch('/fetch_sales_data', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({ pharmacy_name: pharmacyName })
    //         });

    //         const data = await response.json();

    //         if (data.error) {
    //             alert(data.error);
    //             document.getElementById('salesTable').style.display = 'none';
    //         } else {
    //             updateSalesTable(data.sales);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching sales data:', error);
    //     }
    // }

    // function updateSalesTable(salesData) {
    //     const salesTable = document.getElementById('salesTable');
    //     const tbody = salesTable.querySelector('tbody');

    //     // Clear existing rows
    //     tbody.innerHTML = '';

    //     // Populate table with new data
    //     salesData.forEach(item => {
    //         const row = document.createElement('tr');
    //         row.innerHTML = `
    //             <td>${item.pharmacy_name}</td>
    //             <td>${item.medicine_sold}</td>
    //             <td>${item.quantity}</td>
    //             <td>${item.amount}</td>
    //         `;
    //         tbody.appendChild(row);
    //     });

    //     // Show the table
    //     salesTable.style.display = 'table';
    // }

    async function fetchInventoryData(pharmacyName) {
        
        if (!pharmacyName) {
            alert("Please select a pharmacy.");
            return;
        }

        try {
            const response = await fetch('/fetch_inventory_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pharmacy_name: pharmacyName })
            });

            const data = await response.json();
            console.log('Fetched inventory data:', data);

            if (data.error) {
                alert(data.error);
                document.getElementById('inventoryTable').style.display = 'none';
            } else {
                updateInventoryTable(data.inventory);
            }
        } catch (error) {
            console.error('Error fetching inventory data:', error);
        }
    }

    function updateInventoryTable(inventoryData) {
        const inventoryTable = document.getElementById('inventoryTable');
        const tbody = inventoryTable.querySelector('tbody');
    
        // Clear existing rows
        tbody.innerHTML = '';
    
        // Populate table with new data
        inventoryData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.medicine_name}</td>
                <td>${item.quantity}</td>
                <td>${item.price_per_unit}</td>
                <td>${item.purchase_date}</td>
                <td>${item.prescription_date}</td>
            `;
            tbody.appendChild(row);
        });
    
        // Show the table
        inventoryTable.style.display = 'table';
    }
    

    function showEntityForm() {
        const entity = document.getElementById('entityType').value;
        const formContainer = document.getElementById('entityFormContainer');
        formContainer.innerHTML = ''; // Clear previous content

        if (entity === "Admin" || entity === "Manager") {
            formContainer.innerHTML = `
                <form id="entityForm">
                    <label for="user_id">User ID:</label>
                    <input type="text" id="user_id" name="user_id" required><br><br>

                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required><br><br>

                    <label for="phone_number">Phone Number:</label>
                    <input type="text" id="phone_number" name="phone_number" required><br><br>

                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required><br><br>

                    <button type="button" onclick="addEntity('${entity}')">Add</button>
                </form>
                <p id="formMessage" style="color: red;"></p>
            `;
        }
    }

    async function addEntity(entityType) {
        const userId = document.getElementById('user_id').value.trim();
        const username = document.getElementById('username').value.trim();
        const phoneNumber = document.getElementById('phone_number').value.trim();
        const password = document.getElementById('password').value.trim();
        const formMessage = document.getElementById('formMessage');

        // Check if all fields are filled
        if (!userId || !username || !phoneNumber || !password) {
            formMessage.textContent = "Please fill in all fields.";
            return;
        }

        // Determine the admin value based on the entity type
        const isAdmin = entityType === "Admin" ? 1 : 0;

        try {
            const response = await fetch('/add_entity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    username: username,
                    phone_number: phoneNumber,
                    password: password,
                    admin: isAdmin
                })
            });

            const data = await response.json();
            if (data.success) {
                formMessage.style.color = "green";
                formMessage.textContent = "Entity added successfully!";
                document.getElementById('entityForm').reset();
            } else {
                formMessage.style.color = "red";
                formMessage.textContent = data.error || "Failed to add entity.";
            }
        } catch (error) {
            console.error('Error:', error);
            formMessage.textContent = "An error occurred. Please try again.";
        }
    }

    // Load the home section by default
    // window.onload = function() {
    //     showSection('home');
    //     document.getElementById('pharmacySelect').addEventListener('change', function() {
    //         fetchSalesData(this.value);
    //     });
    //     document.getElementById('inventoryPharmacySelect').addEventListener('change', function() {
    //         fetchInventoryData(this.value);
    //     });
    // };

    async function fetchPharmacyStoreData(pharmacyName) {
        if (!pharmacyName) {
            alert("Please select a pharmacy.");
            return;
        }
    
        try {
            const response = await fetch('/fetch_pharmacy_store_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pharmacy_name: pharmacyName })
            });
    
            const data = await response.json();
    
            if (data.error) {
                alert(data.error);
                document.getElementById('pharmacyTable').style.display = 'none';
            } else {
                updatePharmacyTable(data.pharmacyStore);
            }
        } catch (error) {
            console.error('Error fetching pharmacy store data:', error);
        }
    }
    
    function updatePharmacyTable(pharmacyStoreData) {
        const pharmacyTable = document.getElementById('pharmacyTable');
        const tbody = pharmacyTable.querySelector('tbody');
    
        // Clear existing rows
        tbody.innerHTML = '';
    
        // Populate table with new data
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pharmacyStoreData.pharmacy_name}</td>
            <td>${pharmacyStoreData.license_number}</td>
            <td>${pharmacyStoreData.contact_number}</td>
            <td>${pharmacyStoreData.address}</td>
            <td>${pharmacyStoreData.email}</td>
            <td>${pharmacyStoreData.manager_name}</td>
        `;
        tbody.appendChild(row);
    
        // Show the table
        pharmacyTable.style.display = 'table';
    }
    
{/* </script> */}
