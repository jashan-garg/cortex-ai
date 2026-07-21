import axios from 'axios';

let store;

export const injectStore = (_store) => {
  store = _store;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.credits !== undefined && store) {
      store.dispatch({
        type: 'user/setCredits',
        payload: response.data.credits,
      });
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
