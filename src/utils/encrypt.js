// 文本解密
import crypto from "crypto"

/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
const AES_conf = {
  key: '54F0853FD5D8D2FD61CE33309B0D0273', //密钥
  iv: 'A19820BCE43576DF', //偏移向量
  padding: 'PKCS7Padding' //补全值
}

/**
 * 文本解密
 * @param data
 * @param ks
 * @returns {string}
 */
export const decrypted = (data, key) => {
  let iv = AES_conf.iv;
  // console.log("text:", data)
  const cipherChunks = [];
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
  cipherChunks.push(decipher.final('utf8'));
  return cipherChunks.join('');
}

/**
 * 文本加密
 * @param data
 * @param ks
 * @returns {string}
 */
export const encrypted = (data, ks) => {
  let key = ks ? ks : AES_conf.key;
  let iv = AES_conf.iv;
  let padding = AES_conf.padding;
  const cipherChunks = [];
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
  cipherChunks.push(cipher.final('base64'));
  return cipherChunks.join('');
}

export const genKs0 = () => {
  // return Number(Math.random().toString().substr(3,length) + Date.now()).toString(32);
  let d = new Date().getTime();
  return "xxxxxxxxxxxx4xxxxxyxxxxxxxxxxxxx"
    .replace(/[xy]/g,
      c => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
}

export function md5(s) {
  //注意参数需要为string类型，否则会报错
  return crypto.createHash('md5').update(String(s)).digest('hex');
}
