// dayStartUTC: kembalikan timestamp (ms) awal hari (00:00) untuk sebuah zona (offset detik)

export function getLocalDayStart(timestampSec, timezoneOffsetSec){
    const utcMs = timestampSec * 1000;
    const localMs = utcMs + timezoneOffsetSec * 1000;
    const date = new Date(localMs);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate().getTime())
}

export function isTomorrowSlot(slotUnixSec, cityTimeZoneSec, nowUnixSec = Math.floor(Date.now() / 1000)){
    const todayStartLocal = getLocalDayStart(nowUnixSec, cityTimeZoneSec);
    const tomorrowStartLocal = todayStartLocal + 24 * 3600 * 1000;
    const dayAfterStartLocal = tomorrowStartLocal + 24 * 3600 * 1000;

    const slotLocalMs = (slotUnixSec + cityTimeZoneSec) * 1000;

    return slotLocalMs >= tomorrowStartLocal && slotLocalMs < dayAfterStartLocal;
}