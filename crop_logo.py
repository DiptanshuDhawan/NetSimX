from PIL import Image
import os

img = Image.open(r'D:\revelio labs.png').convert("RGBA")
width, height = img.size

# Top half: full logo
top_img = img.crop((0, 0, width, height // 2))

# Bottom half: icon only
bottom_img = img.crop((0, height // 2, width, height))

out_dir = r'D:\netlabx\frontend\public'
os.makedirs(out_dir, exist_ok=True)

top_img.save(os.path.join(out_dir, 'logo-full.png'))
bottom_img.save(os.path.join(out_dir, 'logo-icon.png'))
print("Logos saved successfully!")
