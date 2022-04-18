import { TypedEmitter } from 'tiny-typed-emitter';
import { Client } from 'discord.js';

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

export class Timeouts extends TypedEmitter<Events> {
    /**
     * 
     * @param {Client} client The client class to check if its ready.
     * @param {TimeoutOptions} options The options to the class.
     * @param {boolean} init If init the class or not, default true.
     */
    constructor(client: Client, options: TimeoutOptions, init?: boolean);
    /**
     * Returns the timeouts array.
     * @returns {Promise<Timeout[]>} The peding timeouts.
     * 
     */
    public async getTimeouts(): Promise<Timeout[]>;
    /**
     * Create a timeout.
     * @param {string} id The id to this type of timeouts
     * @param {number} time The time in miliseconds. (x1000)
     * @param {*} data Anything you want to receive when it expires.
     * @returns {Promise<void>}
     */
    public async create(id: string, time: number, data: any): Promise<void>;
    /**
     * Check for pending timeouts.
     * @returns {Promise<void>}
     */
    private async _resolve(): Promise<void>;
    /**
     * Expires a timeout and emit the event
     * @param id The id of the timeout to expire.
     * @param expires The expire date of the timeout to expire.
     * @param time The time of the timeout to expire.
     * @returns {Promise<void>}
     */
    public async out(id: string, expires: number, time: number): Promise<void>;
    /**
     * Deletes a timeout from database without being executed.
     * @param {function} func The function to get and delete the timeout.
     * @returns {Promise<void>}
     * @example
     * <Timeouts>.delete((timeout) => timeout.id === 'globalId' && timeout.data.id === 'subId')
     */
    public async delete(func: Function): Promise<void>;
    /**
     * Check if a timeout exists in the database.
     * @param func The function to get and check if the timeout exists
     * @returns {Promise<boolean>} If it exists
     * @example
     * <Timeouts>.has((timeout) => timeout.id === 'globalId' && timeout.data.id === 'subId')
     */
    public async has(func: Function): Promise<boolean>;
    /**
     * Deletes a timeout from database directly with all timeout data.
     * @param id The id of the timeout to delete.
     * @param expires The expiration date of the timeout to delete.
     * @param time The time of the timeout to delete
     * @returns {Promise<void>}
     */
    private async deleteFromDB(id: string, expires: number, time: number): Promise<void>;
    /**
     * Initialize the class.
     * @returns {void}
     */
    private _init(): void;
}