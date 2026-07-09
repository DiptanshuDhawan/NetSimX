# Cisco Images Directory

Because we cannot legally distribute Cisco IOS/IOL images in our public Docker container, you must provide your own.

**Instructions:**
1. Obtain your `.bin` or `.image` files for Cisco routers/switches.
2. Drop them into this `images/` directory.
3. When you run `docker-compose up`, this folder is automatically mounted into the `gns3-server` container so it can access your images!
