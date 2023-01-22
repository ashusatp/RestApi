// npm i express esm nodemon -D dotenv
import express from 'express';
import mongoose from 'mongoose';
import {APP_PORT, DB_URL} from './config' 
import path from 'path'
import errorHandler from './middlewares/errorHandler';
import routes from './routes'
const app = express();

//Database
mongoose.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
db.once('open',()=>{
    console.log('DB connected...');
})

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use('/api',routes)

app.use(errorHandler);
app.listen(APP_PORT, ()=>{
    console.log(`Listning on port ${APP_PORT}`);
})
