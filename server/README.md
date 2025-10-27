# 🔥 Buzz it Backend API

Backend API for Buzz it - Create buzz in social media with Twilio SMS verification.

## Features

- ✅ **Twilio SMS Verification** - Real SMS verification codes
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **User Management** - Create, read, update users
- ✅ **Buzz Management** - Create, like, share buzzes
- ✅ **Social Media Integration** - Connect social accounts
- ✅ **CORS Enabled** - Cross-origin requests supported

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` with your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### 3. Get Twilio Credentials

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token from the Console
3. Purchase a phone number for SMS
4. Add credentials to `.env` file

### 4. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/send-verification` - Send SMS verification code
- `POST /api/auth/verify-code` - Verify code and create user
- `POST /api/auth/login` - Login with username/password

### Users

- `GET /api/users` - List all users
- `GET /api/users/me` - Get current user (requires auth)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user (requires auth)
- `GET /api/users/check-username/:username` - Check username availability

### Buzzes

- `GET /api/buzzes` - List all buzzes
- `POST /api/buzzes` - Create buzz (requires auth)
- `PATCH /api/buzzes/:id/like` - Like/unlike buzz (requires auth)
- `PATCH /api/buzzes/:id/share` - Share buzz (requires auth)
- `DELETE /api/buzzes/:id` - Delete buzz (requires auth)

### Social Media

- `GET /api/social/:userId` - Get user's social accounts
- `POST /api/social` - Add social account (requires auth)
- `PUT /api/social/:id` - Update social account (requires auth)
- `DELETE /api/social/:id` - Delete social account (requires auth)

## Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## SMS Verification Flow

1. **Send Verification Code**
   ```bash
   POST /api/auth/send-verification
   {
     "mobileNumber": "+1234567890",
     "username": "johndoe"
   }
   ```

2. **Verify Code**
   ```bash
   POST /api/auth/verify-code
   {
     "mobileNumber": "+1234567890",
     "code": "123456",
     "verificationId": "uuid-from-step-1"
   }
   ```

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Other Platforms

- **Heroku**: Add `"start": "node index.js"` to package.json
- **DigitalOcean**: Use Docker or PM2
- **AWS**: Use Elastic Beanstalk or ECS

## Development

### Adding New Features

1. Add new routes in `index.js`
2. Update API documentation
3. Test with Postman or curl
4. Update frontend API service

### Database Integration

Currently uses in-memory storage. To add a real database:

1. Install database driver (e.g., `pg`, `mongodb`)
2. Replace in-memory arrays with database calls
3. Add connection pooling
4. Add migrations

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Yes |
| `TWILIO_PHONE_NUMBER` | Twilio Phone Number | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port | No (default: 3000) |

## Troubleshooting

### Twilio Issues

- Verify phone number format: `+1234567890`
- Check Twilio account balance
- Ensure phone number is verified for trial accounts

### Authentication Issues

- Check JWT token format
- Verify token hasn't expired
- Ensure proper Authorization header

### CORS Issues

- CORS is enabled for all origins
- For production, restrict to your domain

## Support

- Check logs for error details
- Verify environment variables
- Test with Postman collection
- Check Twilio console for SMS delivery

---

**Happy Coding! 🎉**

The backend is now ready to power your Buzz it app with real SMS verification!