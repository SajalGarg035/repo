const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: String,
  description: String,
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
