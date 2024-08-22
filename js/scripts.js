document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('game-list')) {
        loadGames();
    }

    if (document.getElementById('game-details')) {
        loadGameDetails();
    }

    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            filterGames('search', searchBar.value);
        });
    }

    const recentTab = document.getElementById('recent-tab');
    const updatedTab = document.getElementById('updated-tab');
    const allTab = document.getElementById('all-tab');

    if (recentTab) {
        recentTab.addEventListener('click', function() {
            filterGames('recent');
        });
    }

    if (updatedTab) {
        updatedTab.addEventListener('click', function() {
            filterGames('updated');
        });
    }

    if (allTab) {
        allTab.addEventListener('click', function() {
            filterGames('all');
        });
    }
});

function loadGames() {
    fetch('https://raw.githubusercontent.com/crackfusion/crackfusion-data/main/games.json')
        .then(response => response.json())
        .then(games => {
            const gameList = document.getElementById('game-list');
            gameList.innerHTML = '';
            games.forEach((game, index) => {
                const gameItem = document.createElement('div');
                gameItem.classList.add('game-item');
                gameItem.style.setProperty('--index', index); // Set custom property for animation delay
                gameItem.innerHTML = 
                    `<a href="game.html?id=${game.id}">
                        <img src="${game.image}" alt="${game.title}">
                        <h3>${game.title}</h3>
                    </a>`;
                gameList.appendChild(gameItem);
            });
        })
        .catch(error => console.error('Error fetching games:', error));
}

function loadGameDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    fetch('https://raw.githubusercontent.com/crackfusion/crackfusion-data/main/games.json')
        .then(response => response.json())
        .then(games => {
            const game = games.find(g => g.id === gameId);
            if (game) {
                const gameDetails = document.getElementById('game-details');

                // Find the latest version
                let latestVersionIndex = 0;
                let latestDate = new Date(game.versions[0].date);
                game.versions.forEach((version, index) => {
                    const versionDate = new Date(version.date);
                    if (versionDate > latestDate) {
                        latestDate = versionDate;
                        latestVersionIndex = index;
                    }
                });

                // Create version dropdown
                const versionDropdown = game.versions.map((version, index) => {
                    return `<option value="${index}" ${index === latestVersionIndex ? 'selected' : ''}>${version.version}</option>`;
                }).join('');

                gameDetails.innerHTML = 
                    `<div class="game-details">
                        <img src="${game.image}" alt="${game.title}">
                        <div class="game-info">
                            <h1>${game.title}</h1>
                            <p>${game.description}</p>
                            <label for="version-select">Choose a version:</label>
                            <select id="version-select">${versionDropdown}</select>
                            <div class="download-buttons" id="download-buttons">
                                ${game.versions[latestVersionIndex].downloadLinks.map(link => link.url ? `<a href="${link.url}">${link.host}</a>` : '').join(' ')}
                            </div>
                            <div class="source-link">
                                ${game.source ? `<a href="${game.source}" class="source">${game.source}</a>` : ''}
                            </div>
                        </div>
                    </div>`;

                // Add event listener to update download links based on selected version
                document.getElementById('version-select').addEventListener('change', function() {
                    const selectedVersionIndex = this.value;
                    const downloadButtons = document.getElementById('download-buttons');
                    downloadButtons.innerHTML = game.versions[selectedVersionIndex].downloadLinks.map(link => link.url ? `<a href="${link.url}">${link.host}</a>` : '').join(' ');
                });
            } else {
                document.getElementById('game-details').innerHTML = '<p>Game not found.</p>';
            }
        })
        .catch(error => console.error('Error fetching game details:', error));
}


function filterGames(type, query = '') {
    fetch('https://raw.githubusercontent.com/crackfusion/crackfusion-data/main/games.json')
        .then(response => response.json())
        .then(games => {
            const gameList = document.getElementById('game-list');
            gameList.innerHTML = '';

            let filteredGames = games;

            if (type === 'recent') {
                filteredGames = games.slice().sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate)).slice(0, 10);
            } else if (type === 'updated') {
                filteredGames = games.slice().sort((a, b) => {
                    const lastUpdatedA = new Date(Math.max(...a.versions.map(v => new Date(v.date))));
                    const lastUpdatedB = new Date(Math.max(...b.versions.map(v => new Date(v.date))));
                    return lastUpdatedB - lastUpdatedA;
                }).slice(0, 10);
            } else if (type === 'search') {
                const queryLower = query.toLowerCase();
                filteredGames = games.filter(game => game.title.toLowerCase().includes(queryLower));
            }

            filteredGames.forEach((game, index) => {
                const gameItem = document.createElement('div');
                gameItem.classList.add('game-item');
                gameItem.style.setProperty('--index', index); // Set custom property for animation delay
                gameItem.innerHTML = 
                    `<a href="game.html?id=${game.id}">
                        <img src="${game.image}" alt="${game.title}">
                        <h3>${game.title}</h3>
                    </a>`;
                gameList.appendChild(gameItem);
            });
        })
        .catch(error => console.error('Error filtering games:', error));
}

