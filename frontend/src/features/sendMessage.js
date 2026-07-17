import api from '../../utils/axios.js';

const sendMessage = async (payload) => {
    try {
        const { data } = await api.post('/api/agent/chat', payload);
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export default sendMessage;
