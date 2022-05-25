import Dexie from 'dexie';

export const db = new Dexie(process.env.VUE_APP_DATABASE);

db.version(parseInt(process.env.VUE_APP_DATABASE_VERSION))
  .stores({
    nearContacts: 'userId',
    kds: 'userId',
    mails: '[userId+id], from, to, date, code, decrypted, read, toUserId, fromUserId',
  });
