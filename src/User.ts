import { WebSocket } from "ws";
import { SubscriptionManager } from "./SubscriptionManager";


export class User{
   private id:string="";
    private ws:WebSocket|null=null;
   private rooms:String[] = [];

   constructor(id:string,ws:WebSocket){
      this.id = id;
      this.ws = ws;
      this.addListener();
   }

 public emit(){
    // this.ws?.send()
 }
   private addListener(){
        this.ws?.on('message',(data)=>{
            const parsedMessage = JSON.parse(data as unknown as string);
            console.log("parsed message",parsedMessage);
            const roomId = parsedMessage.roomId;
            if(parsedMessage.type === 'subscribe'){
                SubscriptionManager.getInstance().subscribe(roomId,this.id);
            }
            if(parsedMessage.type === 'unsubscribe'){
            }
            if(parsedMessage.type === 'send-message'){
            }
        })
   }
}