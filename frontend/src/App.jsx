/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import Home from './pages/Home';
import getCurrentUser from './features/getCurrentUser.js';
import { useDispatch } from 'react-redux';
import { setUserdata } from './redux/userSlice.js';

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const getUser = async () => {
            const data = await getCurrentUser();
            dispatch(setUserdata(data));
        };
        getUser();
    }, []);

    return (
        <>
            <Home />
        </>
    );
};

export default App;
