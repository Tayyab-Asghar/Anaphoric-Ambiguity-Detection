FROM python:3.11-slim

# Install torch
RUN pip install torch torchvision cpuonly -f https://download.pytorch.org/whl/torch_stable.html

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Run command
CMD ["python", "app.py"]