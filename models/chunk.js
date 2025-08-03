import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  embedding: {
    type: Array,
    required: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

chunkSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model('Chunk', chunkSchema);
