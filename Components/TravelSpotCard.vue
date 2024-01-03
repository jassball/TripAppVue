<script setup lang="ts">
import { IonCard, IonCardHeader, IonChip, IonCardSubtitle, IonCardTitle, IonCardContent } from "@ionic/vue";
import TravelSpotImage from "./TravelSpotImage.vue"

interface Props {
    spot: {
        id: number;
        title: string;
        description: string;
        hashtags: string[];
        imageUrls: string[];
        comments: string[];
    }
}

defineProps<Props>();
</script>

<template>
    <ion-card :router-link="'/detail/' + spot.id">
        <div class="image-container" v-for="(image, index) in spot.imageUrls" :key="index">
            <travel-spot-image :image-url="image"/>
            <div class="hashtag-overlay">
                <ion-chip class="hashTags" v-for="hashtag in spot.hashtags" :key="hashtag">#{{hashtag}}</ion-chip>
            </div>
        </div>

        <ion-card-header>
            <ion-card-title>{{ spot.title }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            {{ spot.description }}
        </ion-card-content>
    </ion-card>
</template>

<style>
.image-container {
    position: relative;
    max-width: 400px;
    border-radius: 10%;
}

.uploadedImage {
    width: 100%;
    border-radius: inherit;
}

.hashtag-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    background-color: rgba(0, 0, 0, 0.7); 
    border-radius: 2;
   
  
}

ion-chip {
    margin: 2px;
}

.hashTags {
    color: white;
}
</style>
