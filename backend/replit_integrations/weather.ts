
interface GeoResult {
    results?: Array<{
        latitude: number;
        longitude: number;
        name: string;
        country: string;
        admin1?: string;
    }>;
}

interface WeatherResult {
    current_weather: {
        temperature: number;
        windspeed: number;
        winddirection: number;
        weathercode: number;
        time: string;
    };
    daily?: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        time: string[];
    };
}

// WMO Weather interpretation codes (WW)
const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};

export async function getWeather(location: string): Promise<string> {
    try {
        // Stage 1: Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            location
        )}&count=1&language=en&format=json`;

        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error("Failed to fetch location data");

        const geoData: GeoResult = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            return `Could not find location: ${location}`;
        }

        const { latitude, longitude, name, country, admin1 } = geoData.results[0];

        // Stage 2: Weather Data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error("Failed to fetch weather data");

        const weatherData: WeatherResult = await weatherRes.json();
        const current = weatherData.current_weather;
        const todayMax = weatherData.daily?.temperature_2m_max?.[0];
        const todayMin = weatherData.daily?.temperature_2m_min?.[0];

        const condition = weatherCodes[current.weathercode] || "Unknown";

        let locationStr = name;
        if (admin1) locationStr += `, ${admin1}`;
        if (country) locationStr += `, ${country}`;

        let response = `Current weather in ${locationStr}:\n`;
        response += `Condition: ${condition}\n`;
        response += `Temperature: ${current.temperature}°C\n`;

        if (todayMax !== undefined && todayMin !== undefined) {
            response += `High: ${todayMax}°C / Low: ${todayMin}°C\n`;
        }

        response += `Wind Speed: ${current.windspeed} km/h`;

        return response;
    } catch (error) {
        console.error("Weather API Error:", error);
        return "Sorry, I couldn't retrieve the weather information at this time.";
    }
}

export async function getTime(location: string): Promise<string> {
    try {
        // Stage 1: Geocoding to get Timezone
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            location
        )}&count=1&language=en&format=json`;

        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error("Failed to fetch location data");

        const geoData: GeoResult = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            return `Could not find location: ${location}`;
        }

        const { name, country, admin1, timezone } = geoData.results[0] as any;

        if (!timezone) {
            return `Timezone information not available for ${name}`;
        }

        const time = new Date().toLocaleTimeString("en-US", {
            timeZone: timezone,
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        let locationStr = name;
        if (admin1) locationStr += `, ${admin1}`;
        if (country) locationStr += `, ${country}`;

        return `The current time in ${locationStr} is ${time}.`;
    } catch (error) {
        console.error("Time API Error:", error);
        return "Sorry, I couldn't retrieve the time information at this time.";
    }
}
