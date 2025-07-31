# BMECom Login System Guide

## Overview
The BMECom system includes a complete login and user management system with the following features:

- User registration and login
- Moderator account management
- Dark blue font theme
- Local storage-based user management

## Available Accounts

### Test User Account
- **Email**: test@bmecom.com
- **Password**: test123
- **Role**: User

### Moderator Account (Mendel)
- **Email**: mendel@bmecom.com
- **Password**: 123
- **Role**: Moderator

## How to Set Up Accounts

### 1. Create Test User Account
1. Open `create-test-user.html` in your browser
2. Click "Create Test User Account" button
3. The test user account will be created automatically

### 2. Add Moderator Account
1. Open `add-moderator-account.html` in your browser
2. Click "Add/Update Mendel's Account" button
3. Mendel's moderator account will be created

## How to Login

### Method 1: Direct Login
1. Open `login.html` in your browser
2. Enter your email and password
3. Click "Login" button
4. You'll be redirected to the articles page upon successful login

### Method 2: Sign Up New Account
1. Open `login.html` in your browser
2. Click "Sign up" link at the bottom
3. Fill in your details (name, email, password)
4. Click "Create Account" button
5. You'll be automatically logged in and redirected to articles

## Font Changes Made

The system now uses a dark blue font color (`#1e3a8a`) throughout the application:

- Body text color updated
- Navigation links updated
- Section titles updated
- Service card headings updated
- Contact info headings updated
- Login page headers and labels updated
- Mobile navigation bars updated

## User Management Features

### For Regular Users
- Create account
- Login/logout
- View articles
- Basic profile management

### For Moderators
- All regular user features
- Manage other users
- Delete user accounts
- Assign/remove moderator roles
- Bulk user management

## File Structure

- `login.html` - Main login/signup page
- `login.js` - Login functionality
- `create-test-user.html` - Tool to create test user account
- `add-moderator-account.html` - Tool to manage moderator accounts
- `styles.css` - Updated with dark blue font theme

## Security Notes

- User data is stored in browser localStorage
- Passwords are stored in plain text (for demo purposes)
- In a production environment, implement proper password hashing and server-side authentication

## Troubleshooting

### Can't Login?
1. Make sure you've created an account first
2. Check that the email and password are correct
3. Try creating a new account using the signup form
4. Use the test user account: test@bmecom.com / test123

### No Users in System?
1. Open `create-test-user.html` to create a test account
2. Open `add-moderator-account.html` to create Mendel's account
3. Check the "Check Existing Users" button to verify accounts exist

### Font Not Showing as Dark Blue?
1. Clear your browser cache
2. Refresh the page
3. Check that `styles.css` has been updated with the new color values 