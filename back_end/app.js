const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const models = require('./models'); // Import models from models.js

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Inventory')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Route for the index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

  // Route to validate login
app.post('/validate_login', async (req, res) => {
    const { username, phone_number, password, admin } = req.body;

    // Check if all required fields are provided
    if (!username || !phone_number || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    console.log(username);
    console.log(phone_number);
    console.log(password);
    // getAllPharmacyStores();
    try {
        // Query to validate user credentials
        const user = await models.UserAuthentication.findOne({
            username: username,
            phone_number: phone_number,
            password: password,
            admin: admin
        });
        console.log(user);
        if (user) {
            return res.status(200).json({ success: true, message: 'Login successful!' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials or user type.' });
        }
    } catch (error) {
        console.error('Error validating login:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});


app.get('/index2', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index2.html'));
});

app.get('/admin_page', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin_page.html'));
});

app.post('/fetch_prescription_data', async (req, res) => {
    const prescriptionId = req.body.prescription_id;
    console.log(prescriptionId);

    if (!prescriptionId) {
        return res.status(400).json({ error: 'Prescription ID is required.' });
    }

    try {
        // Query to fetch all prescription data based on the Prescription ID
        const prescriptions = await models.prescription_details.find({ prescription_id: prescriptionId });

        // Check if any prescriptions were found
        if (prescriptions.length === 0) {
            return res.status(404).json({ error: 'No prescriptions found with the given ID.' });
        }

        // Return all fetched prescription data
        return res.status(200).json({ prescriptions: prescriptions });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.post('/add_entity', async (req, res) => {
    const data = req.body;
    const user_id = data.user_id;
    const username = data.username;
    const phone_number = data.phone_number;
    const password = data.password;
    const admin = data.admin;

    // Check if all fields are provided
    if (!user_id || !username || !phone_number || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Insert data into the database
    try {
        const newUser = new models.UserAuthentication({
            user_id,
            username,
            phone_number,
            password,
            admin
        });

        await newUser.save(); // Save the new user to the database

        // Return a success response with the 'success' key set to True
        return res.status(200).json({
            success: true,
            message: `${username} has been added as a ${admin === 1 ? 'Admin' : 'Manager'} successfully.`
        });
    } catch (error) {
        console.error(`Error adding entity: ${error}`);
        // Return an error response with the 'success' key set to False
        return res.status(500).json({ success: false, message: 'Error adding entity.' });
    }
});


app.post('/fetch_inventory_info', async (req, res) => {
    const pharmacy_id = req.body.pharmacy_id;

    if (!pharmacy_id) {
        return res.status(400).json({ error: 'Pharmacy ID is required.' });
    }

    try {
        // Fetch inventory data for the given pharmacy_id
        const inventoryData = await models.inventory_management.find({ pharmacy_id: pharmacy_id }, {
            medicine_name: 1,
            quantity: 1,
            price_per_unit: 1,
            purchase_date: 1,
            prescription_date: 1,e
        });

        if (inventoryData.length === 0) {
            return res.status(404).json({ error: 'No inventory found for the given Pharmacy ID.' });
        }
        
        // Format the inventory data to include total_price
        const formattedInventoryData = inventoryData.map(item => ({
            medicine_name: item.medicine_name,
            quantity: item.quantity,
            price_per_unit: item.price_per_unit,
            purchase_date: item.purchase_date,
            prescription_date: item.prescription_date
        }));

    } catch (error) {
        console.error('Error fetching inventory info:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.json({ inventory: formattedInventoryData });
});

app.post('/fetch_bill_data', async (req, res) => {
    const prescription_id = req.body.prescription_id;
    console.log(`Received Prescription ID: ${prescription_id}`);

    try {
        const fetchedData = await models.prescription_details.find({ prescription_id });

        if (fetchedData.length === 0) {
            return res.status(404).json({ error: 'No details found for the given Prescription ID.' });
        }

        // Prepare an array to hold the bill data
        const fixedBillData = [];

        // Iterate over fetched prescription details
        for (const item of fetchedData) {
            const medicine = await models.medicines.findOne({ name: item.medicine_name });

            if (medicine) {
                fixedBillData.push({
                    medicine_name: medicine.name,
                    quantity: medicine.quantity, // From prescription_details, assuming quantity is present
                    cost: medicine.cost // From medicines table
                });
            }
        }

        if (fixedBillData.length === 0) {
            return res.status(404).json({ error: 'No matching medicines found for the prescription.' });
        }

        // Calculate the total price
        const total_price = fixedBillData.reduce((acc, item) => acc + (item.cost * item.quantity), 0).toFixed(2);

        return res.json({ bill: fixedBillData, total_price });

    } catch (error) {
        console.error('Error fetching bill data:', error);
        return res.status(500).json({ error: error.message });
    }
});




app.post('/fetch_inventory_data', async (req, res) => {
    const pharmacy_name = req.body.pharmacy_name;

    try {
        // Step 1: Get the pharmacy_id based on the pharmacy_name
        const pharmacy = await models.PharmacyStore.findOne({ pharmacy_name: pharmacy_name });

        if (!pharmacy) {
            return res.status(404).json({ error: "Pharmacy not found" });
        }

        const pharmacy_id = pharmacy.pharmacy_id;

        // Step 2: Fetch inventory data for the given pharmacy_id
        const inventoryData = await models.inventory_management.find({ pharmacy_id: pharmacy_id })
            .select('medicine_name quantity price_per_unit purchase_date prescription_date')
            .lean(); // Use lean() to get plain JavaScript objects instead of Mongoose documents

        // Return the data in JSON format
        return res.json({ inventory: inventoryData });

    } catch (error) {
        console.error('Error fetching inventory data:', error);
        return res.status(500).json({ error: error.message });
    }
});


app.get('/api/pharmacies', async (req, res) => {
    try {
        const pharmacies = await models.PharmacyStore.find();
        console.log("test",pharmacies);
        
        return res.json(pharmacies);
    } catch (error) {
        console.error('Error fetching pharmacies:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get all medicines
app.get('/get_all_medicines', async (req, res) => {
    try {
        // Fetch all medicines using the existing getAllMedicines() logic
        const medicines = await models.medicines.find({});
        console.log(medicines);
        
        // Send the medicines data as a JSON response
        return res.json({ medicines: medicines });
    } catch (err) {
        console.error('Error fetching medicines:', err);
        res.status(500).json({ error: 'Failed to fetch medicines data.' });
    }
});

app.post('/fetch_pharmacy_store_data', async (req, res) => {
    const { pharmacy_name } = req.body;

    try {
        const pharmacyStore = await models.PharmacyStore.findOne({ pharmacy_name: pharmacy_name });
        console.log(pharmacyStore)
        if (!pharmacyStore) {
            return res.status(404).json({ error: 'Pharmacy store not found.' });
        }
        res.json({ pharmacyStore });
    } catch (error) {
        console.error('Error fetching pharmacy store data:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});