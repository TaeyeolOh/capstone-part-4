from flask import Flask, request, jsonify, Response, render_template_string, redirect, url_for
import csv
import io

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Buffer to Store Incoming Data ---
received_data = []

# --- HTML Template ---
HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>Live Pico Data</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <meta http-equiv="refresh" content="5">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            text-align: center;
        }
        .grid-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            align-items: start;
        }
        table {
            border-collapse: collapse;
            margin: auto;
            width: 90%;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 8px;
            text-align: center;
            font-size: 14px;
        }
        th {
            background-color: #f2f2f2;
        }
        canvas {
            width: 100% !important;
            height: 250px !important;
        }
        .button-container {
            margin-top: 30px;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            margin: 10px;
            cursor: pointer;
        }
    </style>
</head>
<body>

    <h1>Live Pico Data Monitoring</h1>

    <div class="grid-container">
        <div><canvas id="voltageChart"></canvas></div>
        <div>
            <table>
                <tr>
                    <th>Voltage (V)</th>
                    <th>Current (A)</th>
                    <th>Power (W)</th>
                    <th>Timestamp (ms)</th>
                </tr>
                {% for entry in data %}
                <tr>
                    <td>{{ entry['voltage'] }}</td>
                    <td>{{ entry['current'] }}</td>
                    <td>{{ entry['power'] }}</td>
                    <td>{{ entry['timestamp'] }}</td>
                </tr>
                {% endfor %}
            </table>
        </div>
        <div><canvas id="currentChart"></canvas></div>
        <div><canvas id="powerChart"></canvas></div>
    </div>

    <div class="button-container">
        <a href="/download" target="_blank">
            <button>📥 Download CSV</button>
        </a>
        <a href="/clear" onclick="return confirm('Are you sure you want to clear all data?');">
            <button style="background-color: #f44336; color: white;">🗑️ Clear All Data</button>
        </a>
    </div>

    <script>
        const data = {{ chart_data | safe }};
        const timestamps = data.map(d => d.timestamp);
        const voltages = data.map(d => d.voltage);
        const currents = data.map(d => d.current);
        const powers = data.map(d => d.power);

        const makeChart = (canvasId, label, values, color) => {
            new Chart(document.getElementById(canvasId), {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: label,
                        data: values,
                        borderColor: color,
                        borderWidth: 2,
                        pointRadius: 2,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: 'Timestamp (ms)' } },
                        y: { title: { display: true, text: label } }
                    }
                }
            });
        };

        makeChart('voltageChart', 'Voltage (V)', voltages, 'red');
        makeChart('currentChart', 'Current (A)', currents, 'blue');
        makeChart('powerChart', 'Power (W)', powers, 'green');
    </script>

</body>
</html>
"""

# --- Flask Routes ---

@app.route('/')
def index():
    return render_template_string(
        HTML_PAGE,
        data=received_data[-10:],        # Last 20 for table
        chart_data=received_data[-25:]  # Last 50 but every 2nd point
    )


@app.route('/upload', methods=['POST'])
def upload():
    data = request.get_json()
    print("Received:", data)
    received_data.append(data)
    return "OK", 200

@app.route('/download')
def download():
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['voltage', 'current', 'power', 'timestamp'])
    for entry in received_data:
        cw.writerow([
            entry['voltage'],
            entry['current'],
            entry['power'],
            entry['timestamp']
        ])
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=received_data.csv"}
    )

@app.route('/clear')
def clear():
    received_data.clear()
    print("All data cleared.")
    return redirect(url_for('index'))

# --- Main ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
