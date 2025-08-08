import mongoose, { Types } from "mongoose";
const User = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Content = new mongoose.Schema({
  link: { type: String },
  type: { type: String },
  title: { type: String },
  tags: [{ type: Types.ObjectId, ref: "Tags" }],
  userId: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});
const Tags = new mongoose.Schema({
  title: { type: String, required: true },
});
const Link = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const userModel = mongoose.model("User", User);
const contentModel = mongoose.model("Content", Content);
const tagsModel = mongoose.model("Tags", Tags);
const linkModel = mongoose.model("Link", Link);
export default { userModel, contentModel, tagsModel, linkModel };
