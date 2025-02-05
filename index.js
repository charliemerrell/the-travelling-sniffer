let pointsCount = 3;
let randomPoints = generateRandomPoints(pointsCount);
let heldKarpRoute = HeldKarpShortestRoute(randomPoints);

console.log("HeldKarpShortestRoute route:", prettyPrintPoints(heldKarpRoute));
console.log("Total distance for HeldKarpShortestRoute:", calculateTotalDistance(heldKarpRoute));

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

function generateRandomPoints(count) {
    return Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * 99) + 1,
        y: Math.floor(Math.random() * 99) + 1
    }));
}

// Initialize animated chart once the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    ctx.canvas.style.cursor = 'pointer'; // Set cursor to pointer for the canvas

    const data = {
        datasets: [
            {
                data: randomPoints,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.6)',
                showLine: false,  // Points only
                pointBackgroundColor: 'rgba(75,192,192,0.6)', // Uniform color for all points
                pointRadius: 10 // Increased radius for all points
            },
            {
                type: 'line', // Explicitly set as line for incremental drawing
                data: [], // Initially empty
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 4, // Increased line thickness
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

    // Create button element
    const button = document.createElement('button');
    button.textContent = 'Generate New Points';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.display = 'none';
    document.body.appendChild(button);

    button.addEventListener('click', function () {
        stopAnimations(); // Stop any ongoing animations immediately
        pointsCount += 1; // Increase the number of points by 1
        randomPoints = generateRandomPoints(pointsCount);
        heldKarpRoute = HeldKarpShortestRoute(randomPoints);
        selectedPoints = [];
        myChart.data.datasets[0].data = randomPoints;
        myChart.data.datasets[1].data = [];
        myChart.update();
        modal.style.display = 'none'; // Hide the modal
        button.style.display = 'none'; // Hide the button
        button.style.backgroundColor = '#4CAF50'; // Reset button color to green
        button.textContent = 'Generate New Points'; // Reset button text
    });

    // Create restart button element
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.style.position = 'fixed';
    restartButton.style.bottom = '50px';
    restartButton.style.right = '10px';
    restartButton.style.padding = '10px 20px';
    restartButton.style.backgroundColor = 'red';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    restartButton.style.display = 'none';
    document.body.appendChild(restartButton);

    restartButton.addEventListener('click', function () {
        location.reload(); // Refresh the page
    });

    function showModal(message, userRoute, shortestRoute) {
        modal.innerHTML = `
            <p>${message}</p>
        `;
        modal.style.display = 'block';
        button.style.display = 'block'; // Show the button
        alternateRoutes(userRoute, shortestRoute); // Start alternating animations
    }

    let animationFrameId;
    let intervalId;

    function stopAnimations() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function alternateRoutes(userRoute, bestRoute) {
        let showingUserRoute = false; // Start with the best route
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

        intervalId = setInterval(switchRoute, intervalDuration);

        // Clear interval when new points are generated
        setTimeout(() => clearInterval(intervalId), 3000);
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
                animationFrameId = requestAnimationFrame(step);
            } else {
                currentIndex++;
                if (currentIndex < route.length - 1) {
                    startTime = null;
                    animationFrameId = requestAnimationFrame(step);
                } else {
                    myChart.data.datasets[1].data = route;
                    myChart.data.datasets[1].borderColor = 'blue'; // Ensure the final route is blue
                    myChart.update();
                    if (callback) callback(); // Call the callback after animation
                }
            }
        }
        animationFrameId = requestAnimationFrame(step);
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
                animationFrameId = requestAnimationFrame(step);
            } else {
                currentIndex++;
                if (currentIndex < route.length - 1) {
                    startTime = null;
                    animationFrameId = requestAnimationFrame(step);
                } else {
                    myChart.data.datasets[1].data = route;
                    myChart.data.datasets[1].borderColor = 'green'; // Ensure the final route is green
                    myChart.update();
                    if (callback) callback(); // Call the callback after animation
                }
            }
        }
        animationFrameId = requestAnimationFrame(step);
    }

    function checkShortestRoute() {
        const userDistance = calculateTotalDistance(selectedPoints);
        const shortestDistance = calculateTotalDistance(heldKarpRoute);
        const tolerance = 0.01; // Tolerance for floating-point comparison

        if (Math.abs(userDistance - shortestDistance) < tolerance) {
            showModal("Congratulations! You found the shortest route.", selectedPoints, heldKarpRoute);
        } else {
            showModal(`The shortest route is ${shortestDistance.toFixed(2)} units. Your route is ${userDistance.toFixed(2)} units.`, selectedPoints, heldKarpRoute);
            button.textContent = 'Restart Game'; // Change button text to 'Restart Game'
            button.style.display = 'none'; // Hide the green button
            restartButton.style.display = 'block'; // Show the red restart button
        }
    }

    // Remove initial update to show the auto-selected start point
    // myChart.data.datasets[1].data = selectedPoints;
    // myChart.update();
});
