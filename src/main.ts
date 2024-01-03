import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { defineCustomElements } from '@ionic/pwa-elements/loader';


import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACom5kGZncV-IM7ia0z0XgNMBRIo-aA9w",
  authDomain: "travelspot-6055a.firebaseapp.com",
  databaseURL: "https://travelspot-6055a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "travelspot-6055a",
  storageBucket: "travelspot-6055a.appspot.com",
  messagingSenderId: "1024086405286",
  appId: "1:1024086405286:web:b43ddcc8b80a15950d8467"
};


initializeApp(firebaseConfig)

const app = createApp(App)
  .use(IonicVue)
  .use(router);

  // Register Ionic PWA elements
defineCustomElements(window);
router.isReady().then(() => {
  app.mount('#app');
});