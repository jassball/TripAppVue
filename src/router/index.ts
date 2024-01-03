import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw} from 'vue-router';
import HomePage from '@/views/HomePage.vue'
import DetailPage from '@/views/DetailPage.vue'
import ImagePage from '@/views/ImagePage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import AuthenticationPage from '@/views/AuthPage.vue'
import NewTravelSpotPage from '@/views/NewTravelSpotPage.vue'
import { toastController } from "@ionic/vue";
import { authService } from '@/services/firebase.authservice';

const parseJwt = (token:string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

const authenticationRouteGuard = async () => {
  const userAccessToken = localStorage.getItem("auth_token");
    if (!userAccessToken) {
      return { name: "Login" }
    }

    const jwtPayload = parseJwt(userAccessToken);

    const userAccessTokenExpiresAt = jwtPayload?.exp as unknown as number;

    if (userAccessTokenExpiresAt < Date.now()/1000) {
      
      localStorage.removeItem("auth_token");
      const errorToast = await toastController.create({
        message: "Brukersesjon er utløpt – logg inn på nytt",
        duration: 3000,
        color: "warning"
      });

      await errorToast.present();
      
      await authService.logout();
      return { name: "Login" }
    }
  

}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
    beforeEnter: [authenticationRouteGuard]
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfilePage,
    beforeEnter: [authenticationRouteGuard]
  },

  {
    path: "/authentication",
    name: "Login",
    component: AuthenticationPage,
  },
  {
    path: "/new-spot",
    name: "NewCampSpot",
    component: NewTravelSpotPage,
    beforeEnter: [authenticationRouteGuard]
  },
  {
    path: "/detail/:id",
    name: "Detail",
    component: DetailPage,
    beforeEnter: [authenticationRouteGuard]
  },
  {
    path: "/image",
    name: "ImagePage",
    component: ImagePage,
     beforeEnter: [authenticationRouteGuard]

  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
