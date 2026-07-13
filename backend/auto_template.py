import os
import time
import requests
import logging

logger = logging.getLogger(__name__)

GNS3_HOST = os.getenv("GNS3_HOST", "127.0.0.1")
GNS3_PORT = os.getenv("GNS3_PORT", "3080")
GNS3_URL = f"http://{GNS3_HOST}:{GNS3_PORT}"
IMAGES_DIR = "/app/images"

def auto_configure_templates():
    # Wait for GNS3 server to be ready
    max_retries = 10
    for i in range(max_retries):
        try:
            res = requests.get(f"{GNS3_URL}/v2/version", timeout=5)
            if res.status_code == 200:
                logger.info("GNS3 server is ready.")
                break
        except Exception:
            pass
        logger.info(f"Waiting for GNS3 server... ({i+1}/{max_retries})")
        time.sleep(3)
    else:
        logger.error("Could not connect to GNS3 server to create templates.")
        return

    # Check images directory
    if not os.path.exists(IMAGES_DIR):
        logger.warning(f"Images directory {IMAGES_DIR} not found. Skipping auto-template.")
        return

    images = [f for f in os.listdir(IMAGES_DIR) if f.endswith(".bin") or f.endswith(".image")]
    if not images:
        logger.warning(f"No .bin or .image files found in {IMAGES_DIR}. Skipping auto-template.")
        return
        
    logger.info(f"Found images: {images}")

    if "router.bin" not in images:
        logger.warning("router.bin not found in images directory. Skipping auto-template.")
        return
    if "switch.bin" not in images:
        logger.warning("switch.bin not found in images directory. Skipping auto-template.")
        return

    router_image = "router.bin"
    switch_image = "switch.bin"

    # Fetch existing templates
    existing_templates = []
    try:
        res = requests.get(f"{GNS3_URL}/v2/templates")
        if res.status_code == 200:
            existing_templates = [t.get("name") for t in res.json()]
    except Exception as e:
        logger.error(f"Error fetching templates: {e}")
        return

    # Create Router Template if missing
    if "cisco_ios_telnet" not in existing_templates:
        logger.info(f"Creating router template 'cisco_ios_telnet' with image {router_image}")
        payload = {
            "name": "cisco_ios_telnet",
            "compute_id": "local",
            "template_type": "iou",
            "path": router_image,
            "category": "router"
        }
        try:
            requests.post(f"{GNS3_URL}/v2/templates", json=payload)
        except Exception as e:
            logger.error(f"Failed to create router template: {e}")

    # Create Switch Template if missing
    if "cisco_iol_l2" not in existing_templates:
        logger.info(f"Creating switch template 'cisco_iol_l2' with image {switch_image}")
        payload = {
            "name": "cisco_iol_l2",
            "compute_id": "local",
            "template_type": "iou",
            "path": switch_image,
            "category": "switch"
        }
        try:
            requests.post(f"{GNS3_URL}/v2/templates", json=payload)
        except Exception as e:
            logger.error(f"Failed to create switch template: {e}")
