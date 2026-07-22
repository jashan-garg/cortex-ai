/* eslint-disable react-hooks/exhaustive-deps */
import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PanelRight,
  SquarePen,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getConversations } from '../features/getConversations.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  setConversations,
  setSelectedConversation,
} from '../redux/conversationSlice.js';
import logout from '../features/logout.js';
import { setUserdata } from '../redux/userSlice.js';
import { setArtifacts } from '../redux/messageSlice.js';
import BillingDrawer from './BillingDrawer.jsx';

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation
  );
  const { user } = useSelector((state) => state.user);
  const [imageError, setImageError] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getConv = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(data));
      } catch (err) {
        console.error('fetch failed:', err);
      }
    };
    getConv();
  }, [user?._id]);

  // Common close handler for mobile
  const closeMobileSidebar = () => setMobileOpen(false);

  // Expanded sidebar content (reused in desktop expanded & mobile overlay)
  const expandedSidebarContent = (
    <div
      className={`${
        isMobile ? 'fixed top-0 left-0 z-50' : 'lg:static'
      } h-[calc(100vh-16px)] w-64 m-2 bg-[#111111]/90 backdrop-blur-xl rounded-2xl shrink-0 border border-white/5`}
    >
      <div className="flex flex-col h-full p-1">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          <span className="text-[14px] font-semibold text-slate-200 tracking-tight px-1">
            Cortex AI
          </span>
          {/* Close button only on mobile */}
          {isMobile ? (
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors duration-150 bg-transparent border-none cursor-pointer"
              onClick={closeMobileSidebar}
            >
              <X size={17} />
            </button>
          ) : (
            <button
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors duration-150 bg-transparent border-none cursor-pointer"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftIcon size={17} />
            </button>
          )}
        </div>

        {/* New chat */}
        <div className="px-2 flex flex-col gap-0.5">
          <button
            className="w-full flex items-center gap-2.5 text-[13.5px] font-medium text-slate-200 rounded-lg px-2.5 py-2 border-none bg-transparent cursor-pointer hover:bg-white/8 transition-colors duration-150"
            onClick={() => {
              dispatch(setSelectedConversation(null));
              dispatch(setArtifacts(null));
              if (isMobile) closeMobileSidebar();
            }}
          >
            <SquarePen size={16} className="text-slate-400" />
            New chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="px-4 pt-5 pb-1.5 text-[11px] font-medium text-slate-600">
          {conversations.length === 0 ? 'No conversations yet' : 'Chats'}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {conversations.map((conversation) => {
            const isActive = selectedConversation?._id == conversation?._id;
            return (
              <div
                key={conversation._id}
                className={`group flex items-center gap-2 cursor-pointer mb-0.5 px-2.5 py-2 rounded-lg transition-colors duration-150 ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/8'
                }`}
                onClick={() => {
                  dispatch(setSelectedConversation(conversation));
                  dispatch(setArtifacts(null));
                  if (isMobile) closeMobileSidebar();
                }}
              >
                <span
                  className={`text-[13.5px] truncate ${
                    isActive
                      ? 'text-slate-100'
                      : 'text-slate-300 group-hover:text-slate-100'
                  }`}
                >
                  {conversation?.title || 'New Chat'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-white/6">
          {user && (
            <div className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-2 hover:bg-white/8 transition-colors duration-150">
              <div className="shrink-0">
                {user?.avatar && !imageError ? (
                  <img
                    className="w-7 h-7 rounded-full object-cover"
                    src={user.avatar}
                    alt="profile photo"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center">
                    <User size={13} className="text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-200 truncate">
                  {user?.name || 'Loading...'}
                </p>
                <p className="text-[11px] text-slate-600 capitalize">
                  {user?.plan ?? 'Free'} Plan
                </p>
              </div>

              <button
                className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-slate-500 cursor-pointer hover:bg-white/10 hover:text-slate-300 transition-colors duration-150"
                onClick={() => {
                  setShowBilling(true);
                  if (isMobile) closeMobileSidebar();
                }}
              >
                <Coins size={15} />
              </button>

              <button
                className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-slate-500 cursor-pointer hover:bg-white/10 hover:text-slate-300 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                  dispatch(setUserdata(null));
                  if (isMobile) closeMobileSidebar();
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
    </div>
  );

  // ----- Mobile Layout -----
  if (isMobile) {
    return (
      <>
        {/* Hamburger toggle */}
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed top-3 left-3 z-40 flex items-center justify-center w-9 h-9 rounded-lg bg-[#111111]/90 backdrop-blur-xl border border-white/5 text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors duration-150 cursor-pointer"
          >
            <PanelLeftIcon size={18} />
          </button>
        )}

        {/* Overlay backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Sidebar overlay */}
        {mobileOpen && expandedSidebarContent}
      </>
    );
  }

  // ----- Desktop Layout (unchanged logic) -----
  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center w-14 h-[calc(100vh-16px)] m-2 bg-[#111111]/90 backdrop-blur-xl rounded-2xl border border-white/5 py-3 gap-1 shrink-0">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors duration-150 bg-transparent border-none cursor-pointer"
          onClick={() => setCollapsed(false)}
        >
          <PanelRight size={18} />
        </button>

        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors duration-150 bg-transparent border-none cursor-pointer mt-1"
          onClick={() => {
            dispatch(setSelectedConversation(null));
            dispatch(setArtifacts(null));
          }}
        >
          <SquarePen size={17} />
        </button>

        <div className="flex-1 overflow-y-auto w-full px-2 pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden pt-4 flex flex-col items-center gap-0.5">
          {conversations.map((conversation) => {
            const isActive = selectedConversation?._id == conversation?._id;
            return (
              <div
                key={conversation._id}
                className={`flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/10 text-slate-100'
                    : 'text-slate-500 hover:bg-white/8 hover:text-slate-300'
                }`}
                onClick={() => {
                  dispatch(setSelectedConversation(conversation));
                  dispatch(setArtifacts(null));
                }}
              >
                <MessageSquare size={15} />
              </div>
            );
          })}
        </div>

        <div className="shrink-0 pb-1">
          {user?.avatar && !imageError ? (
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={user.avatar}
              alt="profile photo"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
              <User size={14} className="text-slate-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop expanded
  return expandedSidebarContent;
};

export default SideBar;
