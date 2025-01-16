import { RedisPubSubService } from "./RedisPubSubService";




export class SubscriptionManager {
    private static instance: SubscriptionManager;
    public roomsSubscription: Map<string, string[]> = new Map(); // userId -> [roomIds]
    public reverseRoomsSubscription: Map<string, string[]> = new Map(); // roomId -> [userIds]
    private redisService: RedisPubSubService;

    private constructor() {
        this.redisService = RedisPubSubService.getInstance();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }

    public async subscribe(roomId: string, userId: string) {
        console.log("Subscribing user to room:", roomId);

        // Update local subscription state
        if (this.roomsSubscription.get(userId)?.includes(roomId)) {
            return;
        }
        this.roomsSubscription.set(userId, (this.roomsSubscription.get(userId) || []).concat(roomId));
        this.reverseRoomsSubscription.set(roomId, (this.reverseRoomsSubscription.get(roomId) || []).concat(userId));

        // Subscribe to Redis Pub/Sub if it's the first subscriber to the room
        if (this.reverseRoomsSubscription.get(roomId)?.length === 1) {
            console.log("First user in room, subscribing Redis to room:", roomId);
            await this.redisService.subscribe(roomId, (message: string) => {
                this.broadcastToRoom(roomId, message);
            });
        }
    }

    public async unsubscribe(roomId: string, userId: string) {
        console.log("Unsubscribing user from room:", roomId);

        // Update local subscription state
        this.roomsSubscription.set(userId, (this.roomsSubscription.get(userId) || []).filter((r) => r !== roomId));
        this.reverseRoomsSubscription.set(roomId, (this.reverseRoomsSubscription.get(roomId) || []).filter((u) => u !== userId));

        // Unsubscribe from Redis Pub/Sub if no users are left in the room
        if ((this.reverseRoomsSubscription.get(roomId)?.length || 0) === 0) {
            console.log("No users left in room, unsubscribing Redis from room:", roomId);
            await this.redisService.unsubscribe(roomId);
        }
    }

    private broadcastToRoom(roomId: string, message: string) {
        const subscribers = this.reverseRoomsSubscription.get(roomId) || [];
      
    }

}
