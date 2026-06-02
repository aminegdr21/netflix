import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: 'application/json' }
});

// ==========================================
// 🚀 مكون الكارطة مع التريلر (Hover Video)
// ==========================================
const MovieCard = ({ movie, onMovieClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(async () => {
      setIsHovered(true);
      try {
        const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
        const res = await tmdbApi.get(`/${type}/${movie.id}?append_to_response=videos`);
        if (res.data.videos?.results) {
          const trailer = res.data.videos.results.find(v => v.type === 'Trailer') || res.data.videos.results[0];
          if (trailer) setTrailerKey(trailer.key);
        }
      } catch (e) { console.error(e); }
    }, 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    setTrailerKey(null);
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onMovieClick(movie)}
      className="relative flex-shrink-0 w-[150px] md:w-[240px] lg:w-[280px] aspect-[16/9] rounded overflow-hidden cursor-pointer group snap-start transition-all duration-300 hover:scale-110 hover:z-40 hover:shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-[#222]"
    >
      {isHovered && trailerKey ? (
        <iframe
          className="absolute inset-0 w-full h-full pointer-events-none scale-150"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1`}
          allow="autoplay"
        ></iframe>
      ) : (
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`} 
          alt={movie.title || movie.name} 
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/500x281/222222/555555?text=Netflix' }}
        />
      )}

      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-white font-bold text-[13px] md:text-[16px] line-clamp-1 drop-shadow-md">{movie.title || movie.name}</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#46d369] text-[10px] md:text-[12px] font-bold">{movie.vote_average ? `${(movie.vote_average * 10).toFixed(0)}% Match` : 'New'}</span>
          <span className="border border-gray-400 text-gray-300 text-[9px] md:text-[10px] px-1 font-bold rounded-sm uppercase">{movie.media_type === 'tv' || movie.first_air_date ? 'Série' : 'Film'}</span>
        </div>
      </div>
      
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
         <span className="text-white font-bold text-xs md:text-sm line-clamp-1 drop-shadow-lg">{movie.title || movie.name}</span>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 مكون السطر (Movie Row)
// ==========================================
const MovieRow = ({ title, movies, onMovieClick }) => {
  const rowRef = useRef(null);
  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      rowRef.current.scrollTo({ left: direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="pl-4 md:pl-12 mb-8 md:mb-12 relative group">
      <h2 className="text-[14px] md:text-[20px] font-bold mb-3 text-[#e5e5e5] hover:text-white transition cursor-pointer flex items-center gap-2">
        {title}
        <span className="text-[#54b9c5] text-[12px] opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline-block">Explore All {'>'}</span>
      </h2>
      <div className="relative">
        <div onClick={() => handleScroll('left')} className="absolute left-0 top-0 bottom-0 w-[40px] md:w-[50px] bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 z-40 flex items-center justify-center cursor-pointer transition-all duration-300 hidden md:flex"><svg className="w-8 h-8 text-white hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg></div>
        <div ref={rowRef} className="flex gap-2 overflow-x-auto hide-scrollbar pb-8 pt-4 -mt-4 px-2 snap-x">
          {movies.map((movie) => <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />)}
        </div>
        <div onClick={() => handleScroll('right')} className="absolute right-0 top-0 bottom-0 w-[40px] md:w-[50px] bg-black/50 hover:bg-black/80 opacity-0 group-hover:opacity-100 z-40 flex items-center justify-center cursor-pointer transition-all duration-300 hidden md:flex"><svg className="w-8 h-8 text-white hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg></div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 مكون التحميل الوهمي (Skeleton Row)
// ==========================================
const SkeletonRow = () => (
  <div className="pl-4 md:pl-12 mb-8 md:mb-12 animate-pulse">
    <div className="h-5 md:h-6 w-32 md:w-48 bg-[#333] rounded mb-4"></div>
    <div className="flex gap-2 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[150px] md:w-[240px] lg:w-[280px] aspect-[16/9] bg-[#222] rounded"></div>
      ))}
    </div>
  </div>
);

// ==========================================
// 🚀 المكون الرئيسي Browse
// ==========================================
const Browse = () => {
  const navigate = useNavigate();

  const [selectedProfile, setSelectedProfile] = useState(() => {
    const saved = localStorage.getItem('activeProfile');
    return saved ? JSON.parse(saved) : null;
  }); 

  const [isScrolled, setIsScrolled] = useState(false); 
  const [userData, setUserData] = useState(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [realProfiles, setRealProfiles] = useState([]);
  
  // 🚀 state ديال التحميل (Skeleton)
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 state ديال التصنيفات والأنواع
  const [activeCategory, setActiveCategory] = useState('home'); 
  const [activeGenre, setActiveGenre] = useState(null); 
  const [genreMovies, setGenreMovies] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // 🚀 States د الأفلام (8 ديال السطورا باش تبان الصفحة عامرة)
  const [heroMovie, setHeroMovie] = useState(null);
  const [trendingRow, setTrendingRow] = useState([]);
  const [row1, setRow1] = useState([]);
  const [row2, setRow2] = useState([]);
  const [row3, setRow3] = useState([]);
  const [row4, setRow4] = useState([]);
  const [row5, setRow5] = useState([]);
  const [row6, setRow6] = useState([]);
  const [row7, setRow7] = useState([]);
  const [row8, setRow8] = useState([]);

  const [modalMovie, setModalMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  // 🚀 داتا ديال الأنواع (Genres)
  const tvGenres = [
    { id: 10759, name: 'Action & Aventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comédie' }, 
    { id: 80, name: 'Crime' }, { id: 99, name: 'Documentaires' }, { id: 18, name: 'Drames' }, 
    { id: 10765, name: 'Science-Fiction' }, { id: 10764, name: 'Téléréalité' }
  ];
  const movieGenres = [
    { id: 28, name: 'Action' }, { id: 12, name: 'Aventure' }, { id: 16, name: 'Animation' }, 
    { id: 35, name: 'Comédie' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentaires' }, 
    { id: 18, name: 'Drames' }, { id: 14, name: 'Fantastique' }, { id: 27, name: 'Horreur' }, 
    { id: 10749, name: 'Romance' }, { id: 878, name: 'Science-Fiction' }, { id: 53, name: 'Thriller' }
  ];
  const currentGenres = activeCategory === 'tv' ? tvGenres : movieGenres;

  // 🚀 العساس د الحساب (Check Trial)
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuth) { navigate('/login'); return; }

    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const now = new Date();
    const trialEnd = storedUser.trialEndDate ? new Date(storedUser.trialEndDate) : null;

    if (
      storedUser.subscriptionStatus === 'Inactive' || 
      (storedUser.subscriptionStatus === 'Trial' && trialEnd && now > trialEnd)
    ) {
      navigate('/signup'); 
      return;
    }

    setUserData(storedUser);

    const defaultImages = [
      'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png',
      'https://mir-s3-cdn-cf.behance.net/project_modules/disp/366be133850498.56ba69ac36858.png',
      'https://mir-s3-cdn-cf.behance.net/project_modules/disp/64623a33850498.56ba69ac2a6f7.png',
      'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
      'https://pro2-bar-s3-cdn-cf4.myportfolio.com/project_modules/disp/1bdc9a33850498.56ba69ac2ba5b.png'
    ];
    
    if (storedUser.profiles && storedUser.profiles.length > 0) {
      const validProfiles = storedUser.profiles.filter(p => p.name && p.name.trim() !== '');
      setRealProfiles(validProfiles.map((p, idx) => ({ 
        ...p, name: p.name, img: p.profilePic || defaultImages[idx % defaultImages.length], myList: p.myList || [] 
      })));
    } else {
      setRealProfiles([{ name: 'User', img: defaultImages[0], myList: [] }]);
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  // 🚀 جلب الأفلام الرئيسية بـ 8 تصنيفات باش تعمر الصفحة
  useEffect(() => {
    if (!selectedProfile || activeCategory === 'mylist' || searchQuery || activeGenre) return;
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        let reqHero, req1, req2, req3, req4, req5, req6, req7, req8;
        
        if (activeCategory === 'tv') {
          reqHero = tmdbApi.get('/trending/tv/week');
          req1 = tmdbApi.get('/tv/top_rated'); 
          req2 = tmdbApi.get('/discover/tv?with_genres=10759'); // Action
          req3 = tmdbApi.get('/discover/tv?with_genres=35'); // Comedy
          req4 = tmdbApi.get('/discover/tv?with_genres=18'); // Drama
          req5 = tmdbApi.get('/discover/tv?with_genres=80'); // Crime
          req6 = tmdbApi.get('/discover/tv?with_genres=99'); // Docs
          req7 = tmdbApi.get('/discover/tv?with_genres=10765'); // Sci-Fi
          req8 = tmdbApi.get('/discover/tv?with_genres=16'); // Animation
        } else if (activeCategory === 'movie') {
          reqHero = tmdbApi.get('/trending/movie/week');
          req1 = tmdbApi.get('/movie/top_rated'); 
          req2 = tmdbApi.get('/discover/movie?with_genres=28'); // Action
          req3 = tmdbApi.get('/discover/movie?with_genres=35'); // Comedy
          req4 = tmdbApi.get('/discover/movie?with_genres=27'); // Horror
          req5 = tmdbApi.get('/discover/movie?with_genres=10749'); // Romance
          req6 = tmdbApi.get('/discover/movie?with_genres=878'); // Sci-Fi
          req7 = tmdbApi.get('/discover/movie?with_genres=99'); // Docs
          req8 = tmdbApi.get('/discover/movie?with_genres=16'); // Animation
        } else {
          reqHero = tmdbApi.get('/trending/all/week');
          req1 = tmdbApi.get('/movie/top_rated'); 
          req2 = tmdbApi.get('/discover/movie?with_genres=28'); 
          req3 = tmdbApi.get('/discover/movie?with_genres=35'); 
          req4 = tmdbApi.get('/discover/movie?with_genres=27'); 
          req5 = tmdbApi.get('/discover/tv?with_genres=18'); // TV Drama
          req6 = tmdbApi.get('/discover/movie?with_genres=10749'); 
          req7 = tmdbApi.get('/discover/movie?with_genres=99'); 
          req8 = tmdbApi.get('/discover/movie?with_genres=16'); 
        }

        const [h, r1, r2, r3, r4, r5, r6, r7, r8] = await Promise.all([reqHero, req1, req2, req3, req4, req5, req6, req7, req8]);

        setHeroMovie(h.data.results[Math.floor(Math.random() * h.data.results.length)]);
        setTrendingRow(h.data.results); setRow1(r1.data.results); setRow2(r2.data.results); setRow3(r3.data.results); 
        setRow4(r4.data.results); setRow5(r5.data.results); setRow6(r6.data.results); setRow7(r7.data.results); setRow8(r8.data.results);
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    fetchMovies();
  }, [selectedProfile, activeCategory, activeGenre, searchQuery]);

  // 🚀 جلب أفلام لـ Genre محدد
  useEffect(() => {
    if (!activeGenre) return;
    const fetchByGenre = async () => {
      setIsLoading(true);
      try {
        const type = activeCategory === 'tv' ? 'tv' : 'movie';
        // كنجيبو جوج صفحات باش يعمرو الشاشة مزيان
        const [p1, p2] = await Promise.all([
          tmdbApi.get(`/discover/${type}?with_genres=${activeGenre}&page=1`),
          tmdbApi.get(`/discover/${type}?with_genres=${activeGenre}&page=2`)
        ]);
        setGenreMovies([...p1.data.results, ...p2.data.results]);
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    fetchByGenre();
  }, [activeGenre, activeCategory]);

  // 🚀 جلب البحث
  useEffect(() => {
    if (searchQuery.trim() === '') { setSearchResults([]); return; }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await tmdbApi.get(`/search/multi?query=${searchQuery}`);
        setSearchResults(res.data.results.filter(item => item.media_type !== 'person' && item.backdrop_path));
      } catch (error) { console.error(error); }
    }, 500); 
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleToggleMyList = async (movieToAdd) => {
    if (!userData || !selectedProfile) return;
    const isAlreadyInList = selectedProfile.myList?.some(m => m.id === movieToAdd.id);
    let updatedMyList = isAlreadyInList ? selectedProfile.myList.filter(m => m.id !== movieToAdd.id) : [...(selectedProfile.myList || []), movieToAdd]; 

    const newProfileData = { ...selectedProfile, myList: updatedMyList };
    setSelectedProfile(newProfileData);
    localStorage.setItem('activeProfile', JSON.stringify(newProfileData));

    const updatedProfiles = userData.profiles.map(p => p.name === selectedProfile.name ? newProfileData : p);
    const newUserData = { ...userData, profiles: updatedProfiles };
    setUserData(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));

    try {
      await axios.put(`${BACKEND_URL}/users/${userData._id}`, { profiles: updatedProfiles }, { headers: { token: `Bearer ${localStorage.getItem('token')}` } });
    } catch (e) { console.error("Error updating My List in DB", e); }
  };

  const handleOpenModal = async (movie) => {
    setModalMovie(movie); setTrailerKey(null); document.body.style.overflow = 'hidden';
    try {
      const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
      const res = await tmdbApi.get(`/${type}/${movie.id}?append_to_response=videos`);
      setMovieDetails(res.data);
      const trailer = res.data.videos?.results.find(vid => vid.type === "Trailer");
      if (trailer) setTrailerKey(trailer.key);
    } catch (e) { setMovieDetails(null); }
  };

  const handleCloseModal = () => { setModalMovie(null); setMovieDetails(null); setTrailerKey(null); document.body.style.overflow = 'auto'; };
  const handleExitProfile = () => { localStorage.removeItem('activeProfile'); setSelectedProfile(null); };

  const handleProfileClick = (profile, idx) => {
    if (isManageMode) {
      navigate('/manage-profile', { state: { profile, index: idx, isNew: false } });
    } else {
      localStorage.setItem('activeProfile', JSON.stringify(profile));
      setSelectedProfile(profile);
      setActiveCategory('home');
      setActiveGenre(null);
      setSearchQuery('');
      setIsSearchActive(false);
      window.scrollTo(0, 0); 
    }
  };

  // ==========================================
  // 🚀 شاشة اختيار البروفايل (Who's watching)
  // ==========================================
  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center font-['Inter',_sans-serif]">
        <h1 className="text-white text-[6vw] md:text-[3.5rem] font-medium mb-8 text-center px-4">
          {isManageMode ? 'Manage Profiles:' : "Who's watching?"}
        </h1>
        <div className="flex gap-4 md:gap-8 justify-center flex-wrap max-w-[90%] md:max-w-[80%]">
          {realProfiles.map((profile, idx) => (
            <div key={idx} className="flex flex-col items-center group cursor-pointer relative" onClick={() => handleProfileClick(profile, idx)}>
              <div className={`w-[25vw] h-[25vw] md:w-[10vw] md:h-[10vw] min-w-[84px] min-h-[84px] max-w-[150px] max-h-[150px] rounded-md overflow-hidden border-2 border-transparent transition-all duration-200 ${isManageMode ? 'opacity-50' : 'group-hover:border-white'}`}>
                <img src={profile.img} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              {isManageMode && (
                <div className="absolute top-[35%] left-[35%] w-[30%] h-[30%] pointer-events-none">
                  <svg className="text-white w-full h-full drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"></path></svg>
                </div>
              )}
              <span className={`mt-4 text-[14px] md:text-[1.3vw] font-medium transition-colors ${isManageMode ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{profile.name}</span>
            </div>
          ))}

          {realProfiles.length < 5 && (
            <div className="flex flex-col items-center group cursor-pointer" onClick={() => navigate('/manage-profile', { state: { isNew: true } })}>
              <div className={`w-[25vw] h-[25vw] md:w-[10vw] md:h-[10vw] min-w-[84px] min-h-[84px] max-w-[150px] max-h-[150px] rounded-md overflow-hidden transition-all duration-200 flex items-center justify-center border-2 border-transparent group-hover:bg-gray-800 ${isManageMode ? 'opacity-50' : ''}`}>
                <svg className="w-12 h-12 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <span className={`mt-4 text-[14px] md:text-[1.3vw] font-medium transition-colors ${isManageMode ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>Add Profile</span>
            </div>
          )}
        </div>
        <button onClick={() => setIsManageMode(!isManageMode)} className={`mt-16 px-6 py-2 text-[16px] md:text-[1.2vw] transition-colors tracking-widest uppercase font-medium ${isManageMode ? 'bg-white text-black hover:bg-[#c00]' : 'border border-gray-500 text-gray-400 hover:border-white hover:text-white'}`}>
          {isManageMode ? 'Done' : 'Manage Profiles'}
        </button>
      </div>
    );
  }

  const isInMyList = selectedProfile.myList?.some(m => m.id === modalMovie?.id);

  return (
    <>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="min-h-screen bg-[#141414] text-white font-['Inter',_sans-serif] overflow-x-hidden">
        
        {/* ========================================== */}
        {/* 🚀 Navbar الأساسية */}
        {/* ========================================== */}
        <nav className={`fixed w-full z-50 transition-colors duration-500 flex items-center justify-between px-4 md:px-12 py-4 ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
          <div className="flex items-center gap-4 md:gap-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-5 md:h-7 cursor-pointer" onClick={() => {setSearchQuery(''); setActiveCategory('home'); setActiveGenre(null);}} />
            <ul className="hidden lg:flex gap-5 text-[14px] font-medium text-gray-200">
              <li onClick={() => {setSearchQuery(''); setActiveCategory('home'); setActiveGenre(null);}} className={`cursor-pointer ${activeCategory === 'home' ? 'text-white font-bold' : 'hover:text-gray-400'}`}>Accueil</li>
              <li onClick={() => {setSearchQuery(''); setActiveCategory('tv'); setActiveGenre(null);}} className={`cursor-pointer ${activeCategory === 'tv' ? 'text-white font-bold' : 'hover:text-gray-400'}`}>Séries</li>
              <li onClick={() => {setSearchQuery(''); setActiveCategory('movie'); setActiveGenre(null);}} className={`cursor-pointer ${activeCategory === 'movie' ? 'text-white font-bold' : 'hover:text-gray-400'}`}>Films</li>
              <li onClick={() => {setSearchQuery(''); setActiveCategory('mylist'); setActiveGenre(null);}} className={`cursor-pointer ${activeCategory === 'mylist' ? 'text-white font-bold' : 'hover:text-gray-400'}`}>Ma Liste</li>
            </ul>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            {/* 🚀 أيقونة البحث */}
            <div className={`flex items-center transition-all duration-300 ${isSearchActive || searchQuery ? 'border border-white bg-black/80 w-[200px] md:w-[250px] px-2 py-1' : 'w-[30px]'}`}>
              <svg onClick={() => setIsSearchActive(!isSearchActive)} className="w-5 h-5 md:w-6 md:h-6 cursor-pointer text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              {(isSearchActive || searchQuery) && (
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Titres, personnes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white text-[12px] md:text-[14px] ml-2 w-full focus:outline-none placeholder-gray-400"
                />
              )}
            </div>

            {/* 🚀 أيقونة البروفايل Dropdown */}
            <div className="relative group cursor-pointer flex items-center gap-2">
              <img src={selectedProfile.img} alt="Profile" className="w-8 h-8 rounded" />
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180 hidden md:block" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              
              <div className="absolute right-0 mt-0 w-[220px] bg-black/95 border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 top-[120%] p-0">
                <div className="absolute top-[-8px] right-4 w-4 h-4 bg-black/95 border-t border-l border-gray-800 transform rotate-45"></div>
                <div className="p-3">
                  {realProfiles.filter(p => p.name !== selectedProfile.name).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded transition cursor-pointer" onClick={() => handleProfileClick(p, idx)}>
                      <img src={p.img} alt="" className="w-8 h-8 rounded" />
                      <span className="text-[14px] font-medium">{p.name}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-800 p-2 flex flex-col">
                  <div onClick={() => { handleExitProfile(); setIsManageMode(true); }} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded transition text-[14px] cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Manage Profiles
                  </div>
                  <div onClick={handleExitProfile} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded transition text-[14px] cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> Exit Profile
                  </div>
                  <div onClick={() => navigate('/account')} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded transition text-[14px] cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Account
                  </div>
                </div>
                <div className="border-t border-gray-800 p-2">
                  <button onClick={() => {localStorage.clear(); navigate('/login');}} className="w-full text-center p-2 text-[14px] font-medium hover:underline transition">Sign out of Netflix</button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* ========================================== */}
        {/* 🚀 Header ديال الأنواع (Genres) */}
        {/* ========================================== */}
        {(activeCategory === 'movie' || activeCategory === 'tv') && !searchQuery && (
          <div className="pt-[80px] md:pt-24 px-4 md:px-12 flex items-center gap-6 absolute z-40 w-full">
            <h1 className="text-[28px] md:text-[38px] font-bold">{activeCategory === 'movie' ? 'Films' : 'Séries'}</h1>
            <div className="relative">
              <select
                className="bg-black/80 text-white border border-gray-500 text-[12px] md:text-[14px] font-medium px-4 py-1 md:py-1.5 focus:outline-none appearance-none cursor-pointer hover:bg-gray-800 transition"
                value={activeGenre || ''}
                onChange={(e) => setActiveGenre(e.target.value)}
              >
                <option value="">Tous les genres</option>
                {currentGenres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <svg className="w-3 h-3 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 🚀 المحتوى (Content) كيتغير على حسب شنو معزول */}
        {/* ========================================== */}
        {searchQuery ? (
          <div className="pt-32 px-4 md:px-12">
            <h2 className="text-gray-400 mb-6 text-[18px]">Recherche pour : <span className="text-white">"{searchQuery}"</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {searchResults.map(movie => <MovieCard key={movie.id} movie={movie} onMovieClick={handleOpenModal} />)}
            </div>
          </div>
        ) : 
        activeCategory === 'mylist' ? (
          <div className="pt-32 px-4 md:px-12">
            <h1 className="text-[28px] md:text-[32px] font-bold mb-8">Ma Liste</h1>
            {selectedProfile.myList?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                {selectedProfile.myList.map(movie => <MovieCard key={movie.id} movie={movie} onMovieClick={handleOpenModal} />)}
              </div>
            ) : (
              <p className="text-gray-400 text-[16px] md:text-[18px]">Vous n'avez pas encore ajouté de films à votre liste.</p>
            )}
          </div>
        ) : 
        activeGenre ? (
          // 🚀 ملي الكليان كيعزل Genre معين (كيطلعو كـ Grid)
          <div className="pt-40 px-4 md:px-12 pb-20">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                {[...Array(12)].map((_, i) => <div key={i} className="w-full aspect-[16/9] bg-[#222] animate-pulse rounded"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                {genreMovies.map(movie => <MovieCard key={movie.id} movie={movie} onMovieClick={handleOpenModal} />)}
              </div>
            )}
          </div>
        ) : (
          // 🚀 الصفحة العادية (Home, Movies, TV Shows)
          <>
            {/* 🚀 Skeleton Loaders فاش كتكون كونيكسيو ثقيلة */}
            {isLoading ? (
              <div className="w-full">
                <div className="h-[60vh] md:h-[85vh] w-full bg-[#111] animate-pulse mb-8"></div>
                <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
              </div>
            ) : (
              <>
                {heroMovie && (
                  <div className="relative h-[65vh] md:h-[95vh] w-full bg-[#141414]">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-12 max-w-[90%] md:max-w-[45%] flex flex-col gap-4 md:gap-5 z-10">
                      <h1 className="text-[32px] md:text-[60px] font-black uppercase leading-none drop-shadow-2xl">{heroMovie.title || heroMovie.name || heroMovie.original_name}</h1>
                      <p className="text-white text-[13px] md:text-[18px] font-medium drop-shadow-md line-clamp-3">{heroMovie.overview}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => navigate(`/watch/${heroMovie.id}`)} className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-2.5 rounded-[4px] font-bold text-[14px] md:text-[18px] hover:bg-white/80 transition w-full md:w-auto"><svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8z"/></svg>Lecture</button>
                        <button onClick={() => handleOpenModal(heroMovie)} className="flex items-center justify-center gap-2 bg-[#515151]/80 text-white px-6 md:px-8 py-2 md:py-2.5 rounded-[4px] font-bold text-[14px] md:text-[18px] hover:bg-[#515151]/60 transition w-full md:w-auto"><svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"></circle></svg>Plus d'infos</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 🚀 زدنا 8 ديال السطورا باش تبان الصفحة عامرة وماتقاداش */}
                <div className="relative z-20 pb-24 mt-[-5vh] md:mt-[-10vh]">
                  <MovieRow title="Top 10 aujourd'hui" movies={trendingRow} onMovieClick={handleOpenModal} />
                  <MovieRow title="Succès sur Netflix" movies={row1} onMovieClick={handleOpenModal} />
                  <MovieRow title="Programmes d'action" movies={row2} onMovieClick={handleOpenModal} />
                  <MovieRow title="Comédies" movies={row3} onMovieClick={handleOpenModal} />
                  <MovieRow title="Frissons garantis" movies={row4} onMovieClick={handleOpenModal} />
                  <MovieRow title={activeCategory === 'tv' ? 'Séries dramatiques' : 'Films romantiques'} movies={row5} onMovieClick={handleOpenModal} />
                  <MovieRow title="Sci-Fi & Fantastique" movies={row6} onMovieClick={handleOpenModal} />
                  <MovieRow title="Documentaires primés" movies={row7} onMovieClick={handleOpenModal} />
                  <MovieRow title="Animation pour toute la famille" movies={row8} onMovieClick={handleOpenModal} />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ========================================== */}
      {/* 🚀 Modal ديال معلومات الفيلم (Trailer & Info) */}
      {/* ========================================== */}
      {modalMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 overflow-y-auto pt-20">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-[#181818] text-white w-full max-w-[850px] rounded-[8px] shadow-2xl overflow-hidden z-10 mx-auto mb-10">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 z-50 bg-[#181818] rounded-full p-2 hover:bg-white hover:text-black transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            <div className="relative h-[250px] md:h-[450px] bg-black">
              {trailerKey ? <iframe className="absolute inset-0 w-full h-full pointer-events-none" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0`} allow="autoplay"></iframe> : <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${modalMovie.backdrop_path})` }}></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 md:left-12 max-w-[80%] z-20">
                <h2 className="text-[24px] md:text-[45px] font-black uppercase mb-4 leading-none">{modalMovie.title || modalMovie.name}</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(`/watch/${modalMovie.id}`)} className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-2.5 rounded-[4px] font-bold text-[14px] md:text-[18px] hover:bg-white/80 transition"><svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8z"/></svg>Lecture</button>
                  <button 
                    onClick={() => handleToggleMyList(modalMovie)} 
                    className="w-10 h-10 md:w-12 md:h-12 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition bg-[#2a2a2a]/60"
                  >
                    {isInMyList ? (
                      <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    ) : (
                      <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-12"><p className="text-[14px] md:text-[16px] leading-relaxed text-gray-300">{modalMovie.overview}</p></div>
          </div>
        </div>
      )}
    </>
  );
}

export default Browse;