const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }

            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }

            window.location.href = url.toString();
        });
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};

const hookTripsCatalog = async () => {
    const listEl = document.getElementById('routes-list');
    const templateEl = document.getElementById('route-card-template');
    const loadingEl = document.getElementById('trips-loading');
    const errorEl = document.getElementById('trips-error');
    const regionSelect = document.getElementById('region-filter');
    const seasonSelect = document.getElementById('season-filter');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trips');

        if (!response.ok) {
            throw new Error(`Failed to load trips (${response.status})`);
        }

        const payload = await response.json();
        const trips = payload.trips || [];

        // Populate region options
        if (regionSelect) {
            const regions = [...new Set(trips.map((trip) => trip.region))].sort();

            regions.forEach((region) => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region.charAt(0).toUpperCase() + region.slice(1);
                regionSelect.appendChild(option);
            });
        }

        // Populate season options
        if (seasonSelect) {
            const seasons = [...new Set(trips.map((trip) => trip.bestSeason))].sort();

            seasons.forEach((season) => {
                const option = document.createElement('option');
                option.value = season;
                option.textContent = season.charAt(0).toUpperCase() + season.slice(1);
                seasonSelect.appendChild(option);
            });
        }

        // Render trips using the selected filters
        const renderTrips = () => {
            const selectedRegion = regionSelect?.value || 'all';
            const selectedSeason = seasonSelect?.value || 'all';

            const filteredTrips = trips.filter((trip) => {
                const matchesRegion =
                    selectedRegion === 'all' || trip.region === selectedRegion;

                const matchesSeason =
                    selectedSeason === 'all' || trip.bestSeason === selectedSeason;

                return matchesRegion && matchesSeason;
            });

            const fragment = document.createDocumentFragment();

            filteredTrips.forEach((trip) => {
                const card = templateEl.content.cloneNode(true);

                card.querySelector('[data-field="name"]').textContent = trip.name;
                card.querySelector('[data-field="region"]').textContent = trip.region;
                card.querySelector('[data-field="start-station"]').textContent = trip.startStation;
                card.querySelector('[data-field="end-station"]').textContent = trip.endStation;
                card.querySelector('[data-field="duration"]').textContent = trip.duration;
                card.querySelector('[data-field="distance"]').textContent = `${trip.distance} km`;
                card.querySelector('[data-field="description"]').textContent = trip.description;

                const seasonEl = card.querySelector('[data-field="season"]');
                seasonEl.textContent = `Best in ${trip.bestSeason}`;
                seasonEl.classList.add(`season-${trip.bestSeason}`);

                const highlightsEl = card.querySelector('[data-field="highlights"]');

                trip.highlights.forEach((highlight) => {
                    const tag = document.createElement('span');
                    tag.classList.add('highlight-tag');
                    tag.textContent = highlight;
                    highlightsEl.appendChild(tag);
                });

                const detailsLink = card.querySelector('[data-field="details-link"]');
                detailsLink.href = `/trips/${encodeURIComponent(trip.id)}`;

                fragment.appendChild(card);
            });

            listEl.replaceChildren(fragment);

            if (filteredTrips.length === 0) {
                listEl.textContent = 'No trips match the selected filters.';
            }
        };

        regionSelect?.addEventListener('change', renderTrips);
        seasonSelect?.addEventListener('change', renderTrips);

        renderTrips();

        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        console.error('Error loading trips:', error);

        if (loadingEl) {
            loadingEl.hidden = true;
        }

        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trips right now. Please try again in a moment.';
        }
    }
};


const hookTripSchedules = async () => {
    const schedulesContainer = document.getElementById('route-schedules');

    if (!schedulesContainer) {
        return;
    }

    const tripId = schedulesContainer.dataset.tripId;
    const monthSelect = document.getElementById('schedule-month');
    const listEl = document.getElementById('schedules-list');
    const loadingEl = document.getElementById('schedules-loading');
    const errorEl = document.getElementById('schedules-error');

    const renderSchedules = async () => {
        listEl.replaceChildren();

        if (loadingEl) {
            loadingEl.hidden = false;
        }

        if (errorEl) {
            errorEl.hidden = true;
            errorEl.textContent = '';
        }

        try {
            const selectedMonth = monthSelect?.value;
            const query = selectedMonth
                ? `?month=${encodeURIComponent(selectedMonth)}`
                : '';

            const response = await fetch(
                `/api/trips/${encodeURIComponent(tripId)}/schedules${query}`
            );

            if (!response.ok) {
                throw new Error(`Failed to load schedules (${response.status})`);
            }

            const payload = await response.json();
            const schedules = payload.schedules || [];
            const fragment = document.createDocumentFragment();

            schedules.forEach((schedule) => {
                const card = document.createElement('div');
                card.classList.add('schedule-card');

                const times = document.createElement('div');
                times.classList.add('schedule-times');

                const departure = document.createElement('div');
                departure.classList.add('time-block');

                const departureLabel = document.createElement('span');
                departureLabel.classList.add('time-label');
                departureLabel.textContent = 'Departs';

                const departureTime = document.createElement('span');
                departureTime.classList.add('time-value');
                departureTime.textContent = schedule.departureTime;

                departure.append(departureLabel, departureTime);

                const arrow = document.createElement('span');
                arrow.classList.add('time-arrow');
                arrow.textContent = '→';

                const arrival = document.createElement('div');
                arrival.classList.add('time-block');

                const arrivalLabel = document.createElement('span');
                arrivalLabel.classList.add('time-label');
                arrivalLabel.textContent = 'Arrives';

                const arrivalTime = document.createElement('span');
                arrivalTime.classList.add('time-value');
                arrivalTime.textContent = schedule.arrivalTime;

                arrival.append(arrivalLabel, arrivalTime);
                times.append(departure, arrow, arrival);

                const days = document.createElement('div');
                days.classList.add('schedule-days');

                schedule.daysOfWeek.forEach((day) => {
                    const badge = document.createElement('span');
                    badge.classList.add('day-badge');
                    badge.textContent = day.substring(0, 3);
                    days.appendChild(badge);
                });

                const bookLink = document.createElement('a');
                bookLink.href = `/trips/booking/${encodeURIComponent(schedule.id)}`;
                bookLink.classList.add('book-btn');
                bookLink.textContent = 'Book Now';

                card.append(times, days, bookLink);
                fragment.appendChild(card);
            });

            listEl.replaceChildren(fragment);

            if (schedules.length === 0) {
                listEl.textContent = 'No schedules available for this month.';
            }
        } catch (error) {
            console.error('Error loading schedules:', error);

            if (errorEl) {
                errorEl.hidden = false;
                errorEl.textContent =
                    'Unable to load schedules right now. Please try again in a moment.';
            }
        } finally {
            if (loadingEl) {
                loadingEl.hidden = true;
            }
        }
    };

    monthSelect?.addEventListener('change', renderSchedules);

    await renderSchedules();
};

document.addEventListener('DOMContentLoaded', () => {
    hookTrainsCatalog();
    hookTripsCatalog();
    hookTripSchedules();
});