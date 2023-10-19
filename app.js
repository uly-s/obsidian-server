import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', function connection(ws) {
    ws.send('hello');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    // Here you can define what to do when a certain message is received
    ws.send('hello');
  });
});