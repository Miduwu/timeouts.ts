"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeouts = void 0;
const tslib_1 = require("tslib");
const node_events_1 = tslib_1.__importDefault(require("node:events"));
class Timeouts extends node_events_1.default {
    options;
    ready;
    client;
    constructor(client, ops, init = true) {
        super();
        this.options = ops;
        this.client = client;
        this.ready = false;
        if (init)
            this._init();
    }
    getTimeouts() {
        return this.options.db.get('timeouts') || [];
    }
    create(id, time, data) {
        if (!this.ready)
            throw new Error('Manager is not ready yet');
        let timeouts = this.getTimeouts();
        let expires = Date.now() + time;
        timeouts.push({ id, expires, time, data });
        this.options.db.set('timeouts', timeouts);
    }
    _resolve() {
        if (!this.client.readyAt)
            return;
        let timeouts = this.getTimeouts();
        if (1 > timeouts.length)
            return;
        for (const timeout of timeouts) {
            if (Date.now() >= timeout.expires) {
                this.out(timeout.id, timeout.expires, timeout.time);
            }
        }
    }
    out(id, expires, time) {
        let timeouts = this.getTimeouts();
        let timeout = timeouts.find(t => t.id === id && t.expires === expires && t.time === time);
        if (!timeout)
            return;
        this.emit('expires', timeout);
        this.deleteFromDB(id, expires, time);
    }
    delete(func) {
        let timeouts = this.getTimeouts();
        if (1 > timeouts.length)
            return;
        for (const timeout of timeouts) {
            if (func(timeout)) {
                this.deleteFromDB(timeout.id, timeout.expires, timeout.time);
            }
        }
    }
    has(func) {
        let timeouts = this.getTimeouts();
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
    deleteFromDB(id, expires, time) {
        let timeouts = this.getTimeouts();
        for (let i = 0; i < timeouts.length; i++) {
            if (timeouts[i].id === id && timeouts[i].expires === expires && timeouts[i].time === time) {
                timeouts.splice(i, 1);
                this.options.db.set('timeouts', timeouts);
            }
        }
    }
    _init() {
        setInterval(() => {
            if (this.client.readyAt)
                this._resolve.call(this);
        }, this.options.pulse);
        this.ready = true;
    }
}
exports.Timeouts = Timeouts;
