import { createClient, RedisClientType } from "redis";

export class RedisPubSubService {
    private static instance: RedisPubSubService;
    private redisClient: RedisClientType;

    private constructor() {
        this.redisClient = createClient();

        this.redisClient.on("error", (err) => {
            console.error("Redis client error:", err);
        });

        this.redisClient.connect();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RedisPubSubService();
        }
        return this.instance;
    }

    async subscribe(channel: string, callback: (message: string) => void) {
        const subscriber = this.redisClient.duplicate();
        await subscriber.connect();

        await subscriber.subscribe(channel, (message) => {
            console.log(`Received message from channel ${channel}:`, message);
            callback(message); // Pass the message to the provided callback
        });
    }

    async unsubscribe(channel: string) {
        await this.redisClient.unsubscribe(channel);
        console.log(`Unsubscribed from channel ${channel}`);
    }

    async publish(channel: string, message: string) {
        await this.redisClient.publish(channel, message);
        console.log(`Published message to channel ${channel}:`, message);
    }
}
