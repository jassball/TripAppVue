<script setup lang="ts">
import { IonModal, IonSpinner, IonTextarea, IonBackButton, IonButton, IonAvatar, IonText, IonIcon, IonItem, IonListHeader, IonLabel, IonList, IonCardHeader, IonCardSubtitle, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, onIonViewDidEnter } from "@ionic/vue";import { ref } from 'vue';
import { chatboxOutline, arrowBack, trash, heart, heartOutline, person, images, exit, addCircleOutline, closeOutline} from 'ionicons/icons';
import { useRoute } from 'vue-router';
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  getDoc,
  setDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
    getAuth,
  } from "firebase/auth";
import { authService } from '@/services/firebase.authservice';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap} from '@capacitor/google-maps';
import { useRouter } from 'vue-router';
import TravelSpotImage from "@/Components/TravelSpotImage.vue"; 
import {ITravelSpotResponse} from "@/models/TravelSpotModels" 
import { is } from "@babel/types";


const route = useRoute();
const { id } = route.params;
const router = useRouter();

const isModalOpen = ref(false);
const newCommentText = ref('');
const isLoadingTravelSpot = ref(true);
const travelSpot = ref<ITravelSpotResponse.travel_spots_by_id | null>(null);  
const hasUserLiked = ref(false);
const currentUserData = ref(null);
const myMapref = ref(null);

const userProfiles = ref([]); 
const profileImageSrc = ref(null);

const db = getFirestore();
const travelSpotCollection = collection(db, "travel_spots");
const travelSpotDocRef = doc(travelSpotCollection, id);

const backHome =() => {
  router.replace('/home')
}

onIonViewDidEnter( async() => {
    currentUserData.value = getAuth().currentUser;
    await fetchTravelSpot();
    await checkUserLikeStatus()
    await readGeoLocation();
    await loadProfileImage();

});

const checkUserLikeStatus = async () => {
    try {
        const docSnapshot = await getDoc(travelSpotDocRef)
        const docData = docSnapshot.data();

        if (docData.userWhoLiked && docData.userWhoLiked.includes(currentUserData.value.email)) {
            hasUserLiked.value = true;
        } else {
            hasUserLiked.value = false;
        }
    } catch (error) {
        console.log("Erros checking like status;", error);
    }
};

const readGeoLocation = async() =>{
try{
      if(!travelSpot.value.location) {
          const position = await Geolocation.getCurrentPosition();
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const location = {
            latitude,
            longitude,
          };
          await updateDoc(travelSpotDocRef, { location });
          travelSpot.value.location = location;
      }

       const myMap = await GoogleMap.create({
        id: 'my-google-map', 
        element: myMapref.value, 
        apiKey: process.env.GOOGLE_MAPS_API_KEY, 
        config: {
          center: {
 
            lat: travelSpot.value.location?.latitude,
            lng: travelSpot.value.location?.longitude,
          },
          zoom: 16, 
        },
      })
      const markerId = await myMap.addMarker({
        coordinate: {
            lat: travelSpot.value.location?.latitude,
            lng: travelSpot.value.location?.longitude,
        }
      });  
      
      await myMap.removeMarker(markerId);

  }

  catch (error) {
      console.error('Error getting location:', error);
  }
}

const fetchTravelSpot = async () => {
    try {
        let travel_spot:ITravelSpotResponse.travel_spots_by_id = null;
        const docSnap = await getDoc(travelSpotDocRef);

        if (docSnap.exists()) {
            travel_spot = docSnap.data();
            travelSpot.value = travel_spot;
            isLoadingTravelSpot.value = false;
        } else {
            console.log("No document!");
        } 
    }   catch(error) {
            console.log("Error fetching document:", error);
        }
}

const updateComments = async (updatedComments) => {
    try {
        await setDoc(travelSpotDocRef, { comments: updatedComments }, { merge: true });
        travelSpot.value.comments = updatedComments;
    } catch (error) {
        console.error("Error updating comments:", error);
    }
};

const addNewComment = async () => {
    try {
        if (currentUserData.value) {
            const newComment = {
                id: travelSpot.value.comments? travelSpot.value.comments.length + 1 : 1,
                userId: currentUserData.value.email,
                text: newCommentText.value,
            };

            const updatedComments = travelSpot.value.comments ? [...travelSpot.value.comments, newComment] : [newComment];
            await updateComments(updatedComments);
            isModalOpen.value = false;
            newCommentText.value = '';
              
        } else {
            console.log("There is no user logged in.")
        }
        
    } catch (error) {
        console.error("Error adding new comment:", error);
    }
};

const removeComment = async (commentId) => {
    try {
        const targetComment = travelSpot.value.comments.find((comment) => comment.id === commentId);

        if (!targetComment) {
            throw new Error("Comment not found!");
        }
        if (targetComment.userId !== currentUserData.value.email) {
            throw new Error("You can only delete your own comments!");
        }
        const updatedComments = travelSpot.value.comments.filter((comment) => comment.id !== commentId);
        await updateComments(updatedComments);
    } catch (error) {
        console.error("Error removing comment:", error);
        prompt("You can only remove your own comment.")
    }
}

const toggleLike = async () => {
    try {
        if (currentUserData.value) {
            console.log(currentUserData.value.email);
            const docSnapshot = await getDoc(travelSpotDocRef);
            const docData = docSnapshot.data();

            if (docData.userWhoLiked && docData.userWhoLiked.includes(currentUserData.value.email)) {
                const updatedLikes = docData.userWhoLiked.filter((userId) => userId !== currentUserData.value.email);
                console.log(updatedLikes)
                await setDoc(travelSpotDocRef, { userWhoLiked: updatedLikes }, { merge: true });
                travelSpot.value.userWhoLiked = updatedLikes;
            } else {
                const updatedLikes = docData.userWhoLiked ? [...docData.userWhoLiked, currentUserData.value.email] : [currentUserData.value.email];
                await setDoc(travelSpotDocRef, { userWhoLiked: updatedLikes }, { merge: true });
                travelSpot.value.userWhoLiked = updatedLikes;
            }

            hasUserLiked.value = !hasUserLiked.value;
        }
    } catch (error) {
        console.error("Error toggling like:", error);
    }
};

const fetchProfileImage = async (userEmail) => {
    try {
        const results = [];
        const profilesSnapshot = await getDocs(collection(db, "userProfiles"));
        profilesSnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });

        userProfiles.value = results;
        const targetuserProfile = userProfiles.value.find(userProfile => userProfile.email === userEmail);
        
        // Check if targetuserProfile is defined and has profilePhotoUrl
        if (targetuserProfile && targetuserProfile.profilePhotoUrl) {
            return targetuserProfile.profilePhotoUrl;
        } else {
            // Handle the case where the profile or profilePhotoUrl is not found
            console.warn("Profile or profilePhotoUrl not found for email:", userEmail);
            return null; // Or return a default image URL
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
      <ion-toolbar class="toolbarWithBack">
        <ion-buttons slot="start">
          <ion-button  style="color: white;" @click="backHome">
                <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" v-if="travelSpot && !isLoadingTravelSpot">

      <div class="imageContainer" v-for="(image, index) in travelSpot.imageUrls" :key="index">
        <travel-spot-image class="imageInContainer" :image-url="image" />
      </div>
      <div class="underImageContent">
      <ion-title class="titleInDetail" v-if="travelSpot">{{travelSpot.title}}</ion-title>
      <ion-card-subtitle class="subtitleInDetail">{{ travelSpot.userId }}</ion-card-subtitle>
      <ion-toolbar>
      <ion-buttons slot="start">
      <ion-button style="color: white;" @click="toggleLike">
        <ion-icon  class="likeNComment" v-if="hasUserLiked" :icon="heart"></ion-icon>
        <ion-icon class="likeNComment" v-else :icon="heartOutline"></ion-icon>
      </ion-button>
      <ion-button style="color: white;" @click="isModalOpen = true" id="commentButton">
            <ion-icon class="likeNComment" :icon="chatboxOutline"></ion-icon>
          </ion-button>
    </ion-buttons>
    <ion-buttons slot="end">
         
          <ion-chip v-for="hashtag in travelSpot.hashtags" :key="hashtag"  style="color: white;">#{{hashtag}}</ion-chip>
        </ion-buttons>
      </ion-toolbar>
      <div v-if="travelSpot.userWhoLiked">
        <ion-chip v-for="user in travelSpot.userWhoLiked" :key="user" color="black"><ion-icon :icon="heart"></ion-icon>...{{user}}</ion-chip>
      </div>
    </div>

      <!-- Camping spot info section -->
      <ion-card>
        <ion-card-header>
          <ion-card-subtitle style="color: black;">Beskrivelse</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content style="color: black;">
          {{travelSpot.description}}
          <div></div>
          <div v-if="travelSpot.location">
            Geolocation: <ion-chip>Latitude: {{travelSpot.location.latitude}}, Longitude:  {{travelSpot.location.longitude}}</ion-chip>
          </div>
          <div>
            <capacitor-google-map ref="myMapref" style="display: inline-block; width: 60%; height: 40px;"></capacitor-google-map>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Comment section -->
        <ion-list id="commentSection">
          <ion-list-header>
            <ion-label>
              Kommentarfelt
              <ion-icon :icon="chatboxOutline"></ion-icon>
            </ion-label>
          </ion-list-header>
          <ion-item v-for="comment in travelSpot.comments" :key="comment.id" lines="none">
              <ion-avatar slot="start">
                  <img :src="profileImageSrc" id="profileImage" alt="Profile Image">
              </ion-avatar>
              <ion-label class="ion-text-wrap comment-container">
                  <div class="comment-username">
                      <b>{{comment.userId}} </b>
                  </div>
                  <div class="comment-text-and-icon">
                      <p class="comment-text">{{comment.text}}</p>
                      <ion-icon :icon="trash" @click="removeComment(comment.id)"></ion-icon>
                  </div>
              </ion-label>
          </ion-item>
        </ion-list>
     
    
    

      <ion-modal 
        :is-open="isModalOpen" 
        :initial-breakpoint="0.25"
        :breakpoints="[0, 0.25, 0.5, 0.75]"
        @did-dismiss="isModalOpen = false">
          <ion-content>
            <ion-item  class="commentItem" lines="none">
              <ion-label position="floating">Skriv din kommentar...</ion-label>
              <ion-textarea v-model="newCommentText"></ion-textarea>
              <ion-button class="addCommentButton" @click="addNewComment">Send</ion-button>
            </ion-item>
          </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>


<style scoped>
.commentItem {
  display: flex;
  justify-content: center;
  align-items: center;
}
.addCommentButton {
  width: 50%;
}
.toolbarWithBack {
  background-color: white;
}
.titleInDetail {
  padding: 2%;
}
.comment-container {
    display: flex;
    flex-direction: column;
}

.comment-text-and-icon {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.comment-text {
    flex: 1; /* This allows the text to take up the available space, pushing the icon to the far right */
}
.spot-image {
  width: 100%;       /* Sets the width to 100% of its container */
  object-fit: cover; /* Ensure the images resize to cover the entire area without stretching */
  display: block;    /* Removes any bottom spacing that images might have by default */
}

.imageContainer {
  padding: 8%;
  background-color: #574497;
}

.imageInContainer {
  border-radius: 10px;

  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;}

ion-toolbar {
  --background: #574497;
  --border-color: #574497
}

.underImageContent {
  background-color: #574497;
  padding-bottom: 5%;
}

.titleInDetail {
  text-align: center;
  font-size: 25px;
}

.subtitleInDetail {
  text-align: center;
  font-size: 20px;
}


#commentSection {
  --background: white;
}

ion-chip {
  --color:white;
}

.likeNComment {
  font-size: 25px;
}

ion-button {
  --color: white;
}



</style>