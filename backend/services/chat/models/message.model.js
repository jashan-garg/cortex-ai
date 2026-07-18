import { model, Mongoose, Schema } from 'mongoose';

const fileSchema = new Schema(
  { name: String, content: String },
  { _id: false }
);

const artifactSchema = new Schema(
  { id: Number, type: String, files: [fileSchema], title: String },
  { _id: false }
);

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
    },
    content: String,
    images: [String],
    artifacts: [artifactSchema],
  },
  { timestamps: true }
);

const Message = model('Message', messageSchema);
export default Message;
