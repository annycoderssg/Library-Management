import { useState } from 'react';
import { subscriptionsAPI } from '../api';
import '../styles/Home.css';



// Static new books
// const STATIC_NEW_BOOKS = [
//     {
//         id: 1,
//         title: "The Great Gatsby",
//         author: "F. Scott Fitzgerald",
//         published_year: 1925,
//         isbn: "978-0-7432-7356-5",
//         total_copies: 10,
//         available_copies: 7
//     },
//     {
//         id: 2,
//         title: "To Kill a Mockingbird",
//         author: "Harper Lee",
//         published_year: 1960,
//         isbn: "978-0-06-112008-4",
//         total_copies: 8,
//         available_copies: 5
//     },
//     {
//         id: 3,
//         title: "1984",
//         author: "George Orwell",
//         published_year: 1949,
//         isbn: "978-0-452-28423-4",
//         total_copies: 12,
//         available_copies: 9
//     },
//     {
//         id: 4,
//         title: "Pride and Prejudice",
//         author: "Jane Austen",
//         published_year: 1813,
//         isbn: "978-0-14-143951-8",
//         total_copies: 15,
//         available_copies: 11
//     }
// ];

// Static testimonials
const STATIC_TESTIMONIALS = [
    {
        id: 1,
        reader_name: 'Sarah Johnson',
        rating: 5,
        comment: 'This library has an amazing collection! I found so many great books that I couldn\'t find anywhere else. The staff is helpful and the atmosphere is perfect for reading.',
        book: { title: 'The Great Gatsby' }
    },
    {
        id: 2,
        reader_name: 'Michael Chen',
        rating: 5,
        comment: 'I love how easy it is to borrow books here. The online system is user-friendly and I always find what I\'m looking for. Highly recommend to all book lovers!',
        book: { title: 'To Kill a Mockingbird' }
    },
    {
        id: 3,
        reader_name: 'Emily Rodriguez',
        rating: 4,
        comment: 'Great selection of books and the borrowing process is seamless. The library has become my go-to place for weekend reading. Keep up the excellent work!',
        book: { title: '1984' }
    },
    {
        id: 4,
        reader_name: 'David Thompson',
        rating: 5,
        comment: 'Best library in the neighborhood! The collection keeps growing and I always discover new authors. The community here is wonderful and welcoming.',
        book: { title: 'Pride and Prejudice' }
    },
    {
        id: 5,
        reader_name: 'Lisa Anderson',
        rating: 4,
        comment: 'I\'ve been a member for over a year now and I\'m always impressed by the variety of books available. The staff is knowledgeable and always ready to help.',
        book: { title: 'The Catcher in the Rye' }
    }
];

function Home() {
    const [subscriptionEmail, setSubscriptionEmail] = useState('');
    const [subscriptionMessage, setSubscriptionMessage] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!subscriptionEmail) {
            setSubscriptionMessage('Please enter your email address');
            return;
        }

        try {
            await subscriptionsAPI.create({ email: subscriptionEmail });
            setSubscriptionMessage('Thank you for subscribing!');
            setSubscriptionEmail('');
        } catch (error) {
            setSubscriptionMessage(error.response?.data?.detail || 'Error subscribing. Please try again.');
        }
    };

    return (
        <div className="home-container">
            {/* Static Banner with Book Images */}
            <section className="books-banner">
                <div className="banner-overlay">
                    <div className="banner-content">
                        <h1>Neighborhood Library</h1>
                        <p>Discover Your Next Great Read</p>
                    </div>
                </div>
                <div className="banner-books">
                    <div className="book-image book-1"></div>
                    <div className="book-image book-2"></div>
                    <div className="book-image book-3"></div>
                    <div className="book-image book-4"></div>
                    <div className="book-image book-5"></div>
                    <div className="book-image book-6"></div>
                </div>
            </section>

            {/* Dashboard Stats */}
            {/* <section className="stats-section">
                <h2>Library Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{STATIC_STATS.total_books}</h3>
                        <p>Total Books</p>
                    </div>
                    <div className="stat-card">
                        <h3>{STATIC_STATS.total_members}</h3>
                        <p>Members</p>
                    </div>
                    <div className="stat-card">
                        <h3>{STATIC_STATS.active_borrowings}</h3>
                        <p>Active Borrowings</p>
                    </div>
                    <div className="stat-card">
                        <h3>{STATIC_STATS.available_books}</h3>
                        <p>Available Books</p>
                    </div>
                </div>
            </section> */}

            {/* New Books Section */}
            {/* <section className="new-books-section">
                <h2>Recently Added Books</h2>
                <div className="books-grid">
                    {STATIC_NEW_BOOKS.map((book) => (
                        <div key={book.id} className="book-card">
                            <h3>{book.title}</h3>
                            <p className="book-author">by {book.author}</p>
                            {book.published_year && (
                                <p className="book-year">Published: {book.published_year}</p>
                            )}
                            {book.isbn && (
                                <p className="book-isbn">ISBN: {book.isbn}</p>
                            )}
                            <p className="book-availability">
                                {book.available_copies} of {book.total_copies} available
                            </p>
                        </div>
                    ))}
                </div>
            </section> */}

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <h2>What Our Readers Say</h2>
                <div className="testimonials-grid">
                    {STATIC_TESTIMONIALS.map((testimonial) => (
                        <div key={testimonial.id} className="testimonial-card">
                            <div className="testimonial-rating">
                                {'⭐'.repeat(testimonial.rating)}
                            </div>
                            <p className="testimonial-comment">"{testimonial.comment}"</p>
                            <p className="testimonial-author">- {testimonial.reader_name}</p>
                            {testimonial.book && (
                                <p className="testimonial-book">About: {testimonial.book.title}</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Subscription Section */}
            <section className="subscription-section">
                <h2>Stay Updated</h2>
                <p>Subscribe to receive updates about new books and library events</p>
                <form onSubmit={handleSubscribe} className="subscription-form">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={subscriptionEmail}
                        onChange={(e) => setSubscriptionEmail(e.target.value)}
                        className="subscription-input"
                    />
                    <button type="submit" className="btn-subscribe">
                        Subscribe
                    </button>
                </form>
                {subscriptionMessage && (
                    <p className={`subscription-message ${subscriptionMessage.includes('Thank you') ? 'success' : 'error'}`}>
                        {subscriptionMessage}
                    </p>
                )}
            </section>
        </div>
    );
}

export default Home;

