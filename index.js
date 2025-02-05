// Initialize animated chart once the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    const pointsCount = 8;
    const randomPoints = Array.from({ length: pointsCount }, () => ({
        x: Math.floor(Math.random() * 99) + 1, // Updated to generate numbers between 1 and 99
        y: Math.floor(Math.random() * 99) + 1  // Updated to generate numbers between 1 and 99
    }));
    const data = {
        datasets: [
            {
                data: randomPoints,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.6)',
                showLine: false  // Points only
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

    // Animate line drawing once using the dots generated on page refresh with the new animation
    animateLine(randomPoints);
});
