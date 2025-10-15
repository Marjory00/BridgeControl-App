// --- 1. D3.JS MOCK DATA (Expanded) ---

// Simulated daily traffic volume and speed data over 24 hours (0-23)
// New fields: ped_vol, bike_vol
const mockTrafficData = [
    { hour: 0, count: 500, speed: 40, incident: false, ped_vol: 50, bike_vol: 30 },
    { hour: 1, count: 350, speed: 45, incident: false, ped_vol: 30, bike_vol: 20 },
    { hour: 2, count: 200, speed: 50, incident: false, ped_vol: 20, bike_vol: 10 },
    { hour: 3, count: 180, speed: 50, incident: false, ped_vol: 10, bike_vol: 5 },
    { hour: 4, count: 400, speed: 40, incident: false, ped_vol: 20, bike_vol: 15 },
    { hour: 5, count: 1200, speed: 30, incident: false, ped_vol: 100, bike_vol: 50 },
    { hour: 6, count: 3500, speed: 18, incident: false, ped_vol: 300, bike_vol: 150 },
    { hour: 7, count: 5800, speed: 8, incident: false, ped_vol: 500, bike_vol: 200 },
    { hour: 8, count: 6500, speed: 4, incident: true, ped_vol: 700, bike_vol: 350 }, // AM Rush + Stand Still + Accident
    { hour: 9, count: 5100, speed: 10, incident: false, ped_vol: 650, bike_vol: 300 },
    { hour: 10, count: 4000, speed: 25, incident: false, ped_vol: 800, bike_vol: 250 }, // Best time to drive
    { hour: 11, count: 3800, speed: 35, incident: false, ped_vol: 900, bike_vol: 200 }, // Best time to drive
    { hour: 12, count: 3500, speed: 38, incident: false, ped_vol: 1000, bike_vol: 180 }, // Mid-day peak peds
    { hour: 13, count: 3700, speed: 35, incident: false, ped_vol: 1100, bike_vol: 170 },
    { hour: 14, count: 4200, speed: 30, incident: false, ped_vol: 950, bike_vol: 160 },
    { hour: 15, count: 5000, speed: 20, incident: false, ped_vol: 700, bike_vol: 250 },
    { hour: 16, count: 6200, speed: 15, incident: false, ped_vol: 500, bike_vol: 300 },
    { hour: 17, count: 7000, speed: 6, incident: false, ped_vol: 400, bike_vol: 450 }, // PM Rush Hour + Bike Peak
    { hour: 18, count: 6800, speed: 5, incident: false, ped_vol: 350, bike_vol: 400 }, // Near Stand Still
    { hour: 19, count: 5500, speed: 15, incident: false, ped_vol: 300, bike_vol: 300 },
    { hour: 20, count: 4100, speed: 25, incident: false, ped_vol: 200, bike_vol: 200 },
    { hour: 21, count: 3000, speed: 35, incident: false, ped_vol: 150, bike_vol: 150 },
    { hour: 22, count: 1800, speed: 40, incident: false, ped_vol: 100, bike_vol: 100 },
    { hour: 23, count: 900, speed: 45, incident: false, ped_vol: 70, bike_vol: 50 }
];

// Simplified Historical Average for comparison
const historicalAverage = mockTrafficData.map(d => ({ hour: d.hour, count: d.count * 0.95 }));

// --- 2. D3.JS CHART SETUP (Same as previous, using a drawing function) ---

const margin = { top: 20, right: 30, bottom: 50, left: 60 };
const containerWidth = document.querySelector('.chart-container').clientWidth;
const width = containerWidth - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;

const svg = d3.select("#traffic-chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

// Define Scales
const x = d3.scaleLinear()
    .domain(d3.extent(mockTrafficData, d => d.hour))
    .range([0, width]);

const y = d3.scaleLinear()
    .domain([0, d3.max(mockTrafficData, d => d.count) * 1.1])
    .range([height, 0]);

// Define the Area generator (for the current traffic volume)
const area = d3.area()
    .x(d => x(d.hour))
    .y0(height)
    .y1(d => y(d.count));

// Define the Line generators
const currentLine = d3.line()
    .x(d => x(d.hour))
    .y(d => y(d.count));

const historicalLine = d3.line()
    .x(d => x(d.hour))
    .y(d => y(historicalAverage.find(h => h.hour === d.hour).count));

// Define a color scale/gradient based on speed/congestion
const speedColorScale = d3.scaleThreshold()
    .domain([5, 15, 35]) // Stand Still (<5), Heavy (5-15), Congested (15-35), Free Flow (>35)
    .range(['#940000', '#FF0000', '#FFD700', '#008000']); // Dark Red, Red, Yellow, Green

function drawChart(data, averageData, highlightHour, forecastHour1, forecastHour2) {
    // Clear previous elements
    svg.selectAll("*").remove();

    // Re-create Gradient (as before)
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "trafficGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    const step = 100 / (data.length - 1);
    data.forEach((d, i) => {
        gradient.append("stop")
            .attr("offset", `${i * step}%`)
            .attr("stop-color", speedColorScale(d.speed));
    });

    // Draw Axes, Labels, Rush Hour Shading (omitted for brevity, assume same as before)
    // ... X-Axis, Y-Axis, Labels ...
    svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(24).tickFormat(d => d % 6 === 0 ? `${d}h` : ''));
    svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).tickFormat(d3.format(".2s")));
    // ...

    // Draw Historical Average Line
    svg.append("path").datum(averageData).attr("class", "line-historical").attr("d", historicalLine);

    // Draw Current Traffic Area & Line
    svg.append("path").datum(data).attr("class", "area-current").attr("d", area);
    svg.append("path").datum(data).attr("class", "line-current").attr("d", currentLine);

    // --- NEW FEATURE: Forecast Highlight ---
    if (forecastHour1 !== undefined && forecastHour2 !== undefined) {
        svg.append("rect") // Forecast Shading
            .attr("x", x(forecastHour1))
            .attr("y", 0)
            .attr("width", x(forecastHour2) - x(forecastHour1))
            .attr("height", height)
            .attr("fill", "#ffc107") // Yellow/Orange for prediction
            .attr("opacity", 0.15);
    }
    
    // Highlight the "current" hour with a vertical line and circle (as before)
    if (highlightHour !== undefined) {
        // ... vertical line code ...
         svg.append("line")
            .attr("x1", x(highlightHour))
            .attr("x2", x(highlightHour))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4");

        // ... circle code ...
        const currentDataPoint = data.find(d => d.hour === highlightHour);
        if (currentDataPoint) {
             svg.append("circle")
                .attr("cx", x(highlightHour))
                .attr("cy", y(currentDataPoint.count))
                .attr("r", 7)
                .attr("fill", speedColorScale(currentDataPoint.speed))
                .attr("stroke", "#333")
                .attr("stroke-width", 2);
        }
    }
}


// --- 3. ACTIONABLE INSIGHTS & ALERT LOGIC (Expanded) ---

function calculateBestTime(data) {
    // Logic as before
    const filteredData = data.filter(d => 
        (d.hour > 4 && d.hour < 6) || (d.hour > 9 && d.hour < 16) || (d.hour > 19)
    );
    filteredData.sort((a, b) => a.count - b.count);
    
    const bestHour1 = filteredData[0];
    const bestHour2 = data.find(d => d.hour === bestHour1.hour + 1);

    if (bestHour1 && bestHour2) {
        const bestTimeStart = `${bestHour1.hour}:00`;
        const bestTimeEnd = `${bestHour2.hour + 1}:00`;
        const lowestCount = (bestHour1.count + bestHour2.count) / 2;
        const overallAvg = d3.mean(data, d => d.count);
        const savings = Math.round(((overallAvg - lowestCount) / overallAvg) * 100);

        document.getElementById('optimal-time').textContent = `${bestTimeStart} - ${bestTimeEnd}`;
        document.getElementById('traffic-savings').textContent = `${savings}%`;
    }
}


function updateAlerts(currentDataPoint) {
    const isStandStill = currentDataPoint.speed < 5;
    const isIncident = currentDataPoint.incident;
    
    // Stand Still Alert
    const standstillAlert = document.getElementById('standstill-alert');
    document.getElementById('current-speed').textContent = `${currentDataPoint.speed} mph`;
    if (isStandStill) {
        standstillAlert.classList.remove('hidden');
    } else {
        standstillAlert.classList.add('hidden');
    }

    // Incident Alert
    const incidentAlert = document.getElementById('accident-info');
    if (isIncident) {
        incidentAlert.classList.remove('hidden');
        document.getElementById('incident-type').textContent = "Major Accident (Lane Closed)";
    } else {
        incidentAlert.classList.add('hidden');
    }

    // Map Simulation Update (Uses HTML to show status)
    const mapPlaceholder = document.querySelector('.map-placeholder');
    let colorStatus;
    if (isStandStill) {
        colorStatus = "⚫ **BLACK** on Map: Stand Still Traffic";
    } else if (currentDataPoint.speed < 15) {
        colorStatus = "🔴 **RED** on Map: Heavy Congestion";
    } else {
        colorStatus = "🟢 **GREEN** on Map: Free Flow";
    }
    mapPlaceholder.innerHTML = `${colorStatus} (Speed: ${currentDataPoint.speed} mph) at Time ${currentDataPoint.hour}h. <br> *Map Simulation: Colors represent current vehicle speed.*`;

    // --- NEW FEATURE: Multi-Modal Data Update ---
    const pedStatus = currentDataPoint.ped_vol > 800 ? "Very High" : currentDataPoint.ped_vol > 300 ? "High" : "Low";
    const bikeStatus = currentDataPoint.bike_vol > 300 ? "High Volume" : "Normal Flow";
    
    document.getElementById('ped-volume').textContent = `${pedStatus} (${currentDataPoint.ped_vol} est./hr)`;
    document.getElementById('bike-status').textContent = `Open, ${bikeStatus} (${currentDataPoint.bike_vol} est./hr)`;
}

// --- NEW FEATURE: 2-HOUR FORECAST LOGIC ---

function updateForecast(data, currentHour) {
    // Get the next two hours' data points
    const nextHour = data.find(d => d.hour === (currentHour + 1) % 24);
    const hourAfterNext = data.find(d => d.hour === (currentHour + 2) % 24);

    if (!nextHour || !hourAfterNext) {
        document.getElementById('forecast-text').textContent = "Forecast data unavailable for the next 2 hours.";
        return;
    }

    const currentData = data.find(d => d.hour === currentHour);

    const speedChange1 = nextHour.speed - currentData.speed;
    const speedChange2 = hourAfterNext.speed - nextHour.speed;

    let message;

    if (speedChange1 > 10 || speedChange2 > 10) {
        message = `GOOD NEWS! Speed is predicted to significantly **IMPROVE** to $\\mathbf{${nextHour.speed} \text{ mph}}$ by ${(currentHour + 1) % 24}:00.`;
    } else if (speedChange1 < -10 || speedChange2 < -10) {
        message = `CAUTION! Speed is predicted to **WORSEN** from $\\mathbf{${currentData.speed} \text{ mph}}$ to $\\mathbf{${hourAfterNext.speed} \text{ mph}}$ by ${(currentHour + 2) % 24}:00. Expect $\\mathbf{20\%}$ heavier traffic.`;
    } else if (nextHour.speed < 10) {
        message = `CONGESTION CONTINUES. Traffic remains slow ($\\mathbf{< 10 \text{ mph}}$) for the next two hours.`;
    } else {
        message = `STEADY FLOW. Traffic is expected to remain stable with minor fluctuations over the next two hours.`;
    }

    document.getElementById('forecast-text').innerHTML = message;

    return [(currentHour + 1) % 24, (currentHour + 2) % 24]; // Return hours for chart highlight
}


// --- 4. INITIALIZATION AND SIMULATION LOOP ---

let currentHour = 7; // Start the simulation at 7 AM

function runSimulation() {
    // Wrap around to 0 after 23
    currentHour = currentHour > 23 ? 0 : currentHour; 

    const currentDataPoint = mockTrafficData.find(d => d.hour === currentHour);
    
    // Update Alerts and Multi-Modal Data
    updateAlerts(currentDataPoint);
    
    // Update Forecast and get hours to highlight
    const forecastHours = updateForecast(mockTrafficData, currentHour);

    // Redraw the chart with the current hour and forecast highlighted
    drawChart(mockTrafficData, historicalAverage, currentHour, forecastHours[0], forecastHours[1]);
    
    // Increment hour for the next loop
    currentHour++;
}

// Initial calculations for static panels
calculateBestTime(mockTrafficData);

// Start the simulation loop (updates every 2 seconds to show "real-time" flow)
setInterval(runSimulation, 2000);

// Run once immediately on load
runSimulation();