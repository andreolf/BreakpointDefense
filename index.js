import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent ensures the app is the root component
// regardless of whether you're using expo start or native builds
registerRootComponent(App);

