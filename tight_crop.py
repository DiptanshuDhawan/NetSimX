from PIL import Image, ImageChops
import os

def crop_white_borders(img):
    # Ensure image is in RGBA
    img = img.convert("RGBA")
    # Create a solid white background image
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    
    # Calculate the difference
    diff = ImageChops.difference(img, bg)
    
    # Get bounding box of the non-zero regions (non-white)
    bbox = diff.getbbox()
    if bbox:
        # Pad a little bit (optional, but tight is better for making it big)
        # Let's just return the tight bbox
        return img.crop(bbox)
    return img

file_path = r'D:\netlabx\frontend\public\logo-icon.png'
img = Image.open(file_path)
img = crop_white_borders(img)
img.save(file_path)
print(f"Tight crop applied! New size: {img.size}")
