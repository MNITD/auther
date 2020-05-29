import app from 'src/app'

const port = process.env.PORT || 9000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

console.log('Hello from Auther!')
