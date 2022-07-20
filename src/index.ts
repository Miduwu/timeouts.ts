import { TypedEmitter } from 'tiny-typed-emitter';

export interface TimeoutOptions {
    pulse: number,
    db: any
}

export interface Timeout {
    id: string,
    time: number,
    expires: number,
    data: any
}

export interface Events {
    'expires': (timeout: Timeout) => void,
    'deleted': (timeout: Timeout) => void,
    'create': (timeout: Timeout) => void,
    'ready': (timeouts: Timeouts) => void
}

class Timeouts extends TypedEmitter<Events> {
    private options: TimeoutOptions
    ready: boolean
    constructor(options: TimeoutOptions) {
        super()
        this.options = options
        this.ready = false
    }
    public async getTimeouts(): Promise<Timeout[] | any[]> {
        return (await this.options.db.get('timeouts')) || []
    }
    public async create(id: string, time: number, data: any): Promise<void> {
        if(!this.ready) throw new Error('Manager is not ready yet')
        let timeouts = await this.getTimeouts()
        let expires: number = Date.now() + time
        timeouts.push({id, expires ,time, data})
        this.options.db.set('timeouts', timeouts)
        this.emit('create', {id, expires ,time, data})
    }
    private async _resolve(): Promise<void> {
        let timeouts = await this.getTimeouts()
        if(1 > timeouts.length) return;
        for(const timeout of timeouts) {
            if(Date.now() >= timeout.expires) {
                this.out(timeout.id, timeout.expires, timeout.time)
            }
        }
    }
    public async out(id: string, expires: number, time: number): Promise<void> {
        let timeouts = await this.getTimeouts()
        let timeout: Timeout | null | undefined = timeouts.find((t: Timeout) => t.id === id && t.expires === expires && t.time === time)
        if(!timeout) return;
        this.emit('expires', timeout)
        this.deleteFromDB(id, expires, time)
    }
    public async delete(func: Function): Promise<void> {
        let timeouts = await this.getTimeouts()
        if(1 > timeouts.length) return;
        for(const timeout of timeouts) {
            if(func(timeout)) {
                this.deleteFromDB(timeout.id, timeout.expires, timeout.time)
            }
        }
    }
    public async has(func: Function): Promise<boolean> {
        let timeouts = await this.getTimeouts()
        if(1 > timeouts.length) return false
        let so = false;
        for(const timeout of timeouts) {
            if(func(timeout)) {
                so = true
            }
        }
        return so
    }
    private async deleteFromDB(id: string, expires: number, time: number): Promise<void> {
        let timeouts = await this.getTimeouts()
        for(let i = 0; i < timeouts.length; i++) {
            if(timeouts[i].id === id && timeouts[i].expires === expires && timeouts[i].time === time) {
                timeouts.splice(i, 1)
                this.options.db.set('timeouts', timeouts)
                this.emit('deleted', timeouts[i])
            }
        }
    }
    public _init(): void {
        setInterval(() => {
            this._resolve.call(this)
        }, this.options.pulse)
        this.ready = true
        this.emit('ready', this)
    }
}

export { Timeouts }