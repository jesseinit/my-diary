import 'babel-polyfill';
import dotenv from 'dotenv';
import webpush from 'web-push';
import { pool } from './connection';

dotenv.config();

const publicVapid = process.env.VAPID_PUBLIC;
const privateVapid = process.env.VAPID_PRIVATE;

webpush.setVapidDetails('mailto:test1@test1.com', publicVapid, privateVapid);

const sendNotification = async () => {
  try {
    const users = await pool.query('select * from users where reminder = $1', [true]);
    if (users.rowCount > 0)
      users.rows.forEach(async user => {
        const subscription = user.push_sub;
        const payload = JSON.stringify({
          title: `Hi ${user.fullname}`,
          body: 'Let every moment count. Write a diary of today in History'
        });
        await webpush.sendNotification(subscription, payload, { TTL: 43200 });
      });
    else {
      console.log('No User Subscribed Yet');
    }
  } catch (error) {
    // console.log(error);
  }
};

sendNotification();
export default sendNotification;
