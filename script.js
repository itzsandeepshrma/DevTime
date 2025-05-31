const usernameInput = document.getElementById('username');
const fetchBtn = document.getElementById('fetchBtn');
const messageEl = document.getElementById('message');
const ctx = document.getElementById('starsChart').getContext('2d');

let chart;

function createChart(labels, data) {
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Stars',
        data,
        backgroundColor: '#e879f9',
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: '#e9d5ff', font: { weight: 'bold', family: 'Roboto' } },
          grid: { display: false }
        },
        y: {
          ticks: { color: '#e9d5ff', font: { weight: 'bold', family: 'Roboto' } },
          beginAtZero: true,
          grid: { color: '#6b21a8' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#581c87',
          titleColor: '#f472b6',
          bodyColor: '#fcd34d',
          titleFont: { family: 'Roboto', weight: 'bold' },
          bodyFont: { family: 'Roboto', weight: 'bold' }
        }
      }
    }
  });
}

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#f87171' : '#facc15';
}

async function fetchGitHubData(username) {
  showMessage('Fetching data...');
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('User not found or API error');
    const userData = await userRes.json();

    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    if (!repoRes.ok) throw new Error('User not found or API error');
    const repos = await repoRes.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      showMessage('No repositories found for this user.', true);
      if (chart) chart.destroy();
      return;
    }

    const sorted = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
    const labels = sorted.map(r => r.name);
    const stars = sorted.map(r => r.stargazers_count);
    createChart(labels, stars);

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalRepos = repos.length;

    showMessage(`Top 10 star repos of ${username} | Total Repos: ${totalRepos}, Total Stars: ${totalStars}`);
  } catch (err) {
    showMessage(err.message, true);
    if (chart) chart.destroy();
  }
}

fetchBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    fetchGitHubData(username);
  } else {
    showMessage('Please enter a GitHub username.', true);
  }
});

// Fetch data for default username on page load
fetchGitHubData(usernameInput.value.trim());
