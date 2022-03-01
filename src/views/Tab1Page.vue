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
      <ion-grid>
        <ion-col>
          <ion-row>
            <ion-card>
              <ion-card-header>
                <ion-card-title>Home</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                Welcome to the Capacitor EDGE AI Demo App
              </ion-card-content>
            </ion-card>
          </ion-row>
          <ion-row  class="ion-align-self-center">
            <ion-button :onclick="takePicture" color="primary">Take picture</ion-button>
          </ion-row>
          <ion-row>
            <img id="image" :src="imageSrc" crossorigin='anonymous' width=224 height=224 />
          </ion-row>
          <ion-button :onclick="classifyImage" color="primary">Classify</ion-button>
          <div id="predictions"></div>
          
        </ion-col>
    </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonGrid, IonCol, IonRow, IonButton, alertController } from '@ionic/vue';
import { Camera, CameraResultType } from '@capacitor/camera';
import { initializeModel, classifyImage, IDetectionClass } from '../services/image-classification.service'

initializeModel()

export default  defineComponent({
  name: 'Tab1Page',
  components: { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonGrid, IonCol, IonRow, IonButton },
  data: function () {
    return {
      imageSrc: 'https://raw.githubusercontent.com/tensorflow/tfjs-examples/master/mobilenet/cat.jpg'
    }
  },
  methods: {
    async takePicture() {
      const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri
        });

      // image.webPath will contain a path that can be set as an image src.
      // You can access the original file using image.path, which can be
      // passed to the Filesystem API to read the raw data of the image,
      // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
      var imageUrl = image.webPath;
      console.log(imageUrl)
      if (imageUrl) {
        this.imageSrc = imageUrl as string
      }
    },
    async classifyImage() {

      const imgElement = document.getElementById('image') as HTMLImageElement;
      const classes = await classifyImage(imgElement)
      await this.presentAlert(classes)
    },
    async presentAlert(classes: IDetectionClass[]) {
      let fullResultsMessage = '';
      for (let detectedClass of classes) {
        fullResultsMessage += `${detectedClass.className.split(',')[0]}: ${detectedClass?.probability?.toFixed(1)}% - `
      }

      const firstClass = classes[0];
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Success',
          subHeader: `${firstClass.className.split(',')[0]} - ${firstClass?.probability?.toFixed(1)}%`,
          message: `We detected ${firstClass.className} with ${firstClass?.probability?.toFixed(1)}% of probability`,
          buttons: [
            {
              text: 'Details',
              role: 'cancel',
              cssClass: 'secondary',
              id: 'cancel-button',
              handler: async () => {

                      const alert = await alertController
                      .create({
                        cssClass: 'my-custom-class',
                        header: 'Full results',
                        message: fullResultsMessage,
                        buttons: [ 'OK'],
                      });
                    await alert.present();
              },
            },
            {
              text: 'Okay',
              id: 'confirm-button'
            },
          ],
        });
      await alert.present();

      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
    }
  }
});
</script>

<style scoped>

/* Works - pass "my-custom-class" in cssClass to increase specificity */
.my-custom-class .alert-wrapper {
  background: #e5e5e5;
}
</style>