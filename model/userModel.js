const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role : {
        type: String,
        enum: [ "user", "admin" ],
        default: "user",
    },
});


 // hash the password before saving 
 userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
}); 

// compare entered password with hashed password 
userSchema.methods.matchPassword = async function( enteredPassword ) {
    return await bcrypt.hash(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema);
module.exports = User;
