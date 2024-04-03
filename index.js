const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server, Socket } = require('socket.io');
const ACTIONS = require('./src/Actions');
const axios = require('axios');

const server = http.createServer(app);

const io = new Server(server);
const EventSource = require('eventsource');
const { run } = require('./producer');







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


io.on('connection', async(socket) => {
    console.log('socket connected', socket.id);
    


    const events = new EventSource('http://localhost:8000/events?clientId=' + socket.id);

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
    
    socket.on("pm-compile", async({ roomId, code,lang,input }) => {
        // socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        // console.log(code);
        
        

        
        
        //push msg to message queue
        await run({
            code:`
${code}
            `,
            roomId,
            lang,
            socketId:socket.id,
            input:`
${input}
            `,
            
        })

        events.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            
            console.log(parsedData,"final output");
            socket.nsp.in(roomId).emit("output-recieved", { result:parsedData}); //nsp sends to all
        };

        
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    socket.on("sync_lang", ({ socketId, lang }) => {
        console.log(lang);
        io.to(socketId).emit("change_lang", { lang });
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
