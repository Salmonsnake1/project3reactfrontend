import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import { MdEdit, MdDelete } from 'react-icons/md'; // Importing Material Design icons
import './App.css';

const App = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    releaseDate: '',
    duration: '',
    countryOfOrigin: '',
    rating: ''
  });
  const [searchQuery, setSearchQuery] = useState({});
  const [searchField, setSearchField] = useState('title'); // To track the selected search field
  const [editItemId, setEditItemId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [noResults, setNoResults] = useState(false); // To show "No results" message
  const apiUrl = 'https://project-2-rest-api.vercel.app/api'; // Replace with your Vercel API URL

  // Fetch all items from the API (GET /api/getall)
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${apiUrl}/getall`);
      setItems(response.data);
      setNoResults(false); // Reset noResults flag when fetching all items
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Fetch items based on search query (GET /api/search)
  const searchItems = async () => {
    try {
      const response = await axios.get(`${apiUrl}/search`, {
        params: searchQuery,
      });
      setItems(response.data);
      setNoResults(response.data.length === 0); // Show message if no results
    } catch (error) {
      console.error('Error searching items:', error);
      setNoResults(true); // Display error for failed search
    }
  };

  // Add new item or update existing item (POST /api/add or PUT /api/update/:id)
  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        // Update existing item
        await axios.put(`${apiUrl}/update/${editItemId}`, formData);
        setEditItemId(null);
      } else {
        // Add new item
        await axios.post(`${apiUrl}/add`, formData);
      }
      fetchItems(); // Refresh the item list after adding or updating
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      genre: '',
      releaseDate: '',
      duration: '',
      countryOfOrigin: '',
      rating: ''
    });
    setShowModal(false);
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle search query input change
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prevQuery) => ({
      ...prevQuery,
      [name]: value,
    }));
  };

  // Delete an item (DELETE /api/delete/:id)
  const deleteItem = async (id) => {
    try {
      await axios.delete(`${apiUrl}/delete/${id}`);
      fetchItems(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Populate form with existing item data for editing
  const editItem = (item) => {
    setEditItemId(item._id);
    setFormData({
      title: item.title,
      artist: item.artist,
      genre: item.genre,
      releaseDate: item.releaseDate.split('T')[0], // Format date for input
      duration: item.duration,
      countryOfOrigin: item.countryOfOrigin,
      rating: item.rating
    });
    setShowModal(true);
  };

  // Fetch the items when the component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Container>
      <h1 className="my-4">Music Albums</h1>

      {/* Search Section */}
      <h2>Search Albums</h2>
      <Form onSubmit={(e) => {
    e.preventDefault(); // Prevent default form submission
    searchItems(); // Trigger search when Enter is pressed
  }}>
        <Row>
          <Col md={4}>
            <Form.Select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="genre">Genre</option>
              <option value="releaseDate">Release Date</option>
              <option value="duration">Duration (Min)</option>
              <option value="rating">Rating</option>
              <option value="countryOfOrigin">Country</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder={`Search by ${searchField}`}
              name={searchField}
              value={searchQuery[searchField] || ''}
              onChange={handleSearchChange}
            />
          </Col>
          <Col md={4}>
            <Button onClick={searchItems}>Search</Button>
            <Button variant="secondary" className="ms-2" onClick={fetchItems}>
              Show All Albums
            </Button>
            <Button variant="secondary" className="ms-2" onClick={() => setItems([])}>
              Hide All Albums
            </Button>
          </Col>
        </Row>
        {noResults && (
          <p className="text-danger mt-3">
            No albums match your search criteria.
          </p>
        )}
      </Form>

      {/* Add/Edit Item Section */}
      <h2 className="my-4">{editItemId ? 'Edit Album' : 'Add New Album'}</h2>
      <Button onClick={() => setShowModal(true)}>Add Album</Button>
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editItemId ? 'Edit Album' : 'Add New Album'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitForm}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Artist"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                placeholder="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Country"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                placeholder="Rating (0-10)"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button type="submit">{editItemId ? 'Update' : 'Add'}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Displaying List of Items */}
      <h2 className="my-4">Album List</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Genre</th>
            <th>Release Date</th>
            <th>Duration (min)</th>
            <th>Country</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.artist}</td>
              <td>{item.genre}</td>
              <td>{item.releaseDate.split('T')[0]}</td>
              <td>{item.duration}</td>
              <td>{item.countryOfOrigin}</td>
              <td>{item.rating}</td>
              <td>
              <Button
                variant="primary"
                onClick={() => editItem(item)}
                className="me-2"
                style={{ padding: '10px' }} // Optional: Adjust padding if the icon becomes too big
              >
                <MdEdit size={24} />  {/* Increase icon size */}
              </Button>

              <Button
                variant="danger"
                onClick={() => deleteItem(item._id)}
                style={{ padding: '10px' }}  // Optional: Adjust padding here too
              >
              <MdDelete size={24} />  {/* Increase icon size */}
              </Button>

              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default App;
