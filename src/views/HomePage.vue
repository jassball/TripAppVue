<script setup lang="ts">

import { onIonViewDidEnter, IonFooter, IonLoading, IonContent, IonButtons, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCard, IonHeader, IonPage, IonTitle, IonToolbar, toastController, IonIcon } from '@ionic/vue';
import { ref } from 'vue';
import {person, images, exit, addCircleOutline} from 'ionicons/icons';
import { authService } from '@/services/firebase.authservice';
import TravelSpotCard from '@/Components/TravelSpotCard.vue'; 
import {
  collection,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { useRouter } from 'vue-router';
import {ITravelSpotsResponse} from "@/models/TravelSpotModels" 
import {ITravelSpot} from "@/models/TravelSpotModels"

const db = getFirestore();
const travelSpots = ref<ITravelSpotsResponse.travel_spots | null>([]);
const router = useRouter();

const navigateTo = (route: string) => {
  router.push(route);
}

onIonViewDidEnter(async () => {
  fetchTravelSpots();
})

const refreshTravelSpotsView = async (event: CustomEvent) => {
  await fetchTravelSpots();
  event.detail.complete();  //??
}

const fetchTravelSpots = (async () => {
  try {
    const results: ITravelSpotsResponse.travel_spots = [];
    const travelSpotsSnaphot = await getDocs(collection(db, "travel_spots"));
    travelSpotsSnaphot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    travelSpots.value = results;
  } catch(error) {
    const errorToast = await toastController.create({
        message: 'Noe gikk galt ved opplastning av turplass',
        duration: 2500,
        position: 'bottom',
        color: 'danger'
    });

    await errorToast.present();
    console.error(error);
  }
})

const logout = async()=> {
  try {
    await authService.logout();
    localStorage.removeItem("auth_token");
    router.push('/authentication');

  }  catch(error) {
      console.error(error)
  }
}

</script>



<template>
  <ion-page>
   
    <ion-footer :translucent="true">
      <ion-toolbar>
        <ion-buttons id="open-loading" slot="start">
          <ion-button router-link="/new-spot"><ion-icon :icon="addCircleOutline"></ion-icon></ion-button>
          <ion-button router-link="/Image"><ion-icon :icon="images"></ion-icon></ion-button>
          <ion-button router-link="/Profile"><ion-icon :icon="person"></ion-icon></ion-button>
          <ion-loading trigger="open-loading" duration="500" spinner="circles"></ion-loading>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="logout()"><ion-icon :icon="exit"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>

    <ion-content :fullscreen="true" id="main-content">
      <ion-refresher slot="fixed" @ionRefresh="refreshTravelSpotsView($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <travel-spot-card v-for="spot in travelSpots" :key="spot.id" :spot="spot" />
    </ion-content>
  </ion-page>
</template>

<style scoped>

.user-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

ion-subtitle {
    margin-right: 15px; 
}

ion-toolbar {
  --background: background-color: #607123;
background-image: linear-gradient(314deg, #607123 0%, #95b54c 74%);


}
.flex-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.user-email {
    flex: 1; 
    margin-right: 15px; 
}

.custom-link {
 
  text-decoration: none; 
  color: #007aff; 
  font-weight: bold; 

}


 ion-button ion-icon {
  --ion-color-base: white;
}

 
</style>