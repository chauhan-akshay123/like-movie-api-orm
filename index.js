const express = require("express");
const cors = require("cors");
const app = express();
let { user } = require("./models/user.model");
let { movie } = require("./models/movie.model");
let { like } = require("./models/like.model");
let { Op } = require("@sequelize/core");
let { sequelize } = require("./lib/index");

app.use(express.json());
app.use(cors());

let movieData = [
    {
      title: 'Inception',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi',
      year: 2010,
      summary: 'A skilled thief is given a chance at redemption if he can successfully perform an inception.',
    },
    {
      title: 'The Godfather',
      director: 'Francis Ford Coppola',
      genre: 'Crime',
      year: 1972,
      summary: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    },
    {
      title: 'Pulp Fiction',
      director: 'Quentin Tarantino',
      genre: 'Crime',
      year: 1994,
      summary: 'The lives of two mob hitmen, a boxer, a gangster, and his wife intertwine in four tales of violence and redemption.',
    },
    {
      title: 'The Dark Knight',
      director: 'Christopher Nolan',
      genre: 'Action',
      year: 2008,
      summary: 'When the menace known as the Joker emerges, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    },
    {
      title: 'Forrest Gump',
      director: 'Robert Zemeckis',
      genre: 'Drama',
      year: 1994,
      summary: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other events unfold from the perspective of an Alabama man with an IQ of 75.',
    },
  ];

let userData = {
  };  

// Defining a route to seed the database
app.get("/seed_db", async (req, res) => {
  try{
    await sequelize.sync({ force: true });
    await movie.bulkCreate(movieData);
    await user.create({
      username: "moviefan",
      email: "moviefan@gmail.com",
      password: "password123",
    });
    
    return res.status(200).json({ message: "Database seeding is successful." });
  } catch(error){
    return res.status(500).json({ message: "Error seeding the database", error: error.message });
  }
});  

// function to like a movie
async function likeMovie(data){
  let newLike = await like.create({
   userId: data.userId,
   movieId: data.movieId,
  });

  return { message: "Movie liked.", newLike };
};

// Endpoint to like a movie
app.get("/users/:id/like", async (req, res) => {
  try{
    let userId = parseInt(req.params.id);
    let movieId = parseInt(req.query.movieId);
    let response = await likeMovie({ userId, movieId });
   
    return res.status(200).json(response);
  } catch(error){
    return res.status(500).json({ message: "Error liking the movie", error: error.message });
  }
});

// function to dilike a movie
async function dilikeMovie(data){
 let count = await like.destroy({ where: { 
    userId: data.userId,
    movieId: data.movieId,
  }});
  
  if(count === 0){
    return {};
  }
  
  return { message: "Movie disliked." };
}

// Endpoint to dislike a movie
app.get("/users/:id/dislike", async (req, res) => {
  try{
    let userId = parseInt(req.params.id);
    let movieId = parseInt(req.query.movieId);
    let response = await dilikeMovie({ userId, movieId });
    
    if(!response.message){
        return res.status(404).json({ message: "This movie is not in your liked list." });
    }
    
    return res.status(200).json(response);
  } catch(error){
    return res.status(500).json({ message: "Error disliking the  movie", error: error.message }); 
  }
});

// function to get all liked movies
async function getAllLiked(userId){
  let movieIds = await like.findAll(
    {
      where: {userId},
      attributes: ["movieId"],
    }
  );
  
  let movieRecords = [];

  for(let i=0; i<movieIds.length; i++){
      movieRecords.push(movieIds[i].movieId);
  }

  let likedMovies = await movie.findAll({
    where: { id: { [Op.in] : movieRecords } }
  });
  
  return { likedMovies };
}

// Endpoint to get all liked movies
app.get("/users/:id/liked", async (req, res) => {
  try{
    let userId = parseInt(req.params.id);
    let response = await getAllLiked(userId);

    if(response.likedMovies.length === 0){
       return res.status(404).json({ message: "No liked movies found." }); 
    }
   
    return res.status(200).json(response);
  } catch(error){
    return res.status({ message: "Error fetching all liked movies", error: error.message });
  }
});

app.listen(3000, () => {
 console.log("Server is running on Port : 3000");
});
