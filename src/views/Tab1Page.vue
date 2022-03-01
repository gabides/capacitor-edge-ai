<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Capacitor Edge AI</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Capacitor Edge AI</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Home</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          Welcome to the Capacitor EDGE AI Demo App
        </ion-card-content>
    </ion-card>
    </ion-content>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard } from '@ionic/vue';

export default  defineComponent({
  name: 'Tab1Page',
  components: { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonCard }
});
</script>
