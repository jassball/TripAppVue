<script setup lang="ts">
import { authService } from '@/services/firebase.authservice';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonToggle, toastController } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Camera, CameraResultType } from '@capacitor/camera';
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { trashOutline } from 'ionicons/icons';
import {
  getStorage,
  uploadBytes,
  getDownloadURL,
  ref as dbRef,
} from "firebase/storage";
import {
    getIdToken,
  } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

const router = useRouter();

const inRegMode = ref(false);

const userDetails = ref({ 
    id: '',
    firstName: '',
    email: '',
    password: '', 
    profilePhotoUrl: '',
});

const userProfileCollection = collection(getFirestore(), "userProfiles");

const login = async () => {
    try {
        const user = await authService.login(userDetails.value.email, userDetails.value.password);     
        const idToken = await user.getIdToken(/**foreceRefresh*/ true);
        localStorage.setItem("auth_token", idToken)
        router.push('/home');
    } catch (error) {
        const toast = await toastController.create({
            message: error.message,
            duration: 2000
        });
        toast.present();
    }
}

const register = async () => {
    try {
        const emailLowercase = userDetails.value.email.toLowerCase();
        await authService.register(emailLowercase, userDetails.value.password);
        await postProfilePhoto();
        await login();
    } catch (error) {
        console.log(error);
    }
}

const triggerCamera = async () => {
    const photo = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri,
    });

    if (photo.webPath) {
        userDetails.value.profilePhotoUrl = photo.webPath;
    }
}

const googleLogin = async () => {
    try {
        const user = await authService.signinWithGoogle();  
        const idToken = user.accessToken;
        localStorage.setItem("auth_token", idToken)
        router.replace('/home');
    } catch (error) {
        console.error(error);
    }
}

const removePhotoPreview = () => {
    userDetails.value.profilePhotoUrl = '';
}

const postProfilePhoto = async () => {
    if (userDetails.value.profilePhotoUrl === "") {
        alert("Du må laste opp ett bilde");
        return;
    } try {
        const generatedUUID = uuidv4();
        const iamgeName = new Date().getTime() + '.jpg';
        const storageRef = getStorage();
        const imageRef = dbRef(storageRef, `profilePhotos/${iamgeName}`);
        const response = await fetch(userDetails.value.profilePhotoUrl);
        const imageBlob = await response.blob();
        const snapshot = await uploadBytes(imageRef, imageBlob);
        const url = await getDownloadURL(snapshot.ref);
        userDetails.value.profilePhotoUrl = url;

        userDetails.value.id = generatedUUID;
        await setDoc(doc(userProfileCollection, generatedUUID), userDetails.value);
        const successToast = await toastController.create({
            message: "Profilen din ble laget!",
            duration: 1400,
            position: "bottom",
            color: "success"
        });

        await successToast.present();
        router.replace('/home');
    } catch (error) {
        const errorToast = await toastController.create({
            message: "Noe gikk galt, prøv igjen",
            duration: 1400,
            position: "bottom",
            color: "danger"
        });

        await errorToast.present();
        console.error(error);
    }
}
</script>

<template>
    <ion-page>
        <ion-content>
            <ion-list>
                <ion-list-header>
                    <ion-title>TravelSnap</ion-title>
                </ion-list-header>

                <img class="hero-image" src="/assets/TravelSnapLogo.png" />

                <ion-item lines="none">
                    <ion-label class="label-mild">Ny bruker?</ion-label>
                    <ion-toggle color="dark" @ion-change="inRegMode = !inRegMode"></ion-toggle>
                </ion-item>

                <hr />

                <ion-item v-if="inRegMode">
                    <ion-label class="label-mild" position="floating">Fornavn</ion-label>
                    <ion-input v-model="userDetails.firstName"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label class="label-mild" position="floating">Email</ion-label>
                    <ion-input type="email" v-model="userDetails.email"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label class="label-mild" position="floating">Passord</ion-label>
                    <ion-input type="password" v-model="userDetails.password"></ion-input>
                </ion-item>

                <ion-item v-if="inRegMode">
                    <ion-button @click="triggerCamera" class="image-picker" color="light">
                        Velg fil eller ta bilde 📸
                    </ion-button>
                    <section v-if="userDetails.profilePhotoUrl">
                        <img :src="userDetails.profilePhotoUrl" />
                        <ion-button @click="() => removePhotoPreview()" fill="default" class="remove-image-preview">
                            <ion-icon slot="icon-only" :icon="trashOutline" color="danger"></ion-icon>
                        </ion-button>
                    </section>
                </ion-item>

                <ion-button v-if="inRegMode" @click="register" class="button-auth" fill="solid" color="dark" size="default">
                    Registrer deg
                </ion-button>

                <ion-button v-else @click="login"  class="button-auth" fill="solid" color="dark" size="default">
                    Logg inn
                </ion-button>

                <ion-button @click="googleLogin"  class="button-auth" fill="solid" color="dark" size="default">
                    Google Log in
                </ion-button>
            </ion-list>
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

.hero-image {
    width: 80vw;
    align-self: center;
    border-radius: 10px;
}

.button-auth {
    margin-top: 50px;
    margin-left: 10px;
    margin-right: 10px;
}

.image-picker {
    height: 20vh;
    margin: 10px;
    border: 2px #8a8a8a dashed;
    border-radius: 8px;
    font-size: medium;
}
</style>
