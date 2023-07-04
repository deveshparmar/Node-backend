const { default: axios } = require("axios")
const body = {
    "clientId": process.env.CLIENT_ID,
    "clientSecret": process.env.CLIENT_SECRET,
    "grantType": "client_credentials"
}
const header = {
    'Content-Type': 'application/json',
}
const generateToken = async () => {
    const response = await axios.post('https://dev.abdm.gov.in/gateway/v0.5/sessions', body, header)
    return response.data.accessToken;
}

module.exports = {generateToken}