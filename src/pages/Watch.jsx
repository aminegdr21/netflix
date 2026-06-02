import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState(null);
  const [movieTitle, setMovieTitle] = useState('');

  const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

  useEffect(() => {
    const fetchTrailer = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } };
        let res;
        // كنقلبو واش فيلم ولا مسلسل
        try {
          res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?append_to_response=videos`, config);
        } catch (e) {
          res = await axios.get(`https://api.themoviedb.org/3/tv/${id}?append_to_response=videos`, config);
        }

        setMovieTitle(res.data.title || res.data.name);

        if (res.data.videos && res.data.videos.results) {
          const trailer = res.data.videos.results.find(vid => vid.type === "Trailer" || vid.name.includes("Official"));
          if (trailer) setTrailerKey(trailer.key);
          else if (res.data.videos.results.length > 0) setTrailerKey(res.data.videos.results[0].key);
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
      }
    };
    fetchTrailer();
  }, [id]);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden font-['Inter',_sans-serif]">
      
      {/* 🚀 يوتوب كديماري فـ الخلفية مخفية الأزرار ديالها */}
      {trailerKey && (
        <iframe
          className="absolute inset-0 w-full h-full pointer-events-none"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=0&modestbranding=1&showinfo=0&rel=0`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      )}

      {/* 🚀 واجهة نيتفليكس لي صيفطتي فـ التصويرة (Player UI) */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20">
        
        {/* البارة الفوقانية */}
        <div className="p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300 transition cursor-pointer">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <button className="text-white hover:text-gray-300 transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5zM3 17h9"></path></svg>
          </button>
        </div>

        {/* البارة التحتانية (التحكم) */}
        <div className="p-8 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-4">
          
          {/* شريط الوقت (Progress Bar) */}
          <div className="flex items-center gap-4 text-white text-[14px] font-medium">
            <div className="flex-grow h-1.5 bg-gray-600 rounded-full relative cursor-pointer group">
              <div className="absolute top-0 left-0 h-full bg-[#e50914] w-[15%] rounded-full"></div>
              <div className="absolute top-1/2 left-[15%] transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#e50914] rounded-full opacity-0 group-hover:opacity-100 transition"></div>
            </div>
            <span>1:26:06</span>
          </div>

          {/* الأزرار (Play, Volume, Title, Fullscreen...) */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-6">
              <svg className="w-9 h-9 cursor-pointer hover:text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg className="w-10 h-10 cursor-pointer hover:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path></svg>
              <svg className="w-10 h-10 cursor-pointer hover:text-gray-300 transform rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path></svg>
              <svg className="w-8 h-8 cursor-pointer hover:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 text-[20px] font-bold">
              {movieTitle}
            </div>

            <div className="flex items-center gap-6">
              <svg className="w-8 h-8 cursor-pointer hover:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              <svg className="w-8 h-8 cursor-pointer hover:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <svg className="w-8 h-8 cursor-pointer hover:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Watch;