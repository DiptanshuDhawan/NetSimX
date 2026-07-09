FROM python:3.11-slim

WORKDIR /app

# Install dependencies needed for some Python packages
RUN apt-get update && apt-get install -y gcc libffi-dev musl-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY . .

# Expose port 8000
EXPOSE 8000

# Start the FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
