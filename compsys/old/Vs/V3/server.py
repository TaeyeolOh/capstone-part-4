from flask import Flask, request, Response, render_template_string, jsonify
import csv
import io

app = Flask(__name__)

# --- Buffers ---
received_data = []         # For live data (only recent)
recorded_data = []         # Full recording data
stop_triggered = False     # Signal for Pico to stop sampling

# --- HTML Template ---
HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>Live Pico Data Monitoring</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial; }
        .grid { display: grid; grid-template-columns: 60% 40%; gap: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
        canvas { width: 100%; height: 200px; }
        button { padding: 10px 20px; font-size: 16px; margin-top: 20px; }
    </style>
</head>
<body>

<h1>Live Pico Data Monitoring</h1>

<div class="grid">
    <div>
        <canvas id="voltageChart"></canvas>
        <canvas id="currentChart"></canvas>
        <canvas id="powerChart"></canvas>
    </div>
    <div>
        <table>
            <thead>
                <tr>
                    <th>Voltage (V)</th>
                    <th>Current (A)</th>
                    <th>Power (W)</th>
                    <th>Timestamp (ms)</th>
                </tr>
            </thead>
            <tbody id="data-table-body">
                <!-- Table rows will be dynamically populated here -->
            </tbody>
        </table>

        <form action="/trigger_stop" method="post">
            <button type="submit">🛑 Stop & Download All Data</button>
        </form>
    </div>
</div>

<script>
let voltageChart, currentChart, powerChart;

async function fetchDataAndUpdate() {
    const response = await fetch('/live_data');
    const data = await response.json();

    const timestamps = data.map(d => d.t);
    const voltages = data.map(d => parseFloat(d.v));
    const currents = data.map(d => parseFloat(d.c));
    const powers = data.map(d => parseFloat(d.p));


    if (!voltageChart) {
        voltageChart = new Chart(document.getElementById('voltageChart'), makeConfig('Voltage (V)', voltages, 'red', timestamps));
        currentChart = new Chart(document.getElementById('currentChart'), makeConfig('Current (A)', currents, 'blue', timestamps));
        powerChart   = new Chart(document.getElementById('powerChart'), makeConfig('Power (W)', powers, 'green', timestamps));
    } else {
        voltageChart.data.labels = timestamps;
        voltageChart.data.datasets[0].data = voltages;
        voltageChart.update();

        currentChart.data.labels = timestamps;
        currentChart.data.datasets[0].data = currents;
        currentChart.update();

        powerChart.data.labels = timestamps;
        powerChart.data.datasets[0].data = powers;
        powerChart.update();
    }

    // --- Update Table ---
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = ''; // Clear old table rows
    data.slice(-20).forEach(entry => {  // Last 20 only
        const row = `<tr>
            <td>${entry.v}</td>
            <td>${entry.c}</td>
            <td>${entry.p}</td>
            <td>${entry.t}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function makeConfig(label, values, color, labels) {
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                borderColor: color,
                fill: false
            }]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                x: { title: { display: true, text: 'Timestamp (ms)' } },
                y: { title: { display: true, text: label } }
            }
        }
    };
}

// Update graphs and table every 1 second
setInterval(fetchDataAndUpdate, 1000);

// Initial load
fetchDataAndUpdate();
</script>



</body>
</html>
"""

# --- Routes ---

@app.route('/')
def index():
    return render_template_string(
        HTML_PAGE,
        data=received_data[-20:],      # Display last 20 readings
        chart_data=received_data[-50:] # Graph last 50 readings
    )

@app.route('/upload', methods=['POST'])
def upload():
    data = request.get_json()
    print("Received (Live):", data)
    received_data.append(data)
    recorded_data.append(data)  # Also store into full recorded data
    return "OK", 200

@app.route('/upload_all', methods=['POST'])
def upload_all():
    global recorded_data
    new_data = request.get_json()
    print(f"Received batch of {len(new_data)} records")
    recorded_data.extend(new_data)
    return "OK", 200

@app.route('/download')
def download():
    si = io.StringIO()
    cw = csv.writer(si)
    # descriptive headers
    cw.writerow(['Voltage (V)', 'Current (A)', 'Power (W)', 'Timestamp (ms)'])
    for entry in recorded_data:
        # use the actual keys your Pico is sending
        cw.writerow([
            entry.get('v', ''), 
            entry.get('c', ''), 
            entry.get('p', ''), 
            entry.get('t', '')
        ])
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=recorded_data.csv"}
    )


@app.route('/trigger_stop', methods=['POST'])
def trigger_stop():
    global stop_triggered, recorded_data, received_data

    # wipe out any old data, so the next upload_all() calls start from zero
    recorded_data.clear()
    received_data.clear()

    stop_triggered = True
    print("🛑 Stop trigger activated! Buffers have been reset.")
    return (
        "Stop command sent! Pico will upload full data shortly."
        "<br><a href='/download'>Download CSV</a>"
    )

@app.route('/check_stop')
def check_stop():
    global stop_triggered
    response = {"stop_sampling": stop_triggered}
    stop_triggered = False  # Reset once sent
    return jsonify(response)

@app.route('/live_data')
def live_data():
    return jsonify(received_data[-50:])  # Sending last 50 records

# --- Main ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
