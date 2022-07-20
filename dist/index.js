"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeouts = void 0;
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
class Timeouts extends tiny_typed_emitter_1.TypedEmitter {
    options;
    ready;
    constructor(options) {
        super();
        this.options = options;
        this.ready = false;
    }
    async getTimeouts() {
        return (await this.options.db.get('timeouts')) || [];
    }
    async create(id, time, data) {
        if (!this.ready)
            throw new Error('Manager is not ready yet');
        let timeouts = await this.getTimeouts();
        let expires = Date.now() + time;
        timeouts.push({ id, expires, time, data });
        this.options.db.set('timeouts', timeouts);
        this.emit('create', { id, expires, time, data });
    }
    async _resolve() {
        let timeouts = await this.getTimeouts();
        if (1 > timeouts.length)
            return;
        for (const timeout of timeouts) {
            if (Date.now() >= timeout.expires) {
                this.out(timeout.id, timeout.expires, timeout.time);
            }
        }
    }
    async out(id, expires, time) {
        let timeouts = await this.getTimeouts();
        let timeout = timeouts.find((t) => t.id === id && t.expires === expires && t.time === time);
        if (!timeout)
            return;
        this.emit('expires', timeout);
        this.deleteFromDB(id, expires, time);
    }
    async delete(func) {
        let timeouts = await this.getTimeouts();
        if (1 > timeouts.length)
            return;
        for (const timeout of timeouts) {
            if (func(timeout)) {
                this.deleteFromDB(timeout.id, timeout.expires, timeout.time);
            }
        }
    }
    async has(func) {
        let timeouts = await this.getTimeouts();
        if (1 > timeouts.length)
            return false;
        let so = false;
        for (const timeout of timeouts) {
            if (func(timeout)) {
                so = true;
            }
        }
        return so;
    }
    async deleteFromDB(id, expires, time) {
        let timeouts = await this.getTimeouts();
        for (let i = 0; i < timeouts.length; i++) {
            if (timeouts[i].id === id && timeouts[i].expires === expires && timeouts[i].time === time) {
                timeouts.splice(i, 1);
                this.options.db.set('timeouts', timeouts);
                this.emit('deleted', timeouts[i]);
            }
        }
    }
    _init() {
        setInterval(() => {
            this._resolve.call(this);
        }, this.options.pulse);
        this.ready = true;
        this.emit('ready', this);
    }
}
exports.Timeouts = Timeouts;
