# timeouts.ts-dev
Persistent timeouts that call an event when it expires using quick.db!

## Install
```
npm i timeouts.ts-dev
```

## Usage
**JavaScript:**
```js
const { Timeouts } = require('timeouts.ts-dev')
const timeouts = new Timeouts(client, {
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

### Methods
#### Create:
**`<Timeouts>.create(id: string, time: number, data: any): Promise<void>`**

Ex: `timeouts.create('globalId', 60_000, 'hello')`
#### Delete:
**`<Timeouts>.delete(func: Function): Promise<void>`**

Ex: `timeouts.delete((timeout) => timeout.data === 'hello')`
#### Has:
**`<Timeouts>.has(func: Function): Promise<boolean>`**

Ex: `timeouts.has((timeout) => timeout.data === 'hello')`

### Events
```
ready: Timeouts
create: Timeout
delete: Timeout
expires: Timeout
```