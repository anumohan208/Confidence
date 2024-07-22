import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/EventDetails.css';

const EventDetails = () => {
    const [data, setData] = useState([]); // State to store fetched event data
    const [filteredData, setFilteredData] = useState([]); // State to store filtered event data
    const [error, setError] = useState(null); // State to handle errors during data fetching
    const [searchTerm, setSearchTerm] = useState(''); // State to manage search term for event filtering
    const [filters, setFilters] = useState({ // State to manage various filters
        category: '',
        startDate: '',
        endDate: '',
        location: '',
        minPrice: '',
        maxPrice: ''
    });

    // Fetch data from API on initial component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Function to fetch event data from API
    const fetchData = () => {
        axios.get('http://localhost:8080/api/events')
            .then(res => {
                console.log('Fetched data:', res.data); // Log the fetched data
                // Set approvalStatus to 'pending' for each event
                const eventsWithPendingApproval = res.data.map(event => ({
                    ...event,
                    approvalStatus: 'pending'
                }));
                setData(eventsWithPendingApproval); // Set fetched data to state with pending approvalStatus
                setFilteredData(eventsWithPendingApproval); // Initially set filteredData to all data
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Error fetching data. Please try again later.'); // Handle fetch error
            });
    };

    // Effect to apply filters whenever filters state changes
    useEffect(() => {
        applyFilters();
    }, [filters]);

    // Function to apply filters to event data
    const applyFilters = () => {
        let filtered = [...data]; // Create a copy of original data array

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(event => event.eventCategory === filters.category);
        }

        // Apply date range filter (assuming events have a date field)
        if (filters.startDate && filters.endDate) {
            filtered = filtered.filter(event =>
                new Date(event.eventDate) >= new Date(filters.startDate) &&
                new Date(event.eventDate) <= new Date(filters.endDate)
            );
        }

        // Apply location filter
        if (filters.location) {
            filtered = filtered.filter(event => event.eventLocation.toLowerCase().includes(filters.location.toLowerCase()));
        }

        // Apply price range filter (assuming events have a price field)
        if (filters.minPrice && filters.maxPrice) {
            filtered = filtered.filter(event =>
                event.eventPrice >= parseFloat(filters.minPrice) &&
                event.eventPrice <= parseFloat(filters.maxPrice)
            );
        }

        setFilteredData(filtered); // Update filteredData state with filtered array
    };

    // Handler function for search input change
    const handleSearch = (event) => {
        setSearchTerm(event.target.value); // Update search term state
    };

    // Effect to filter data based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredData(data); // Reset filteredData if search term is empty
        } else {
            const filtered = data.filter(event =>
                event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.eventLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.eventCategory.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(filtered); // Update filteredData based on search term
        }
    }, [searchTerm, data]);

    // Function to clear all filters and search term
    const clearFilters = () => {
        setFilters({ // Reset filters state
            category: '',
            startDate: '',
            endDate: '',
            location: '',
            minPrice: '',
            maxPrice: ''
        });
        setSearchTerm(''); // Reset search term state
    };

    // Function to format time from array [hours, minutes] to HH:MM format
    const formatTime = (timeArray) => {
        try {
            if (!Array.isArray(timeArray) || timeArray.length !== 2) {
                return '';
            }
            const [hours, minutes] = timeArray;
            const time = new Date();
            time.setHours(hours);
            time.setMinutes(minutes);
            return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    // Function to convert base64 image string to URL
    const base64ToImageUrl = (base64String, mimeType) => {
        if (!base64String) return ''; // Handle case where base64String is not available
        const imageUrl = `data:${mimeType};base64,${base64String}`;
        return imageUrl;
    };

    // Function to fetch and update approval status
    const fetchAndUpdateApprovalStatus = (eventId) => {
        // Assuming you have an endpoint to update approval status, e.g., PUT /api/events/:id/approve
        axios.put(`http://localhost:8080/api/events/${eventId}/approve`)
            .then(res => {
                // Handle success if needed
                console.log('Event approval status updated successfully');
                // Refetch data to update changes
                fetchData();
            })
            .catch(err => {
                console.error('Error updating approval status:', err);
                // Handle error if needed
            });
    };

    return (
        <div className='container py-5'>
            <div className='card shadow-sm'>
                <div className='card-body'>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {!data.length && !error && <div className="alert alert-info">Loading...</div>}

                    <div className='mb-3'>
                        <h1 className='text-primary'>Event Finder</h1>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Search events...'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className='row mb-3'>
                        <div className='col-md-3'>
                            <input
                                type='date'
                                className='form-control'
                                placeholder='Start Date'
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div className='col-md-3'>
                            <input
                                type='date'
                                className='form-control'
                                placeholder='End Date'
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                        <div className='col-md-3'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Location'
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                        </div>
                        <div className='col-md-3'>
                            <div className='input-group'>
                                <span className='input-group-text'>$</span>
                                <input
                                    type='number'
                                    className='form-control'
                                    placeholder='Min Price'
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                />
                                <span className='input-group-text'>to $</span>
                                <input
                                    type='number'
                                    className='form-control'
                                    placeholder='Max Price'
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='row row-cols-1 row-cols-md-2 g-4'>
                        {filteredData.map((event, index) => (
                            <div key={index} className='col'>
                                <div className='card'>
                                    <img
                                        src={base64ToImageUrl(event.eventImage, event.imageMimeType)}
                                        className='card-img-top'
                                        alt={event.eventName}
                                    />
                                    <div className='card-body'>
                                        <h5 className='card-title'>{event.eventName}</h5>
                                        <p className='card-text'><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                                        <p className='card-text'><strong>Time:</strong> {formatTime(event.eventTime)}</p>
                                        <p className='card-text'><strong>Location:</strong> {event.eventLocation}</p>
                                        <p className='card-text'><strong>Description:</strong> {event.description}</p>
                                        <p className='card-text'><strong>Category:</strong> {event.eventCategory}</p>
                                        <p className='card-text'><strong>Price:</strong> ${event.eventPrice.toFixed(2)}</p>
                                        <p className='card-text'><strong>Approval Status:</strong> {event.approvalStatus}</p>
                                        <button className='btn btn-primary' onClick={() => fetchAndUpdateApprovalStatus(event.id)}>Approve Event</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='mt-3'>
                        <button className='btn btn-secondary me-2' onClick={clearFilters}>Clear Filters</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;