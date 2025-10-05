import os
from flask import Flask, jsonify, Response
import time
import random

app = Flask(__name__)

# Simple metrics tracking
request_count = 0
error_count = 0
total_request_time = 0.0

@app.route('/')
def home():
    global request_count, total_request_time
    start_time = time.time()
    request_count += 1
    
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    total_request_time += (time.time() - start_time)
    
    return jsonify({
        'message': 'Flask Monitoring Demo', 
        'status': 'healthy',
        'version': '2.0'
    })

@app.route('/health')
def health():
    global request_count
    request_count += 1
    return jsonify({'status': 'healthy'})

@app.route("/version")
def version():
    return "v1", 200

@app.route('/api/data')
def get_data():
    global request_count, error_count, total_request_time
    start_time = time.time()
    request_count += 1
    
    time.sleep(random.uniform(0.1, 0.5))
    
    # Simulate 5% error rate
    if random.random() < 0.05:
        error_count += 1
        total_request_time += (time.time() - start_time)
        return jsonify({'error': 'Processing failed'}), 500
    
    total_request_time += (time.time() - start_time)
    
    return jsonify({
        'data': [random.randint(1, 1000) for _ in range(10)],
        'timestamp': time.time()
    })

@app.route('/slow')
def slow_endpoint():
    global request_count, total_request_time
    start_time = time.time()
    request_count += 1
    
    # Simulate slow processing
    sleep_time = random.uniform(2, 5)
    time.sleep(sleep_time)
    
    total_request_time += (time.time() - start_time)
    
    return jsonify({'message': 'This was intentionally slow'})

@app.route('/metrics')
def metrics():
    """Prometheus metrics endpoint"""
    avg_response_time = total_request_time / max(request_count, 1)
    uptime = time.time()  # Simple uptime metric
    
    metrics_data = f"""# HELP flask_http_request_total Total number of HTTP requests
# TYPE flask_http_request_total counter
flask_http_request_total {request_count}

# HELP flask_http_request_errors_total Total number of HTTP request errors
# TYPE flask_http_request_errors_total counter
flask_http_request_errors_total {error_count}

# HELP flask_http_request_duration_seconds Average request duration
# TYPE flask_http_request_duration_seconds gauge
flask_http_request_duration_seconds {avg_response_time:.4f}

# HELP flask_app_info Flask application info
# TYPE flask_app_info gauge
flask_app_info{{version="1.0"}} 1

# HELP up Flask application status
# TYPE up gauge
up 1

# HELP flask_app_uptime_seconds Flask application uptime
# TYPE flask_app_uptime_seconds counter
flask_app_uptime_seconds {uptime:.0f}
"""
    return Response(metrics_data, mimetype='text/plain')

if __name__ == '__main__':
    print("🚀 Starting Flask with custom Prometheus metrics...")
    print("📊 Metrics available at: http://localhost:5000/metrics")
    app.run(host='0.0.0.0', port=5000, debug=True)
