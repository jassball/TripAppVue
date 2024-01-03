<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonChip, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonTextarea, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { add, trashOutline, closeOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { Camera, CameraResultType } from '@capacitor/camera';
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import {
  getStorage,
  uploadBytes,
  getDownloadURL,
  ref as dbRef,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {INewTravelSpot} from "@/models/TravelSpotModels"
import { useRouter } from 'vue-router';
const goHome =() => {
  router.replace('/home')
}


const router = useRouter();

const newHashtagText = ref("");

const newTravelSpot = ref<INewTravelSpot>({
    title: "",
    description: "",
    hashtags: [],
    imageUrls: [],
    id: ""
});

const travelSpotCollection = collection(getFirestore(), "travel_spots");

const addNewHashtag = () => {
    if (newHashtagText.value) {
        newTravelSpot.value.hashtags.push(newHashtagText.value);
        newHashtagText.value = "";
    }
}

const postNewTravelSpot = async () => {
    
    if (newTravelSpot.value.imageUrls.length === 0) {
        alert("Du må laste opp minst ett bilde");

        return;
    }

    try {
        const generatedUUID = uuidv4();
        const newImageUrls = [];

        for (const imageUrl of newTravelSpot.value.imageUrls) {
            const imageName = new Date().getTime() + '.jpg';
            const storageRef = getStorage();
            const imageRef = dbRef(storageRef, `images/${imageName}`);
            const response = await fetch(imageUrl);
            const imageBlob = await response.blob();
            const snapshot = await uploadBytes(imageRef, imageBlob);
            const url = await getDownloadURL(snapshot.ref);
            newImageUrls.push(url)
        }

        newTravelSpot.value.imageUrls = newImageUrls;
        newTravelSpot.value.id = generatedUUID;
        await setDoc(doc(travelSpotCollection, generatedUUID), newTravelSpot.value);
        const successToast = await toastController.create( {
            message: 'Reiseplassen ble lastet opp.',
            duration: 1400,
            position: 'bottom',
            color: 'success'
        });

        await successToast.present();
        router.replace('/home');

    } catch (error) {
        const errorToast = await toastController.create({
            message: 'Noe gikk galt ved opplastning av reiseplass.',
            duration: 2400,
            position: 'bottom',
            color: 'danger'
        });

        await errorToast.present();
        console.error(error);
    }
}

const triggerCamera = async () => {
    const photo = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri,
    });
    if (photo.webPath) {
        newTravelSpot.value.imageUrls.push(photo.webPath);
    }
};

const removePhotoPreview = (index) => {
    if (index >= 0 && index < newTravelSpot.value.imageUrls.length) {
        newTravelSpot.value.imageUrls.splice(index, 1);
    }
}

</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
          <ion-button @click="goHome">
              <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
                <ion-title>Legg til ny turplass</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">

            <ion-list>

               
                <ion-button @click="triggerCamera" class="image-picker" color="light">
                    Velg fil eller ta bilde 📸
                </ion-button>

                <section v-if="newTravelSpot.imageUrls.length">
                <div v-for="(imageUrl, index) in newTravelSpot.imageUrls" :key="index">
                    <img :src="imageUrl" />
                    <ion-button @click="() => removePhotoPreview(index)" fill="default" class="remove-image-preview">
                        <ion-icon slot="icon-only" :icon="trashOutline" color="danger"></ion-icon>
                    </ion-button>
                </div>
                </section>


                <ion-item>
                    <ion-label class="label-mild" position="floating">Tittel</ion-label>
                    <ion-input type="text" v-model="newTravelSpot.title"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label class="label-mild" position="floating">Beskrivelse</ion-label>
                    <ion-textarea type="password" v-model="newTravelSpot.description"></ion-textarea>
                </ion-item>

                <ion-item>
                    <ion-label class="label-mild" position="floating">Hashtag</ion-label>
                    <ion-input type="text" v-model="newHashtagText"></ion-input>

                    <ion-button slot="end" color="dark" size="default" @click="addNewHashtag">
                        <ion-icon :icon="add"></ion-icon>
                    </ion-button>
                </ion-item>

                <ion-item lines="none">
                    <ion-chip color="primary" v-for="tag in newTravelSpot.hashtags" :key="tag">{{tag}}</ion-chip>
                </ion-item>

                <ion-button @click="postNewTravelSpot" class="button-add" fill="solid" color="dark" size="default">
                    Last opp
                </ion-button>

            </ion-list>
            <div class="button-center">
        <ion-button @click="goHome" id="closeButton">Lukk</ion-button>
      </div>
        </ion-content>
    </ion-page>
</template>
    
<style scoped>
ion-content {
    --ion-background-color: #f4f4f4;
    display: flex;
}

ion-list {
    display: flex;
    flex-direction: column;
}

.label-mild {
    --color: #8a8a8a !important;
}

.image-picker {
    height: 20vh;
    margin: 10px;
    border: 2px #8a8a8a dashed;
    border-radius: 8px;
    font-size: medium;
}

#closeButton {
 
 width: 80%;
 height: 50%;
 color: #f39e74;
 --background: #fdf3f1;
}

.button-center {
  height: 13%;
  margin-top: 30%;
  display: flex;
  flex-direction: column;
  justify-content: start; 
  align-items: center; 

}


.remove-image-preview {
    position: absolute;
    right: 0;
}

.button-add {
    margin-top: 50px;
    margin-left: 10px;
    margin-right: 10px;
}
ion-back-button::part(native) {
  --background: linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%);
  --color: white; 
}

</style>
