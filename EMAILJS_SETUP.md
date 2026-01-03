# EmailJS Setup Guide

## Current Configuration

- **Public Key**: `BniRJ2-ISpjpbwtP_`
- **Service ID**: `AUXO_Contact`
- **Template ID**: `template_0xusna8`

## Email Template Configuration

Your EmailJS template must use these **exact variable names**:

### Required Template Variables

```
{{from_name}}      - Sender's name
{{from_email}}     - Sender's email address
{{company}}        - Company name (or "Not provided")
{{subject}}        - Message subject
{{message}}        - Message content
```

### Recommended Template Structure

**Subject Line:**
```
New Contact Form Submission - {{subject}}
```

**Email Body:**
```
You have received a new message from the AUXO Data Labs contact form.

From: {{from_name}}
Email: {{from_email}}
Company: {{company}}

Subject: {{subject}}

Message:
{{message}}

---
This message was sent from the AUXO Data Labs website contact form.
```

## How to Update Your Template

1. Go to https://dashboard.emailjs.com/admin/templates
2. Click on template `template_0xusna8`
3. Update the template to use the variable names shown above
4. Make sure to use double curly braces: `{{variable_name}}`
5. Click **Save** and **Test** the template

## GitHub Actions Secrets

Add these secrets to your GitHub repository:

1. Go to: `https://github.com/YOUR_USERNAME/auxo-final-website/settings/secrets/actions`
2. Add these secrets:

```
PUBLIC_EMAILJS_PUBLIC_KEY = BniRJ2-ISpjpbwtP_
PUBLIC_EMAILJS_SERVICE_ID = AUXO_Contact
PUBLIC_EMAILJS_TEMPLATE_ID = template_0xusna8
```

## Features Included

✅ **Form Validation** - Real-time validation with Zod schema
✅ **Rate Limiting** - Prevents spam (60-second cooldown between submissions)
✅ **Debounced Validation** - 500ms delay for smooth UX
✅ **Error Handling** - Inline field errors with clear messages
✅ **Success Notifications** - Toast notifications for user feedback
✅ **Loading States** - Button shows "Sending..." during submission
✅ **Google Analytics** - Tracks form submissions (if GA is configured)
✅ **Auto Form Reset** - Clears form after successful submission

## Troubleshooting

### 422 Error (Current Issue)
- **Cause**: Template variable names don't match
- **Fix**: Update your EmailJS template to use the exact variable names listed above

### Configuration Error
- **Cause**: Environment variables not set
- **Fix**: Ensure `.env` file has all three EmailJS variables

### Rate Limit Error
- **Message**: "Please wait X seconds before submitting again"
- **Cause**: User tried to submit within 60 seconds
- **Fix**: Wait for the cooldown period

## Testing the Form

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:4340/contact`
3. Fill out the form with valid data
4. Submit and check for success notification
5. Verify email is received at your configured recipient address
