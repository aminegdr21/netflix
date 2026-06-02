import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Membership'); 
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuth) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    setUserData(user);
  }, [navigate]);

  if (!userData) return null;

  const activeProfile = JSON.parse(localStorage.getItem('activeProfile')) || userData.profiles[0];

  // ==========================================
  // 🚀 دوال الفورماطاج ديال التواريخ والكارطة
  // ==========================================
  
  // 1. تاريخ التسجيل (مثال: October 2026)
  const memberSince = userData.createdAt 
    ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  // 2. تاريخ الخلاص الجاي أو نهاية الفابور (مثال: 15 June 2026)
  const nextPaymentDate = userData.trialEndDate 
    ? new Date(userData.trialEndDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Pending';

  // 3. جبدان 4 الأرقام اللخرين ديال الكارطة
  const cardLast4 = userData.cardNumber ? userData.cardNumber.slice(-4) : '****';

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-['Inter',_sans-serif] text-[#333]">
      
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-12">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
          alt="Netflix" 
          className="h-6 cursor-pointer" 
          onClick={() => navigate('/browse')} 
        />
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/browse')}>
          <img src={activeProfile?.img} alt="Profile" className="w-8 h-8 rounded" />
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto pt-10 px-4 pb-20 flex flex-col md:flex-row gap-12">
        
        <aside className="w-full md:w-[250px] flex-shrink-0">
          <button onClick={() => navigate('/browse')} className="flex items-center gap-2 text-[15px] font-medium hover:underline mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Netflix
          </button>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'Overview', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> },
              { id: 'Membership', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path> },
              { id: 'Security', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path> },
              { id: 'Devices', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> },
              { id: 'Profiles', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left ${activeTab === item.id ? 'font-bold text-black' : 'font-medium text-gray-600 hover:bg-gray-200'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">{item.icon}</svg>
                {item.id}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-grow max-w-[800px]">
          <h1 className="text-[32px] font-bold mb-1">{activeTab}</h1>
          
          {/* --- 1. صفحة Membership --- */}
          {activeTab === 'Membership' && (
            <>
              <p className="text-gray-500 mb-6">Membership details</p>
              
              {/* 🚀 البادج الأحمر ديال Member Since */}
              <div className="bg-[#e50914] text-white text-[14px] font-bold w-fit px-4 py-1.5 rounded-t-md">
                Member since {memberSince}
              </div>

              <div className="bg-white border border-gray-300 rounded-b-lg rounded-tr-lg overflow-hidden mb-8 shadow-sm">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <div>
                    {/* 🚀 جبدنا الخطة الحقيقية د اليوزر */}
                    <h3 className="text-[18px] font-bold">{userData.plan || 'Premium'} plan</h3>
                    <p className="text-gray-500 text-[14px]">4K video resolution with spatial audio, advert-free watching and more.</p>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <span className="font-bold text-[16px]">Change plan</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <div className="p-6 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <div>
                    <span className="font-bold text-[16px] block">Buy an extra member slot</span>
                    <span className="text-gray-500 text-[14px]">Share your Netflix with someone who doesn't live with you.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 text-[12px] font-bold px-2 py-0.5 rounded">New</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              </div>

              <p className="text-gray-500 mb-2">Payment Info</p>
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  {/* 🚀 كتبدل حسب واش فابور ولا كيخلص دابا */}
                  <span className="font-bold text-[16px] block mb-1">
                    {userData.subscriptionStatus === 'Trial' ? 'Free trial ends:' : 'Next payment:'}
                  </span>
                  <span className="text-gray-500 text-[15px] block mb-3">{nextPaymentDate}</span>
                  <div className="flex items-center gap-2">
                    {/* 🚀 حطينا 4 الأرقام اللخرين ديال الكارطة لي دخل */}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Card" className="w-8" />
                    <span className="text-[15px] font-medium">•••• •••• •••• {cardLast4}</span>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <span className="font-bold text-[16px]">Manage payment method</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <div className="p-6 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <span className="font-bold text-[16px]">View payment history</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>

              <button className="w-full py-4 bg-white border border-gray-300 text-[#e50914] font-bold rounded-lg hover:bg-gray-50 transition shadow-sm">
                Cancel membership
              </button>
            </>
          )}

          {/* --- 2. صفحة Security --- */}
          {activeTab === 'Security' && (
            <>
              <p className="text-gray-500 mb-6">Account Details</p>
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-8 shadow-sm">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <span className="font-bold text-[16px]">Password</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <div>
                      <span className="font-bold text-[16px] block">Email</span>
                      <span className="text-gray-500 text-[14px]">{userData.email}</span>
                      <div className="flex items-center gap-1 mt-1 text-green-700 text-[12px] font-bold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg> Verified
                      </div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <div className="p-6 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    <div>
                      <span className="font-bold text-[16px] block">Mobile phone</span>
                      <span className="text-gray-500 text-[14px]">{userData.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
              
              <button className="w-full py-4 bg-white border border-gray-300 text-[#e50914] font-bold rounded-lg hover:bg-gray-50 transition shadow-sm">
                Delete Account
              </button>
            </>
          )}

          {/* --- 3. صفحة Profiles --- */}
          {activeTab === 'Profiles' && (
            <>
              <p className="text-gray-500 mb-6">Parental Controls and Permissions</p>
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-8 shadow-sm">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <div>
                      <span className="font-bold text-[16px] block">Adjust parental controls</span>
                      <span className="text-gray-500 text-[14px]">Set age ratings, block titles</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>

              <p className="text-gray-500 mb-2">Profile Settings</p>
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                {userData.profiles.map((profile, index) => (
                  <div key={index} onClick={() => navigate('/manage-profile', { state: { profile, index, isNew: false } })} className={`p-5 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition ${index !== userData.profiles.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center gap-4">
                      <img src={profile.profilePic || profile.img} alt={profile.name} className="w-10 h-10 rounded" />
                      <span className="font-bold text-[16px]">{profile.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeProfile?.name === profile.name && <span className="bg-blue-100 text-blue-800 text-[12px] font-bold px-2 py-0.5 rounded">Your profile</span>}
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* يلا كليكا على Overview ولا Devices */}
          {(activeTab === 'Overview' || activeTab === 'Devices') && (
            <div className="py-20 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              <h2 className="text-[20px] font-bold text-[#333]">Coming Soon</h2>
              <p>This section is currently under development.</p>
            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default Account;