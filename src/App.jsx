import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import PeerConnection from "./components/PeerConnection"
import UsingSocketIo from "./components/UsingSocketIo";
import './App.css'
import { Route, Routes } from 'react-router-dom';


function App() {
  
  return (
    <div className="App">
      <Routes>
        <Route path="/peer" element={<PeerConnection />}/>
        <Route path="/room/:roomId" element={<UsingSocketIo />}/>
        <Route path="/" element={<UsingSocketIo />}/>
      </Routes>
    </div>
  )
}

export default App
