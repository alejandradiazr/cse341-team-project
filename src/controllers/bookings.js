import {
    getAllBookings as findAllBookings,
    createBooking
} from '../models/bookings.js';
import { getScheduleById } from '../models/schedules.js';
import { getTripById } from '../models/trips.js';
import { generateBookingCode } from '../includes/helpers.js';
import ticketClasses from '../db/seeds/ticket-classes.json' with { type: 'json' };

export async function getAllBookings(req, res) {
    try {
        const bookings = await findAllBookings();

        return res.status(200).json({ bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({
            error: 'Failed to fetch bookings'
        });
    }
}

export function bookingsAdminPage(req, res) {
    return res.render('bookings', {
        title: 'Bookings Administration'
    });
}

export async function bookingPage(req, res, next) {
    try {
        const scheduleId = Number(req.params.scheduleId);

        if (!Number.isInteger(scheduleId)) {
            return res.status(400).send('Invalid schedule ID.');
        }

        const schedule = await getScheduleById(scheduleId);

        if (!schedule) {
            return res.status(404).send('Schedule not found.');
        }

        const trip = await getTripById(schedule.tripId);

        if (!trip) {
            return res.status(404).send('Trip not found.');
        }

        const ticketOptions = ticketClasses.map((ticketClass) => ({
            class: ticketClass.class,
            name: ticketClass.name,
            price: trip.distance * ticketClass.pricePerKm,
            amenities: ticketClass.amenities,
            description: ticketClass.description
        }));

        return res.render('trips/book', {
            title: 'Book Trip',
            schedule,
            ticketOptions
        });
    } catch (error) {
        return next(error);
    }
}

export async function processBookingRequest(req, res, next) {
    try {
        const scheduleId = Number(req.body.scheduleId);
        const { ticketClass, selectedDay } = req.body;
        const passengers = req.body.passengers;

        if (!Number.isInteger(scheduleId)) {
            return res.status(400).send('Invalid schedule ID.');
        }

        const schedule = await getScheduleById(scheduleId);

        if (!schedule) {
            return res.status(404).send('Schedule not found.');
        }

        const validTicketClass = ticketClasses.some(
            (ticket) => ticket.class === ticketClass
        );

        if (!validTicketClass) {
            return res.status(400).send('Invalid ticket class.');
        }

        if (!schedule.daysOfWeek.includes(selectedDay)) {
            return res.status(400).send('Invalid travel day for this schedule.');
        }

        if (!Array.isArray(passengers) || passengers.length < 1 || passengers.length > 8) {
            return res.status(400).send('You must provide between 1 and 8 passengers.');
        }

        const booking = await createBooking({
            id: generateBookingCode(),
            scheduleId,
            tripId: schedule.tripId,
            ticketClass,
            selectedDay,
            passengers: passengers.map((passenger) => ({
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                email: passenger.email,
                phone: passenger.phone
            }))
        });

        return res.redirect(`/trips/confirmation/${booking.id}`);
    } catch (error) {
        return next(error);
    }
}
