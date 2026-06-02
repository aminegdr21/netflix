import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios'; // 🚀 رجعناها صحيح دابا 100%
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================
  // 🚀 1. دوال التشفير وفك التشفير (URL State)
  // ==========================================
  const encodeState = (data) => btoa(encodeURIComponent(JSON.stringify(data)));
  const decodeState = (str) => {
    try { return JSON.parse(decodeURIComponent(atob(str))); } catch(e) { return {}; }
  };

  // كنجبدو الداتا من الرابط يلا كانت
  const urlStateStr = searchParams.get('serverState');
  const urlState = urlStateStr ? decodeState(urlStateStr) : {};

  // المتغيرات الأساسية كنجبدوهم من الرابط (أو من Home يلا يلاه دخلنا)
  const step = urlState.step || 1;
  const isAccountCreated = urlState.isCreated || false;
  const userId = urlState.uid || null;
  const [email, setEmail] = useState(urlState.email || location.state?.email || "");

  // 🚀 زدت هاد العساس هنا باش مايخليش لي مكونيكطي يرجع لصفحة التسجيل
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuth) {
      navigate('/browse', { replace: true });
    }
  }, [navigate]);

  // دالة باش نبدلو الخطوة ونزيدوها فـ الرابط (باش الـ Back button يخدم)
  const goToStep = (newStep, created = isAccountCreated, uid = userId) => {
    const stateObj = { step: newStep, isCreated: created, uid: uid, email: email };
    setSearchParams({ serverState: encodeState(stateObj) });
  };

  // 🚀 دالة الخروج (Sign Out) من الهيدر وسط خطوات التسجيل
  const handleHeaderSignOut = () => {
    localStorage.clear(); // كنمسحو كاع الداتا المؤقتة
    navigate('/', { replace: true }); // كنرجعوه لـ Home
  };

  // ==========================================
  // 🚀 2. الـ States المحلية ديال الخانات
  // ==========================================
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Premium');

  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 

  const [selectedCountry, setSelectedCountry] = useState({ code: '+1', flag: '🇺🇸' });
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [profiles, setProfiles] = useState(['', '', '', '', '']);
  const [selectedMovies, setSelectedMovies] = useState([]);
  
  const [cardErrors, setCardErrors] = useState({});
  const [cardType, setCardType] = useState('');

  // ==========================================
  // 🚀 3. دوال الفورماطاج والـ Validation
  // ==========================================
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    let type = '';
    if (/^4/.test(value)) type = 'visa';
    else if (/^5[1-5]/.test(value)) type = 'mastercard';
    else if (/^3[47]/.test(value)) type = 'amex';
    else if (/^6/.test(value)) type = 'discover';
    setCardType(type);

    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    let maxLength = type === 'amex' ? 17 : 19; 
    setCardNumber(formatted.substring(0, maxLength));
    if(cardErrors.cardNumber) setCardErrors({...cardErrors, cardNumber: ''});
  };

  const handleCardNumberBlur = () => {
    if (!cardNumber) setCardErrors(prev => ({...prev, cardNumber: "Please enter a card number."}));
    else if (cardNumber.replace(/\s/g, '').length < 15) setCardErrors(prev => ({...prev, cardNumber: "Please enter a valid credit card number."}));
  };

  const handleExpirationChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    setExpirationDate(value);
    if(cardErrors.expirationDate) setCardErrors({...cardErrors, expirationDate: ''});
  };

  const handleExpirationBlur = () => {
    if (!expirationDate) setCardErrors(prev => ({...prev, expirationDate: "Please enter an expiration date."}));
    else if (expirationDate.length !== 5) setCardErrors(prev => ({...prev, expirationDate: "Please enter a valid expiration date."}));
    else {
      const [mm, yy] = expirationDate.split('/');
      const month = parseInt(mm, 10);
      const year = parseInt(yy, 10);
      const currentYearFull = new Date().getFullYear();
      const currentYear = parseInt(currentYearFull.toString().slice(-2), 10); 
      const currentMonth = new Date().getMonth() + 1;

      if (month < 1 || month > 12) setCardErrors(prev => ({...prev, expirationDate: "Please enter a valid expiration month."}));
      else if (year < currentYear || year > 51) setCardErrors(prev => ({...prev, expirationDate: `Expiration Year must be between ${currentYearFull} and 2051.`}));
      else if (year === currentYear && month < currentMonth) setCardErrors(prev => ({...prev, expirationDate: "Please enter a valid expiration date."}));
    }
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let maxLength = cardType === 'amex' ? 4 : 3;
    setCvv(value.substring(0, maxLength));
    if(cardErrors.cvv) setCardErrors({...cardErrors, cvv: ''});
  };

  const handleCvvBlur = () => {
    if (!cvv) setCardErrors(prev => ({...prev, cvv: "Please enter a CVV."}));
    else if ((cardType === 'amex' && cvv.length !== 4) || (cardType !== 'amex' && cvv.length !== 3)) setCardErrors(prev => ({...prev, cvv: "Please enter a valid CVV."}));
  };

  const validateCardForm = () => {
    let errors = {}; let isValid = true;
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) { errors.cardNumber = "Please enter a valid credit card number."; isValid = false; }
    if (!expirationDate || expirationDate.length !== 5) { errors.expirationDate = "Please enter a valid expiration date."; isValid = false; }
    else {
      const [mm, yy] = expirationDate.split('/');
      const month = parseInt(mm, 10); const year = parseInt(yy, 10);
      const currentYearFull = new Date().getFullYear();
      const currentYear = parseInt(currentYearFull.toString().slice(-2), 10); 
      const currentMonth = new Date().getMonth() + 1;
      if (month < 1 || month > 12 || year < currentYear || year > 51 || (year === currentYear && month < currentMonth)) {
        errors.expirationDate = "Please enter a valid expiration date."; isValid = false;
      }
    }
    if (!cvv || ((cardType === 'amex' && cvv.length !== 4) || (cardType !== 'amex' && cvv.length !== 3))) { errors.cvv = "Please enter a valid CVV."; isValid = false; }
    if (!nameOnCard) { errors.nameOnCard = "Name is required."; isValid = false; }
    if (!zipCode) { errors.zipCode = "Please enter a billing ZIP code."; isValid = false; }
    setCardErrors(errors); return isValid;
  };

  const handlePasswordBlur = () => {
    if (password.length === 0) setPwdError('Password is required!');
    else if (password.length < 6 || password.length > 60) setPwdError('Password should be between 6 and 60 characters.');
  };
  const handleEmailBlur = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() === '') {
      setEmailError('Email is required!');
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
    }
  };
  // ==========================================
  // 🚀 4. دوال الإرسال (Submit) مع الداتابيز
  // ==========================================
  
const handleCreateAccount = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let isValid = true;
  // فيريفيكاسيون ديال الإيميل
    if (email.trim() === '') {
      setEmailError('Email is required!');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }
   // فيريفيكاسيون ديال المودباس
    if (password.length === 0 || password.length < 6 || password.length > 60) {
      setPwdError('Password should be between 6 and 60 characters.');
      isValid = false;
    }
    if (!isValid) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/register`, {
        email: email,
        password: password
      });
      
      if(response.data) {
        // 🚀 السحر هنا: كنخبيو الساروت نيشان ملي كيتسجل الكليان
        // درت token ولا accessToken باش نضمنو يشد داكشي لي كيصيفط الباكاند
        const userToken = response.data.token || response.data.accessToken;
        if (userToken) {
          localStorage.setItem('token', userToken);
        }

        const uid = response.data._id;
        const stateStep1Created = { step: 1, isCreated: true, uid: uid, email: email };
        setSearchParams({ serverState: encodeState(stateStep1Created) }, { replace: true });
        
        setTimeout(() => {
          goToStep(2, true, uid);
        }, 50);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        setPwdError('هاد الإيميل مسجل ديجا. سير لصفحة الدخول (Login).');
      } else {
        alert('كاين مشكل فـ الباكاند! تأكد بلي السيرفر شاعل.');
      }
    }
  };

  const handleFinishSetup = async () => {
    try {
      const formattedProfiles = profiles
        .filter(name => name.trim() !== '')
        .map(name => ({ name: name, profilePic: "", myList: [] }));

      const trialPeriod = new Date();
      trialPeriod.setDate(trialPeriod.getDate() + 30);

      const updateData = { 
        plan: selectedPlan, 
        paymentMethod: 'Credit/Debit Card',
        cardNumber: cardNumber,
        expirationDate : expirationDate,
        cvv :cvv, 
        phoneNumber: selectedCountry.code + " " + phoneNumber,
        phone: phoneNumber,
        profiles: formattedProfiles,
        subscriptionStatus: "Trial", 
        trialEndDate: trialPeriod.toISOString() 
      };
      
      if (userId) {
        const res = await axios.put(`${BACKEND_URL}/users/finish-signup/${userId}`, updateData);
        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/browse', { replace: true }); 
    } catch (error) {
      console.error(error); 
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/browse', { replace: true });
    }
  };

  const toggleDevice = (deviceId) => {
    if (selectedDevices.includes(deviceId)) {
      setSelectedDevices(selectedDevices.filter(id => id !== deviceId));
    } else {
      setSelectedDevices([...selectedDevices, deviceId]);
    }
  };

  const updateProfile = (index, value) => {
    const newProfiles = [...profiles];
    newProfiles[index] = value;
    setProfiles(newProfiles);
  };

  const toggleMovie = (movieId) => {
    if (selectedMovies.includes(movieId)) setSelectedMovies(selectedMovies.filter(id => id !== movieId));
    else setSelectedMovies([...selectedMovies, movieId]);
  };

  const countries = [
    { code: '+1', flag: '🇺🇸', name: 'US' },
    { code: '+33', flag: '🇫🇷', name: 'FR' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+20', flag: '🇪🇬', name: 'EG' },
  ];

  const devicesList = [
    { id: 'tv', label: 'TV', sub: 'Smart or internet connected TVs', icon: <path d="M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm0 0V4m16 2V4M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
    { id: 'phone', label: 'Phone or Tablet', sub: 'Download the Netflix app to enjoy', icon: <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2zM6 8h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
    { id: 'computer', label: 'Computer', sub: 'Desktop or laptop', icon: <path d="M4 14V6a2 2 0 012-2h12a2 2 0 012 2v8M2 18h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
    { id: 'console', label: 'Game Console', sub: 'Connected to the internet', icon: <path d="M6 12h4m-2-2v4m8-2h.01M16 10h.01M5 8h14a3 3 0 013 3v2a3 3 0 01-3 3H5a3 3 0 01-3-3v-2a3 3 0 013-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
    { id: 'streaming', label: 'Streaming Device', sub: 'Connects your TV to the internet', icon: <path d="M6 16h4a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm8-6c0-2.21 1.79-4 4-4m-4 8c0-3.315 2.685-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
    { id: 'cable', label: 'Cable Set Top Box', sub: 'From your cable provider', icon: <path d="M4 14h16a2 2 0 002-2v-2a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2zm12-3h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> }
  ];
  
const dummyMovies = [
  {
    id: 1,
    title: 'Stranger Things',
    img: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg'
  },
  {
    id: 2,
    title: 'Money Heist',
    img: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg'
  },
  {
    id: 3,
    title: 'Emily in Paris',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500'
  },
  {
    id: 4,
    title: 'Squid Game',
    img: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg'
  },
  {
    id: 5,
    title: 'The Witcher',
    img: 'https://image.tmdb.org/t/p/w500/cZ0d3rtvXPVvuiX22sP79K3Hmjz.jpg'
  },
  {
    id: 6,
    title: 'Wednesday',
    img: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg'
  },
  {
    id: 7,
    title: 'Bridgerton',
    img: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=500'
  },
  {
    id: 8,
    title: 'Breaking Bad',
    img: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg'
  },
  {
    id: 9,
    title: 'Peaky Blinders',
    img: 'https://image.tmdb.org/t/p/w500/bGZn5RVzMMXju4ev7xbl1aLdXqq.jpg'
  },
  {
    id: 10,
    title: 'Lucifer',
    img: 'https://image.tmdb.org/t/p/w500/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg'
  },
];

  const plansData = [
    { id: 'Standard with ads', title: 'Standard with ads', resolution: '1080p', gradient: 'bg-gradient-to-br from-[#1e3a8a] to-[#701a75]', price: 'USD 8.99', quality: 'Good', resDetails: '1080p (Full HD)', devices: 'TV, computer, mobile phone, tablet', screens: '2', downloads: '2', ads: 'Less than you might think', audio: null },
    { id: 'Standard', title: 'Standard', resolution: '1080p', gradient: 'bg-gradient-to-br from-[#4a148c] to-[#c2185b]', price: 'USD 19.99', quality: 'Good', resDetails: '1080p (Full HD)', devices: 'TV, computer, mobile phone, tablet', screens: '2', downloads: '2', ads: 'No ads', audio: null },
    { id: 'Premium', title: 'Premium', resolution: '4K + HDR', gradient: 'bg-gradient-to-br from-[#1a237e] via-[#880e4f] to-[#b71c1c]', price: 'USD 26.99', quality: 'Best', resDetails: '4K (Ultra HD) + HDR', devices: 'TV, computer, mobile phone, tablet', screens: '4', downloads: '6', ads: 'No ads', audio: 'Included' }
  ];

  const currentPlan = plansData.find(plan => plan.id === selectedPlan);

  const ErrorIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-[2px] flex-shrink-0"><path fillRule="evenodd" clipRule="evenodd" d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z" fill="currentColor"></path></svg>
  );

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');`}
      </style>

      <div className={`min-h-screen ${step === 10 ? 'bg-[#141414] text-white' : 'bg-white text-[#333]'} font-['Inter',_sans-serif]`}>
        
        {/* Navbar */}
        <header className={`h-[90px] border-b ${step === 10 ? 'border-gray-800 bg-[#141414]' : 'border-[#e6e6e6] bg-white'} flex justify-between items-center px-6 md:px-[5%]`}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix Logo" className="w-[120px] md:w-[167px] cursor-pointer" onClick={() => navigate('/')} />
          
          {/* 🚀 بوطونة Sign Out تفاعلية دابا فـ كاع الخطوات */}
          <button 
            onClick={step === 7 ? undefined : handleHeaderSignOut}
            className={`font-bold text-[19px] hover:underline ${step === 10 ? 'text-white' : 'text-[#333]'}`}
          >
            {step === 7 ? 'Help' : 'Sign Out'}
          </button>
        </header>

        <main className={`flex justify-center mt-6 md:mt-8 px-4 pb-20 ${step === 4 ? 'w-full' : ''}`}>
          <div className={`w-full ${step === 4 ? 'max-w-[1000px]' : 'max-w-[500px]'}`}>
            
            {/* ======================= الخطوة 1 ======================= */}
            {step === 1 && !isAccountCreated && (
               <div className="flex flex-col text-left max-w-[440px] mx-auto">
                 <span className="text-[13px] font-medium mb-1">Step <b>2</b> of <b>3</b></span>
                 <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-3 text-[#333]">Create a password to start your membership</h1>
                 <p className="text-[18px] mb-1 text-[#333]">Just a few more steps and you're done!</p>
                 <p className="text-[18px] mb-4 text-[#333]">We hate paperwork, too.</p>
                 <div className="flex flex-col">
                   <div className="relative w-full mb-3"> 
                  <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        onBlur={handleEmailBlur}
                        className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${emailError ? 'border-[#eb3942]' : 'border-[#8c8c8c]'} focus:border-blue-500 rounded-[2px] text-black text-[16px] font-medium focus:outline-none appearance-none peer`} 
                        placeholder=" "
                      />
                     <label className="absolute text-gray-500 font-medium text-[12px] top-1.5 left-4">Email</label>
                       {emailError && (
                    <div className="flex items-center gap-1.5 text-[#eb3942] text-[13px] mt-1.5 font-medium pl-0.5">
                      <ErrorIcon />
                      {emailError}
                    </div>
                  )}
                   </div>
                 
                   <div className="relative w-full">
                     <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setPwdError(''); }} onBlur={handlePasswordBlur} className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${pwdError ? 'border-[#eb3942]' : 'border-[#8c8c8c]'} rounded-[2px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} placeholder=" " />
                     <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Password</label>
                   </div>
                   {pwdError && (
                     <div className="flex items-center gap-1.5 text-[#eb3942] text-[13px] mt-1.5 font-medium pl-0.5">
                       <ErrorIcon />
                       {pwdError}
                     </div>
                   )}
                   <div className="flex items-center gap-3 mt-4 mb-6">
                     <input type="checkbox" defaultChecked className="w-[22px] h-[22px] border-gray-400 rounded-sm accent-black cursor-pointer shrink-0" />
                     <span className="text-[16px] text-[#333] leading-none mt-[2px]">Please do not email me Netflix special offers.</span>
                   </div>
                   <button onClick={handleCreateAccount} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-medium text-[24px] hover:bg-red-700 transition">Next</button>
                 </div>
               </div>
            )}

            {/* ======================= الخطوة 1 (شاشة Account Created) ======================= */}
            {step === 1 && isAccountCreated && (
              <div className="flex flex-col text-left max-w-[440px] mx-auto mt-4">
                <span className="text-[13px] font-medium mb-1">Step <b>2</b> of <b>3</b></span>
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-4 text-[#333]">Account Created</h1>
                <p className="text-[17px] mb-4 text-[#333]">Use this email to access your account:</p>
                <p className="text-[17px] font-bold mb-8 text-[#333]">{emailFromHome}</p>
                <button onClick={() => goToStep(2)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-medium text-[24px] hover:bg-red-700 transition">Next</button>
              </div>
            )}

            {/* ======================= الخطوة 2 ======================= */}
            {step === 2 && ( 
              <div className="flex flex-col items-center text-center mt-12 max-w-[440px] mx-auto">
                <div className="border-2 border-[#e50914] rounded-full p-3 mb-6">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#e50914]">
                      <path d="M12 22S20 18 20 10V5L12 2L4 5V10C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="w-full text-left">
                  <span className="text-[13px] font-medium mb-1 text-[#333]">Step <b>2</b> of <b>4</b></span>
                  <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-[#333]">Great, now let's verify your email</h1>
                  <p className="text-[17px] mb-4 text-[#333]">Click the link we sent to <b>{emailFromHome || 'your email'}</b> to verify.</p>
                  <p className="text-[17px] mb-6 text-[#333]">Verifying your email will improve account security and help you receive important Netflix communications.</p>
                  <button onClick={() => goToStep(3)} className="bg-[#e6e6e6] text-black w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-gray-300 transition">Skip</button>
                </div>
              </div> 
            )}

            {/* ======================= الخطوة 3 ======================= */}
            {step === 3 && ( 
              <div className="flex flex-col items-center text-center mt-12 max-w-[340px] mx-auto">
                <div className="border-2 border-[#e50914] rounded-full p-2 mb-6">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#e50914]"><path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="w-full text-left">
                  <span className="text-[13px] font-medium mb-1 flex justify-center text-[#333]">Step <b>3</b> of <b>4</b></span>
                  <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-6 text-center text-[#333]">Choose your plan</h1>
                  
                  <ul className="mb-8 flex flex-col gap-5 text-[18px] text-[#333] font-medium">
                    <li className="flex gap-3 items-start"><svg className="w-7 h-7 text-[#e50914] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>No commitments, cancel anytime.</li>
                    <li className="flex gap-3 items-start"><svg className="w-7 h-7 text-[#e50914] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Endless entertainment for one low price.</li>
                    <li className="flex gap-3 items-start"><svg className="w-7 h-7 text-[#e50914] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Enjoy Netflix on all your devices.</li>
                  </ul>
                  <button onClick={() => goToStep(4)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-medium text-[24px] hover:bg-red-700 transition">Next</button>
                </div>
              </div> 
            )}

            {/* ======================= الخطوة 4 (الأثمنة) ======================= */}
            {step === 4 && (
              <div className="flex flex-col text-left mt-2 max-w-[1000px] mx-auto">
                <span className="text-[13px] font-medium mb-1 text-[#333]">Step <b>3</b> of <b>4</b></span>
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-6 text-[#333]">Choose the plan that's right for you</h1>

                {/* واجهة الموبايل */}
                <div className="block md:hidden">
                  <div className="flex gap-3 mb-6 overflow-x-auto pb-2 snap-x">
                    {plansData.map((plan) => (
                      <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`flex-shrink-0 w-[110px] h-[110px] p-3 rounded-xl cursor-pointer relative snap-center transition-all ${selectedPlan === plan.id ? `text-white ${plan.gradient} shadow-md border-none` : 'bg-white text-[#333] border border-gray-300 opacity-80'}`}>
                        <h2 className="text-[15px] font-bold leading-tight mb-1">{plan.title}</h2>
                        <p className={`text-[13px] font-medium ${selectedPlan === plan.id ? 'opacity-90' : 'text-gray-500'}`}>{plan.resolution}</p>
                        {selectedPlan === plan.id && ( <div className="absolute bottom-2 right-2 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md"><svg width="10" height="10" viewBox="0 0 16 16" fill="#e50914" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M14.4309 3.56911L6.00003 12L1.56912 7.56911L2.63028 6.50795L6.00003 9.87771L13.3698 2.50795L14.4309 3.56911Z"></path></svg></div> )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col mb-8">
                    <div className="flex justify-between py-4 border-b border-gray-200">
                      <span className="text-[#737373] text-[14px] font-medium w-1/2">Monthly price</span>
                      <div className="w-1/2 text-right">
                        <span className="line-through text-gray-400 text-[14px] mr-2">{currentPlan.price}</span>
                        <span className="text-[#e50914] text-[15px] font-bold">Gratuit (1er mois)</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">Ensuite {currentPlan.price}/month</p>
                      </div>
                    </div>
                    <div className="flex justify-between py-4 border-b border-gray-200"><span className="text-[#737373] text-[14px] font-medium w-1/2">Video and sound quality</span><span className="text-[#333] text-[15px] font-bold w-1/2 text-right">{currentPlan.quality}</span></div>
                    <div className="flex justify-between py-4 border-b border-gray-200"><span className="text-[#737373] text-[14px] font-medium w-1/2">Resolution</span><span className="text-[#333] text-[15px] font-bold w-1/2 text-right">{currentPlan.resDetails}</span></div>
                    {currentPlan.audio && (<div className="flex justify-between py-4 border-b border-gray-200"><span className="text-[#737373] text-[14px] font-medium w-1/2">Spatial audio</span><span className="text-[#333] text-[15px] font-bold w-1/2 text-right">{currentPlan.audio}</span></div>)}
                    <div className="flex justify-between py-4 border-b border-gray-200"><span className="text-[#737373] text-[14px] font-medium w-1/2">Supported devices</span><span className="text-[#333] text-[15px] font-bold w-1/2 text-right">{currentPlan.devices}</span></div>
                    <div className="flex justify-between py-4 border-b border-gray-200"><span className="text-[#737373] text-[14px] font-medium w-1/2">Devices your household can watch at the same time</span><span className="text-[#333] text-[15px] font-bold w-1/2 text-right">{currentPlan.screens}</span></div>
                    <div className="flex justify-between py-4 border-b border-gray-200"><span className="text-[#737373] text-[14px] font-medium w-1/2">Download devices</span><span className="text-[#333] text-[15px] font-bold w-1/2 text-right">{currentPlan.downloads}</span></div>
                    <div className="flex justify-between py-4"><span className="text-[#737373] text-[14px] font-medium w-1/2">Ads</span><span className="text-[#333] text-[15px] font-bold w-1/2 text-right">{currentPlan.ads}</span></div>
                  </div>
                </div>

                {/* واجهة الديسكطوب */}
                <div className="hidden md:grid grid-cols-3 gap-4 mb-8">
                  {plansData.map((plan) => (
                    <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`relative rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${selectedPlan === plan.id ? 'border-[1px] border-gray-400 shadow-[0_4px_10px_rgba(0,0,0,0.15)] ring-1 ring-gray-400' : 'border-[1px] border-gray-200 opacity-80 hover:opacity-100'}`}>
                      <div className={`h-[110px] p-4 text-white relative ${plan.gradient}`}>
                        <h2 className="text-[20px] font-bold mb-0.5">{plan.title}</h2>
                        <p className="text-[15px] font-medium opacity-90">{plan.resolution}</p>
                        {selectedPlan === plan.id && ( <div className="absolute bottom-3 right-4 bg-white rounded-full w-[22px] h-[22px] flex items-center justify-center shadow-md"><svg width="12" height="12" viewBox="0 0 16 16" fill="#e50914" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M14.4309 3.56911L6.00003 12L1.56912 7.56911L2.63028 6.50795L6.00003 9.87771L13.3698 2.50795L14.4309 3.56911Z"></path></svg></div> )}
                      </div>
                      <div className="p-4 bg-white">
                        <div className="py-3 border-b border-gray-200">
                          <p className="text-[13px] text-[#737373] font-medium mb-1">Monthly price</p>
                          <p className="text-[16px] text-[#333] font-bold">
                            <span className="line-through text-gray-400 font-normal text-[14px] mr-2">{plan.price}</span>
                            <span className="text-[#e50914]">Gratuit</span>
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Ensuite {plan.price}/month</p>
                        </div>
                        <div className="py-3 border-b border-gray-200"><p className="text-[13px] text-[#737373] font-medium mb-1">Video and sound quality</p><p className="text-[16px] text-[#333] font-bold">{plan.quality}</p></div>
                        <div className="py-3 border-b border-gray-200"><p className="text-[13px] text-[#737373] font-medium mb-1">Resolution</p><p className="text-[16px] text-[#333] font-bold">{plan.resDetails}</p></div>
                        <div className="py-3 border-b border-gray-200"><p className="text-[13px] text-[#737373] font-medium mb-1">Supported devices</p><p className="text-[16px] text-[#333] font-bold">{plan.devices}</p></div>
                        <div className="py-3 border-b border-gray-200"><p className="text-[13px] text-[#737373] font-medium mb-1">Devices your household can watch at the same time</p><p className="text-[16px] text-[#333] font-bold">{plan.screens}</p></div>
                        <div className="pt-3 pb-1"><p className="text-[13px] text-[#737373] font-medium mb-1">Ads</p><p className="text-[16px] text-[#333] font-bold">{plan.ads}</p></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#f3f3f3] p-4 rounded text-[13px] text-[#333] flex gap-3 mb-4 items-start">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0 text-[#737373] mt-0.5" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  <p className="leading-snug">The vast majority of our TV shows and movies are available on an ad-supported plan... <a href="#" className="text-blue-600 hover:underline">Learn more about an ad-supported plan.</a></p>
                </div>

                <div className="flex justify-center">
                  <button onClick={() => goToStep(5)} className="bg-[#e50914] text-white w-full max-w-[440px] h-[64px] rounded-[3px] font-medium text-[24px] hover:bg-red-700 transition">Next</button>
                </div>
              </div>
            )}

            {/* ======================= الخطوة 5: اختيارات الدفع ======================= */}
            {step === 5 && (
              <div className="flex flex-col items-center mt-8 md:mt-12 max-w-[500px] mx-auto px-4">
                <div className="border-2 border-[#e50914] rounded-full w-[46px] h-[46px] flex items-center justify-center mb-6">
                  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px] text-[#e50914]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="11" width="10" height="9" rx="1.5" ry="1.5"></rect><path d="M9 11V7a3 3 0 016 0v4"></path><circle cx="12" cy="14.5" r="0.5" fill="currentColor" stroke="currentColor"></circle><path d="M12 15v1.5"></path></svg>
                </div>
                
                <div className="w-full text-left">
                  <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>4</b> of <b>4</b></span>
                  <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-[#333]">Choose how to pay</h1>
                  <p className="text-[17px] mb-4 text-[#333]">Your payment is encrypted and you can change how you pay anytime.</p>
                  
                  <div className="text-[17px] font-bold text-[#333] mb-6 leading-snug"><p>Secure for peace of mind.</p><p>Cancel easily online.</p></div>

                  <div className="flex justify-end items-center gap-1 mb-2 text-[13px] text-[#737373] font-medium">End-to-end encrypted <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 6V4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5V6H3.5C2.67157 6 2 6.67157 2 7.5V13.5C2 14.3284 2.67157 15 3.5 15H12.5C13.3284 15 14 14.3284 14 13.5V7.5C14 6.67157 13.3284 6 12.5 6H11.5ZM9.5 6H6.5V4.5C6.5 3.67157 7.17157 3 8 3C8.82843 3 9.5 3.67157 9.5 4.5V6Z"></path></svg></div>

                  <div className="flex flex-col gap-2">
                    <button onClick={() => goToStep(6)} className="flex items-center justify-between w-full p-4 border border-gray-300 rounded-[5px] hover:bg-gray-50 transition min-h-[64px]">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[16px] text-[#333] font-medium">Credit or Debit Card</span>
                        <div className="flex gap-1.5 items-center">
                          <img src="https://download.logo.wine/logo/Visa_Inc./Visa_Inc.-Logo.wine.png" alt="Visa" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                        </div>
                      </div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================= الخطوة 6: إدخال الكارط ======================= */}
            {step === 6 && (
              <div className="flex flex-col text-left mt-2 max-w-[440px] mx-auto px-4 md:px-0">
                
                <button onClick={() => goToStep(5)} className="flex items-center gap-1 text-[#0071eb] text-[13px] hover:underline mb-6 font-medium w-fit">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 13L5.5 8L10.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Change payment method
                </button>

                <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>4</b> of <b>4</b></span>
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-6 text-[#333]">Set up your credit or debit card</h1>

                <div className="flex gap-1.5 mb-6">
                  <img src="https://download.logo.wine/logo/Visa_Inc./Visa_Inc.-Logo.wine.png" alt="Visa" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={handleCardNumberChange}
                        onBlur={handleCardNumberBlur}
                        className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.cardNumber ? 'border-[#eb3942]' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                        placeholder=" " 
                      />
                      <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Card number</label>
                      
                      <div className="absolute right-4 top-[18px]">
                        {cardType === 'visa' && <img src="https://download.logo.wine/logo/Visa_Inc./Visa_Inc.-Logo.wine.png" alt="Visa" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {cardType === 'mastercard' && <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {cardType === 'amex' && <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {cardType === 'discover' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {!cardType && <svg className="w-[26px] h-[26px] text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>}
                      </div>
                    </div>
                    {cardErrors.cardNumber && <div className="flex items-start gap-1.5 text-[#eb3942] text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.cardNumber}</div>}
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col w-full">
                      <div className="relative w-full">
                        <input 
                          type="text" 
                          value={expirationDate} 
                          onChange={handleExpirationChange}
                          onBlur={handleExpirationBlur}
                          className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.expirationDate ? 'border-[#eb3942]' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                          placeholder=" " 
                        />
                        <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Expiration date</label>
                      </div>
                      {cardErrors.expirationDate && <div className="flex items-start gap-1.5 text-[#eb3942] text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.expirationDate}</div>}
                    </div>

                    <div className="flex flex-col w-full">
                      <div className="relative w-full">
                        <input 
                          type="text" 
                          value={cvv} 
                          onChange={handleCvvChange}
                          onBlur={handleCvvBlur}
                          className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.cvv ? 'border-[#eb3942]' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                          placeholder=" " 
                        />
                        <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">CVV</label>
                        <svg className="absolute right-4 top-[18px] w-[26px] h-[26px] text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      {cardErrors.cvv && <div className="flex items-start gap-1.5 text-[#eb3942] text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.cvv}</div>}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        value={nameOnCard} 
                        onChange={(e) => {setNameOnCard(e.target.value); if(cardErrors.nameOnCard) setCardErrors({...cardErrors, nameOnCard: ''});}}
                        onBlur={() => { if(!nameOnCard) setCardErrors(prev => ({...prev, nameOnCard: "Name is required."})) }}
                        className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.nameOnCard ? 'border-[#eb3942]' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                        placeholder=" " 
                      />
                      <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Name on card</label>
                    </div>
                    {cardErrors.nameOnCard && <div className="flex items-start gap-1.5 text-[#eb3942] text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.nameOnCard}</div>}
                  </div>

                  <div className="flex flex-col">
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        value={zipCode} 
                        onChange={(e) => {setZipCode(e.target.value); if(cardErrors.zipCode) setCardErrors({...cardErrors, zipCode: ''});}}
                        onBlur={() => { if(!zipCode) setCardErrors(prev => ({...prev, zipCode: "Please enter a billing ZIP code."})) }}
                        className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.zipCode ? 'border-[#eb3942]' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                        placeholder=" " 
                      />
                      <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">ZIP code</label>
                    </div>
                    {cardErrors.zipCode && <div className="flex items-start gap-1.5 text-[#eb3942] text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.zipCode}</div>}
                  </div>
                </div>

                {/* ملخص الفاتورة مشطب عليه */}
                <div className="bg-[#f3f3f3] p-4 rounded-[4px] mt-4 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-[16px] text-[#333] font-bold">
                      <span className="line-through text-gray-400 font-normal mr-2">{currentPlan.price}</span>
                      <span className="text-[#e50914]">USD 0.00</span> (1er mois gratuit)
                    </p>
                    <p className="text-[14px] text-[#737373]">Ensuite {currentPlan.price}/month • {currentPlan.title}</p>
                  </div>
                  <button onClick={() => goToStep(4)} className="text-[#0071eb] font-bold hover:underline text-[15px]">Change</button>
                </div>

                <p className="text-[13px] text-[#737373] mb-6 leading-snug">
                  By clicking the "Start Membership" button below, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>, <a href="#" className="text-blue-600 hover:underline">Privacy Statement</a>, that you are over 18, and that <b>Netflix will automatically continue your membership and charge the membership fee (currently {currentPlan.price}/month plus applicable taxes) to your payment method until you cancel. You may cancel at any time to avoid future charges. To cancel, go to Account and click "Manage Membership."</b>
                </p>

                <button 
                  onClick={() => { if(validateCardForm()) goToStep(7); }} 
                  className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition"
                >
                  Start Membership
                </button>

                <p className="text-[13px] text-[#737373] mt-8 text-center px-4">
                  This page is protected by Google reCAPTCHA to ensure you're not a bot.
                </p>

              </div>
            )}

            {/* ======================= Step 7: صفحة الترحيب (Welcome) ======================= */}
            {step === 7 && (
              <div className="flex flex-col text-left mt-8 max-w-[440px] mx-auto px-4 md:px-0">
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-4 text-[#333]">
                  Welcome to Netflix!
                </h1>
                <p className="text-[17px] text-[#333] mb-4">
                  You've started your membership and we emailed the details to <br/> <b>{emailFromHome || 'your email'}</b>.
                </p>
                <p className="text-[17px] text-[#333] mb-6">
                  Remember you can cancel anytime in the Account section.
                </p>

                <div className="bg-[#f3f3f3] rounded-[4px] mb-6 pb-6 pt-4 px-4 text-center border border-gray-200">
                  <span className="text-[13px] text-[#737373] uppercase tracking-wider font-medium">Set up password recovery</span>
                  <p className="text-[15px] text-[#333] mt-2 mb-4 leading-snug">
                    Your phone number will be used to help you access and recover your account. Message and data rates may apply.
                  </p>
                  
                  <div className="flex items-center w-full h-[60px] bg-white border border-[#8c8c8c] rounded-[2px] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <div className="relative flex items-center justify-center pl-3 pr-2 border-r border-gray-300 h-full cursor-pointer hover:bg-gray-50">
                      <span className="text-[18px] mr-1">{selectedCountry.flag}</span>
                      <span className="text-[16px] text-[#333]">{selectedCountry.code}</span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="ml-1 text-gray-500"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <select 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        value={selectedCountry.code}
                        onChange={(e) => {
                          const code = e.target.value;
                          const country = countries.find(c => c.code === code);
                          if(country) setSelectedCountry(country);
                        }}
                      >
                        {countries.map(c => (
                          <option key={c.code} value={c.code}>{c.name} {c.code}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative w-full h-full">
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="block w-full h-full px-3 pt-5 pb-1 text-black text-[16px] focus:outline-none peer appearance-none bg-transparent" 
                        placeholder=" " 
                      />
                      <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">
                        Mobile phone number
                      </label>
                    </div>
                  </div>
                </div>

                <button onClick={() => goToStep(8)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition">Next</button>
              </div>
            )}

            {/* ======================= Step 8: إعداد الأجهزة ======================= */}
            {step === 8 && (
              <div className="flex flex-col text-left mt-4 mx-auto px-4 md:px-0 max-w-[600px]">
                <span className="text-[13px] font-medium mb-1 text-[#333]">Step <b>1</b> of <b>5</b></span>
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-3 text-[#333]">
                  What devices will you be watching on?
                </h1>
                <p className="text-[17px] text-[#333] mb-6 font-medium">
                  You can watch Netflix on any of these devices. <b className="font-bold">Select all that apply.</b>
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {devicesList.map((device) => {
                    const isSelected = selectedDevices.includes(device.id);
                    return (
                      <div 
                        key={device.id} 
                        onClick={() => toggleDevice(device.id)}
                        className={`relative flex flex-col items-center text-center p-4 border-2 rounded-[4px] cursor-pointer transition-all duration-150 min-h-[160px] justify-center ${
                          isSelected 
                            ? 'border-[#e50914] bg-[#fdf5f5]' 
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className={`w-12 h-12 mb-3 ${isSelected ? 'text-[#e50914]' : 'text-gray-400'}`}>
                          {device.icon}
                        </svg>
                        
                        <h3 className={`text-[15px] font-bold mb-1 ${isSelected ? 'text-[#e50914]' : 'text-[#333]'}`}>{device.label}</h3>
                        <p className="text-[11px] text-gray-500 leading-tight">{device.sub}</p>

                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-[#e50914] rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-sm">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M14.4309 3.56911L6.00003 12L1.56912 7.56911L2.63028 6.50795L6.00003 9.87771L13.3698 2.50795L14.4309 3.56911Z"></path></svg>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-center max-w-[440px] mx-auto w-full">
                  <button onClick={() => goToStep(9)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition">Next</button>
                </div>
              </div>
            )}

            {/* ======================= Step 9: إضافة البروفايلات ======================= */}
            {step === 9 && (
              <div className="flex flex-col text-left mt-4 mx-auto px-4 md:px-0 max-w-[500px]">
                <span className="text-[13px] font-medium mb-1 text-[#333]">Step <b>2</b> of <b>5</b></span>
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-3 text-[#333]">Who will be watching Netflix?</h1>
                <p className="text-[17px] text-[#333] mb-4">Add a profile for up to 5 people you live with to get:</p>
                <ul className="list-disc pl-6 mb-8 text-[17px] text-[#737373] space-y-1">
                  <li>Personalized recommendations</li>
                  <li>Different settings for whoever is watching</li>
                  <li>An experience tailored to each individual</li>
                </ul>

                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <p className="text-[16px] font-bold text-[#333] mb-2">Your profile</p>
                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gray-500 flex-shrink-0" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      <input 
                        type="text" 
                        value={profiles[0]} 
                        onChange={(e) => updateProfile(0, e.target.value)} 
                        className="w-full h-[50px] px-4 bg-white border border-gray-300 rounded-[2px] text-black focus:outline-none focus:border-blue-500" 
                        placeholder="Name" 
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-[16px] font-bold text-[#333] mb-2">Add profiles?</p>
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div className="flex items-center gap-3" key={i}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gray-500 flex-shrink-0" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          <input 
                            type="text" 
                            value={profiles[i]} 
                            onChange={(e) => updateProfile(i, e.target.value)} 
                            className="w-full h-[50px] px-4 bg-white border border-gray-300 rounded-[2px] text-black focus:outline-none focus:border-blue-500" 
                            placeholder="Name" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#f3f3f3] p-4 rounded text-[13px] text-[#737373] mb-8">
                  Only people who live with you may use your account. <a href="#" className="text-blue-600 hover:underline">Learn more</a>.
                </div>

                <div className="flex justify-center max-w-[440px] mx-auto w-full">
                  <button onClick={() => goToStep(10)} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition">Next</button>
                </div>
              </div>
            )}

            {/* ======================= Step 10: اختيار الأفلام ======================= */}
            {step === 10 && (
              <div className="flex flex-col text-left mt-4 mx-auto px-4 md:px-0 max-w-[800px]">
                <span className="text-[13px] font-medium mb-1 text-gray-400">Step <b>5</b> of <b>5</b></span>
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-3 text-white">
                  {profiles[0] || 'User'}, select 3 you like.
                </h1>
                <p className="text-[17px] text-gray-400 mb-8">
                  This helps us to find TV shows and movies you'll love. Select the ones you like.
                </p>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {dummyMovies.map(movie => {
                    const isSelected = selectedMovies.includes(movie.id);
                    return (
                      <div 
                        key={movie.id} 
                        onClick={() => toggleMovie(movie.id)} 
                        className="relative aspect-[2/3] cursor-pointer rounded overflow-hidden group bg-gray-800"
                      >
                        <img src={movie.img} alt={movie.title} className={`w-full h-full object-cover transition-transform duration-300 ${isSelected ? 'scale-105 opacity-40' : 'group-hover:scale-105'}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                          <span className="text-white font-bold text-sm leading-tight drop-shadow-md">{movie.title}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12 drop-shadow-lg opacity-90">
                              <path d="M2 9h3v12H2zm19-2h-5.27l.8-3.6c.03-.13.04-.27.04-.41 0-.64-.26-1.23-.69-1.65L14.71 0l-6.85 6.85A1.99 1.99 0 007 8.24V19c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05A1.976 1.976 0 0021 11V9c0-1.1-.9-2-2-2z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-[#141414]/95 border-t border-gray-800 p-4 flex justify-center z-50 backdrop-blur-sm">
                  <button 
                    disabled={selectedMovies.length < 3}
                    onClick={handleFinishSetup} 
                    className={`w-full max-w-[440px] h-[64px] rounded-[3px] font-bold text-[24px] transition ${
                      selectedMovies.length >= 3 
                        ? 'bg-[#e50914] text-white hover:bg-red-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedMovies.length < 3 ? `Pick ${3 - selectedMovies.length} to Continue` : 'Finish'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

export default Signup;