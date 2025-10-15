// --- 1. D3.JS MOCK DATA ---

// Simulated daily traffic volume and speed data over 24 hours (0-23)
const mockTrafficData = [
    { hour: 0, count: 500, speed: 40, incident: false },
    { hour: 1, count: 350, speed: 45, incident: false },
    { hour: 2, count: 200, speed: 50, incident: false },
    { hour: 3, count: 180, speed: 50, incident: false },
    { hour: 4, count: 400, speed: 40, incident: false },
    { hour: 5, count: 1200, speed: 30, incident: false },
    { hour: 6, count: 3500, speed: 18, incident: false },
    { hour: 7, count: 5800, speed: 8, incident: false }, // Heavy Congestion
    { hour: 8, count: 6500, speed: 4, incident: true },  // AM Rush + Stand Still + Accident
    { hour: 9, count: 5100, speed: 10, incident: false },
    { hour: 10, count: 4000, speed: 25, incident: false }, // Post-AM Rush Lull (Best time)
    { hour: 11, count: 3800, speed: 35, incident: false }, // Post-AM Rush Lull (Best time)
    { hour: 12, count: 3500, speed: 38, incident: false },
    { hour: 13, count: 3700, speed: 35, incident: false },
    { hour: 14, count: 4200, speed: 30, incident: false },
    { hour: 15, count: 5000, speed: 20, incident: false },
    { hour: 16, count: 6200, speed: 15, incident: false },
    { hour: 17, count: 7000, speed: 6, incident: false }, // PM Rush Hour Congestion
    { hour: 18, count: 6800, speed: 5, incident: false }, // Near Stand Still
    { hour: 19, count: 5500, speed: 15, incident: false },
    { hour: 20, count: 4100, speed: 25, incident: false },
    { hour: 21, count: 3000, speed: 35, incident: false },
    { hour: 22, count: 1800, speed: 40, incident: false },
    { hour: 23, count: 900, speed: 45, incident: false }
];

// Simulated Historical Average (for pattern comparison)
const historicalAverage = [
    { hour: 0, count: 450 }, { hour: 1, count: 300 }, { hour: 2, count: 220 },
    { hour: 3, count: 200 }, { hour: 4, count: 500 }, { hour: 5, count: 1000 },
    { hour: 6, count: 3000 }, { hour: 7, count: 5500 }, { hour: 8, count: 6000 },
    { hour: 9, count: 4800 }, { hour: 10, count: 3500 }, { hour: 11, count: 3300 },
    { hour: 12, count: 3000 }, { hour: 13, count: 3200 }, { hour: 14, count: 4000 },
    { hour: 15, count: 4800 }, { hour: 16, count: 6000 }, { hour: 17, count: 6500 },
    { hour: 18, count: 6300 }, { hour: 19, count: 5000 }, { hour: 20, count: 3800 },
    { hour: 21, count: 2500 }, { hour: 22, count: 1500 }, { hour: 23, count: 800 }
];

// --- 2. D3.JS CHART SETUP ---

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

// --- 3. DRAWING FUNCTION ---

function drawChart(data, averageData, highlightHour) {
    // Clear previous elements
    svg.selectAll("*").remove();

    // Create a color gradient (to show speed/congestion within the area)
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "trafficGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    // Gradient stops based on the mock data points' speed
    const step = 100 / (data.length - 1);
    data.forEach((d, i) => {
        gradient.append("stop")
            .attr("offset", `${i * step}%`)
            .attr("stop-color", speedColorScale(d.speed));
    });


    // Draw X Axis
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(24).tickFormat(d => d % 6 === 0 ? `${d}h` : '')); // Tick every 6 hours

    // X-axis label
    svg.append("text")
        .attr("class", "label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Time of Day (24-Hour)");

    // Draw Y Axis
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s"))); // Use SI prefix for large numbers

    // Y-axis label
    svg.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Vehicle Count");

    // 1. Draw Historical Average Line
    svg.append("path")
        .datum(averageData)
        .attr("class", "line-historical")
        .attr("d", historicalLine);

    // 2. Draw Current Traffic Area
    svg.append("path")
        .datum(data)
        .attr("class", "area-current")
        .attr("d", area);

    // 3. Draw Current Traffic Line (on top of area)
    svg.append("path")
        .datum(data)
        .attr("class", "line-current")
        .attr("d", currentLine);

    // 4. Highlight the "current" hour with a vertical line
    if (highlightHour !== undefined) {
        svg.append("line")
            .attr("x1", x(highlightHour))
            .attr("x2", x(highlightHour))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4");

        // Add a circle on the current hour data point
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

    // 5. Add Rush Hour Shading (Example: AM Rush 6h-9h, PM Rush 16h-19h)
    svg.append("rect") // AM Rush Shading
        .attr("x", x(6))
        .attr("y", 0)
        .attr("width", x(9) - x(6))
        .attr("height", height)
        .attr("fill", "#007bff")
        .attr("opacity", 0.1);

    svg.append("rect") // PM Rush Shading
        .attr("x", x(16))
        .attr("y", 0)
        .attr("width", x(19) - x(16))
        .attr("height", height)
        .attr("fill", "#007bff")
        .attr("opacity", 0.1);
}


// --- 4. ACTIONABLE INSIGHTS & ALERT LOGIC ---

// Find the least busy period (Best Time to Drive)
function calculateBestTime(data) {
    // Exclude deep-sleep hours (0-4) and rush hours (6-9, 16-19) to find practical "best" time
    const filteredData = data.filter(d => 
        (d.hour > 4 && d.hour < 6) || (d.hour > 9 && d.hour < 16) || (d.hour > 19)
    );
    
    // Sort by count to find the least busy practical hour
    filteredData.sort((a, b) => a.count - b.count);
    
    // Take the lowest two consecutive hours (for a window)
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


// Update alerts based on a "current" hour's data
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
        document.getElementById('incident-type').textContent = "Major Accident";
    } else {
        incidentAlert.classList.add('hidden');
    }

    // Map Simulation (Updates the placeholder text)
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (isStandStill) {
        mapPlaceholder.innerHTML = `🚨 **BLACK** on Map: Stand Still Traffic (Speed: ${currentDataPoint.speed} mph) at Time ${currentDataPoint.hour}h. <br> *Map Simulation: Colors represent speed*`;
    } else if (currentDataPoint.speed < 15) {
        mapPlaceholder.innerHTML = `🔴 **RED** on Map: Heavy Congestion (Speed: ${currentDataPoint.speed} mph) at Time ${currentDataPoint.hour}h. <br> *Map Simulation: Colors represent speed*`;
    } else {
        mapPlaceholder.innerHTML = `🟢 **GREEN** on Map: Free Flow (Speed: ${currentDataPoint.speed} mph) at Time ${currentDataPoint.hour}h. <br> *Map Simulation: Colors represent speed*`;
    }
}


// --- 5. INITIALIZATION AND SIMULATION LOOP ---

let currentHour = 7; // Start the simulation at 7 AM

function runSimulation() {
    // Wrap around to 0 after 23
    currentHour = currentHour > 23 ? 0 : currentHour; 

    const currentDataPoint = mockTrafficData.find(d => d.hour === currentHour);
    
    // 1. Redraw the chart with the current hour highlighted
    drawChart(mockTrafficData, historicalAverage, currentHour);
    
    // 2. Update alerts and map based on current hour's data
    updateAlerts(currentDataPoint);
    
    // 3. Increment hour for the next loop
    currentHour++;
}

// Initial calculations for static panels
calculateBestTime(mockTrafficData);

// Start the simulation loop (updates every 2 seconds to show "real-time" flow)
// In a real application, this would be an API call, not a timeout loop
setInterval(runSimulation, 2000);

// Run once immediately on load
runSimulation();