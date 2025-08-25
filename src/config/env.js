import 'dotenv/config';

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 5000,
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
    OPENWEATHER_BASE_URL: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org'
};

if(!env.OPENWEATHER_API_KEY){
    console.error('Missing OPENWEATHER_API_KEY in .env');
    process.exit(1);
}