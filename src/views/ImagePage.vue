<script setup lang="ts">
import { onIonViewDidEnter, IonContent, IonButtons, IonLoading, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCard, IonHeader, IonPage, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import TravelSpotImage from "@/components/TravelSpotImage.vue";
import { ref} from 'vue';
import { getApp } from "firebase/app";
import { getStorage, ref as storageRef, getDownloadURL, listAll } from "firebase/storage";
import { useRouter } from 'vue-router';
import { closeOutline, images} from 'ionicons/icons';

const firebaseApp = getApp();
const storage = getStorage(firebaseApp);
const imageList = ref([]);

const router = useRouter();

const goHome =() => {
    router.replace('/home')
}

onIonViewDidEnter(async() => {
    await fetchTravelSpots();
})

const refreshTravelSpotsView = async (event: CustomEvent) => {
    await fetchTravelSpots();
    event.target.complete();
}

const fetchTravelSpots = (async () => {
    try {
        const imageRef = storageRef(storage, 'images');
        const listResult = await listAll(imageRef);

        for (const item of listResult.items) {
            const url = await getDownloadURL(item);
            imageList.value.push({ name: item.name, url });
        }
    } catch (error) {
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
</script>

<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-title>Bildegalleri
            <ion-icon :icon="images"></ion-icon>
          </ion-title>   
          <ion-buttons slot="start">
          <ion-button id="open-loading" @click="goHome">
              <ion-icon :icon="closeOutline"></ion-icon>
              <ion-loading trigger="open-loading" duration="500" spinner="circles"></ion-loading>
          </ion-button>
        </ion-buttons>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true" id="main-content">
        <ion-refresher slot="fixed" @ionRefresh="refreshTravelSpotsView($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        <div v-for="(image, index) in imageList" :key="index">
        <travel-spot-image class="imageInGallery" :image-url="image.url" />
        </div>
      </ion-content>
    </ion-page>
  </template>
  <style scoped>

  .imageInGallery {
    margin-bottom: 10%;
    border-bottom: grey 1px solid;
    border-top: grey 1px solid;
  }
  
  ion-content {
      --ion-background-color: #ccbaba;
      display: flex;
  }
  
  ion-button {
    --color: white;
  }
  
  #customStyleButton::part(native) {
     background: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
  }
  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* Adjust the number of columns as needed */
    gap: 16px; /* Adjust the gap between grid items */
  }
  
  .grid-item {
    /* Additional styles for grid items */
    border: 1px solid #ccc; /* Example border */
    padding: 16px; /* Example padding */
  }

  ion-icon {
  color: black;
}
  </style>