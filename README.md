# Express jwt refreshtoken template
User authentication template via JWT with Refresh Token for Express.js 

## Usage

Install all dependencies
```bash
$ npm install
```

Open src/scripts/install.js and modify the administrator user info, then run npm run init-admin
```bash
$ npm run init-admin
```

Modify env variables. Example:
```
PORT=3000
COOKIE_SECRET=ThisIsSuperSecret
JWT_SECRET=ThisIsSuperSecret2
JWT_EXPIRES_IN=15m
MONGO_URI=mongodb://localhost/database-name
```

The proyect use Babel, so you need to compile the project before start.

```bash
$ npm run build
```
And start
```bash
$ npm run start
```

