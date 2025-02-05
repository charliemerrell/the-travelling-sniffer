// Initialize animated chart once the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    const pointsCount = 5;
    const randomPoints = Array.from({ length: pointsCount }, () => ({
        x: Math.floor(Math.random() * 101),
        y: Math.floor(Math.random() * 101)
    }));
    const data = {
        datasets: [
            {
                label: 'Random Points',
                data: randomPoints,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.6)',
                showLine: false  // Points only
            },
            {
                type: 'line', // Explicitly set as line for incremental drawing
                label: 'Connecting Line',
                data: [], // Initially empty
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
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

    // Function to animate drawing of the connecting line incrementally
    function animateLine(points) {
        myChart.data.datasets[1].data = [];
        let i = 0;
        const interval = setInterval(() => {
            if (i >= points.length) {
                clearInterval(interval);
                return;
            }
            myChart.data.datasets[1].data.push(points[i]);
            myChart.update();
            i++;
        }, 600); // Increased delay for slower drawing
    }

    // Animate line drawing once using the dots generated on page refresh
    animateLine(randomPoints);
});
