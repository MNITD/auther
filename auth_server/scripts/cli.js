import {program} from 'commander'
import bcrypt from 'bcrypt'
import {generateKeyPair} from 'crypto'
import fs from 'fs'

const users = program.command('users')
const clients = program.command('clients')
const secrets = program.command('secrets')

secrets
  .command('keypair [passphrase] <dist>')
  .description('generate public/private keys')
  .action(async (passphrase, dist) => {
    const pair = await new Promise((res) =>
      generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          passphrase,
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
        },
      }, (err, publicKey, privateKey) => {
        if (!err) res({publicKey, privateKey})
      }))
    if (dist) {
      fs.writeFile(dist, JSON.stringify(pair), (err) => {
        if(err) console.log(err)
        else console.log('File successfully created')
      })
    } else {
      console.log(pair)
    }
  })

users
  .command('add <username> <password>')
  .description('add user to db')
  .action(async (username, password) => {
    const hash = await bcrypt.hash(password, 10)
    console.log('hash', hash)
  })

users
  .command('compare <password> <hash>')
  .description('compare password with hash')
  .action(async (password, hash) => {
    const result = await bcrypt.compare(password, hash)
    console.log(result)
  })

clients
  .command('add <name> <type>')
  .description('add user to db')
  .action(async (name, type) => {

  })

program.parse(process.argv)
