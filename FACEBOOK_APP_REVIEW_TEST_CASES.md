# 📋 Facebook App Review - Test Cases

## App Information

- **App Name**: Buzz it
- **App ID**: [Your Facebook App ID]
- **App Type**: Social Media Platform
- **Website**: https://buzzit-production.up.railway.app
- **Privacy Policy**: [Your Privacy Policy URL]

## Permissions Requested

1. **pages_manage_posts** - To post content to Facebook Pages
2. **pages_read_engagement** - To read engagement metrics on posts
3. **instagram_basic** - To access Instagram Business Account information
4. **instagram_content_publish** - To publish content to Instagram Business Accounts

---

## Use Case Justification

### Primary Use Case
**Buzz it** is a social media content creation platform that allows users to create multimedia posts (called "buzzes") and share them across multiple social media platforms, including Facebook Pages and Instagram Business accounts.

### User Benefits
- **Content Creators**: Share their creations (videos, images, music) directly to their Facebook Pages and Instagram accounts from one platform
- **Businesses**: Manage content distribution across multiple social platforms efficiently
- **Influencers**: Cross-post content to maximize reach and engagement
- **Event Organizers**: Promote events across Facebook and Instagram simultaneously

### How We Use the Permissions

#### 1. `pages_manage_posts`
- **Purpose**: Allow users to post their "buzzes" (text, images, videos) to their connected Facebook Pages
- **User Action**: User selects a buzz and chooses "Share to Facebook Page"
- **Technical Use**: Creates a post on the user's Facebook Page using the Graph API

#### 2. `pages_read_engagement`
- **Purpose**: Display engagement metrics (likes, comments, shares) for posts shared to Facebook Pages
- **User Action**: User views analytics/stats for their shared content
- **Technical Use**: Reads engagement data to show in-app analytics dashboard

#### 3. `instagram_basic`
- **Purpose**: Access user's Instagram Business Account information (username, profile picture, account ID)
- **User Action**: User connects their Instagram Business Account
- **Technical Use**: Retrieves Instagram account details for display and verification

#### 4. `instagram_content_publish`
- **Purpose**: Allow users to publish their buzzes (images/videos with captions) to their Instagram Business Account
- **User Action**: User selects a buzz and chooses "Share to Instagram"
- **Technical Use**: Creates a post on the user's Instagram Business Account using Instagram Graph API

---

## Test Cases for Reviewers

### Prerequisites for Testing

1. **Test Account Setup**
   - Facebook account with at least one Facebook Page (you can create a test page)
   - Instagram Business Account connected to the Facebook Page
   - Access to the Buzz it app (iOS/Android app or web interface)

2. **Test Credentials**
   - App URL: https://buzzit-production.up.railway.app
   - Test User Account: [Create a test account or provide credentials]
   - Test Facebook Page: [Reviewer can create their own test page]

---

### Test Case 1: Connect Facebook Page

**Objective**: Verify users can connect their Facebook Page to the app

**Steps**:
1. Open the Buzz it app
2. Navigate to **Settings** → **Social Media Accounts**
3. Tap **Connect Facebook**
4. Authenticate with Facebook and grant permissions
5. Select a Facebook Page to connect
6. Grant `pages_manage_posts` and `pages_read_engagement` permissions
7. Verify the Facebook Page appears as "Connected" in the app

**Expected Result**:
- ✅ Facebook Page is successfully connected
- ✅ Page name and profile picture are displayed in the app
- ✅ Connection status shows "Connected"

**Screenshots Needed**:
- Screen showing Facebook Page connection
- Screen showing connected page in app settings

---

### Test Case 2: Post to Facebook Page

**Objective**: Verify users can post content (buzz) to their Facebook Page

**Steps**:
1. Create a new "buzz" in the app with:
   - Text content: "Test post from Buzz it app"
   - Optional: Add an image or video
2. Tap **Share** or **Post**
3. Select **Share to Facebook Page**
4. Choose the connected Facebook Page
5. Review the post preview
6. Confirm and post

**Expected Result**:
- ✅ Post appears on the Facebook Page
- ✅ Post contains the text content from the buzz
- ✅ If media was included, it appears in the Facebook post
- ✅ Success message is displayed in the app

**Screenshots Needed**:
- App screen showing buzz creation
- App screen showing share options
- Facebook Page showing the posted content

---

### Test Case 3: View Facebook Page Engagement Metrics

**Objective**: Verify users can view engagement metrics for posts shared to Facebook Pages

**Steps**:
1. Navigate to **Analytics** or **My Posts** section
2. Find a post that was shared to Facebook Page
3. Tap on the post to view details
4. View engagement metrics (likes, comments, shares)

**Expected Result**:
- ✅ Engagement metrics are displayed
- ✅ Data matches the actual Facebook post engagement
- ✅ Metrics update when refreshed

**Screenshots Needed**:
- App screen showing engagement metrics
- Comparison with actual Facebook post engagement

---

### Test Case 4: Connect Instagram Business Account

**Objective**: Verify users can connect their Instagram Business Account

**Steps**:
1. Ensure you have an Instagram Business Account connected to your Facebook Page
2. In Buzz it app, go to **Settings** → **Social Media Accounts**
3. Tap **Connect Instagram**
4. Authenticate with Facebook (since Instagram uses Facebook auth)
5. Grant `instagram_basic` and `instagram_content_publish` permissions
6. Verify the Instagram account is connected

**Expected Result**:
- ✅ Instagram Business Account is successfully connected
- ✅ Instagram username and profile picture are displayed
- ✅ Connection status shows "Connected"

**Screenshots Needed**:
- Screen showing Instagram account connection
- Screen showing connected Instagram account in settings

---

### Test Case 5: Publish to Instagram

**Objective**: Verify users can publish content to Instagram Business Account

**Steps**:
1. Create a new "buzz" with:
   - Image or video (Instagram requires visual media)
   - Caption text: "Test post from Buzz it app"
2. Tap **Share** or **Post**
3. Select **Share to Instagram**
4. Review the post preview
5. Confirm and publish

**Expected Result**:
- ✅ Post appears on the Instagram Business Account feed
- ✅ Post contains the image/video and caption
- ✅ Success message is displayed in the app

**Screenshots Needed**:
- App screen showing buzz creation with media
- App screen showing Instagram share option
- Instagram feed showing the published post

---

### Test Case 6: Multiple Platform Sharing

**Objective**: Verify users can share the same content to multiple platforms

**Steps**:
1. Create a buzz with text and media
2. Tap **Share**
3. Select both **Facebook Page** and **Instagram**
4. Confirm sharing to both platforms

**Expected Result**:
- ✅ Post appears on both Facebook Page and Instagram
- ✅ Both platforms show the content correctly
- ✅ Success confirmation for both platforms

**Screenshots Needed**:
- App screen showing multi-platform share selection
- Facebook Page showing the post
- Instagram feed showing the post

---

## Data Usage Explanation

### Data We Collect
- Facebook Page ID and name (for identification)
- Instagram Business Account ID and username (for identification)
- Access tokens (stored securely, encrypted)
- Engagement metrics (for analytics display only)

### Data We DO NOT Collect
- We do not collect, store, or sell user's personal Facebook/Instagram data
- We do not access user's friend lists or private messages
- We do not share data with third parties
- We only use permissions for the explicit features described above

### Data Storage
- Access tokens are encrypted and stored securely
- Tokens are only used for API calls to post content
- Users can disconnect their accounts at any time
- When disconnected, all stored tokens are deleted

---

## Privacy Policy

**Privacy Policy URL**: [Your Privacy Policy URL]

Our privacy policy clearly states:
- How we collect and use Facebook/Instagram data
- User's rights to access and delete their data
- How we protect user data
- Contact information for privacy inquiries

---

## Additional Information for Reviewers

### Testing Notes
- All features work in both mobile app (iOS/Android) and web interface
- Users can connect multiple Facebook Pages and Instagram accounts
- Content is shared only when user explicitly chooses to share
- No automatic posting or scheduled posts without user consent

### Common Questions

**Q: Can users share other people's content?**
A: No, users can only share their own created "buzzes". The app does not allow sharing of third-party content.

**Q: What happens if a user revokes permissions?**
A: The app will detect the revoked permissions and prompt the user to reconnect. No data is lost from the app itself.

**Q: Can users schedule posts?**
A: Currently, posts are published immediately. Scheduled posting may be added in a future update.

**Q: What media formats are supported?**
A: Images (JPG, PNG) and videos (MP4) are supported for both Facebook Pages and Instagram.

---

## Reviewer Checklist

When testing, please verify:

- [ ] Facebook Page connection works correctly
- [ ] Posts to Facebook Page appear correctly with all content
- [ ] Engagement metrics are displayed accurately
- [ ] Instagram Business Account connection works
- [ ] Posts to Instagram appear correctly with media and caption
- [ ] User can disconnect accounts successfully
- [ ] Privacy policy is accessible and clear
- [ ] No unexpected data is collected or used
- [ ] Permissions are used only for stated purposes

---

## Support Information

If reviewers encounter any issues during testing:

**Contact Email**: [Your support email]
**App Support URL**: https://buzzit-production.up.railway.app/support
**Response Time**: We will respond to reviewer inquiries within 24 hours

---

## App Review Submission Checklist

Before submitting for review, ensure you have:

- [ ] Added test user credentials (if required)
- [ ] Provided screenshots/videos for each test case
- [ ] Added Privacy Policy URL to Facebook App settings
- [ ] Added App Domain to Facebook App settings
- [ ] Added Valid OAuth Redirect URIs
- [ ] Verified all features work in test mode
- [ ] Prepared a video walkthrough (optional but recommended)
- [ ] Completed all required app review questions

---

## Video Walkthrough (Optional but Recommended)

Create a short video (2-5 minutes) demonstrating:
1. App overview and main features
2. Connecting Facebook Page
3. Creating and posting a buzz to Facebook Page
4. Connecting Instagram Business Account
5. Publishing to Instagram
6. Viewing analytics/engagement metrics

Upload the video to YouTube (unlisted) and include the link in your App Review submission.

---

## Notes

- **Development Mode**: App is currently in Development mode. Ensure test users are added to the app in Facebook App settings.
- **Production Mode**: After review approval, app will be switched to Live mode for public use.
- **Permissions Scope**: We only request permissions that are necessary for the described features. No additional permissions are requested.

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
**App Version**: 1.0.3
**Review Submission Date**: [Date you submit]

