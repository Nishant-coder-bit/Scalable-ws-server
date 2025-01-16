


import WebSocket, { WebSocketServer } from "ws";
 import { createClient } from "redis";
 const publisherClient = createClient({ url: 'redis://127.0.0.1:6379' });
 const subscriberClient = createClient({ url: 'redis://127.0.0.1:6379' });

//  const publisherClient =  createClient();
 publisherClient.connect();

//  const subscriberClient = createClient();
 subscriberClient.connect();
const wss = new WebSocketServer({port:8080});
type  User={
   ws:WebSocket,
   rooms:String[]
}
const Users:User[] = [];
wss.on('connection',(userSocket)=>{
      console.log("connected to the server");
   
     
      
      userSocket.on('message',(data)=>{
          const parsedMessage = JSON.parse(data as unknown as string);
          console.log("parsed message",parsedMessage);
          const roomId = parsedMessage.roomId;
          if(parsedMessage.type === 'subscribe'){
            
             Users.push({ws:userSocket,rooms:[roomId]});

             if(oneUserJoinRoom(roomId)){
               console.log("subscribing to redis pub sub",roomId);
               subscriberClient.subscribe(roomId,(message)=>{
                    const parsedMessage = JSON.parse(message as unknown as string);
                    console.log("parsed message",parsedMessage);
                    Users.forEach((user:User)=>{
                         if(user.rooms.includes(parsedMessage.roomId)){
                           
                              user.ws.send(parsedMessage.message);
                     
                         }
                    })
               })
             }
          }
          if(parsedMessage.type === 'unsubscribe'){
            const {roomId} = parsedMessage;
            console.log("inside unsubscribe",roomId);
            const user = Users.find((user:User)=>{
               return user.ws === userSocket;
            })
            if(user){
              user.rooms = user.rooms.filter((room)=>{
                 return room !== roomId;
              })
            }
            if(lastUserLeftRoom(roomId)){
               console.log(user,"leaving the room",roomId);
               subscriberClient.unsubscribe(roomId);
            }

         }
          if(parsedMessage.type === 'send-message'){
              const {roomId,message} = parsedMessage;
              console.log("roomId",roomId);
              
              publisherClient.publish(roomId,JSON.stringify({
                   type:'send-message',
                   roomId:roomId,
                   message
              }))
          }
         });
     
})




function lastUserLeftRoom(roomId: string) {
   let count =0;
   Users.forEach((user:User)=>{
      if(user.rooms.includes(roomId)){
         count++;
      }
   })
   if(count === 0){
     return true;
   }
     return false;
}

function oneUserJoinRoom(roomId: any) {
   let count =0;
   Users.forEach((user:User)=>{
      if(user.rooms.includes(roomId)){
         count++;
      }
   })
   if(count === 1){
     return true;
   }
     return false;
}
//  Scalable Websocket video refrence week -31 cohort -2 exchange project

  
