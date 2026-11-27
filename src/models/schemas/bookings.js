import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            required: true
        },
        scheduleId: {
            type: Number,
            required: true
        },
        tripId: {
            type: String,
            required: true,
            trim: true
        },
        ticketClass: {
            type: String,
            required: true,
            enum: ['standard', 'premium', 'first']
        },
        selectedDay: {
            type: String,
            required: true,
            enum: [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday'
            ]
        },
        passengers: {
            type: [passengerSchema],
            required: true,
            validate: [
                {
                    validator: (passengers) => passengers.length >= 1,
                    message: 'At least one passenger is required.'
                },
                {
                    validator: (passengers) => passengers.length <= 8,
                    message: 'A maximum of 8 passengers is allowed.'
                }
            ]
        }
    },
    { versionKey: false }
);

const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

export default Booking;
