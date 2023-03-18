const express = require('express');
const Note = require('../models/Note');
const { default: mongoose } = require('mongoose');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// ROUTE1: Get all the notes details using: GET "/api/notes/fetchallnotes" : login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
  }
})

// ROUTE2: Add a new NOTE using: POST "/api/notes/addnote" : login required
router.post('/addnote', fetchuser, [
  body('title', 'Enter a valid title').isLength({ min: 3 }),
  body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    // if there are errors, return bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note = new Note({
      title, description, tag, user: req.user.id
    })
    const savedNote = await note.save();
    res.json(savedNote)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
  }
})

// ROUTE3: Update an existing NOTE using: PUT "/api/notes/updatenote" : login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // create a newNote object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };
    
    // find the note to be updated and update it.
    let note = await Note.findById(req.params.id);
    if (!note) { return res.status(404).send("Not found") };
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed")
    }
    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
  }
})

// ROUTE4: Delete an existing NOTE using: DELETE "/api/notes/deletenote" : login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  // const { title, description, tag } = req.body;
  try {
    // find the to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) { return res.status(404).send("Not found") };

    // allow deletion only if user owns it
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed")
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ "Success": "Notes has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
  }
})

module.exports = router