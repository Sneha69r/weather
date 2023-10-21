const cityInput = document.querySelector(".city-input")
const searchButton = document.querySelector(".search-btn")
const locationButton = document.querySelector(".location-btn")
const currentWeatherDiv = document.querySelector(".current-weather")
const weatherCardsDiv = document.querySelector(".weather-cards")

const API_KEY = "25c86de7bee0e5dd5bb2b494a64139a8"
//apikey  for openweatherapi

const createWeatherCard = (cityName, weatherItem, index) => {
    // html for main weather card
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>

                <div class="icon">
                  <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                  <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    else {  //five day forecast
        return `<li class="card">
                   <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                   <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                   <h4>Temp : ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                   <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                   <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }

}

const getWeatherDetails = (cityName, latitude, longitude) => {

    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];

      //filter the forecast to get one forecast per day
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate()
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate)
            }
        })

        //clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = ""
        weatherCardsDiv.innerHTML = ""
        //console.log(fiveDaysForecast);
        //creating weather cards and add them to the dom
        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {

                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }
            else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }

            //add card to page

        })

    }).catch(() => {
        alert("An error occurred while fetching the weather forecast! ")
    });

}

const getCityCoordinates = () => {

    const cityName = cityInput.value.trim();//get user entered city name and remove extra spaces

    if (cityName === "") return;//return if city name is empty

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`


    //get city coordintes(name,lat,lon) from api response

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`)
        const { lat, lon,name } = data[0];
        getWeatherDetails(name, lat, lon)


    }).catch(() => {
        alert("An error occurred while fetching the coordinates! ")
    });
}


const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords  //get coordinates of user location
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`

            //get cityname from coordinates using reverse geocoding api

            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude)


            }).catch(() => {
                alert("An error occurred while fetching the city! ")
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
        
        );
    
}

locationButton.addEventListener("click", getUserCoordinates)
searchButton.addEventListener("click", getCityCoordinates)
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates())