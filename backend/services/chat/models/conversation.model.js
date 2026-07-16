import { model, Schema } from 'mongoose';

const conversationSchema = new Schema(
    {
        title: {
            type: String,
            default: 'New Chat',
        },
        userId: String,
    },
    { timestamps: true }
);

const Conversation = new model('Conversation', conversationSchema);
export default Conversation;
