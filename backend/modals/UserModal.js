const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    
    fullName: { type: String },
    email: { type: String},
    password: { type: String},
    createdOn: { type: Date, default: new Date().getTime() },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
