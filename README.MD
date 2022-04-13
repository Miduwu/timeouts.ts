# timeouts.ts-dev
Persistent timeouts that call an event when it expires using quick.db!

## Install
```
npm i timeouts.ts-dev
```

## Usage
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
```

### Methods
#### Create:
**`<Timeouts>.create(id: string, time: number, data: any): void`**

Ex: `timeouts.create('globalId', 60_000, 'hello')`
#### Delete:
**`<Timeouts>.delete(func: Function): void`**

Ex: `timeouts.delete((timeout) => timeout.data === 'hello')`
#### Has:
**`<Timeouts>`.has(func: Function): boolean**

Ex: `timeouts.has((timeout) => timeout.data === 'hello')`