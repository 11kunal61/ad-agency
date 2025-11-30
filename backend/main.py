from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from google import genai
from google.genai import types
from PIL import Image, ImageDraw, ImageFont
from rembg import remove
from moviepy.editor import ImageClip
import io
import os
import json
import tempfile

app = FastAPI()

# 1. ALLOW REQUESTS FROM ANYWHERE (Crucial for Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. SETUP GOOGLE CLIENT (Reads from Render Env Vars)
# Make sure you set GOOGLE_API_KEY in Render settings later!
client = genai.Client(api_key=os.environ.get("AIzaSyDTnS6HczS0GkIcRATs6dMhAsCIBj4gXfU"))

@app.get("/")
def home():
    return {"status": "AI Agency is Live"}

@app.post("/generate")
async def generate_campaign(file: UploadFile = File(...), prompt: str = Form(...)):
    
    # --- STEP 1: READ IMAGE ---
    print(f"📥 Received image for event: {prompt}")
    image_bytes = await file.read()
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    
    # --- STEP 2: STRATEGIST (Gemini 1.5 Pro) ---
    print("🧠 Strategizing...")
    strategy_prompt = f"""
    Analyze this product for event: '{prompt}'.
    Return JSON with:
    1. "caption": Catchy caption.
    2. "bg_prompt": Physical background description (no people, photorealistic, 8k).
    3. "video_hook": Short 3-word text for video overlay.
    """
    res = client.models.generate_content(
        model="gemini-1.5-pro",
        contents=[types.Part.from_bytes(image_bytes, "image/jpeg"), strategy_prompt],
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    data = json.loads(res.text)
    print(f"💡 Strategy: {data['video_hook']}")

    # --- STEP 3: ARTIST (Imagen 3 + Rembg) ---
    print("🎨 Painting...")
    # A. Remove background from product
    product_cutout = remove(input_image)
    
    # B. Generate Background
    bg_res = client.models.generate_images(
        model="imagen-3.0-generate-001",
        prompt=data['bg_prompt'],
        config=types.GenerateImagesConfig(number_of_images=1)
    )
    # Get the background bytes
    bg_image_bytes = bg_res.generated_images[0].image.image_bytes
    bg_image = Image.open(io.BytesIO(bg_image_bytes)).convert("RGBA")
    
    # C. Compose (Paste Product on Background)
    bg_image = bg_image.resize((1080, 1920)) # Reel Size
    product_cutout.thumbnail((800, 800))
    
    # Center logic
    bg_w, bg_h = bg_image.size
    p_w, p_h = product_cutout.size
    offset = ((bg_w - p_w) // 2, (bg_h - p_h) // 2 + 100)
    bg_image.paste(product_cutout, offset, product_cutout)

    # --- STEP 4: DRAW TEXT (Using Pillow for safety) ---
    draw = ImageDraw.Draw(bg_image)
    # Try to load a font, fallback to default if linux server lacks fonts
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
    except:
        font = ImageFont.load_default()
        
    text = data['video_hook'].upper()
    # Draw text at bottom center
    draw.text((100, 1400), text, fill="white", font=font)
    
    # Save temp file for Video processing
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_img:
        bg_image.save(temp_img.name)
        temp_img_path = temp_img.name

    # --- STEP 5: DIRECTOR (MoviePy Zoom) ---
    print("🎬 Filming...")
    clip = ImageClip(temp_img_path).set_duration(5)
    # Zoom Effect: 1.0 to 1.1 scale
    clip = clip.resize(lambda t : 1 + 0.04*t) 
    
    # Save video to temp
    output_video_path = tempfile.mktemp(suffix=".mp4")
    clip.write_videofile(output_video_path, fps=24, codec="libx264", audio=False)

    # Clean up image
    os.remove(temp_img_path)

    # Return the video file
    return FileResponse(output_video_path, media_type="video/mp4", headers={"X-Caption": data['caption']})