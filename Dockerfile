# Use the official Python image.
FROM python:3.11-slim

# Set the working directory.
WORKDIR /app

# Copy requirements file and install dependencies.
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the application code.
COPY . .

# Expose the port Flask runs on.
EXPOSE 5000

# Command to run the application.
CMD ["flask", "run", "--host=0.0.0.0"]
