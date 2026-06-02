import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProfileSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isNew = location.state?.isNew || false;
  const profile = location.state?.profile || { name: '', img: '' };
  const profileIndex = location.state?.index;

  const availableAvatars = [
    'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png',
    'https://mir-s3-cdn-cf.behance.net/project_modules/disp/366be133850498.56ba69ac36858.png',
    'https://mir-s3-cdn-cf.behance.net/project_modules/disp/64623a33850498.56ba69ac2a6f7.png',
    'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
    'https://pro2-bar-s3-cdn-cf4.myportfolio.com/project_modules/disp/1bdc9a33850498.56ba69ac2ba5b.png',
    'https://mir-s3-cdn-cf.behance.net/project_modules/disp/bf6e4a33850498.56ba69ac322d4.png',
    'https://pbs.twimg.com/profile_images/1356333120992149505/5_2kuzaR_400x400.jpg',
    'https://i.pinimg.com/originals/b6/77/cd/b677cd1cde292f261166533d6fe75872.png'
  ];

  const [name, setName] = useState(isNew ? '' : profile.name);
  const [avatar, setAvatar] = useState(isNew ? availableAvatars[0] : profile.img);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // 🚀 State جديدة باش نبينو الإيرور بطريقة زوينة عوض alert
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setErrorMsg(''); // كنمسحو الإيرور القديم
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token'); 

      let updatedProfiles = [...user.profiles];

      if (isNew) {
        updatedProfiles.push({ name: name, profilePic: avatar, myList: [] });
      } else {
        updatedProfiles[profileIndex] = { ...updatedProfiles[profileIndex], name: name, profilePic: avatar };
      }

      const response = await axios.put(
        `${BACKEND_URL}/users/${user._id}`, 
        { profiles: updatedProfiles },
        { 
          headers: { 
            token: `Bearer ${token}`,
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/browse');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // 🚀 اللوجيك الاحترافي: يلا كان الساروت ماينش (403 أو 401)، كنفورماطيو الجلسة ونردوه لـ Login بسكات
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        localStorage.clear();
        navigate('/login', { state: { error: 'Your session has expired. Please sign in again.' } });
      } else {
        setErrorMsg('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token'); 

      const updatedProfiles = user.profiles.filter((_, idx) => idx !== profileIndex);

      const response = await axios.put(
        `${BACKEND_URL}/users/${user._id}`, 
        { profiles: updatedProfiles },
        { headers: { token: `Bearer ${token}`, Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/browse');
    } catch (error) {
      console.error('Error deleting profile:', error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        localStorage.clear();
        navigate('/login', { state: { error: 'Your session has expired. Please sign in again.' } });
      } else {
        setErrorMsg('Failed to delete profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
    }
  };

  // ==========================================
  // 🚀 1. شاشة اختيار الصور (Avatars Selector)
  // ==========================================
  if (showAvatarSelector) {
    return (
      <div className="min-h-screen bg-[#141414] text-white font-['Inter',_sans-serif]">
        <div className="flex items-center gap-4 p-6 md:px-12 border-b border-gray-800">
          <button onClick={() => setShowAvatarSelector(false)} className="hover:text-gray-400 transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-bold leading-tight">Edit Profile</h1>
            <h2 className="text-[16px] text-gray-400">Choose a profile icon.</h2>
          </div>
        </div>
        
        <div className="p-6 md:px-12 max-w-[1200px] mx-auto pb-20">
          <h3 className="text-[20px] font-medium mb-6">The Classics</h3>
          <div className="flex flex-wrap gap-4 justify-start">
            {availableAvatars.map((av, index) => (
              <img 
                key={index} 
                src={av} 
                alt="Avatar" 
                onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' }}
                onClick={() => {
                  setAvatar(av);
                  setShowAvatarSelector(false);
                }}
                className={`w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded object-cover cursor-pointer transition-transform duration-200 hover:scale-105 border-2 ${avatar === av ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-['Inter',_sans-serif] relative">
      
      {/* ========================================== */}
      {/* 🚀 2. الـ Modal ديال نيتفليكس */}
      {/* ========================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-md max-w-[620px] w-full p-8 md:p-10 relative shadow-2xl flex flex-col items-center text-center">
            
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 text-black hover:opacity-60 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <h2 className="text-[28px] md:text-[36px] font-bold text-black mb-6">Delete profile?</h2>

            <div className="w-[110px] h-[110px] rounded overflow-hidden mb-3">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[18px] font-bold text-black mb-6 block">{name}</span>

            <p className="text-gray-600 text-[15px] md:text-[16px] max-w-[85%] leading-relaxed mb-8">
              This profile's history – including My List, ratings and activity – will be gone forever, and you won't be able to access it again.
            </p>

            <div className="w-full h-[1px] bg-gray-200 mb-6"></div>

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="w-full h-[48px] bg-white border border-gray-300 text-[#c11119] font-bold text-[16px] hover:bg-gray-50 transition rounded-[2px]"
              >
                {isSaving ? 'Deleting...' : 'Delete Profile'}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="w-full h-[48px] bg-[#e6e6e6] text-black font-bold text-[16px] hover:bg-gray-300 transition rounded-[2px]"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- الواجهة البيضاء الرئيسية (Settings) --- */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center px-6 md:px-12">
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-6 cursor-pointer" onClick={() => navigate('/browse')} />
      </header>

      <main className="max-w-[800px] mx-auto pt-10 px-4 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/browse')} className="p-2 hover:bg-gray-200 rounded-full transition">
            <svg className="w-6 h-6 text-[#333]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <h1 className="text-[32px] font-bold text-[#333]">{isNew ? 'Add Profile' : 'Manage profile and preferences'}</h1>
        </div>

        {/* 🚀 يلا وقع شي مشكل (غير 403) كيبان الإيرور هنا أنيق */}
        {errorMsg && (
          <div className="bg-[#ffa00a] text-black p-4 rounded mb-6 font-medium flex items-center gap-2">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
             {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full">
              <div 
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => setShowAvatarSelector(true)}
              >
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' }}
                  className="w-14 h-14 md:w-16 md:h-16 rounded opacity-90 group-hover:opacity-50 transition object-cover" 
                />
                <svg className="absolute inset-0 m-auto w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </div>
              
              <div className="flex flex-col flex-grow">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Name"
                  className="text-[18px] font-bold text-[#333] border-b border-transparent hover:border-gray-300 focus:border-black focus:outline-none bg-transparent w-full md:w-[70%] mb-1 transition-colors pb-1" 
                />
                <span className="text-[13px] text-gray-500">Edit personal and contact info</span>
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={isSaving || !name.trim()}
              className="bg-black text-white px-6 py-2 rounded text-[15px] font-medium hover:bg-gray-800 transition disabled:opacity-50 flex-shrink-0 w-full md:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {!isNew && (
            <div className="p-6 flex items-center justify-between cursor-not-allowed opacity-60">
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <div className="flex flex-col">
                  <span className="text-[16px] font-bold text-[#333]">Profile lock</span>
                  <span className="text-[13px] text-gray-500">Off</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </div>
          )}
        </div>

        {!isNew && (
          <div className="mt-8">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-[#c11119] font-medium text-[16px] py-4 hover:bg-gray-50 transition rounded-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Profile
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default ProfileSettings;