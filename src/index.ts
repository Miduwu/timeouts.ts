import { Client } from "discord.js"
import EventEmiter from 'node:events'
import db from 'quick.db'

export interface TimeoutOptions {
    pulse: number,
    db: typeof db
}

export interface Timeout {
    id: string,
    time: number,
    expires: number,
    data: any
}

class Timeouts extends EventEmiter {
    options: TimeoutOptions
    ready: boolean
    client: Client
    constructor(client: Client, options: TimeoutOptions, init = true) {
        super()
        this.options = options
        this.client = client
        this.ready = false
        if(init) this._init()
    }
    getTimeouts(): Timeout[] | [] {
        return this.options.db.get('timeouts') || []
    }
    create(id: string, time: number, data: any): void {
        if(!this.ready) throw new Error('Manager is not ready yet')
        let timeouts: Timeout[] = this.getTimeouts()
        let expires: number = Date.now() + time
        timeouts.push({id, expires ,time, data})
        this.options.db.set('timeouts', timeouts)
    }
    private _resolve(): void {
        if(!this.client.readyAt) return;
        let timeouts = this.getTimeouts()
        if(1 > timeouts.length) return;
        for(const timeout of timeouts) {
            if(Date.now() >= timeout.expires) {
                this.out(timeout.id, timeout.expires, timeout.time)
            }
        }
    }
    out(id: string, expires: number, time: number): void {
        let timeouts = this.getTimeouts()
        let timeout: Timeout | null | undefined = timeouts.find((t: Timeout) => t.id === id && t.expires === expires && t.time === time)
        if(!timeout) return;
        this.emit('expires', timeout)
        this.deleteFromDB(id, expires, time)
    }
    delete(func: Function): void {
        let timeouts = this.getTimeouts()
        if(1 > timeouts.length) return;
        for(const timeout of timeouts) {
            if(func(timeout)) {
                this.deleteFromDB(timeout.id, timeout.expires, timeout.time)
            }
        }
    }
    has(func: Function): boolean {
        let timeouts = this.getTimeouts()
        if(1 > timeouts.length) return false
        let so = false;
        for(const timeout of timeouts) {
            if(func(timeout)) {
                so = true
            }
        }
        return so
    }
    private deleteFromDB(id: string, expires: number, time: number): void {
        let timeouts = this.getTimeouts()
        for(let i = 0; i < timeouts.length; i++) {
            if(timeouts[i].id === id && timeouts[i].expires === expires && timeouts[i].time === time) {
                timeouts.splice(i, 1)
                this.options.db.set('timeouts', timeouts)
            }
        }
    }
    private _init(): void {
        setInterval(() => {
            if(this.client.readyAt) this._resolve.call(this)
        }, this.options.pulse)
        this.ready = true
    }
}

export { Timeouts }