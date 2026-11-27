import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true
        },
        tripId: {
            type: String,
            required: true,
            trim: true
        },
        departureTime: {
            type: String,
            required: true,
            trim: true
        },
        arrivalTime: {
            type: String,
            required: true,
            trim: true
        },
        daysOfWeek: {
            type: [String],
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
        months: {
            type: [{
                type: Number,
                min: 1,
                max: 12
            }],
            required: true,
            validate: {
                validator: (months) => months.length > 0,
                message: 'At least one operating month is required.'
            }
        },
        status: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;