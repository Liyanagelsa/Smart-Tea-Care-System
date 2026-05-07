import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import sys

def run_inference(model_path, image_path):
    # Define class names
    classes = ['Algal Leaf Spot', 'Brown Blight', 'Gray Blight', 'Healthy', 'Helopeltis', 'Red Leaf Spot']

    if not os.path.exists(model_path):
        print(f"Error: Model file {model_path} not found.")
        return

    # Load model
    model = tf.keras.models.load_model(model_path)

    # Preprocess image
    img = image.load_img(image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    # Predict
    predictions = model.predict(img_array, verbose=0)
    class_idx = np.argmax(predictions[0])
    confidence = predictions[0][class_idx] * 100

    print(f"\n--- Prediction Result ---")
    print(f"Image: {os.path.basename(image_path)}")
    print(f"Result: {classes[class_idx]}")
    print(f"Confidence: {confidence:.2f}%")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python predict.py <model_path> <image_path>")
    else:
        run_inference(sys.argv[1], sys.argv[2])