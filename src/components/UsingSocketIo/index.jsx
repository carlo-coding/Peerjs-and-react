
import io from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import { Link, useRoute } from "wouter";
import { useLocation, useParams } from "react-router-dom";

const id = ()=> Math.random().toString(16).slice(2);

function Video({ stream }) {
    const videoRef = useRef(null);
    useEffect(()=> {
        videoRef.current.srcObject = stream;
    }, []);

    return <video ref={videoRef} autoPlay></video>
}


export default function UsingSocketIo () {
    const params = useParams();
    const [roomId, setRoomId] = useState("");
    const [videos, setVideos] = useState([]);

    const videoGrid = useRef(null);

    function addVideoStream(stream) {
        let newId = id();
        setVideos(vids => [...vids, { stream, id: newId }]);
        return newId;
    }
    function removeVideoStream(id) {
        setVideos(vids => vids.filter(vid=> vid.id !== id));
    }

    useEffect(()=> {
        (async ()=> {
            if (params.roomId) return;
            const data = await (await fetch("https://peer-connection-dx8mf.ondigitalocean.app/create/room")).json();
            setRoomId(data.id);
        })();
        const socket = io("wss://peer-connection-dx8mf.ondigitalocean.app/");
        const peer = new Peer({
            host: "peer-connection-dx8mf.ondigitalocean.app",
            path: "/peerjs/myapp"
        });

        peer.on("open", id=> {
            socket.emit("join-room", params.roomId? params.roomId : roomId, id );
        })

        function connectToNewUser(userId, stream){
            const call = peer.call(userId, stream);
            let id = "";
            call.on("stream", userStream=> {
                id = addVideoStream(userStream)
            });
            call.on("close", ()=> {
                removeVideoStream(id)
            })
        }

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        .then(stream=> {
            addVideoStream(stream);

            peer.on("call", (call)=> {
                call.answer(stream);
                call.on("stream", userStream=> {
                    addVideoStream(userStream)
                })
            })

            socket.on("user-connected", userId=> {
                console.log("new user connected", userId)
                connectToNewUser(userId, stream);
            });
        })


    }, [])
    return (
        <div>
            {!params.roomId && <React.Fragment>
                <p>your room url</p>
                <a href={`http://${window.location.host}/#/room/${roomId}`}>
                    http://{window.location.host}/#/room/{roomId}
                </a>    
            </React.Fragment>}
            <div id="video-grid" ref={videoGrid}>
                {videos?.map((video)=> (
                    <Video stream={video?.stream} key={video?.id}/>
                ))}
            </div>
        </div>
    )
}