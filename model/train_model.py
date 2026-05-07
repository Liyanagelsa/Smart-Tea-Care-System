from ultralytics import YOLO
import os
import yaml # Import yaml to read and write the data.yaml file

# Load a YOLOv8n model
model = YOLO('yolo26s.pt') # Corrected model name to yolov8n.pt

# Define the path to the data.yaml file for the balanced dataset
balanced_data_yaml_path = os.path.join(extracted_base_dir, 'data.yaml')

# --- Start of fix for data.yaml paths ---
# Load the existing data.yaml
with open(balanced_data_yaml_path, 'r') as f:
    data_config = yaml.safe_load(f)

# Update the paths to point to the correct extracted location
# The extracted_base_dir is '/content/balanced_tea_leaf_dataset_extracted'
data_config['train'] = os.path.join(extracted_base_dir, 'train', 'images')
data_config['val'] = os.path.join(extracted_base_dir, 'valid', 'images')
data_config['test'] = os.path.join(extracted_base_dir, 'test', 'images') # Ensure test path is also correct

# Save the updated data.yaml
with open(balanced_data_yaml_path, 'w') as f:
    yaml.dump(data_config, f, default_flow_style=False)

print(f"Updated data.yaml at {balanced_data_yaml_path} with correct paths for training.")
# --- End of fix ---

# Train the model
results = model.train(
    data=balanced_data_yaml_path,
    epochs=50,  # Number of epochs
    imgsz=640,  # Image size
    batch=16,   # Batch size
    name='yolov8_tea_disease_balanced_v1' # Name for the training run
)