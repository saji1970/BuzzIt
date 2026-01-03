# Facebook App Mode - Development vs Live

## Check Current Mode

1. Go to https://developers.facebook.com/apps/
2. Select your BuzzIt app
3. Look at the **top-right corner** of the dashboard
4. You'll see a toggle that says either:
   - **"Development"** (with a green dot) - App is in development mode
   - **"Live"** (with a blue dot) - App is live/production mode

---

## Development Mode (Recommended for Testing)

### What is Development Mode?

- App is private - only you and testers can use it
- No App Review required for basic features
- Can test freely without affecting real users
- Good for building and testing your app

### How to Set to Development Mode

**If your app is currently Live:**

1. Click the toggle in the top-right corner
2. Select **"Switch to Development Mode"**
3. Confirm the action
4. App is now in Development mode

**If already in Development mode:**
- No action needed! Keep it in Development while testing.

### Add Yourself as a Tester (Required for Development Mode)

When in Development mode, ONLY these people can use your app:
- **Developers** - Full access to the app
- **Testers** - Can test the app
- **Test Users** - Fake accounts for testing

**To add yourself:**

1. In your Facebook App Dashboard
2. Left sidebar → **"Roles"** → **"Roles"**
3. Under **"Developers"** section:
   - If you created the app, you're already here ✅
   - You can see your name/email listed

4. If you're NOT listed as a developer, add yourself as a **Tester**:
   - Scroll to the **"Testers"** section
   - Click **"Add Testers"**
   - Enter your Facebook account name or email
   - Click **"Submit"**
   - Check your Facebook notifications
   - Accept the tester invitation

**To add other people for testing:**

1. Roles → Roles → **"Testers"** section
2. Click **"Add Testers"**
3. Enter their Facebook name or email
4. They must accept the invitation in their Facebook notifications

---

## Live Mode (Production)

### What is Live Mode?

- App is public - anyone can use it
- Requires App Review for most features
- Used for production/released apps
- Changes affect real users

### How to Set to Live Mode

**Requirements before going Live:**

1. ✅ Complete all required fields in Settings → Basic:
   - App Icon (1024x1024)
   - Privacy Policy URL
   - User Data Deletion
   - App Domains

2. ✅ Get Advanced Access for permissions:
   - `email` - Should have "Advanced Access" (no review needed)
   - `public_profile` - Should have "Advanced Access" (no review needed)

3. ✅ Test everything in Development mode first

4. ✅ Submit for App Review if using advanced features

**Switch to Live Mode:**

1. Complete all requirements above
2. Click the toggle in the top-right corner
3. Select **"Switch to Live Mode"**
4. Review the checklist Facebook shows
5. Click **"Switch Mode"**
6. App is now Live

---

## Recommended Setup for You

**For Testing (Now):**

✅ **Use Development Mode**
1. Keep app in Development mode
2. Add yourself as a Developer/Tester
3. Test Facebook login
4. Test all features
5. Fix any bugs

**For Production (Later):**

✅ **Switch to Live Mode**
1. Complete all testing
2. Fill in all required app information
3. Get Advanced Access for permissions
4. Switch to Live mode
5. Submit for App Review if needed

---

## Quick Reference

### Current Mode Check
```
Facebook App Dashboard → Top-right corner toggle
- Green "Development" = Development mode
- Blue "Live" = Live mode
```

### Add Yourself as Tester
```
Left sidebar → Roles → Roles → Testers → Add Testers
Enter your Facebook email → Submit → Accept invitation
```

### Switch Modes
```
Top-right toggle → Select desired mode → Confirm
```

---

## Common Questions

### Q: Can anyone use my app in Development mode?
**A:** No. Only developers, testers, and test users can access your app.

### Q: Do I need App Review in Development mode?
**A:** No. `email` and `public_profile` permissions work immediately with Advanced Access.

### Q: Should I use Development or Live mode?
**A:** Use Development mode while building and testing. Switch to Live when ready for real users.

### Q: How do I know if I'm added as a tester?
**A:** Go to Roles → Roles. You should see your name under "Developers" or "Testers".

### Q: What if I can't add myself as a tester?
**A:** If you created the app, you're automatically a developer. If someone else created it, they need to add you.

### Q: Can I switch back and forth between modes?
**A:** Yes, you can switch anytime. But be careful - switching to Live affects real users.

---

## Troubleshooting

### Issue: Can't find the mode toggle
**Location:** Top-right corner of the Facebook App Dashboard (next to your profile picture)

### Issue: Toggle is grayed out
**Cause:** Missing required information
**Fix:** Go to Settings → Basic and fill in all required fields

### Issue: "This app isn't available" when trying to use it
**Cause:** App is in Development mode and you're not a tester
**Fix:** Add yourself in Roles → Roles → Testers

### Issue: Can't switch to Live mode
**Cause:** Missing requirements
**Fix:**
1. Add app icon (1024x1024)
2. Add privacy policy URL
3. Add data deletion URL
4. Complete all required fields

---

## Summary

**For testing your BuzzIt app now:**

1. ✅ Keep app in **Development mode**
2. ✅ Go to Roles → Roles
3. ✅ Verify you're listed as Developer or Tester
4. ✅ If not, add yourself as Tester
5. ✅ Accept the invitation
6. ✅ Try Facebook login again

**Development mode is perfect for testing - use it until you're ready to launch!**
