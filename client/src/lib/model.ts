import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;

export async function initializeModel() {
  if (!model) {
    try {
      // Load model from the updated Teachable Machine shared URL
      model = await tf.loadLayersModel('https://teachablemachine.withgoogle.com/models/YR7_msqUp/model.json');
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to load the classification model');
    }
  }
  return model;
}

export async function classifyImage(imageElement: HTMLImageElement): Promise<{
  ec: number;
  sa: number;
  kp: number;
  invalid: number;
}> {
  try {
    const model = await initializeModel();

    // Preprocess image according to Teachable Machine requirements
    const tfImg = tf.browser.fromPixels(imageElement)
      .resizeBilinear([224, 224]) // Teachable Machine uses 224x224
      .toFloat()
      .expandDims()
      .div(127.5)
      .sub(1); // Normalize to [-1, 1]

    // Get predictions
    const predictions = await model.predict(tfImg) as tf.Tensor;
    const probabilities = await predictions.data();

    // Cleanup
    tfImg.dispose();
    predictions.dispose();

    // Return probabilities for all classes
    // Model outputs: EC (E.coli), SA (S.Aureus), KP (Klebsiella Pneumonae), Invalid
    return {
      ec: probabilities[0],
      sa: probabilities[1], 
      kp: probabilities[2],
      invalid: probabilities[3]
    };
  } catch (error) {
    console.error('Error classifying image:', error);
    throw new Error('Failed to classify image');
  }
}