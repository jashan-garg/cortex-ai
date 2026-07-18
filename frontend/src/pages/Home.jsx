import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../utils/firebase.js';
import api from '../../utils/axios.js';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch, useSelector } from 'react-redux';
import { setUserdata } from '../redux/userSlice.js';
import SideBar from '../components/SideBar.jsx';
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
      dispatch(setUserdata(data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex text-white overflow-hidden bg-linear-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#050505]">
      <SideBar />
      <ChatArea />
      <Artifact />

      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-85 bg-[#1a1a1a] border border-white/10 rounded-2xl p-7 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold text-neutral-200 tracking-tight">
                Welcome to Cortex AI
              </h2>
              <p className="text-[13px] text-neutral-500">
                Please login to continue using the app
              </p>
            </div>

            <button
              onClick={googleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg text-sm font-medium 
                            bg-[#2b2b2b] hover:bg-[#343434] active:bg-[#2f2f2f] 
                            text-neutral-200 
                            transition-colors duration-150 cursor-pointer"
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
