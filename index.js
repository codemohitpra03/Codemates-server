const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const axios = require('axios');

const server = http.createServer(app);

const io = new Server(server);
const EventSource = require('eventsource');
const { run } = require('./producer');
const events = new EventSource('http://localhost:8000/events');






const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}


const send_code_to_compile = async(src) =>{
    try {
        
        const response = await axios.post('http://localhost:8000/compile',{
                code: 'Textual content '+src
            });
            
            console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}


io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    socket.on("change_lang", ({ roomId, lang }) => {
        socket.in(roomId).emit("change_lang", { lang });
        
    });
    
    socket.on("pm-compile", async({ roomId, code }) => {
        // socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        // console.log(code);
        // socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code:"milgya bhai code" });
        // instead of emit push brodcast including me the response of code

        // here push to message queue
        // and listen forresponse
        // push_to_kafka()

        // await send_code_to_compile(code)
        await run({code,roomId,lang:"python"})

        events.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            
            console.log(parsedData,"aagya ly queue se");
            // socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code:parsedData});
        };

        
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
