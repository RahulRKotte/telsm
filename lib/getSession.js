require("dotenv").config();
const axios = require("axios")

async function getRequestToken() {
    return axios.get(`https://api.themoviedb.org/3/authentication/token/new?api_key=${"9b90166edfecb09195b9512d9dd840d7"}`)
        .then(response => {
            if (response.data.success) {
                return response.data.request_token
            }
        })
}

async function getSessionId(requestToken) {
    return axios.get(`https://api.themoviedb.org/3/authentication/session/new?api_key=${"9b90166edfecb09195b9512d9dd840d7"}&request_token=${requestToken}`)
        .then(response => {
            if (response.data.success) {
                return response.data.session_id
            }
        })
}

module.exports = { getRequestToken, getSessionId }