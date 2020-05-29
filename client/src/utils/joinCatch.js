export const joinCatch = (promise) =>
  promise
    .then(data => [null, data])
    .catch(err => [err])
