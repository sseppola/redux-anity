# Redux-anity (WIP!)
Handle data dependencies declaratively

`-anity` because the prefix is yet to be decided: sanity, insanity, or

![linsanity](https://media.giphy.com/media/WrBKMqGyrEvAs/giphy.gif)


## WORK IN PROGRESS
API may change without notice nor following semantic versioning.


## Install
```
npm install --save redux-anity
```


## Why?
Having tried quite a few async libraries to handle redux-style data fetching I
still don't feel like anything nails it, so wrote what I think could be a sane
way to handle data dependencies. Feedback welcome.

The idea is to stop writing data fetching in your components, and instead make
the middleware do the work.


## How does it work
Read the code, there's not that much of it.


## "This is ok, what's next?"
- [x] export as es5 module
- [ ] Tests
- [ ] Prioritize fetching
- [ ] Run certain tasks synchronously
- [ ] Retry middleware
- [ ] Shed superfluous dependencies
- [ ] Examples


## Contributions
Sure


## License
MIT
