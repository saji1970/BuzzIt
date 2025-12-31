# 📝 Facebook App Review Submission Guide

## Step-by-Step Submission Process

### Step 1: Prepare Your App

#### 1.1 Complete App Setup
- [ ] Add Privacy Policy URL in App Settings → Basic → Privacy Policy URL
- [ ] Add App Domain: `buzzit-production.up.railway.app`
- [ ] Add Valid OAuth Redirect URIs:
  - `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback`
  - `https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback`
- [ ] Add App Icon and Display Name
- [ ] Complete App Details section

#### 1.2 Prepare Test Assets
- [ ] Create test user accounts (if needed)
- [ ] Prepare screenshots for each test case
- [ ] Create video walkthrough (optional but recommended)
- [ ] Write clear use case descriptions

### Step 2: Request Permissions

1. Go to [Facebook App Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Navigate to **App Review** → **Permissions and Features**

#### Request Each Permission:

##### 2.1 `pages_manage_posts`
- Click **Request** or **Add Permission**
- **Use Case**: "Allow users to post their created content (buzzes) to their Facebook Pages"
- **Detailed Description**: 
  ```
  Users create multimedia posts (text, images, videos) in our app called "buzzes". 
  They can choose to share these buzzes to their connected Facebook Pages. 
  This permission allows us to create posts on the user's behalf on their Pages.
  ```
- **Where in App**: Settings → Social Media → Connect Facebook Page → Share Buzz → Select Facebook Page
- **Upload Screenshots**: 
  - Screenshot of buzz creation
  - Screenshot of share options
  - Screenshot of Facebook Page showing the posted content

##### 2.2 `pages_read_engagement`
- Click **Request** or **Add Permission**
- **Use Case**: "Display engagement metrics (likes, comments, shares) for posts shared to Facebook Pages"
- **Detailed Description**:
  ```
  Users want to see how their shared content is performing. 
  This permission allows us to read engagement metrics from posts shared to Facebook Pages 
  and display them in our app's analytics dashboard.
  ```
- **Where in App**: Analytics/My Posts section → View post details → See engagement metrics
- **Upload Screenshots**:
  - Screenshot of analytics dashboard
  - Screenshot showing engagement metrics

##### 2.3 `instagram_basic`
- Click **Request** or **Add Permission**
- **Use Case**: "Access Instagram Business Account information for account connection"
- **Detailed Description**:
  ```
  Users connect their Instagram Business Accounts to share content. 
  This permission allows us to retrieve basic account information (username, profile picture, account ID) 
  to display and verify the connected account.
  ```
- **Where in App**: Settings → Social Media → Connect Instagram
- **Upload Screenshots**:
  - Screenshot of Instagram connection screen
  - Screenshot showing connected Instagram account

##### 2.4 `instagram_content_publish`
- Click **Request** or **Add Permission**
- **Use Case**: "Allow users to publish content to their Instagram Business Accounts"
- **Detailed Description**:
  ```
  Users create multimedia posts in our app and want to share them to Instagram. 
  This permission allows us to publish images/videos with captions to the user's Instagram Business Account feed.
  ```
- **Where in App**: Create Buzz → Share → Select Instagram → Publish
- **Upload Screenshots**:
  - Screenshot of buzz creation with media
  - Screenshot of Instagram share option
  - Screenshot of Instagram feed showing published post

### Step 3: Complete Review Questions

For each permission, Facebook will ask:

#### Data Use Questions:
- **What data do you request?**
  - Answer: Facebook Page ID/name, Instagram account ID/username, access tokens, engagement metrics

- **How do you use this data?**
  - Answer: To identify connected accounts, post content on user's behalf, display analytics

- **Do you share this data with third parties?**
  - Answer: No, we do not share user data with third parties

- **Do you use this data for advertising?**
  - Answer: No, we only use data for the stated features

#### User Experience Questions:
- **How does the user grant permission?**
  - Answer: User taps "Connect Facebook" or "Connect Instagram" in app settings, authenticates with Facebook, and grants permissions through Facebook's OAuth dialog

- **How do users revoke permission?**
  - Answer: Users can disconnect their accounts in Settings → Social Media Accounts → Disconnect. This immediately revokes all permissions.

### Step 4: Submit Test Cases

1. In the App Review submission, you'll be asked to provide test cases
2. Use the test cases from `FACEBOOK_APP_REVIEW_TEST_CASES.md`
3. For each permission, provide:
   - Step-by-step instructions
   - Expected results
   - Screenshots or video

### Step 5: Add Test Users (If Required)

If your app is in Development mode:

1. Go to **Roles** → **Test Users**
2. Add test users or create new ones
3. Provide test credentials in the review submission
4. Or switch app to "Live" mode for testing (if applicable)

### Step 6: Submit for Review

1. Review all information for accuracy
2. Ensure all required fields are completed
3. Upload all screenshots/videos
4. Click **Submit for Review**

### Step 7: Monitor Review Status

- Check **App Review** dashboard regularly
- Respond to any reviewer questions within 24 hours
- Make changes if requested
- Review typically takes 3-7 business days

---

## Common Reasons for Rejection

### 1. Insufficient Use Case Description
**Problem**: Description is too vague
**Solution**: Be very specific about how and why you use each permission

### 2. Missing Screenshots/Videos
**Problem**: Reviewers can't verify functionality
**Solution**: Provide clear screenshots showing each step and the result

### 3. Privacy Policy Issues
**Problem**: Privacy policy doesn't mention Facebook/Instagram data usage
**Solution**: Update privacy policy to explicitly mention how you use Facebook/Instagram data

### 4. Not Following Guidelines
**Problem**: App doesn't follow Facebook Platform Policy
**Solution**: Review Facebook Platform Policy and ensure compliance

### 5. Insufficient Test Instructions
**Problem**: Reviewers can't test the features
**Solution**: Provide detailed, step-by-step test cases with expected results

---

## Tips for Successful Review

### ✅ Do's:
- **Be Clear and Specific**: Describe exactly how you use each permission
- **Provide Complete Test Cases**: Give reviewers everything they need to test
- **Show Real Examples**: Use actual screenshots from your app
- **Respond Quickly**: Answer reviewer questions within 24 hours
- **Test Everything First**: Make sure all features work before submitting

### ❌ Don'ts:
- **Don't Be Vague**: Avoid generic descriptions
- **Don't Skip Steps**: Provide complete test instructions
- **Don't Ignore Requests**: Respond to all reviewer questions
- **Don't Submit Broken Features**: Test everything thoroughly first
- **Don't Request Unnecessary Permissions**: Only request what you actually use

---

## After Approval

Once your permissions are approved:

1. **Update App Code**: Add the approved permissions back to your OAuth scopes
2. **Test in Production**: Verify everything works with approved permissions
3. **Monitor Usage**: Keep track of how permissions are being used
4. **Stay Compliant**: Continue following Facebook Platform Policy

---

## Update OAuth Scopes After Approval

Once permissions are approved, update your code:

```javascript
// In server/routes/socialAuthRoutes.js

facebook: {
  // ... other config ...
  scope: 'public_profile,pages_manage_posts,pages_read_engagement',
},

instagram: {
  // ... other config ...
  scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
},
```

---

## Resources

- [Facebook App Review Documentation](https://developers.facebook.com/docs/app-review)
- [Facebook Platform Policy](https://developers.facebook.com/policy)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Pages API Documentation](https://developers.facebook.com/docs/pages)

---

## Checklist Before Submission

- [ ] Privacy Policy URL added to app settings
- [ ] App Domain configured correctly
- [ ] OAuth Redirect URIs added
- [ ] Test cases written and tested
- [ ] Screenshots prepared for each permission
- [ ] Video walkthrough created (optional)
- [ ] All use case descriptions written
- [ ] Test users added (if needed)
- [ ] Code tested with requested permissions
- [ ] Ready to submit!

---

**Good luck with your App Review submission!** 🚀

