<script setup lang="ts">

interface Props {
    imageUrl: string;
}

defineProps<Props>();

</script>

<template>
    <img class="spot-image" :src="imageUrl" alt="travel spot image" />
</template>

<style scoped>
.spot-image {
  width: 100%;      
  object-fit: cover; 
  display: block;    
}
</style>