type Callback = (...args: any[]) => boolean | Promise<boolean>;

export default class Broadcast {
    protected static channels: { [pattern: string]: Callback[] } = {};

    // Register a channel
    public static channel(pattern: string, callback: Callback) {
        if (!this.channels[pattern]) this.channels[pattern] = [];
        this.channels[pattern].push(callback);
    }

    // Match a channel name to a pattern and extract params
    protected static matchPattern(pattern: string, name: string): Record<string, string> | null {
        const regex = new RegExp('^' + pattern.replace(/\{(\w+)\}/g, (_, key) => `(?<${
            key
        }>[^/]+)`) + '$');
        const match = name.match(regex);
        return match?.groups || null;
    }

    // Authorize
    public static async authorize(channelName: string, ...args: any[]): Promise<boolean> {
        const fns = [];
        for (const pattern in this.channels) {
            if (this.matchPattern(pattern, channelName)) {
                fns.push(...this.channels[pattern]);
            }
        }
        for (const fn of fns) {
            const result = await fn(...args);
            if (!result) return false;
        }
        return true;
    }
}
