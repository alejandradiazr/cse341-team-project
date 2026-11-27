import { getBookingById } from '../models/bookings.js';

export default async (req, res, next) => {
    try {
        const { confirmationId } = req.params;
        const booking = await getBookingById(confirmationId);

        if (!booking) {
            return res.status(404).send('Booking not found.');
        }

        return res.render('trips/confirm', {
            title: 'Trip Confirmation',
            booking
        });
    } catch (error) {
        return next(error);
    }
};
