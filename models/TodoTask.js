const mongoose = require('mongoose');
const todoTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  subtasks: [
    {
      subtaskTitle: {
        type: String,
        required: true
      },
      subtaskDate: {
        type: Date,
        default: Date.now
      },
      subtaskCompleted: {
        type: Boolean,
        default: false
      }
    }
  ],
  tag: {
    type: String,
    default: "Misc"
  }
})
module.exports = mongoose.model('TodoTask',todoTaskSchema);

// https://medium.com/@diogo.fg.pinheiro/simple-to-do-list-app-with-node-js-and-mongodb-chapter-2-3780a1c5b039