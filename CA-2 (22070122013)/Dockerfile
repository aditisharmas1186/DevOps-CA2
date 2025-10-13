# Base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files and folders
COPY . .

# Expose Flask port
EXPOSE 5000

# Command to start the app
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
