import 'dotenv/config';
import '../database';
import Role from '../models/Role';
import User from '../models/User';
(async () => {
        const roleAdmin = {
            name: 'admin',
            permissions: ['*']
        };

        const newRole = new Role(roleAdmin);

        const adminUser = {
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'Example',
            password: 'password',
            role: newRole._id
        }

        const newUser = new User(adminUser);

        await newRole.save();
        await newUser.save();
        console.log('Admin role and Admin user is created');
        process.exit(0);
    }
)()