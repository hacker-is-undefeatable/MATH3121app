# MathMaster

Welcome to **MathMaster**, a mobile quiz application built with [Expo](https://expo.dev) and React Native. This app allows users to register, log in, take quizzes, and view their score history, all within a visually appealing dark, starry-night themed interface. Powered by Supabase for authentication and data storage, MathMaster provides a seamless cross-platform experience on Android, iOS, and web.

## Features

- **User Authentication**: Secure registration and login with email and password, integrated with Supabase. *Note: After clicking the email confirmation link, you may encounter an error message. This can be safely ignored as the email account is still confirmed. For best results, use a laptop to click the confirmation link.*
- **Interactive Quizzes**: Take quizzes with multiple-choice questions and track progress.
- **Score History**: View past quiz scores with timestamps.
- **Dark Theme**: A cohesive, starry-night UI with animated stars for an engaging user experience.
- **Cross-Platform**: Runs on Android, iOS, and web using Expo.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v16 or higher)
- [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/go) app for mobile testing (optional)
- A [Supabase](https://supabase.com) account for authentication and database

### Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Supabase**

   - Email chwman@connect.ust.hk to obtain the Supabase key and URL. You will then be given a file named supabaseConfig.json. Please place it in the root directory.

4. **Start the App**

   ```bash
   npx expo start
   ```

   In the output, you'll see options to:
   - Open in a [development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - Run on an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - Run on an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - Test in [Expo Go](https://expo.dev/go) for quick mobile previews

## Project Structure

This project uses [file-based routing](https://docs.expo.dev/router/introduction) with Expo Router. Key files and directories include:

- **app/**: Contains the main app screens (`RegisterScreen.js`, `LoginScreen.js`, `QuizScreen.js`, `DashboardScreen.js`).
- **contexts/AuthContext.js**: Manages user authentication with Supabase.

## Development

- **Editing**: Modify files in the `app/` directory to update screens or add new routes.
- **Styling**: The app uses a consistent dark theme with `#1f1f1f` background, `#E0E0E0` text, and `#4A5859` borders.
- **Database**: Ensure your Supabase tables (`quizzes`, `questions`, `scores`) are set up with the correct schema.

## Learn More

Explore these resources to deepen your understanding of Expo and React Native:

- [Expo Documentation](https://docs.expo.dev): Covers fundamentals and advanced topics.
- [Expo Tutorial](https://docs.expo.dev/tutorial/introduction): A step-by-step guide to building a universal app.
- [React Native Documentation](https://reactnative.dev): Learn about native components and APIs.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code follows the project's style guidelines and includes tests where applicable.
