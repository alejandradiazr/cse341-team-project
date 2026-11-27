import { Router } from 'express';
import {
    getTripById,
    getAllTrips,
} from '../controllers/trips.js';
import {
    getSchedulesForTrip,
    getSchedulesForTripAndMonth,
} from '../controllers/schedules.js';

const router = Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     description: Retrieve a list of all available scenic train trips.
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: List of trips retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trips:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Failed to fetch trips.
 */
router.get('/trips', getAllTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     description: Retrieve a specific scenic train trip using its ID.
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the trip.
 *     responses:
 *       200:
 *         description: Trip retrieved successfully.
 *       404:
 *         description: Trip not found.
 *       500:
 *         description: Failed to fetch trip.
 */
router.get('/trips/:id', getTripById);

/**
 * @swagger
 * /api/trips/{id}/schedules:
 *   get:
 *     summary: Get schedules for a trip
 *     description: Retrieve active schedules for a trip, optionally filtered by month.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the trip.
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Optional month filter (1-12).
 *     responses:
 *       200:
 *         description: Schedules retrieved successfully.
 *       400:
 *         description: Invalid month.
 *       404:
 *         description: Trip not found.
 *       500:
 *         description: Failed to fetch schedules.
 */
router.get('/trips/:id/schedules', (req, res, next) => {
    if (req.query.month !== undefined) {
        return getSchedulesForTripAndMonth(req, res, next);
    }

    return getSchedulesForTrip(req, res, next);
});

export default router;