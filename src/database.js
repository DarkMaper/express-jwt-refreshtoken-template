import { connect as CreateConn } from 'mongoose';

CreateConn(process.env.MONGO_URI)
.then(() => console.log('Connected to database'))
.catch( err => console.error(err))