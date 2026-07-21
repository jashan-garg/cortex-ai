import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X, Check, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { createOrder } from '../features/createOrder.js';
import { verifyPayment } from '../features/verifyPayment.js';
import { setUserdata } from '../redux/userSlice.js';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹199',
    amount: 199,
    period: '/month',
    credits: 500,
    features: [
      '500 credits / month',
      'Chat, search & coding agents',
      'Standard response speed',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹499',
    amount: 499,
    period: '/month',
    credits: 1000,
    popular: true,
    features: [
      '1,000 credits / month',
      'All agents, including image, PDF & PPT',
      'Priority response speed',
      'Early access to new agents',
    ],
  },
];

export default function BillingDrawer({ open, onClose }) {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const currentPlan = (user?.plan ? user.plan : 'free').toLowerCase();
  const creditsPct = Math.min(
    ((user?.credits || 0) / (user?.totalCredits || 1)) * 100,
    100
  );

  const getAvailablePlans = () => {
    switch (currentPlan) {
      case 'free':
        return PLANS.map((plan) => ({
          ...plan,
          displayPrice: plan.price,
          displayCredits: plan.credits,
          buttonText: `Upgrade to ${plan.name}`,
        }));
      case 'starter':
        return [
          {
            ...PLANS[1],
            price: '₹300',
            amount: 300,
            displayPrice: '₹300',
            displayCredits: 1000,
            buttonText: 'Upgrade to Pro',
            note: 'Prorated upgrade from Starter',
          },
        ];
      case 'pro':
        return [];
      default:
        return PLANS;
    }
  };

  const availablePlans = getAvailablePlans();

  const handleUpgrade = async (plan) => {
    if (loadingPlan) return;
    setLoadingPlan(plan.id);

    try {
      const data = await createOrder(plan.id);
      if (!data?.order) {
        throw new Error(data?.message || 'Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Cortex AI',
        description: `${data.plan.name} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const result = await verifyPayment(response);
            if (!result?.message?.includes('success')) {
              throw new Error(result?.message || 'Verification failed');
            }

            // Update Redux instead of reloading
            dispatch(
              setUserdata({
                ...user,
                plan: plan.id,
                credits: plan.displayCredits || plan.credits,
                totalCredits: plan.displayCredits || plan.credits,
                planExpiresAt: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
              })
            );
            onClose();
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setLoadingPlan(null);
          }
        },
        theme: { color: '#0d0d0d' },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Order creation failed:', error.message);
      alert(error.message || 'Failed to create order. Please try again.');
      setLoadingPlan(null);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-100"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-101 h-screen w-100 bg-[#0d0d0d] border-l border-white/10 shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-[15px] font-medium text-[#ececec]">
                {currentPlan === 'pro' ? 'Your Plan' : 'Upgrade your plan'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#b4b4b4] hover:text-[#ececec] transition-colors duration-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current plan / credits */}
            <div className="px-5 pt-4">
              <div className="rounded-xl bg-[#171717] border border-white/10 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#8e8ea0]">
                      Current plan
                    </p>
                    <h3 className="text-[15px] font-medium text-[#ececec] mt-0.5 capitalize">
                      {currentPlan}
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#8e8ea0] border border-white/10 rounded-full px-2.5 py-1">
                    {user?.credits || 0} / {user?.totalCredits || 0}
                  </span>
                </div>

                <div className="mt-3.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#ececec] transition-all duration-500"
                    style={{ width: `${creditsPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Plans */}
            <div className="px-5 pt-4 flex-1 overflow-auto space-y-3 pb-4">
              {currentPlan === 'pro' ? (
                <div className="rounded-xl border border-white/10 bg-[#131313] p-6 text-center">
                  <h3 className="text-[15px] font-medium text-[#ececec]">
                    You're on the Pro plan
                  </h3>
                  <p className="mt-2 text-[13px] text-[#8e8ea0]">
                    You have access to all features and maximum credits.
                  </p>
                </div>
              ) : (
                availablePlans.map((plan) => {
                  const isCurrent = currentPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="relative rounded-xl border border-white/10 bg-[#131313] p-4"
                    >
                      {plan.popular && !isCurrent && (
                        <span className="absolute right-4 top-4 text-[10px] font-medium text-[#8e8ea0] border border-white/10 rounded-full px-2 py-0.5">
                          Most popular
                        </span>
                      )}

                      <h3 className="text-[15px] font-medium text-[#ececec]">
                        {plan.name}
                      </h3>
                      <p className="mt-1.5">
                        <span className="text-[22px] font-semibold text-[#ececec]">
                          {plan.displayPrice || plan.price}
                        </span>
                        <span className="text-[13px] text-[#8e8ea0]">
                          {plan.period}
                        </span>
                      </p>
                      {plan.note && (
                        <p className="mt-1 text-[11px] text-[#8e8ea0]">
                          {plan.note}
                        </p>
                      )}

                      <ul className="mt-3.5 space-y-2">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-[13px] text-[#c5c5c5]"
                          >
                            <Check
                              size={14}
                              className="text-[#8e8ea0] mt-0.5 shrink-0"
                            />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        disabled={isCurrent || !!loadingPlan}
                        onClick={() => handleUpgrade(plan)}
                        className={`mt-4 w-full rounded-lg py-2 text-[13.5px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 ${
                          isCurrent
                            ? 'bg-white/5 text-[#8e8ea0] cursor-not-allowed border border-white/10'
                            : 'bg-[#ececec] text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {loadingPlan === plan.id && (
                          <Loader2 size={14} className="animate-spin" />
                        )}
                        {isCurrent
                          ? 'Current plan'
                          : plan.buttonText || 'Upgrade'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10">
              <p className="text-[11.5px] text-[#8e8ea0]">
                Credits are used for image, PDF, PPT and AI generation.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
