// --- 1. D3.JS MOCK DATA ---
const mockTrafficData = [
    // hour, count, speed, incident (bool), ped_vol, bike_vol, co2
    { hour: 0, count: 500, speed: 40, incident: false, ped_vol: 50, bike_vol: 30, co2: 700 },
    { hour: 1, count: 350, speed: 45, incident: false, ped_vol: 30, bike_vol: 20, co2: 650 },
    { hour: 2, count: 200, speed: 50, incident: false, ped_vol: 20, bike_vol: 10, co2: 600 },
    { hour: 3, count: 180, speed: 50, incident: false, ped_vol: 10, bike_vol: 5, co2: 610 },
    { hour: 4, count: 400, speed: 40, incident: false, ped_vol: 20, bike_vol: 15, co2: 680 },
    { hour: 5, count: 1200, speed: 30, incident: false, ped_vol: 100, bike_vol: 50, co2: 850 },
    { hour: 6, count: 3500, speed: 18, incident: false, ped_vol: 300, bike_vol: 150, co2: 1100 },
    { hour: 7, count: 5800, speed: 8, incident: false, ped_vol: 500, bike_vol: 200, co2: 1400 },
    { hour: 8, count: 6500, speed: 4, incident: true, ped_vol: 700, bike_vol: 350, co2: 1650 }, // Critical Hour
    { hour: 9, count: 5100, speed: 10, incident: false, ped_vol: 650, bike_vol: 300, co2: 1350 },
    { hour: 10, count: 4000, speed: 25, incident: false, ped_vol: 800, bike_vol: 250, co2: 1100 },
    { hour: 11, count: 3800, speed: 35, incident: false, ped_vol: 900, bike_vol: 200, co2: 950 },
    { hour: 12, count: 3500, speed: 38, incident: false, ped_vol: 1000, bike_vol: 180, co2: 800 },
    { hour: 13, count: 3700, speed: 35, incident: false, ped_vol: 1100, bike_vol: 170, co2: 850 },
    { hour: 14, count: 4200, speed: 30, incident: false, ped_vol: 950, bike_vol: 160, co2: 980 },
    { hour: 15, count: 5000, speed: 20, incident: false, ped_vol: 700, bike_vol: 250, co2: 1150 },
    { hour: 16, count: 6200, speed: 15, incident: false, ped_vol: 500, bike_vol: 300, co2: 1400 },
    { hour: 17, count: 7000, speed: 6, incident: false, ped_vol: 400, bike_vol: 450, co2: 1700 }, // Critical Hour
    { hour: 18, count: 6800, speed: 5, incident: false, ped_vol: 350, bike_vol: 400, co2: 1600 },
    { hour: 19, count: 5500, speed: 15, incident: false, ped_vol: 300, bike_vol: 300, co2: 1300 },
    { hour: 20, count: 4100, speed: 25, incident: false, ped_vol: 200, bike_vol: 200, co2: 1000 },
    { hour: 21, count: 3000, speed: 35, incident: false, ped_vol: 150, bike_vol: 150, co2: 850 },
    { hour: 22, count: 1800, speed: 40, incident: false, ped_vol: 100, bike_vol: 100, co2: 750 },
    { hour: 23, count: 900, speed: 45, incident: false, ped_vol: 70, bike_vol: 50, co2: 700 }
];
const historicalAverage = mockTrafficData.map(d => ({ hour: d.hour, count: d.count * 0.95 }));
// Updated colors for light mode (matching the CSS legend)
const speedColorScale = d3.scaleThreshold().domain([5, 15, 35]).range(['#D50000', '#FF3D00', '#FFD600', '#00C853']); 


// --- 2. D3.JS CHART SETUP ---
// NOTE: To get correct chart width, this D3 setup should be done AFTER the element is rendered.
const margin = { top: 20, right: 30, bottom: 50, left: 60 };
const height = 350 - margin.top - margin.bottom;

const svg = d3.select("#traffic-chart")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear();
const y = d3.scaleLinear().domain([0, d3.max(mockTrafficData, d => d.count) * 1.1]).range([height, 0]);

d3.select("#time-range-selector").on("change", () => runSimulation());

function drawChart(data, averageData, highlightHour, forecastHour1, forecastHour2) {
    // Get the current width of the parent container on each draw
    const containerWidth = document.querySelector('.chart-container').clientWidth;
    const width = containerWidth - margin.left - margin.right;

    const range = parseInt(d3.select("#time-range-selector").node().value);
    const startIndex = (currentHour - range + 1 + 24) % 24; 
    
    const sortedData = data.slice().sort((a, b) => a.hour - b.hour);
    const displayData = [];
    for (let i = 0; i < range; i++) {
        const hour = (startIndex + i) % 24;
        displayData.push(sortedData.find(d => d.hour === hour));
    }
    const displayAvgData = displayData.map(d => averageData.find(a => a.hour === d.hour));

    d3.select("svg").attr("width", width + margin.left + margin.right);
    
    x.domain([0, range - 1]).range([0, width]);

    // Update D3 generators with the new width/range
    const indexLine = d3.line().x((d, i) => x(i)).y(d => y(d.count));
    const indexArea = d3.area().x((d, i) => x(i)).y0(height).y1(d => y(d.count));
    
    svg.selectAll("*").remove();

    // Draw X Axis
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(range < 5 ? range - 1 : 6).tickFormat(i => `${displayData[i].hour}h`));

    // Draw Y Axis
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

    // 1. Draw Historical Average Line (Traffic Pattern Graph)
    svg.append("path")
        .datum(displayAvgData)
        .attr("class", "line-historical")
        .attr("d", indexLine);

    // 2. Draw Current Traffic Area
    svg.append("path")
        .datum(displayData)
        .attr("class", "area-current")
        .attr("d", indexArea)
        .attr("fill", "#007BFF"); // High-contrast blue area

    // 3. Draw Current Traffic Line
    svg.append("path")
        .datum(displayData)
        .attr("class", "line-current")
        .attr("d", indexLine);

    // Highlight the "current" hour 
    const currentDataIndex = displayData.length - 1;
    const currentDataPoint = displayData[currentDataIndex];
    if (currentDataPoint) {
        svg.append("circle")
            .attr("cx", x(currentDataIndex))
            .attr("cy", y(currentDataPoint.count))
            .attr("r", 7)
            .attr("fill", speedColorScale(currentDataPoint.speed))
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
    }
}


// --- 3. SIMULATION LOGIC (Unchanged, ensures dynamic data works) ---

let alertHistory = [
    { time: '06:45h', description: 'Disabled vehicle reported, B-B exit.', status: 'Clearance' }
];
let incidentLog = [
    { time: '08:05h', description: 'Major accident, M-B lanes. Emergency crews dispatched.', status: 'ongoing' }
];

function updateIncidentAndHistory(currentDataPoint) {
    const list = d3.select('#incident-list');
    const historyList = d3.select('#alert-history-list');
    list.html(''); 
    historyList.html(''); 

    const criticalIncidentActive = currentDataPoint.incident && currentDataPoint.hour === 8;

    if (criticalIncidentActive) {
        list.append('li').html(`<span class="incident-status ongoing">Ongoing</span> ${incidentLog[0].time} - ${incidentLog[0].description}`);
    } else if (currentDataPoint.hour === 9) {
        list.html('<li><span class="incident-status resolved">CLEARED</span> 09:00h - No major active incidents.</li>');
        if (!alertHistory.find(a => a.time === '09:00h')) {
            alertHistory.push({ time: '09:00h', description: 'Major accident cleared.', status: 'Resolved' });
        }
    } else {
        list.html('<li><span class="incident-status resolved">CLEARED</span> No major active incidents.</li>');
    }

    alertHistory.slice().reverse().forEach(alert => {
        historyList.append('li').html(`<span class="history-status info">${alert.status}</span> ${alert.time} - ${alert.description}`);
    });
}

function updateEnvironment(currentDataPoint) {
    const co2 = currentDataPoint.co2;
    
    let score;
    let aqiStatus;
    let statusClass;

    if (co2 > 1500) {
        score = 'High';
        aqiStatus = 'Poor';
        statusClass = 'status-warning';
    } else if (co2 > 1000) {
        score = 'Moderate';
        aqiStatus = 'Moderate';
        statusClass = 'status-warning';
    } else {
        score = 'Low';
        aqiStatus = 'Normal';
        statusClass = 'status-good';
    }

    document.getElementById('co2-value').textContent = `${co2} ppm`;
    document.getElementById('co2-score').textContent = score;
    
    document.getElementById('co2-score').className = statusClass;
    document.getElementById('aqi-status').textContent = aqiStatus;
    document.getElementById('aqi-status').className = statusClass;
}

function updateMapSimulation(currentDataPoint) {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    const nextHour = mockTrafficData.find(d => d.hour === (currentHour + 1) % 24);

    let currentStatus = currentDataPoint.speed < 5 ? '⚫ BLACK (Stand Still)' : currentDataPoint.speed < 15 ? '🔴 RED (Heavy Congestion)' : '🟢 GREEN (Free Flow)';
    let nextStatus = nextHour.speed < 5 ? '⚫ BLACK (Stand Still)' : nextHour.speed < 15 ? '🔴 RED (Heavy Congestion)' : '🟢 GREEN (Free Flow)';

    mapPlaceholder.innerHTML = `
        **CURRENT:** ${currentStatus} (${currentDataPoint.speed} $\\text{mph}$)
        <br>
        **PREDICTED:** ${nextStatus} (${nextHour.speed} $\\text{mph}$)
    `;
}

function updateForecast(data, currentHour) {
    const nextHour = data.find(d => d.hour === (currentHour + 1) % 24);
    if (!nextHour) return;

    const currentData = data.find(d => d.hour === currentHour);
    const speedChange1 = nextHour.speed - currentData.speed;
    const confidence = Math.round(100 - (Math.abs(speedChange1) * 2)); 

    let message;
    if (speedChange1 < -10) {
        message = `CAUTION! Traffic is predicted to **WORSEN** from $\\mathbf{${currentData.speed} \text{ mph}}$ to $\\mathbf{${nextHour.speed} \text{ mph}}$ in the next hour.`;
    } else if (speedChange1 > 10) {
        message = `GOOD NEWS! Traffic is predicted to significantly **IMPROVE** to $\\mathbf{${nextHour.speed} \text{ mph}}$ by ${(currentHour + 1) % 24}:00.`;
    } else {
        message = `STEADY FLOW. Traffic is expected to remain stable with minor changes.`;
    }

    document.getElementById('forecast-text').innerHTML = message;
    document.getElementById('confidence-score').textContent = `Confidence: ${Math.max(65, confidence)}%`; 
    return [(currentHour + 1) % 24, (currentHour + 2) % 24];
}

function updateMiscAlerts(currentDataPoint) {
    document.getElementById('current-speed').textContent = currentDataPoint.speed + ' mph';
    document.getElementById('standstill-alert').classList.toggle('hidden', currentDataPoint.speed >= 5);
    document.getElementById('accident-info').classList.toggle('hidden', !currentDataPoint.incident);
    document.getElementById('ped-volume').textContent = (currentDataPoint.ped_vol > 800 ? "Very High" : "High") + ` (${currentDataPoint.ped_vol} est./hr)`;
    document.getElementById('bike-status').textContent = 'Open, ' + (currentDataPoint.bike_vol > 300 ? "High Volume" : "Normal Flow");
    document.getElementById('last-update-time').textContent = new Date().toLocaleTimeString();
    
    const transitStatus = document.getElementById('subway-status');
    const ferryStatus = document.getElementById('ferry-status');
    if (currentDataPoint.speed < 10) {
        transitStatus.textContent = 'Severe Delays (High Ridership)';
        transitStatus.classList = 'status-warning';
        ferryStatus.textContent = 'On Time, Increased Load';
        ferryStatus.classList = 'status-good';
    } else {
        transitStatus.textContent = 'Good Service';
        transitStatus.classList = 'status-good';
        ferryStatus.textContent = 'On Time';
        ferryStatus.classList = 'status-good';
    }
}

const calculateBestTime = () => {
    document.getElementById('optimal-time').textContent = `10:00 AM - 11:30 AM`;
    document.getElementById('traffic-savings').textContent = `25%`;
};

// --- 4. INITIALIZATION AND SIMULATION LOOP ---
let currentHour = 7; 

function runSimulation() {
    currentHour = (currentHour + 1) % 24; 

    const currentDataPoint = mockTrafficData.find(d => d.hour === currentHour);
    
    updateMiscAlerts(currentDataPoint);
    updateEnvironment(currentDataPoint); 
    updateMapSimulation(currentDataPoint);
    updateIncidentAndHistory(currentDataPoint);

    const forecastHours = updateForecast(mockTrafficData, currentHour);
    drawChart(mockTrafficData, historicalAverage, currentHour, forecastHours[0], forecastHours[1]);
}

// Initial setup on load
calculateBestTime();
runSimulation(); 
// Start the simulation loop (updates every 2 seconds)
setInterval(runSimulation, 2000);