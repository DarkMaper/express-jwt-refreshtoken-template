import 'dotenv/config';
import '../database';
import Role from '../models/Role';
import User from '../models/User';
(async () => {

        const adminRole = new Role({
            name: 'admin',
            permissions: ['*']
        });

        const userRole = new Role({
            name: 'user',
            permissions: []
        })

        const adminUser = {
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'Example',
            password: 'password',
            role: adminRole._id
        }

        const newUser = new User(adminUser);

        await adminRole.save();
        await newUser.save();
        await userRole.save();
        console.log('Admin role and Admin user is created');
        process.exit(0);
    }
)()