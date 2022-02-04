import { useState, useEffect, useRef } from 'react';
import './styles.css'


function PeerConnection() {
  const videoEl = useRef(null);
  const renderVideo = (stream) => (videoEl.current.srcObject = stream);

  const [peerId, setPeerId] = useState("");
  const [peer, setPeer] = useState(null);

  const [messages, setMessages] = useState([]);
  const logMessage = (message) => setMessages([...messages, message]);

  const connectToPeer =  ()=> {
    if (!peer) return;
    logMessage(`Connecting to ${peerId}...`)

    let conn = peer.connect(peerId);
    conn?.on('data', (data) => {
      logMessage(`received: ${data}`);
    });
    conn?.on("open", ()=>{
      conn.send("hi!")
    })
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream=> {
      let call = peer.call(peerId, stream);
      call.on("stream", renderVideo);
    })
    .catch(err=> {
      console.log("Failed to get local stream", err)
    })
  }

  // Creating peer
  useEffect(()=>setPeer(new Peer({
    host: "localhost",
    port: "4005",
    path: "/peerjs/myapp"
  })), []);

  useEffect(()=> {
    if (!peer) return
    peer.on("open", (id)=> {
      console.log("connection opened ...")
      logMessage("My peer id is: "+id);
    })
    peer.on("error", (err)=>console.log("Error: Lost connection to server."));

    peer.on("connection", (conn)=> {
      logMessage("incoming peer connection!");
      conn.on("data", (data)=> {
        logMessage(`received: ${data}`);
      })
      conn.on("open", ()=> {
        conn.send("Hello!");
      })
    })

    peer.on("call", (call)=>{
      navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then(stream => {
        call.answer(stream);
        call.on("stream", renderVideo)
      })
      .catch(err=> {
        console.log("Failed to get local stream", err);
      })
    })
  }, [peer]);
   
  return (
    <div className="App">
        <div id="video-grid">

        </div>

        <video ref={videoEl} className="remote-video" autoPlay></video>
        <input placeholder='Enter peer id: ' value={peerId} onChange={e=>setPeerId(e.target.value)} />
        <button onClick={connectToPeer}>Connect to peer</button>
        <div className="messages">
          {messages.map((msg, index)=>(
            <div key={index}>{msg}</div>
          ))}
        </div>
    </div>
  )
}

export default PeerConnection
