// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("Could not connect to MongoDB:", error));

// Routes
app.use('/', require('./routes/index'));
app.use('/inventory', require('./routes/inventorys'));
app.use('/orders', require('./routes/orders'));
app.use('/auth', require('./routes/users'));
app.use('/users', require('./routes/usermanagement'));
app.use('/reports', require('./routes/report'));
app.use('/notification', require('./routes/notifications'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
