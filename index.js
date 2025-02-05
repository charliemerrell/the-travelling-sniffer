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
                data: HeldKarpShortestRoute(randomPoints),
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.6)',
                showLine: false,  // Points only
                pointBackgroundColor: function(context) {
                    return context.dataIndex === 0 ? 'red' : 'rgba(75,192,192,0.6)';
                },
                pointRadius: function(context) {
                    return context.dataIndex === 0 ? 10 : 5;
                }
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

    // Updated animateLine function: add delay between segments to avoid overlap
    function animateLine(points) {
        const segmentDuration = 1000; // duration per segment in ms
        myChart.data.datasets[1].data = [points[0]];
        myChart.update();
        function animateSegment(segmentIndex) {
            if (segmentIndex >= points.length - 1) return;
            const start = points[segmentIndex];
            const end = points[segmentIndex + 1];
            let startTime = null;
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                let progress = (timestamp - startTime) / segmentDuration;
                if (progress > 1) progress = 1;
                const currentPoint = {
                    x: start.x + (end.x - start.x) * progress,
                    y: start.y + (end.y - start.y) * progress
                };
                const lineData = points.slice(0, segmentIndex + 1);
                lineData.push(currentPoint);
                myChart.data.datasets[1].data = lineData;
                myChart.update();
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Wait briefly before starting next segment to prevent overlap
                    setTimeout(() => {
                        animateSegment(segmentIndex + 1);
                    }, 600);
                }
            }
            requestAnimationFrame(step);
        }
        animateSegment(0);
    }

    // Animate line drawing once using the shortest route generated on page refresh with the new animation
    const heldKarpRoute = HeldKarpShortestRoute(randomPoints);
    animateLine(heldKarpRoute);
});
