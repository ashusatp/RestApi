// npm i express esm nodemon -D dotenv
import express from 'express';
import {APP_PORT} from './config' 
const app = express();

app.listen(APP_PORT, ()=>{
    console.log(`Listning on port ${APP_PORT}`);
})
