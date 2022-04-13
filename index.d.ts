import db from 'quick.db'
import { Timeouts } from './src/index'

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

export { Timeouts }