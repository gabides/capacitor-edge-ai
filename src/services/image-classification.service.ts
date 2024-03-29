
import * as tf from '@tensorflow/tfjs';

import { IMAGENET_CLASSES } from '../services/classes';

const MOBILENET_MODEL_PATH =
    // tslint:disable-next-line:max-line-length
    'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1';

const IMAGE_SIZE = 224;
const TOPK_PREDICTIONS = 10;

export interface IDetectionClass {
    className: string;
    probability: number;
}

let mobilenet: any;

// const predictionsElement = document.getElementById('predictions');

export const initializeModel = async () => {

    mobilenet = await tf.loadGraphModel(MOBILENET_MODEL_PATH, {fromTFHub: true});
    
    // Warmup the model. This isn't necessary, but makes the first prediction
    // faster. Call `dispose` to release the WebGL memory allocated for the return
    // value of `predict`.
    
    mobilenet.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();
}


export async function classifyImage(imgElement: HTMLImageElement) {
  console.log('Predicting...');

  // The first start time includes the time it takes to extract the image
  // from the HTML and preprocess it, in additon to the predict() call.
  const startTime1 = performance.now();
  // The second start time excludes the extraction and preprocessing and
  // includes only the predict() call.
  let startTime2 = 0;
  const logits = tf.tidy(() => {
    // tf.browser.fromPixels() returns a Tensor from an image element.
    const img = tf.cast(tf.browser.fromPixels(imgElement), 'float32');

    const offset = tf.scalar(127.5);
    // Normalize the image from [0, 255] to [-1, 1].
    const normalized = img.sub(offset).div(offset);

    // Reshape to a single-element batch so we can pass it to predict.
    const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);

    startTime2 = performance.now();
    // Make a prediction through mobilenet.
    return mobilenet.predict(batched);
  });

  // Convert logits to probabilities and class names.
  const classes = await getTopKClasses(logits, TOPK_PREDICTIONS);
  const totalTime1 = performance.now() - startTime1;
  const totalTime2 = performance.now() - startTime2;
  console.log(`Done in ${Math.floor(totalTime1)} ms ` +
      `(not including preprocessing: ${Math.floor(totalTime2)} ms)`);

  console.log("classes", classes);
  // Show the classes in the DOM.
  return classes
}

// Postprocess the tensor results and convert them in a array of dicts with classname and probability
export async function getTopKClasses(logits: any, topK: number): Promise<IDetectionClass[]> {
  const values = await logits.data();

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({value: values[i], index: i});
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK) as any;
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: IMAGENET_CLASSES[topkIndices[i].toString()],
      probability: topkValues[i]
    })
  }
  return topClassesAndProbs;
}