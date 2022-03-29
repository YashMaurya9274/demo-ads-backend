import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  title: String,
  category: String,
  price: Number,
  image: String,
  timestamp: String,
  userId: String,
  user: {
    displayName: String,
    email: String,
    photoURL: String,
  },
});

export default mongoose.model("posts", postSchema);
