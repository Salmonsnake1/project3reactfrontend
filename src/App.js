// imports so can use in the program
import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { Container, Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import { MdEdit, MdDelete } from 'react-icons/md'; 
import './App.css';

const App = () => { // app component
  const [items, setItems] = useState([]); // items in empty array, setItems for updating
  const [formData, setFormData] = useState({ // stores input values from form, setFormData for updating
    title: '',
    artist: '',
    genre: '',
    releaseDate: '',
    duration: '',
    countryOfOrigin: '',
    rating: ''
  });
  const [searchQuery, setSearchQuery] = useState({}); // stores searches
  const [searchField, setSearchField] = useState('title'); // set to title but allows choosing field to search by 
  const [editItemId, setEditItemId] = useState(null); // tracking which album is being edited
  const [showModal, setShowModal] = useState(false); // whether pop-up form is visible
  const [noResults, setNoResults] = useState(false); // whether no results message shows 
  const [errorMessage, setErrorMessage] = useState(''); // For other errors generally
  const apiUrl = 'https://project-2-rest-api.vercel.app/api'; // vercel url so can use axios etc

  // Get api/getall route - fetches all the items
  const fetchItems = async () => {
    try { // try catch error block
      const response = await axios.get(`${apiUrl}/getall`); // waits response, axios.get does HTTP get and then apiURl with getall
      setItems(response.data); // puts response data json into array
      setNoResults(false); // ensures no results message does not appear
    } catch (error) {
      console.error('Error fetching items:', error); // console error message for debugging
      setNoResults(true); // shows no results to user
    }
  };

  // Get items using api/search route
  const searchItems = async () => {
    try { // try catch error block
      const response = await axios.get(`${apiUrl}/search`, { // waits the response, axios.get does the HTTP get, apiUrl is as above and then adds to it search
        params: searchQuery, // passes the query to the API
      });
      setItems(response.data); // response.data stored like above, json into array
      setNoResults(response.data.length === 0); // Show message if no results checks for length in this case
    } catch (error) {
      console.error('Error searching items:', error); // console error message for debugging
      setNoResults(true); // Error for failed serach
    }
  };

  // Adding or updating routes via API/add, API/update:id
  const submitForm = async (e) => {  // e passed when form submitted
    e.preventDefault(); // prevents default form behaviour so it stops the page reloading
    try { // try error catch
      if (editItemId) { // checks if editing item
        await axios.put(`${apiUrl}/update/${editItemId}`, formData); // axios. put so the HTTP put, apiURL is above, updates based on ID, formdata to be submitted
        setEditItemId(null); // resets the setEditItemId
      } else {
        await axios.post(`${apiUrl}/add`, formData); // if no edititemid, runs this, this posts the formData as new, so HTTP post
      }
      fetchItems(); // Refreshes list after adding or updating
      resetForm(); // clears form
    } catch (error) {
      console.error('Error submitting form:', error); // console error for debugging
      setErrorMessage('Error submitting form'); // Error for failed adding or updating for user
    }
  };

  // Resets the form and closes the modal
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

  // Handles changes in the form
  const handleChange = (e) => {
    const { name, value } = e.target; // sets e.target to "name" and "value" where name would be input field name and value the addition
    setFormData((prevData) => ({ //updates form
      ...prevData, // preserves other data by using previous form and copies here
      [name]: value, // updates the fields accordingly
    }));
  };

  // Handles user input in search  
  const handleSearchChange = (e) => {
    const { name, value } = e.target; // sets e.target to name and value, refer to above
    setSearchQuery((prevQuery) => ({  // updates search query
      ...prevQuery, // copies existing
      [name]: value, // updates the field in search based on user input
    })); 
  };

  // Deletes an item via /api/delete/:id route
  const deleteItem = async (id) => {
    try { // try catch error block
      await axios.delete(`${apiUrl}/delete/${id}`); // axios.delete for HTTP DELETE route using apiURL
      fetchItems(); // refreshes list after item deleted
    } catch (error) {
      console.error('Error deleting item:', error); // console error for debugging
      setErrorMessage('Error deleting item');; // error for user, deletion didnt work
    }
  };

  // Gets data from entry ID and populates form ready for editing
  const editItem = (item) => { // gets item to edit
    setEditItemId(item._id); // sets id
    setFormData({ // updating form data
      title: item.title,
      artist: item.artist,
      genre: item.genre,
      releaseDate: item.releaseDate.split('T')[0], // Format date for input
      duration: item.duration,
      countryOfOrigin: item.countryOfOrigin,
      rating: item.rating
    });
    setShowModal(true); // shows modal
  };

  // shows all items so getall when page loaded
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Container>
      <h1 className="my-4">Music Albums</h1>

      <h2>Search Albums</h2>
      <Form onSubmit={(e) => {
    e.preventDefault(); // prevents default search
    searchItems(); // searches when enter pressed
  }}>
        <Row>
          <Col md={4}>
            <Form.Select
              value={searchField}
              onChange={(e) => {
              setSearchField(e.target.value);
              setSearchQuery({}); // resets search query if choosing another field to search by 
              }}
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

      {/* Add/Edit Albums */}
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

      {/* Displays albums */}
      <h2 className="my-4">Album List</h2>
      {errorMessage && (
        <p className="text-danger mt-3">
          {errorMessage}
        </p>
      )}
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
                style={{ padding: '10px' }}
              >
                <MdEdit size={24} /> 
              </Button>

              <Button
                variant="danger"
                onClick={() => deleteItem(item._id)}
                style={{ padding: '10px' }}  
              >
              <MdDelete size={24} />  
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
