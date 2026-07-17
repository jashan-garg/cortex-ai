import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const createConversation = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const conversation = await Conversation.create({ userId: userId });
        return res.status(200).json(conversation);
    } catch (error) {
        return res
            .status(500)
            .json({ message: `Error creating conversation, ${error}` });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const conversations = await Conversation.find({ userId: userId }).sort({
            updatedAt: -1,
        });
        return res.status(200).json(conversations);
    } catch (error) {
        return res
            .status(500)
            .json({ message: `Error getting conversations, ${error}` });
    }
};

export const updateConversation = async (req, res) => {
    try {
        const { id, title } = req.body;
        const conversation = await Conversation.findByIdAndUpdate(id, {
            title,
        });
        return res.status(200).json(conversation);
    } catch (error) {
        return res
            .status(500)
            .json({ message: `Error updating conversations, ${error}` });
    }
};

export const saveMessage = async (req, res) => {
    try {
        const { conversationId, role, content } = req.body;
        const message = await Message.create({
            conversationId,
            role,
            content,
        });
        return res.status(200).json(message);
    } catch (error) {
        return res
            .status(500)
            .json({ message: `Error saving messages: ${error}` });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        });
        return res.status(200).json(messages);
    } catch (error) {
        return res
            .status(500)
            .json({ message: `Error getting messages: ${error}` });
    }
};
