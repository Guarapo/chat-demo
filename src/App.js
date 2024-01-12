import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import GamiChat from './demo/GamiChat.js';

const App = () => {
  return (
    <div className="container">
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/gami-chat' element={<GamiChat />} />
      </Routes>
    </div>
  );
}

export default App;
