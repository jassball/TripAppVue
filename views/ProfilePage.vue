<script setup lang="ts">

import { ref } from 'vue';
import { authService } from '@/services/firebase.authservice';
import { onIonViewDidEnter, IonContent, IonButtons, IonLoading, IonButton, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCard, IonHeader, IonPage, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { closeOutline} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import {
  collection,
  getDocs,
  getFirestore,
} from "firebase/firestore";

const router = useRouter();
const currentUserData = ref(null);
const db = getFirestore();
const userProfiles = ref([]); 
const profileImageSrc = ref(null);
const goHome =() => {
  router.replace('/home')
}

onIonViewDidEnter(async() => {
    currentUserData.value = await authService.currentUser();
    await loadProfileImage();

})
const fetchProfileImage = async (userEmail) => {
    try {
        const results = [];
        const profilesSnapshot = await getDocs(collection(db, "userProfiles"));
        profilesSnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });

        userProfiles.value = results;
        const targetuserProfile = userProfiles.value.find(userProfile => userProfile.email === userEmail);
        
   
        if (targetuserProfile && targetuserProfile.profilePhotoUrl) {
            return targetuserProfile.profilePhotoUrl;
        } else {
           
            console.warn("Profile or profilePhotoUrl not found for email:", userEmail);
            return null; 
        }

    } catch (error) {
        console.error("Error fetching user profile", error);
        return null;
    }
  }

const loadProfileImage = async () => {

    if (currentUserData.value.photoURL) {
        profileImageSrc.value = currentUserData.value.photoURL;
    } else {
        profileImageSrc.value = await fetchProfileImage(currentUserData.value.email);
    }
}

</script>


<template>
  <ion-page>
    <ion-header class="ion-no-border" :translucent="true">
      <ion-toolbar>
        <ion-title>Profil</ion-title>   
        <ion-buttons slot="start">
          <ion-button id="open-loading" @click="goHome">
              <ion-icon :icon="closeOutline"></ion-icon>
              <ion-loading trigger="open-loading" duration="500" spinner="circles"></ion-loading>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" v-if="currentUserData">
      <div class="content-center">

          <img :src="profileImageSrc" id="profileImage" alt="Profile Image"/>
      
        <h2 id="displayName">{{ currentUserData.firstName }}</h2>        
        <p id="displayEmail">{{ currentUserData.email }}</p>

    
        
      </div>
      <div class="button-center">
        <ion-button @click="goHome" id="open-loading2" class="closeButton">Lukk
          <ion-loading trigger="open-loading2" duration="500" spinner="circles"></ion-loading></ion-button>

      </div>
    </ion-content>
    
  </ion-page>
</template>

<style scoped>
ion-icon {
  color: black;
}

.closeButton {
 
  width: 80%;
  height: 50%;
  color: #f39e74;
  --background: #fdf3f1;
}

ion-content {
    --background: white;
}

ion-toolbar {
    --background: white;
}
.content-center {
  margin-top: 70%;
  display: flex;
  flex-direction: column;
  justify-content: start; 
  align-items: center; 
  height: 30%;
}

.button-center {
  height: 13%;
  margin-top: 30%;
  display: flex;
  flex-direction: column;
  justify-content: start; 
  align-items: center; 

}

ion-buttons::part(native) {
  border: none;
}  

 ion-checkbox::part(container) {
   background: blue
}    

 
ion-content {
      --ion-background-color: #ccbaba;
      display: flex;
  }


 ion-checkbox {
  --checkbox-background:var( --ion-checkbox-background) 
} 

#profileImage {
  border-radius: 80px;
  height: 150px;
}

#displayName {
  color: black;
}

#displayEmail {
  color: rgb(121, 121, 121);
}



</style>
