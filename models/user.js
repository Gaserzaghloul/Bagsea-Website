const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    avatar: String
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// encrypt(hash) the password before storing
userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
//compare the password with the hashed password
userSchema.methods.validPassword = function (candidatePassword) {
  if (this.password != null) {
    return bcrypt.compareSync(candidatePassword, this.password);
  } else {
    return false;
  }
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

//now we can use the encryptPassword and validPassword methods in the any fileeeee
module.exports = mongoose.model("User", userSchema);
