import mongoose  from "mongoose";

const bookSchema = new mongoose.Schema({
    title : {type: String, required: true},
    author : {type: String, required: true},
    category : {type: String, required: true},
    isbn : {type: String, required: true, unique: true},
    totalCopies : {type: Number, required: true},
    availableCopies : {type: Number, required: true}
},{timestamps :  true});

export default mongoose.model('Book',bookSchema);