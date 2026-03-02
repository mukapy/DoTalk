import os
from io import BytesIO

from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile


def convert_to_webp(image_file, target_size, quality=85):
    img = Image.open(image_file)
    img = img.convert("RGB")
    img = img.resize(target_size, Image.LANCZOS)

    buffer = BytesIO()
    img.save(buffer, format="WEBP", quality=quality)
    buffer.seek(0)

    # Build a new filename with .webp extension
    original_name = getattr(image_file, "name", "image.webp")
    base_name = os.path.splitext(original_name)[0]
    new_name = f"{base_name}.webp"

    return InMemoryUploadedFile(
        file=buffer,
        field_name=None,
        name=new_name,
        content_type="image/webp",
        size=buffer.getbuffer().nbytes,
        charset=None,
    )
