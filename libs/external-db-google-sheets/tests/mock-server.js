const { app }  = require('./mock_google_sheets_api')

const PORT = 1502

app.listen(PORT, () => console.log(`google-sheets mock server is running on port ${PORT}`))
