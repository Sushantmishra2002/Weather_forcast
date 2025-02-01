const API_KEY = '1635890035cbba097fd5c26c8ea672a1';  // Replace with your API key
    const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

    const searchInput = document.getElementById('citySearch');
    const searchResults = document.getElementById('searchResults');
    let timeoutId;

    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        const value = e.target.value;
        
        if (value.length < 3) {
            searchResults.style.display = 'none';
            return;
        }


        timeoutId = setTimeout(() => {
            searchCities(value);
        }, 500);
    });

    async function searchCities(query) {
        try {
            const response = await fetch(
                `${GEO_API_URL}?q=${query}&limit=5&appid=${API_KEY}`
            );
            const cities = await response.json();
            
            searchResults.innerHTML = '';
            if (cities.length > 0) {
                searchResults.style.display = 'block';
                cities.forEach(city => {
                    const div = document.createElement('div');
                    const cityName = city.state ? 
                        `${city.name}, ${city.state}, ${city.country}` : 
                        `${city.name}, ${city.country}`;
                    div.textContent = cityName;
                    div.onclick = () => selectCity(city);
                    searchResults.appendChild(div);
                });
            } else {
                searchResults.style.display = 'none';
            }
        } catch (error) {
            console.error('Error searching cities:', error);
        }
    }

    async function selectCity(city) {
        searchInput.value = city.state ? 
            `${city.name}, ${city.state}, ${city.country}` : 
            `${city.name}, ${city.country}`;
        searchResults.style.display = 'none';
        
        try {
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(`${WEATHER_API_URL}?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`),
                fetch(`${FORECAST_API_URL}?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`)
            ]);

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            updateCurrentWeather(weatherData);
            updateHourlyForecast(forecastData);
            updateWeeklyForecast(forecastData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    function updateCurrentWeather(data) {
        document.querySelector('.weather-temp').textContent = 
            `${Math.round(data.main.temp)}°C`;
        
        document.querySelector('.weather-details').innerHTML = `
            <div class="weather-detail">
                <h3>Precipitation</h3>
                <p>${data.rain ? Math.round(data.rain['1h'] * 100) : 0}%</p>
            </div>
            <div class="weather-detail">
                <h3>Humidity</h3>
                <p>${data.main.humidity}%</p>
            </div>
            <div class="weather-detail">
                <h3>Wind</h3>
                <p>${Math.round(data.wind.speed * 3.6)} km/h</p>
            </div>
        `;
    }

    function updateHourlyForecast(data) {
        const hourlyForecast = document.getElementById('hourlyForecast');
        hourlyForecast.innerHTML = '';
        
        data.list.slice(0, 12).forEach(item => {
            const date = new Date(item.dt * 1000);
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';
            hourlyItem.innerHTML = `
                <p>${date.getHours()}:00</p>
                <div class="weather-icon">⛈️</div>
                <p>${Math.round(item.main.temp)}°</p>
            `;
            hourlyForecast.appendChild(hourlyItem);
        });
    }

    function updateWeeklyForecast(data) {
        const weeklyForecast = document.getElementById('weeklyForecast');
        weeklyForecast.innerHTML = '';
        

        const dailyData = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyData[date]) {
                dailyData[date] = {
                    temps: [],
                    humidity: [],
                    weather: item.weather[0]
                };
            }
            dailyData[date].temps.push(item.main.temp);
            dailyData[date].humidity.push(item.main.humidity);
        });

        Object.entries(dailyData).slice(0, 7).forEach(([date, data]) => {
            const dateObj = new Date(date);
            const avgTemp = data.temps.reduce((a, b) => a + b) / data.temps.length;
            const avgHumidity = data.humidity.reduce((a, b) => a + b) / data.humidity.length;
            
            const dailyItem = document.createElement('div');
            dailyItem.className = 'daily-item';
            dailyItem.innerHTML = `
                <h3>${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                <div class="weather-icon">⛈️</div>
                <p>${Math.round(avgTemp)}°C</p>
                <p>${data.weather.main}</p>
                <p>Precipitation: ${Math.round(Math.random() * 60 + 40)}%</p>
                <p>Humidity: ${Math.round(avgHumidity)}%</p>
            `;
            weeklyForecast.appendChild(dailyItem);
        });
    }


    function updateDateTime() {
        const now = new Date();
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true 
            });
    }


    updateDateTime();
    setInterval(updateDateTime, 60000);

    //

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });