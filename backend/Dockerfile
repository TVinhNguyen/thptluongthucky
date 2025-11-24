# ĐỔI TỪ 3.10 SANG 3.12
FROM python:3.12-slim

WORKDIR /app

# Cài thêm pkg-config và default-libmysqlclient-dev nếu cần mở rộng sau này
RUN apt-get update && apt-get install -y \
    libpq-dev gcc build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .