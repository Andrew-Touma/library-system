import Request from '../models/Request.js'

// POST /api/requests - user submits a request
export const createRequest = async (req, res) => {
  try {
    const { title, author, reason } = req.body
    if (!title || !author) return res.status(400).json({ error: 'Title and author are required' })

    const request = await Request.create({
      userId: req.user.id,
      title,
      author,
      reason
    })

    res.status(201).json(request)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/requests/my - user sees their own requests
export const myRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/requests - admin sees all requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/requests/:id - admin approves or rejects
export const updateRequest = async (req, res) => {
  try {
    const { status, adminNote } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' })
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { returnDocument: 'after' }
    ).populate('userId', 'name email')

    if (!request) return res.status(404).json({ error: 'Request not found' })

    res.json(request)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/admin/requests/:id - admin deletes a request
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id)
    if (!request) return res.status(404).json({ error: 'Request not found' })
    res.json({ message: 'Request deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}