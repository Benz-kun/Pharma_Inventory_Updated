const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    inventory_id: String,
    pharmacy_id: String,
    patient_id: String,
    doctor_id: String,
    medicine_name: String,
    quantity: Number,
    price_per_unit: Number,
    total_price: Number,
    purchase_date: Date,
    prescription_date: Date,
    medicine_id: String
});

const medicineSchema = new mongoose.Schema({
    medicine_id: String,
    name: String,
    cost: Number,
    quantity: Number
});

const pharmacy_stores = new mongoose.Schema({
    pharmacy_id : String,
    pharmacy_name : String,
    license_number : String,
    contact_number : String,
    address : String,
    email : String,
    manager_name : String
});

const prescriptionSchema = new mongoose.Schema({
    prescription_id: String,
    doctor_id: String,
    patient_id: String,
    medicine_name: String,
    dosage: String,
    frequency: String,
    start_date: Date,
    end_date: Date
});

const salesSchema = new mongoose.Schema({
    sale_id: String,
    medicine_id: String,
    quantity: Number,
    total_amount: Number,
    pharmacy_id: String
});

const userAuthenticationSchema = new mongoose.Schema({
    user_id: String,
    username: String,
    phone_number: String,
    password: String,
    admin: Number
});

// Export all models
module.exports = {
    inventory_management: mongoose.model('inventory_managements', inventorySchema),
    medicines: mongoose.model('medicines', medicineSchema),
    PharmacyStore: mongoose.model('pharmacy_stores', pharmacy_stores),
    prescription_details: mongoose.model('prescription_details', prescriptionSchema),
    sales: mongoose.model('sales', salesSchema),
    UserAuthentication: mongoose.model('user_authentications', userAuthenticationSchema)
};
