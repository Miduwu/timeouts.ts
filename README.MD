# timeouts.ts-dev
Persistent timeouts that call an event when it expires using custom database!

## Install
```
npm i timeouts.ts-dev
```

## Usage
```js
import { Timeouts } from "timeouts.ts-dev";

const timeouts = new Timeouts({
    pulse: 10_000, // 10 seconds,
    db: db // quickdb
})

timeouts.create('globalId', 60_000, {foo: 'bar'})

timeouts.on('expires', timeout => {
    timeout
    /**
    { id: 'globalId', time: 60000, expires: Date, data: { 'foo': 'bar' } }
    */ 
})

timeouts._init() // let's start the class
```

### Methods
#### Create:
**`<Timeouts>.create(id: string, time: number, data: any): Promise<void>`**

Ex: `timeouts.create('globalId', 60_000, 'hello')`
#### Delete:
**`<Timeouts>.delete(func: (Timeout) => boolean): Promise<void>`**

Ex: `timeouts.delete((timeout) => timeout.data === 'hello')`
#### Has:
**`<Timeouts>.has(func: (Timeout) => boolean): Promise<boolean>`**

Ex: `timeouts.has((timeout) => timeout.data === 'hello')`

### Events
```
ready: Timeouts
create: Timeout
delete: Timeout
expires: Timeout
```