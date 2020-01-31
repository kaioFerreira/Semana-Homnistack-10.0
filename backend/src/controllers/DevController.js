const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

const { findConnections, sedMessage } = require ('../websocket');

//index(mostrar lista), store(criar um), show(mostrar 1), update, destroy
module.exports = {


    async index(request, response ) {
        const devs = await Dev.find();
        return response.json(devs);
    },

    async store(request, response){

        const { github_username,techs, latitude, longitude } = request.body;
    
        let dev = await Dev.findOne({ github_username });

        if(!dev){
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
    
            const { name = login, bio, avatar_url } = apiResponse.data;
        
            const techsArray = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            })


            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray,
                location,
            )

            sedMessage(sendSocketMessageTo, 'new-dev', dev);
        }
       
        return response.json(dev);
    }
};