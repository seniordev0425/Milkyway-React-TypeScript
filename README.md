
# Key concepts

## Key components:

- Create react app with Typescript.
- Pure SCSS for all styles.
- React-dates and other similar libraries used only where required. Can be looked through component-wise.
- React hooks are used all the way for state management, no external libraries.

## Project structure
- Each component is a separate folder, even app (the so-called entry point). Each folder has a `component-container.tsx` and `component.scss` file that are pretty much self-contained. Some global styles are in `app.scss` level.
- The Routes are in a separate folder, that exposes through the index file inside the routes folder. This folder dictates the react routing paths available, as seen inside `app-container.tsx`
- Images are in a separate folder, font is loaded through Google fonts. No extra style libraries or such is used. BEM is followed as much as possible. Some redundancies may be there.

## How to read code
Start with `app-container.tsx` in `/components`. See all the routes available. Then Drill down to the desired component.

## Access control
Access control for logged-in users is done with private routes. This will ensure that before loading any route, the access is calculated. For more fine-grain control, the role in auth0 app metadata is used and often stored in the component state.


## CRA boilerplate

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
