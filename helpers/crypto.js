const CryptoJS = require("crypto-js");
require("dotenv").config();

class Crypto {
  constructor(key) {
    this.key = key;
  }
  encrypt(str) {
    try {
      return CryptoJS.AES.encrypt(str, this.key.toString()).toString();
    } catch (error) {
      return "tberror";
    }
  }
  decrypt(str) {
    try {
      const dattt = CryptoJS.AES.decrypt(str, this.key.toString());
      return dattt.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return "tberror";
    }
  }
  encryptobj(obj) {
    try {
      return CryptoJS.AES.encrypt(
        JSON.stringify(obj),
        this.key.toString()
      ).toString();
    } catch (error) {
      return "tberror";
    }
  }
  decryptobj(str) {
    try {
      const objt = CryptoJS.AES.decrypt(str, this.key.toString());
      return JSON.parse(objt.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      return "tberror";
    }
  }
}
const password = process.env.CRYPTO_PASS;
const salt = process.env.CRYPTO_SALT;
const key = CryptoJS.PBKDF2(password, salt, {
  keySize: 256 / 32,
  iterations: 100,
});
module.exports = new Crypto(key);
