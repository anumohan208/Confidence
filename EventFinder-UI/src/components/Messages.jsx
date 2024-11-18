import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Messages.css';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [emailPopup, setEmailPopup] = useState(false); // To toggle the email popup
    const [currentEmail, setCurrentEmail] = useState(''); // To hold the selected user's email
    const [emailContent, setEmailContent] = useState({ subject: '', message: '' }); // Email details

    useEffect(() => {
        axios.get('http://localhost:8080/contact')
            .then(response => {
                debugger;
                console.log(response.data);
                setMessages(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the messages!', error);
            });
    }, []);

    // Function to send email
    const sendEmail = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/send-email', {
                to: currentEmail,
                subject: emailContent.subject,
                message: emailContent.message,
            });

            if (response.status === 200) {
                alert('Email sent successfully!');
                setEmailPopup(false); // Close popup
            } else {
                alert('Failed to send email.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Error sending email.');
        }
    };

    return (
        <div className="messages-container">
            <h1>Messages from Users</h1>
            <table className="messages-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map((message) => (
                        <tr key={message.id}>
                            <td>{message.name}</td>
                            <td>{message.email}</td>
                            <td>{message.subject}</td>
                            <td>{message.message}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        setEmailPopup(true);
                                        setCurrentEmail(message.email);
                                        setEmailContent(message.subject,'');
                                    }}
                                >
                                    Send Email
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Email Popup */}
            {emailPopup && (
                <div className="email-popup">
                    <div className="email-popup-content">
                        <h2>Send Email</h2>
                        <form onSubmit={sendEmail}>
                            <label>
                                To:
                                <input
                                    type="email"
                                    value={currentEmail}
                                    readOnly
                                />
                            </label>
                            <label>
                                Subject:
                                <input
                                    type="text"
                                    value={emailContent.subject}
                                    onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Message:
                                <textarea
                                    value={emailContent.message}
                                    onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                                    required
                                />
                            </label>
                            <button type="submit">Send</button>
                            <button type="button" onClick={() => setEmailPopup(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
