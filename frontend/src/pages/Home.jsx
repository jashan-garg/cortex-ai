import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../utils/firebase.js';
import api from '../../utils/axios.js';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch, useSelector } from 'react-redux';
import { setUserdata } from '../redux/userSlice.js';
import SideBar from '../components/Sidebar.jsx';
import ChatArea from '../components/ChatArea.jsx';
import Artifact from '../components/Artifact.jsx';

const Home = () => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const googleLogin = async () => {
        try {
            const data = await signInWithPopup(auth, googleProvider);
            const token = await data.user.getIdToken();
            await handleLogin(token);
        } catch (error) {
            console.log('Google login error:', error);
        }
    };

    const handleLogin = async (token) => {
        try {
            const { data } = await api.post('/api/auth/login', { token });
            console.log(data);
            dispatch(setUserdata(data));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">
            <SideBar />
            <ChatArea />
            <Artifact />

            {!user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-85 bg-[#13151c] border border-white/8 rounded-2xl p-7 flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
                                Welcome to cortex AI
                            </h2>
                            <p className="text-[13px] text-slate-500">
                                Please login to continue using the app
                            </p>
                        </div>

                        <button
                            onClick={googleLogin}
                            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium bg-linear-to-br from-indigo-700 to-violet-900 hover:from-indigo-700 hover:to-violet-900 active:from-indigo-700 active:to-violet900 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-150 cursor-pointer"
                        >
                            <FcGoogle size={18} />
                            <span>Continue with Google</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
