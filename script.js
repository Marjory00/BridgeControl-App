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
    { hour: 8, count: 6500, speed: 4, incident: true, ped_vol: 700, bike_vol: 350, co2: 1650 }, // Critical Hour (Incident)
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

// D3 scale for color mapping based on speed (used for chart dots)
const speedColorScale = d3.scaleThreshold().domain([5, 15, 35]).range(['#D50000', '#FF3D00', '#FFD600', '#00C853']); 
const timeFormatter = (h) => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    if (h < 12) return `${h} AM`;
    return `${h - 12} PM`;
};

// Helper function to map speed to CSS color class for the animated map
function getTrafficColorClass(speed) {
    if (speed < 5) return 'status-black'; 
    if (speed < 15) return 'status-red';  
    if (speed < 35) return 'status-yellow'; 
    return 'status-green'; 
}

// --- 2. D3.JS CHART SETUP ---
const margin = { top: 20, right: 30, bottom: 50, left: 60 };
const height = 350 - margin.top - margin.bottom;
let svg;
let g;
const tooltip = d3.select("#tooltip");
const x = d3.scaleLinear();
const y = d3.scaleLinear().domain([0, d3.max(mockTrafficData, d => d.count) * 1.1]).range([height, 0]);
const historicalAverage = mockTrafficData.map(d => ({ hour: d.hour, count: d.count * 0.95 }));

function initializeSVG() {
    const chartContainer = d3.select("#traffic-chart");

    // Calculate current width of the container
    const containerWidth = document.querySelector('.chart-container').clientWidth - 40; // Account for 20px padding on each side
    const width = containerWidth - margin.left - margin.right;
    
    // Select or append the SVG element
    if (chartContainer.select('svg').empty()) {
        svg = chartContainer
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    } else {
        svg = chartContainer.select('svg');
        g = chartContainer.select('g');
        // Update SVG and group dimensions on redraw/resize
        svg.attr("width", width + margin.left + margin.right);
    }
}

function drawChart(data, averageData, highlightHour) {
    const container = document.querySelector('.chart-container');
    if (!container) return; 

    // Re-initialize/update SVG for responsiveness
    initializeSVG(); 
    
    const containerWidth = container.clientWidth - 40;
    const width = containerWidth - margin.left - margin.right;
    const range = parseInt(d3.select("#time-range-selector").node().value);
    
    const sortedData = data.slice().sort((a, b) => a.hour - b.hour);
    const displayData = [];

    // Dynamically calculate the start hour based on currentHour and range
    let startHour = (highlightHour - range + 1 + 24) % 24;
    
    for (let i = 0; i < range; i++) {
        const hour = (startHour + i) % 24;
        const dataPoint = sortedData.find(d => d.hour === hour);
        if (dataPoint) displayData.push(dataPoint); 
    }
    const displayAvgData = displayData.map(d => averageData.find(a => a.hour === d.hour));

    // Update X scale domain based on number of points displayed
    x.domain([0, displayData.length - 1]).range([0, width]);

    // Define line and area generators
    const indexLine = d3.line().x((d, i) => x(i)).y(d => y(d.count));
    const indexArea = d3.area().x((d, i) => x(i)).y0(height).y1(d => y(d.count));
    
    g.selectAll("*").remove(); // Clear previous elements for redraw

    // Draw Axes
    g.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(Math.min(displayData.length, 6)) // Limit ticks on smaller ranges
            .tickFormat(i => {
                if (displayData[i]) return timeFormatter(displayData[i].hour);
                return '';
            }));

    g.append("text").attr("class", "x label").attr("text-anchor", "end").attr("x", width / 2).attr("y", height + 35).text("Hour of Day");
    g.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).tickFormat(d3.format(".2s")));
    g.append("text").attr("class", "y label").attr("text-anchor", "end").attr("y", -margin.left + 15).attr("x", -height / 2).attr("dy", ".75em").attr("transform", "rotate(-90)").text("Vehicle Volume (Veh/Hr)");


    // 1. Draw Historical Average Line
    g.append("path").datum(displayAvgData).attr("class", "line-historical").attr("d", indexLine);

    // 2. Draw Current Traffic Area
    g.append("path").datum(displayData).attr("class", "area-current").attr("d", indexArea);

    // 3. Draw Current Traffic Line
    g.append("path").datum(displayData).attr("class", "line-current").attr("d", indexLine);
        
    // 4. Incident Marker 
    const incidentIndex = displayData.findIndex(d => d.hour === 8);
    if (incidentIndex !== -1) {
        g.append("line")
            .attr("x1", x(incidentIndex)).attr("x2", x(incidentIndex))
            .attr("y1", 0).attr("y2", height)
            .attr("stroke", "#CC0000").attr("stroke-width", 2).attr("stroke-dasharray", "4 4").attr("opacity", 0.9);
    }

    // 5. Data Points 
    g.selectAll(".dot").data(displayData).enter().append("circle")
        .attr("class", "dot").attr("cx", (d, i) => x(i)).attr("cy", d => y(d.count)).attr("r", 5)
        .attr("fill", d => speedColorScale(d.speed))
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Time: ${timeFormatter(d.hour)}<br>Volume: ${d.count.toLocaleString()}<br>Speed: ${d.speed} mph`)
            .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        }).on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Highlight the "current" hour 
    const currentDataIndex = displayData.findIndex(d => d.hour === highlightHour);
    const currentDataPoint = displayData[currentDataIndex];
    if (currentDataPoint) {
        g.append("circle")
            .attr("cx", x(currentDataIndex)).attr("cy", y(currentDataPoint.count)).attr("r", 7)
            .attr("fill", speedColorScale(currentDataPoint.speed)).attr("stroke", "#343A40").attr("stroke-width", 2);
    }
}


// --- 3. SIMULATION LOGIC ---

let alertHistory = [
    { time: '06:45h', description: 'Disabled vehicle reported, B-B exit.', status: 'Clearance' }
];
let incidentLog = [
    { time: '08:05h', description: 'Major accident, M-B lanes. Emergency crews dispatched.', status: 'ongoing' }
];

function updateIncidentAndHistory(currentDataPoint) {
    const list = d3.select('#incident-list');
    const historyList = d3.select('#alert-history-list');
    if (list.empty() || historyList.empty()) return;

    list.html(''); 
    historyList.html(''); 
    const criticalIncidentActive = currentDataPoint.incident && currentDataPoint.hour === 8;

    if (criticalIncidentActive) {
        list.append('li').html(`<span class="incident-status ongoing">Ongoing</span> ${incidentLog[0].time} - ${incidentLog[0].description}`);
    } else if (currentHour === 9) {
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

    const co2Value = document.getElementById('co2-value');
    const co2Score = document.getElementById('co2-score');
    const aqiStatusEl = document.getElementById('aqi-status');
    
    if (co2Value) co2Value.textContent = `${co2} ppm`; 
    if (co2Score) {
        co2Score.textContent = score;
        co2Score.className = statusClass;
    }
    if (aqiStatusEl) {
        aqiStatusEl.textContent = aqiStatus;
        aqiStatusEl.className = statusClass;
    }
}

// Map simulation logic to use dark fill and animated stroke
function updateMapSimulation(currentDataPoint) {
    const mapCurrentDiv = d3.select('#map-current');
    const mapPredictedDiv = d3.select('#map-predicted');

    if (mapCurrentDiv.empty() || mapPredictedDiv.empty()) return;

    const nextHour = mockTrafficData.find(d => d.hour === (currentHour + 1) % 24);

    const mapWidth = mapCurrentDiv.node().clientWidth;
    const mapHeight = mapCurrentDiv.node().clientHeight;
    const numSegments = 4; // Simulating 4 lanes
    const segmentWidth = mapWidth;
    const segmentHeight = mapHeight / numSegments;

    // --- Current Map (Left) ---
    mapCurrentDiv.selectAll('svg').remove(); // Clear previous SVG
    const svgCurrent = mapCurrentDiv.append('svg')
        .attr('width', mapWidth)
        .attr('height', mapHeight);

    const currentSpeed = currentDataPoint.speed;
    const currentColorClass = getTrafficColorClass(currentSpeed);
    const isStandstill = currentColorClass === 'status-black';

    // Draw the 4 animated road segments
    svgCurrent.selectAll('.traffic-road-segment')
        .data(d3.range(numSegments)) 
        .enter().append('rect')
        // Only apply 'animated' class if it's not a complete standstill
        .attr('class', `traffic-road-segment ${currentColorClass} ${isStandstill ? '' : 'animated'}`) 
        .attr('x', 0)
        .attr('y', (d, i) => i * segmentHeight)
        .attr('width', segmentWidth)
        .attr('height', segmentHeight);


    // --- Predicted Map (Right) ---
    mapPredictedDiv.selectAll('svg').remove(); // Clear previous SVG
    const svgPredicted = mapPredictedDiv.append('svg')
        .attr('width', mapWidth)
        .attr('height', mapHeight);

    let predictedSpeed = nextHour ? nextHour.speed : currentDataPoint.speed; 
    let predictedColorClass = getTrafficColorClass(predictedSpeed);
    const isPredictedStandstill = predictedColorClass === 'status-black';

    // Draw the 4 animated road segments
    svgPredicted.selectAll('.traffic-road-segment')
        .data(d3.range(numSegments)) 
        .enter().append('rect')
        .attr('class', `traffic-road-segment ${predictedColorClass} ${isPredictedStandstill ? '' : 'animated'}`)
        .attr('x', 0)
        .attr('y', (d, i) => i * segmentHeight)
        .attr('width', segmentWidth)
        .attr('height', segmentHeight);
}

function updateForecast(data, currentHour) {
    const nextHourData = data.find(d => d.hour === (currentHour + 1) % 24);
    if (!nextHourData) return;

    const currentData = data.find(d => d.hour === currentHour);
    const speedChange1 = nextHourData.speed - currentData.speed;
    // Calculate confidence based on magnitude of change (larger change = lower initial confidence)
    const confidence = Math.round(100 - (Math.abs(speedChange1) * 2)); 

    let message;
    if (speedChange1 < -10) {
        message = `CAUTION! Traffic is predicted to **WORSEN** from **${currentData.speed} mph** to **${nextHourData.speed} mph** in the next hour.`;
    } else if (speedChange1 > 10) {
        message = `GOOD NEWS! Traffic is predicted to significantly **IMPROVE** to **${nextHourData.speed} mph** by ${timeFormatter((currentHour + 1) % 24)}.`;
    } else {
        message = `STEADY FLOW. Traffic is expected to remain stable with minor changes.`;
    }

    const forecastText = document.getElementById('forecast-text');
    const confidenceScore = document.getElementById('confidence-score');
    if (forecastText) forecastText.innerHTML = message;
    if (confidenceScore) confidenceScore.textContent = `Confidence: ${Math.max(65, confidence)}%`; 
}

function updateMiscAlerts(currentDataPoint) {
    const currentSpeedEl = document.getElementById('current-speed');
    const standstillAlertEl = document.getElementById('standstill-alert');
    const accidentInfoEl = document.getElementById('accident-info');
    const pedVolumeEl = document.getElementById('ped-volume');
    const bikeStatusEl = document.getElementById('bike-status');
    const lastUpdateTimeEl = document.getElementById('last-update-time');
    const transitStatus = document.getElementById('subway-status');
    const ferryStatus = document.getElementById('ferry-status');
    
    // Font Awesome Icons
    const standstillIcon = '<i class="fa-solid fa-hand-paper"></i>';
    const incidentIcon = '<i class="fa-solid fa-car-burst"></i>';
    const successIcon = '<i class="fa-solid fa-check-circle"></i>';

    if (currentSpeedEl) currentSpeedEl.textContent = currentDataPoint.speed + ' mph';
    
    // Update standstill alert text with Font Awesome icon
    if (standstillAlertEl) {
        standstillAlertEl.classList.toggle('hidden', currentDataPoint.speed >= 5);
        standstillAlertEl.innerHTML = `${standstillIcon} **STAND STILL TRAFFIC ALERT!** Speed is <span id="current-speed">${currentDataPoint.speed} mph</span> on the Manhattan-bound lanes.`;
    }
    
    // Update accident alert text with Font Awesome icon
    if (accidentInfoEl) {
        accidentInfoEl.classList.toggle('hidden', !currentDataPoint.incident);
        accidentInfoEl.innerHTML = `${incidentIcon} **INCIDENT ALERT:** <span id="incident-type">Major Accident</span> reported near the mid-span.`;
    }
    
    // Update optimal commute alert text with Font Awesome icon
    const bestTimeEl = document.getElementById('best-time-to-drive');
    if (bestTimeEl) {
        bestTimeEl.innerHTML = `${successIcon} **Optimal Commute Window:** <span id="optimal-time">10:00 AM - 11:30 AM</span>. Traffic is **25%** lighter.`;
    }
    
    // Update multi-modal text
    if (pedVolumeEl) pedVolumeEl.textContent = (currentDataPoint.ped_vol > 800 ? "Very High" : "High") + ` (${currentDataPoint.ped_vol} est./hr)`;
    if (bikeStatusEl) bikeStatusEl.textContent = 'Open, ' + (currentDataPoint.bike_vol > 300 ? "High Volume" : "Normal Flow");
    if (lastUpdateTimeEl) lastUpdateTimeEl.textContent = new Date().toLocaleTimeString();
    
    // Transit status updates based on traffic
    if (transitStatus && ferryStatus) {
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
}

const calculateBestTime = () => {
    // This is hardcoded but would normally use logic to find the dip in mockTrafficData
    const optimalTimeEl = document.getElementById('optimal-time');
    if (optimalTimeEl) optimalTimeEl.textContent = `10:00 AM - 11:30 AM`;
};

// --- 4. INITIALIZATION AND SIMULATION LOOP ---
let currentHour = 7; // Start simulation at a relevant time (e.g., just before rush hour)

function runSimulation() {
    currentHour = (currentHour + 1) % 24; 

    const currentDataPoint = mockTrafficData.find(d => d.hour === currentHour);
    if (!currentDataPoint) return;

    // --- Update all HTML elements ---
    updateMiscAlerts(currentDataPoint);
    updateEnvironment(currentDataPoint); 
    updateMapSimulation(currentDataPoint); 
    updateIncidentAndHistory(currentDataPoint);

    // --- Draw the chart ---
    updateForecast(mockTrafficData, currentHour);
    drawChart(mockTrafficData, historicalAverage, currentHour);
}

function init() {
    calculateBestTime();
    
    const timeRangeSelector = d3.select("#time-range-selector");
    if (!timeRangeSelector.empty()) {
        // Redraw chart immediately when the time range selection changes
        timeRangeSelector.on("change", () => {
            const currentDataPoint = mockTrafficData.find(d => d.hour === currentHour);
            if (currentDataPoint) {
                updateForecast(mockTrafficData, currentHour);
                drawChart(mockTrafficData, historicalAverage, currentHour);
            }
        });
    }
    
    const patternSelector = d3.select("#pattern-selector");
    if (!patternSelector.empty()) {
        // Redraw chart immediately when the pattern selection changes
        patternSelector.on("change", () => {
            const currentDataPoint = mockTrafficData.find(d => d.hour === currentHour);
            if (currentDataPoint) {
                updateForecast(mockTrafficData, currentHour);
                drawChart(mockTrafficData, historicalAverage, currentHour);
            }
        });
    }

    // Run simulation immediately and then set interval
    setTimeout(() => {
        runSimulation(); 
        // Run the simulation every 2 seconds (simulating 1 hour passing)
        setInterval(runSimulation, 2000); 
    }, 100); 

    // Handle responsiveness on window resize
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            const currentDataPoint = mockTrafficData.find(d => d.hour === currentHour);
            if (currentDataPoint) {
                updateForecast(mockTrafficData, currentHour);
                drawChart(mockTrafficData, historicalAverage, currentHour);
            }
        }, 250);
    });
}

document.addEventListener('DOMContentLoaded', init);