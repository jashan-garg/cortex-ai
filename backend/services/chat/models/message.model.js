import { model, Schema } from 'mongoose';

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
  },
  {
    timestamps: true,
  }
);

const Message = model('Message', messageSchema);
export default Message;
