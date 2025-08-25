import { owClient } from "../utils/http.js";
import { isTomorrowSlot } from "../utils/date.js";

async function geocodeCity(q) {
    // OpenWeather Geocoding API: /geo/1.0/direct?q=Jakarta&limit=1
    const res = await owClient.get('/geo/1.0/direct', {params: {q, limit:1}});
    if(!Array.isArray(res.data) || res.data.length === 0){
        throw new Error('Location not found');    
    }

    const { lat, lon, name, country, state } = res.data[0];
    return { lat, lon, name, country, state };
}

export async function checkRainTomorrow({q, units = 'metric', lang = 'en'}) {
    const loc = await geocodeCity(q);

    const res = await owClient.get('/data/2.5/forecast', {
        params: { lat: loc.lat, lon : loc.lon, units, lang}
    });

    const { city, list } = res.data;
    const tz = city?.timezone ?? 0;

    const tomorrowSlots = list.filter(item => isTomorrowSlot(item.dt, tz));

    let willRain = false;
    const rainySlots = [];

    for(const s of tomorrowSlots){
        const volume = (s.rain && (s.rain['3h'] || s.rain['1h'])) || 0;
        if (volume > 0 || pop >= 0.3){
            willRain = true;
            rainySlots.push({
                time: s.dt,
                pop: Number(pop.toFixed(2)),
                volume: volume
            });
        }
    }

    const maxPop = tomorrowSlots.reduce((m, s) => Math.max(m, s.pop ?? 0), 0);

    return {
        location: {
            query: q,
            resolved: [loc.name, loc.state, loc.country].filter(Boolean).join(' '),
            lat: loc.lat,
            lon: loc.lon,
            timezoneOffsetSec: tz
        },
        tomorrow: {
            willRain, 
            highestProbability: Number(maxPop.toFixed(2)),
            rainySlots: rainySlots.sort((a, b) => a.time - b.time)
        }
    }
}