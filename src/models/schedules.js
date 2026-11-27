import Schedule from './schemas/schedules.js';
import Trip from './schemas/trips.js';

export async function getSchedulesByTripId(tripId, month) {
    const trip = await Trip.findOne({ id: tripId })
        .select('operatingMonths')
        .lean();

    if (!trip) {
        return null;
    }

    if (month && !trip.operatingMonths.includes(Number(month))) {
        return [];
    }

    const query = {
        tripId,
        status: true
    };

    if (month) {
        query.months = Number(month);
    }

    return Schedule.find(query)
        .sort({ departureTime: 1 })
        .lean();
}