const config = {
    email: {
        service: 'QQ',
        port: 465,
        host: 'smtp.exmail.qq.com',
        deleteMailsOlderThanDays: process.env.DELETE_MAILS_OLDER_THAN_DAYS || 30
    },
    imap: {
        user: 'happy88@linzhansoft.com',
        // user: 'niqiang@linzhansoft.com',
        // user: '2621847397@qq.com',
        password: 'Linzhan12345',
        // password: 'owuddyizpucadibc',
        host: 'imap.exmail.qq.com',
        // host: 'imap.qq.com',
        port: 993,
        tls: true,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }, //禁用对证书有效性的检查
        // refreshIntervalSeconds: process.env.IMAP_REFRESH_INTERVAL_SECONDS
    },
    specialMail: {
        // 分别是    0量子加密，  1聊天邮件， 2加密+聊天, 3加密+阅后即焚, 4加密+阅后即焚+聊天 ,5撤回邮件
        codeList: ['JeOW0ix7', 'JeOW0ix8', 'JeOW0ix9', 'JeOW0ix0', 'JeOW0ix1', 'JeOW0ix2'],
        // nameList: ['量子密钥加密', '无忧聊天', '量子密钥加密的聊天', '量子密钥加密的阅后即焚', '量子密钥加密的阅后即焚聊天', '撤回'],
        nameList: ['量子密钥加密', '无忧聊天', '无忧聊天', '量子密钥加密', '无忧聊天', '撤回'],
    },
    publicKey: '54F0853FD5D8D2FD61CE33309B0D0273',
    // publicKey: 'A3FA28B1F0C94626',
    http: { port: normalizePort(process.env.PORT || '3000'), ioport: '8880' }
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10)
    if (isNaN(port)) {
        // Named pipe
        return val
    }
    if (port >= 0) {
        // Port number
        return port
    }
    return false
}

module.exports = config
