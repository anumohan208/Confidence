
import React, { Component } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import STL_METRO_ZIPS from '../utilities/MetroZipCodes';

const isValidZipCode = (zipCode) => {
  return STL_METRO_ZIPS.includes(zipCode);
};

class AdminDashboard extends Component {
  
  state = {
    events: [],
    filteredEvents: [],
    filter: 'All',
    sortColumn: null,
    sortDirection: 'asc',
    showEditPopup: false,
    editEvent: null,
    searchQuery: '',
    allCount: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    images: {}, 
    error: null,
    editErrors: {}
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/events');
      const event =response.data;
      this.setState({ events: event, filteredEvents: event });

      const approvedCountC = event.filter(event => event.approvalStatus === 'Approved').length;
      const pendingCountC = event.filter(event => event.approvalStatus === 'Pending').length;
      const rejectedCountC = event.filter(event => event.approvalStatus === 'Rejected').length;
      this.setState({allCount:event.length,approvedCount:approvedCountC,pendingCount:pendingCountC,rejectedCount:rejectedCountC});
       event.forEach(event => this.fetchImage(event.id));

    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  // filterEvents = (status) => {
  //   const { events } = this.state;
  //   let filteredEvents = events;
  //   if (status !== 'All') {
  //     filteredEvents = events.filter(event => event.approvalStatus === status);
  //   }
  //   this.setState({ filteredEvents, filter: status });
  // };

  // New handleSearch method
  handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    this.setState({ searchQuery }, this.applyFilters);
  };

  applyFilters = () => {
    const { events, filter, searchQuery } = this.state;
    let filteredEvents = events;

    // Apply filtering based on approval status
    if (filter !== 'All') {
      filteredEvents = filteredEvents.filter(event => event.approvalStatus === filter);
    }

    // Apply search filter
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.eventName.toLowerCase().includes(searchQuery) ||
        event.description.toLowerCase().includes(searchQuery)
      );
    }

    this.setState({ filteredEvents });
  };

  filterEvents = (status) => {
    this.setState({ filter: status }, this.applyFilters);
  };

  handleSort = (column) => {
    const { sortColumn, sortDirection, filteredEvents } = this.state;
    let newDirection = 'asc';
    
    if (sortColumn === column && sortDirection === 'asc') {
      newDirection = 'desc';
    }

    const sortedEvents = [...filteredEvents].sort((a, b) => {
      if (a[column] < b[column]) return newDirection === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.setState({
      filteredEvents: sortedEvents,
      sortColumn: column,
      sortDirection: newDirection,
    });
  };

  toggleEditPopup = (event) => {
    this.setState({ showEditPopup: !this.state.showEditPopup, editEvent: event ,editErrors:{}});
  };

  handleInputChange = (e) => {
    debugger;
    const { editEvent } = this.state;
    const { name, value } = e.target;
    this.setState({ editEvent: { ...editEvent, [name]: value } });
  };

  validateEditForm = () => {
    const { editEvent } = this.state;
    const errors = {};
  
    if (!editEvent.eventName || editEvent.eventName.trim() === '') {
      errors.eventName = 'Event name is required.';
    }
    if (!editEvent.description || editEvent.description.trim() === '') {
      errors.description = 'Description is required.';
    }
    if (!editEvent.eventCategory || editEvent.eventCategory.trim() === '') {
      errors.eventCategory = 'Event category is required.';
    }
    if (!editEvent.eventDate) {
      errors.eventDate = 'Event date is required.';
    }
    if (!editEvent.eventTime) {
      errors.eventTime = 'Event time is required.';
    }
    if (!editEvent.eventLocation || editEvent.eventLocation.trim() === '') {
      errors.eventLocation = 'Event venue name is required.';
    }
    if (!editEvent.eventCityzip || editEvent.eventCityzip.trim() === '') {
      errors.eventCityzip = 'Event zip code is required.';
    } else if (!isValidZipCode(editEvent.eventCityzip)) {
      errors.eventCityzip = 'Please enter a valid zip code from the St. Louis metro area.';
    }
    if (!editEvent.eventPrice || isNaN(editEvent.eventPrice) || editEvent.eventPrice <= 0) {
      errors.eventPrice = 'Event price must be a positive number.';
    }
    if (!editEvent.approvalStatus || editEvent.approvalStatus.trim() === '') {
      errors.approvalStatus = 'Approval status is required.';
    }
  
    this.setState({ editErrors: errors });
    return Object.keys(errors).length === 0;
  };
  

  saveChanges = async () => {

    if (!this.validateEditForm()) {
      return;
    }

    const { editEvent } = this.state;
  
    try {
      await axios.put(`http://localhost:8080/api/admin/events/${editEvent.id}`, JSON.stringify(editEvent), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      this.toggleEditPopup(null);
      //navigate('/admin');
      this.fetchData();
    } catch (error) {
      console.error('Error updating the event:', error);
    }
  };
  deleteEvent = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');

    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8080/api/admin/events/${eventId}`);
      this.fetchData(); // Refresh the event list
    } catch (error) {
      console.error('Error deleting the event:', error);
    }
  };
  //Function to filter past events 
  filterPastEvents = () => {
    const { events } = this.state;
    const today = new Date();
    const pastEvents = events.filter(event => new Date(event.eventDate) < today);
    this.setState({ filteredEvents: pastEvents, filter: 'Past' });
  };
  
  formatTime = (timeArray) => {
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
  fetchImage = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/events/${id}/image`, { responseType: 'blob' });
      const imageUrl = URL.createObjectURL(response.data);
      this.setState(prevState => ({
        images: { ...prevState.images, [id]: imageUrl }
      }));
    } catch (error) {
      console.error('Error fetching image', error);
    }
  };

  render() {
    const { filteredEvents,searchQuery, filter,sortColumn,sortDirection,showEditPopup, editEvent,allCount,approvedCount,pendingCount,rejectedCount,images,editErrors } = this.state;

    return (
      
      <div className="admin-dashboard-container">
        <header className="header">
          Admin Dashboard
        </header>
        <div className="tiles-container">
        <div className="tile all" onClick={() => this.filterEvents('All')}>
          <h3>All</h3>
          <p>{allCount}</p>
        </div>
        <div className="tile approved" onClick={() => this.filterEvents('Approved')}>
          <h3>Approved</h3>
          <p>{approvedCount}</p>
        </div>
        <div className="tile pending" onClick={() => this.filterEvents('Pending')}>
          <h3>Pending</h3>
          <p>{pendingCount}</p>
        </div>
        <div className="tile rejected" onClick={() => this.filterEvents('Rejected')}>
          <h3>Rejected</h3>
          <p>{rejectedCount}</p>
        </div>
      </div>
        <div className="admin-dashboard">
          <aside className="sidebar">
            <ul>
              <li className={filter === 'All' ? 'active' : ''} onClick={() => this.filterEvents('All')}>All</li>
              <li className={filter === 'Approved' ? 'active' : ''} onClick={() => this.filterEvents('Approved')}>Approved</li>
              <li className={filter === 'Pending' ? 'active' : ''} onClick={() => this.filterEvents('Pending')}>Pending</li>
              <li className={filter === 'Rejected' ? 'active' : ''} onClick={() => this.filterEvents('Rejected')}>Rejected</li>
              <li className={filter === 'Past' ? 'active' : ''} onClick={this.filterPastEvents}>PastEvents</li>
              <li>
                  <Link to="/create-event">Create Event</Link> 
              </li>
              <li>
                  <Link to="/messages">Messages</Link> 
              </li>
              </ul>
          </aside>
          <main className="content">
            
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={this.handleSearch}
            className="search-input"
          />
            <table className="event-table">
              <thead>
              <tr>
                <th onClick={() => this.handleSort('id')}>ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('eventName')}>Event Name {sortColumn === 'eventName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('eventCategory')}>Event Category {sortColumn === 'eventCategory' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('eventDate')}>Event Date {sortColumn === 'eventDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('eventTime')}>Event Time {sortColumn === 'eventTime' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('eventLocation')}>Event Venue {sortColumn === 'eventLocation' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('eventCityzip')}>Event Zip Code {sortColumn === 'eventCityzip' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('eventPrice')}>Event Price {sortColumn === 'eventPrice' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => this.handleSort('approvalStatus')}>Approval Status {sortColumn === 'approvalStatus' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.eventName}</td>
                    {/* <td>{event.description}</td> */}
                    <td>{event.eventCategory}</td>
                    <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                    <td>{this.formatTime(event.eventTime)}</td>
                    <td>{event.eventLocation}</td>
                    <td>{event.eventCityzip}</td>
                    <td>${event.eventPrice.toFixed(2)}</td>
                    <td>{event.approvalStatus}</td>
                    <td className='actions'>
                      <button className="button-edit" onClick={() => this.toggleEditPopup(event)}>View/Edit</button>
                      <button className="button-delete"onClick={() => this.deleteEvent(event.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
           
          </main>
        </div>
        <footer className="footer">
          Confidence
        </footer>
        {showEditPopup && (
          <div className="popup">
            <div className="popup-inner">
              <h2>Edit Event</h2>
              {editEvent && (
                <form>
                  {editEvent.eventImage && images[editEvent.id] ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <img
                          src={images[editEvent.id]}
                          alt={editEvent.eventName}
                          style={{ width: '300px', height: 'auto' }}
                        />
                        </div>
                      ) : 'No Image'}
                  <label>ID: {editEvent.id}</label><br />
                  <label>
                    Event Name:
                    <input type="text" name="eventName" value={editEvent.eventName} onChange={this.handleInputChange} />
                    {editErrors.eventName && <span className="error">{editErrors.eventName}</span>}                   
                  </label><br />
                  <label>
                    Description:
                    <textarea
                      name="description"
                      value={editEvent.description}
                      onChange={this.handleInputChange}
                      rows="5"  
                      cols="50" 
                      style={{ width: '100%' }}
                    />
                    {editErrors.description && <span className="error">{editErrors.description}</span>}
                  </label><br />
                  <label>
                    Event Category:
                    <input type="text" name="eventCategory" value={editEvent.eventCategory} onChange={this.handleInputChange} />
                    {editErrors.eventCategory && <span className="error">{editErrors.eventCategory}</span>}
                  </label><br />
                  <label>
                    Event Date:
                    <input
                      type="date"
                      name="eventDate"
                      value={editEvent.eventDate ? new Date(editEvent.eventDate).toISOString().slice(0, 10) : ''}
                      onChange={this.handleInputChange}
                    />
                    {editErrors.eventDate && <span className="error">{editErrors.eventDate}</span>}
                  </label><br />
                  <label>
                    Event Time:
                    <input
                     type="time"
                     name="eventTime"
                     value={editEvent.eventTime ? editEvent.eventTime.slice(0, 5) : ''}
                     onChange={this.handleInputChange}
                    />
                    {editErrors.eventTime && <span className="error">{editErrors.eventTime}</span>}
                  </label><br />
                  <label>
                    Event Venue:
                    <input type="text" name="eventLocation" value={editEvent.eventLocation} onChange={this.handleInputChange} />
                    {editErrors.eventLocation && <span className="error">{editErrors.eventLocation}</span>} 
                  </label><br />
                  <label>
                    Event Zip Code:
                    <input type="text" name="eventCityzip" value={editEvent.eventCityzip} onChange={this.handleInputChange} />
                    {editErrors.eventCityzip && <span className="error">{editErrors.eventCityzip}</span>} 
                  </label><br />
                  <label>
                    Event Price:
                    <input type="number" name="eventPrice" value={editEvent.eventPrice} onChange={this.handleInputChange} />
                    {editErrors.eventPrice && <span className="error">{editErrors.eventPrice}</span>} 
                  </label><br />
                  <label>
                    Approval Status:
                    <select name="approvalStatus" value={editEvent.approvalStatus} onChange={this.handleInputChange}>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    {editErrors.approvalStatus && <span className="error">{editErrors.approvalStatus}</span>}
                  </label><br />
                  <button type="button" onClick={this.saveChanges}>Save</button>
                  <button type="button" onClick={this.toggleEditPopup}>Cancel</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
     
    );
  }
}

export default AdminDashboard;