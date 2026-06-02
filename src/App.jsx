import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Browse from './pages/Browse';
import ProfileSettings from './pages/ProfileSettings';
import Watch from './pages/Watch';
import TestFlow from './pages/TestFlow';
import NotFound from './pages/NotFound';
import Account from './pages/Account' // الفوق مع الـ imports
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/browse' element={<Browse/>}/>
        <Route path="/manage-profile" element={<ProfileSettings />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/account" element={<Account />} />
        <Route path="/test" element={<TestFlow />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;