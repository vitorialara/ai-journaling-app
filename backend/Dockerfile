# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
COPY /app /app

# Set environment variables
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PYTHONPATH=/app

# Install system dependencies
# RUN apt-get update && apt-get install -y \
#     postgresql-client-15 \
#     && rm -rf /var/lib/apt/lists/*

# Create a non-root user
# RUN useradd -m -u 1000 appuser && \
#     chown -R appuser:appuser /app
# USER appuser

# Copy requirements first to leverage Docker cache
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY  . .

# # Expose the port the app runs on
# EXPOSE 8000

# Health check
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT


# # Add labels
# LABEL maintainer="Feel-Write Team" \
#       version="1.0.0" \
#       description="Feel-Write API Backend"
