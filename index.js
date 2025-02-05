// Initialize animated chart once the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    const data = {
        // Removed labels for scatter chart
        datasets: [{
            label: 'Random Points',
            data: Array.from({ length: 5 }, () => ({
                x: Math.floor(Math.random() * 101),
                y: Math.floor(Math.random() * 101)
            })),
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.6)',
            showLine: false  // Disable line drawing between points
        }]
    };

    const config = {
        type: 'scatter',
        data: data,
        options: {
            animation: {
                duration: 1000, // animation duration in ms
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 0,
                    max: 100
                },
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    };

    const myChart = new Chart(ctx, config);

    // Update chart data every second with new random points
    setInterval(() => {
        myChart.data.datasets[0].data = Array.from({ length: 5 }, () => ({
            x: Math.floor(Math.random() * 101),
            y: Math.floor(Math.random() * 101)
        }));
        myChart.update();
    }, 1000);
});
