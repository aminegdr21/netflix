import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🚀 مانساش تزيد axios
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const Home = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // 🚀 العساس: يلا كان ديجا مكونيكطي (عندو Token/Session)، غانلوحوه نيشان لـ Browse
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuth) {
      navigate('/browse', { replace: true });
    }
  }, [navigate]);

  // 🚀 الدالة السحرية لي كتسول الباكاند واش الإيميل كاين
  const handleGetStarted = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email === '') {
      setError(true);
      return;
    } 
    
    setError(false);

    try {
      // كندقو على الباكاند باش نفحصو الإيميل
      const response = await axios.post(`${BACKEND_URL}/auth/check-email`, { email });

      if (response.data.exists) {
        // 🚀 يلا الإيميل كاين، كنلوحوه لـ Login وكنصيفطو معاه الإيميل باش يلقاه واجد فـ الخانة
        navigate('/login', { state: { email } });
      } else {
        // 🚀 يلا الإيميل جديد، كنصيفطوه يتسجل
        navigate('/signup', { state: { email } });
      }
    } catch (err) {
      console.error("Error checking email:", err);
      // يلا طاح السيرفر أو وقع مشكل، كاحتياط كنلوحوه لـ signup
      navigate('/signup', { state: { email } });
    }
  };

  // دالة جديدة: كتخدم غير كيسالي الكتيبه ويكليكي برا الخانة
  const handleBlur = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // كانقلبو واش كتب شي حاجة والكتبة غالطة
    if (email.length > 0 && !emailRegex.test(email)) {
      setError(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-['Netflix_Sans','Helvetica_Neue',Helvetica,Arial,sans-serif]">
      
      {/* صورة الخلفية */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/435e8bb8-7f1b-49cb-8da8-bff997124294/web/US-en-20260511-TRIFECTA-perspective_faa2ba65-d9fe-44bc-b4e0-f702a991adaa_large.jpg')` }}
      ></div>
      
      {/* الضبابة */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>

      <div className="relative z-10 flex flex-col h-screen">
        
      {/* Navbar */}
        <header className="relative z-50 flex justify-between items-center px-5 md:px-36 py-6 w-full">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
            alt="Netflix Logo" 
            className="w-[120px] md:w-[150px] cursor-pointer"
          />
          
          <div className="flex gap-4 items-center">
            <div className="hidden sm:flex items-center gap-2 bg-[#161616]/80 border border-gray-500 rounded px-3 py-1.5 hover:ring-2 hover:ring-white transition cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM10.5 8C10.5 10.435 9.57279 12.637 8 13.882C6.42721 12.637 5.5 10.435 5.5 8C5.5 5.56505 6.42721 3.36302 8 2.11804C9.57279 3.36302 10.5 5.56505 10.5 8ZM13.882 8C13.882 5.8679 12.8398 3.97827 11.1969 2.80287C11.6669 4.35418 11.95 6.11833 11.95 8C11.95 9.88167 11.6669 11.6458 11.1969 13.1971C12.8398 12.0217 13.882 10.1321 13.882 8ZM4.8031 2.80287C3.16016 3.97827 2.11804 5.8679 2.11804 8C2.11804 10.1321 3.16016 12.0217 4.8031 13.1971C4.3331 11.6458 4.05 9.88167 4.05 8C4.05 6.11833 4.3331 4.35418 4.8031 2.80287Z"></path>
              </svg>
              <select className="bg-transparent text-white text-sm font-medium focus:outline-none appearance-none pr-2">
                <option className="text-black">English</option>
              </select>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.6464 6.35355L8 10L4.35355 6.35355L5.06066 5.64645L8 8.58579L10.9393 5.64645L11.6464 6.35355Z"></path>
              </svg>
            </div>
            
            <button 
              onClick={() => navigate('/login')}
              className="relative z-50 bg-[#e50914] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-red-700 transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col justify-center items-center text-center px-4 mt-[-80px] z-10">
          
          <h1 className="text-white text-[2.5rem] sm:text-[3rem] md:text-[4rem] font-black leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
            Unlimited movies, TV<br className="hidden sm:block" /> shows, and more
          </h1>
          
          <p className="text-white text-lg sm:text-2xl font-medium mb-6 drop-shadow-md">
            Ready to watch for free? Free for 30 days, then USD 8.99/month. Cancel anytime.
          </p>
          
          <p className="text-white text-base sm:text-lg mb-4 drop-shadow-md">
            Ready to watch? Enter your email to create or restart your membership.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[650px] mt-2 justify-center items-start">
            
            <div className="flex flex-col w-full sm:w-[400px]">
              <div className="relative w-full">
                <input 
                  type="text" 
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(false);
                  }}
                  onBlur={handleBlur} 
                  className={`block w-full h-[56px] px-4 pt-5 pb-1 bg-[#161616]/70 border ${error ? 'border-[#eb3942]' : 'border-gray-500'} rounded text-white text-base focus:outline-none focus:ring-2 focus:ring-white peer appearance-none`}
                  placeholder=" "
                />
                <label 
                  htmlFor="email" 
                  className="absolute text-gray-400 font-medium duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 cursor-text"
                >
                  Email address
                </label>
              </div>
              
              {error && (
                <div className="flex items-center gap-1 text-[#eb3942] text-[13px] mt-2 font-medium pl-1 text-left">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z" fill="currentColor"></path>
                  </svg>
                  Please enter a valid email address.
                </div>
              )}
            </div>

            <button 
              onClick={handleGetStarted}
              className="bg-[#e50914] text-white h-[56px] px-6 rounded font-bold text-2xl flex items-center justify-center hover:bg-red-700 transition w-full sm:w-[220px]"
            >
              Get Started <span className="ml-2 text-3xl font-light">›</span>
            </button>
            
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;