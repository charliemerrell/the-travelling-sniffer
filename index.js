const pointsCount = 5;
const randomPoints = Array.from({ length: pointsCount }, () => ({
    x: Math.floor(Math.random() * 99) + 1, // Updated to generate numbers between 1 and 99
    y: Math.floor(Math.random() * 99) + 1  // Updated to generate numbers between 1 and 99
}));

function HeldKarpShortestRoute(points) {
    const n = points.length;
    const dp = Array(1 << n).fill(null).map(() => Array(n).fill(null));
    const parent = Array(1 << n).fill(null).map(() => Array(n).fill(null));
    for (let i = 0; i < n; i++) {
        dp[1 << i][i] = 0;
    }
    for (let mask = 1; mask < (1 << n); mask++) {
        for (let i = 0; i < n; i++) {
            if (!(mask & (1 << i))) continue;
            for (let j = 0; j < n; j++) {
                if (i === j || !(mask & (1 << j))) continue;
                const prevMask = mask ^ (1 << i);
                if (dp[prevMask][j] === null) continue;
                const distance = Math.hypot(points[j].x - points[i].x, points[j].y - points[i].y);
                const newDistance = dp[prevMask][j] + distance;
                if (dp[mask][i] === null || newDistance < dp[mask][i]) {
                    dp[mask][i] = newDistance;
                    parent[mask][i] = j;
                }
            }
        }
    }
    let last = 0;
    let mask = (1 << n) - 1;
    for (let i = 1; i < n; i++) {
        if (dp[(1 << n) - 1][i] < dp[(1 << n) - 1][last]) {
            last = i;
        }
    }
    const route = [];
    for (let i = mask; i > 0;) {
        route.unshift(points[last]);
        const next = parent[i][last];
        i ^= 1 << last;
        last = next;
    }
    return route;
}

function calculateTotalDistance(points) {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const { x: x1, y: y1 } = points[i];
        const { x: x2, y: y2 } = points[i + 1];
        totalDistance += Math.hypot(x2 - x1, y2 - y1);
    }
    return totalDistance;
}

function prettyPrintPoints(points) {
    return points.map(point => `(${point.x}, ${point.y})`).join(' -> ');
}

const heldKarpRoute = HeldKarpShortestRoute(randomPoints);
console.log("HeldKarpShortestRoute route:", prettyPrintPoints(heldKarpRoute));
console.log("Total distance for HeldKarpShortestRoute:", calculateTotalDistance(heldKarpRoute));

// Initialize animated chart once the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    const data = {
        datasets: [
            {
                data: randomPoints,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.6)',
                showLine: false,  // Points only
                pointBackgroundColor: 'rgba(75,192,192,0.6)', // Uniform color for all points
                pointRadius: 5 // Uniform radius for all points
            },
            {
                type: 'line', // Explicitly set as line for incremental drawing
                data: [], // Initially empty
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                tension: 0, // Ensure straight lines, preventing curves that rise up
                // Disable built-in animations to prevent y resetting to 0
                animations: {
                    numbers: { duration: 0 }
                }
            }
        ]
    };

    const config = {
        type: 'scatter',
        data: data,
        options: {
            animation: {
                duration: 1000,
            },
            plugins: {
                legend: { display: false } // Disable legend labels
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 0,
                    max: 100,
                    ticks: { display: false } // Hide x-axis numbers
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false } // Hide y-axis numbers
                }
            }
        }
    };

    const myChart = new Chart(ctx, config);

    // Remove auto-select the start point
    let selectedPoints = [];

    ctx.canvas.addEventListener('click', function(event) {
        const rect = ctx.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const chartX = myChart.scales.x.getValueForPixel(x);
        const chartY = myChart.scales.y.getValueForPixel(y);

        const closestPoint = randomPoints.reduce((prev, curr) => {
            const prevDistance = Math.hypot(prev.x - chartX, prev.y - chartY);
            const currDistance = Math.hypot(curr.x - chartX, curr.y - chartY);
            return (prevDistance < currDistance) ? prev : curr;
        });

        if (!selectedPoints.includes(closestPoint)) {
            selectedPoints.push(closestPoint);
            addPointToLine(closestPoint);
            if (selectedPoints.length === randomPoints.length) {
                checkShortestRoute();
            }
        }
    });

    function addPointToLine(point) {
        const lastPoint = selectedPoints[selectedPoints.length - 2] || point; // Handle first point case
        const segmentDuration = 1000; // duration per segment in ms
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = (timestamp - startTime) / segmentDuration;
            if (progress > 1) progress = 1;
            const currentPoint = {
                x: lastPoint.x + (point.x - lastPoint.x) * progress,
                y: lastPoint.y + (point.y - lastPoint.y) * progress
            };
            const lineData = selectedPoints.slice(0, selectedPoints.length - 1);
            lineData.push(currentPoint);
            myChart.data.datasets[1].data = lineData;
            myChart.update();
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                myChart.data.datasets[1].data = selectedPoints;
                myChart.update();
            }
        }
        requestAnimationFrame(step);
    }

    // Create modal element
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '10px';
    modal.style.left = '10px';
    modal.style.padding = '10px';
    modal.style.backgroundColor = 'white';
    modal.style.border = '1px solid black';
    modal.style.display = 'none';
    document.body.appendChild(modal);

    function showModal(message, userRoute, shortestRoute) {
        modal.innerHTML = `
            <p>${message}</p>
            <p><strong>Your Route:</strong> ${prettyPrintPoints(userRoute)}</p>
            <p><strong>Shortest Route:</strong> ${prettyPrintPoints(shortestRoute)}</p>
        `;
        modal.style.display = 'block';
        alternateRoutes(userRoute, shortestRoute); // Start alternating animations
    }

    function alternateRoutes(userRoute, bestRoute) {
        let showingUserRoute = true;
        const intervalDuration = 2000; // duration to show each route in ms

        function switchRoute() {
            if (showingUserRoute) {
                animateUserPath(userRoute, () => {
                    setTimeout(switchRoute, intervalDuration); // Switch back after animation
                });
            } else {
                animateBestPath(bestRoute, () => {
                    setTimeout(switchRoute, intervalDuration); // Switch back after animation
                });
            }
            showingUserRoute = !showingUserRoute;
        }

        switchRoute(); // Show the initial route
    }

    function animateUserPath(route, callback) {
        const segmentDuration = 1000; // duration per segment in ms
        let startTime = null;
        let currentIndex = 0;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = (timestamp - startTime) / segmentDuration;
            if (progress > 1) progress = 1;

            const currentPoint = {
                x: route[currentIndex].x + (route[currentIndex + 1].x - route[currentIndex].x) * progress,
                y: route[currentIndex].y + (route[currentIndex + 1].y - route[currentIndex].y) * progress
            };

            const lineData = route.slice(0, currentIndex + 1);
            lineData.push(currentPoint);
            myChart.data.datasets[1].data = lineData;
            myChart.data.datasets[1].borderColor = 'blue'; // Set the color to blue
            myChart.update();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                currentIndex++;
                if (currentIndex < route.length - 1) {
                    startTime = null;
                    requestAnimationFrame(step);
                } else {
                    myChart.data.datasets[1].data = route;
                    myChart.data.datasets[1].borderColor = 'blue'; // Ensure the final route is blue
                    myChart.update();
                    if (callback) callback(); // Call the callback after animation
                }
            }
        }
        requestAnimationFrame(step);
    }

    function animateBestPath(route, callback) {
        const segmentDuration = 1000; // duration per segment in ms
        let startTime = null;
        let currentIndex = 0;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = (timestamp - startTime) / segmentDuration;
            if (progress > 1) progress = 1;

            const currentPoint = {
                x: route[currentIndex].x + (route[currentIndex + 1].x - route[currentIndex].x) * progress,
                y: route[currentIndex].y + (route[currentIndex + 1].y - route[currentIndex].y) * progress
            };

            const lineData = route.slice(0, currentIndex + 1);
            lineData.push(currentPoint);
            myChart.data.datasets[1].data = lineData;
            myChart.data.datasets[1].borderColor = 'green'; // Set the color to green
            myChart.update();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                currentIndex++;
                if (currentIndex < route.length - 1) {
                    startTime = null;
                    requestAnimationFrame(step);
                } else {
                    myChart.data.datasets[1].data = route;
                    myChart.data.datasets[1].borderColor = 'green'; // Ensure the final route is green
                    myChart.update();
                    if (callback) callback(); // Call the callback after animation
                }
            }
        }
        requestAnimationFrame(step);
    }

    function checkShortestRoute() {
        const userDistance = calculateTotalDistance(selectedPoints);
        const shortestDistance = calculateTotalDistance(heldKarpRoute);
        if (userDistance === shortestDistance) {
            showModal("Congratulations! You found the shortest route.", selectedPoints, heldKarpRoute);
        } else {
            showModal(`The shortest route is ${shortestDistance.toFixed(2)} units. Your route is ${userDistance.toFixed(2)} units.`, selectedPoints, heldKarpRoute);
        }
    }

    // Remove initial update to show the auto-selected start point
    // myChart.data.datasets[1].data = selectedPoints;
    // myChart.update();
});
