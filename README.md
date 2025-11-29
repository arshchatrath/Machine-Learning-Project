# Face Recognition Based Image Separator

Automatically organize and separate images based on face recognition. This tool processes a collection of images and sorts them into folders by person, making it easy to organize large photo collections.

## Features

- 🎯 **Automatic Face Detection** - Detects faces in images using dlib's HOG-based detector
- 👤 **Face Recognition** - Recognizes and matches faces with 128-dimensional encodings
- 📁 **Smart Organization** - Automatically creates folders for each recognized person
- 👥 **Group Detection** - Identifies and separates images with multiple people
- ⚠️ **Error Handling** - Gracefully handles images with no detectable faces
- 🔧 **Adjustable Tolerance** - Customize recognition sensitivity (default: 0.75)

## Project Structure

```
Face-Recognition-based-Image-Separator/
├── image_segmentation.py      # Main script
├── People/                     # Reference photos (one per person)
├── Dataset/                    # Images to be organized
├── output/                     # Organized results
│   ├── PersonName/            # Individual person folders
│   ├── Group/                 # Images with multiple faces
│   └── Unknown/               # Unrecognized faces
├── venv37/                     # Python 3.7 virtual environment
├── known_encodings.pickle      # Saved face encodings
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Requirements

- Python 3.7
- Windows, macOS, or Linux
- Webcam (optional, for live detection)

## Installation

### 1. Clone or Download the Repository

```bash
git clone https://github.com/yourusername/Face-Recognition-based-Image-Separator.git
cd Face-Recognition-based-Image-Separator
```

### 2. Create Virtual Environment

**Windows:**
```powershell
py -3.7 -m venv venv37
.\venv37\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
python3.7 -m venv venv37
source venv37/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note for Windows users:** If dlib installation fails, download the pre-compiled wheel:
- Download from: https://github.com/z-mahmud22/Dlib_Windows_Python3.x
- Install with: `pip install dlib-19.22.99-cp37-cp37m-win_amd64.whl`

## Usage

### Step 1: Add Reference Photos

Add one clear photo per person to the `People/` folder:

```
People/
├── John.jpg
├── Sarah.png
└── Alex.jpg
```

**Important:** 
- Each photo should contain **only ONE face**
- Use clear, well-lit photos
- Filename (without extension) becomes the person's name

### Step 2: Add Images to Organize

Place all images you want to organize in the `Dataset/` folder:

```
Dataset/
├── IMG_001.jpg
├── IMG_002.jpg
└── ...
```

### Step 3: Run the Script

```bash
python image_segmentation.py
```

### Step 4: Check Results

Find organized images in the `output/` folder:

```
output/
├── John/          # All photos of John
├── Sarah/         # All photos of Sarah
├── Alex/          # All photos of Alex
├── Group/         # Photos with multiple people
└── Unknown/       # Unrecognized faces
```

## Configuration

### Adjust Recognition Tolerance

Edit `image_segmentation.py` line 118:

```python
matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.75)
```

- **Lower tolerance (0.4-0.5)**: Stricter matching, fewer false positives
- **Higher tolerance (0.6-0.8)**: More lenient, catches more variations
- **Default: 0.75** (recommended for most use cases)

### Adjust Image Processing Size

Edit line 187 and 234 to change resize factor:

```python
image = cv2.resize(image, (0,0), fx=0.2, fy=0.2, interpolation=cv2.INTER_LINEAR)
```

- **0.2 (20%)**: Faster processing, lower accuracy
- **0.3-0.4 (30-40%)**: Balanced speed and accuracy
- **0.5+ (50%+)**: Slower but more accurate

## Troubleshooting

### "No face detected" Warning

If you see `[WARNING] No face detected in [filename]`:

1. **Check photo quality** - Ensure the face is clear and visible
2. **Improve lighting** - Use well-lit photos
3. **Face size** - Make sure the face is large enough in the image
4. **Try a different photo** - Use a front-facing photo

### Low Recognition Accuracy

1. **Increase tolerance** - Change from 0.75 to 0.8
2. **Use better reference photos** - Clear, front-facing, well-lit
3. **Add multiple angles** - Use photos from different angles (name them Person1.jpg, Person2.jpg)
4. **Increase processing size** - Change fx/fy from 0.2 to 0.3 or 0.4

### Installation Issues (Windows)

If dlib fails to install:

1. Install Visual Studio Build Tools with C++ support
2. Or download pre-compiled wheel from GitHub (see Installation section)

## How It Works

1. **Load Reference Photos** - Processes images in `People/` folder
2. **Create Face Encodings** - Generates 128-dimensional face encodings
3. **Save Encodings** - Stores encodings in `known_encodings.pickle`
4. **Process Dataset** - Analyzes each image in `Dataset/` folder
5. **Detect Faces** - Finds all faces in each image
6. **Compare & Match** - Compares detected faces with known encodings
7. **Organize** - Saves images to appropriate folders

## Technical Details

- **Face Detection**: dlib's HOG (Histogram of Oriented Gradients)
- **Face Recognition**: 128-dimensional face encoding
- **Matching Algorithm**: Euclidean distance with configurable tolerance
- **Image Processing**: OpenCV (cv2)
- **Encoding Storage**: Pickle serialization

## Bug Fixes & Improvements

This version includes several improvements over the original:

✅ **Fixed UnboundLocalError** - Added check before drawing rectangles  
✅ **Error Handling** - Gracefully handles images with no faces  
✅ **Better Tolerance** - Increased default from 0.5 to 0.75  
✅ **Informative Warnings** - Shows which images have issues  

## Credits

Original project by [Harshit Saraswat](https://github.com/harshit-saraswat/Face-Recognition-based-Image-Separator)

**Libraries Used:**
- [dlib](http://dlib.net/) by Davis King
- [face_recognition](https://github.com/ageitgey/face_recognition) by Adam Geitgey
- [OpenCV](https://opencv.org/)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section
2. Review the original [Medium article](https://medium.com/analytics-vidhya/face-recognition-based-image-separator-408681f2360d)
3. Open an issue on GitHub
