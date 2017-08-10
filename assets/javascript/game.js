
/////////////
//Variables//
/////////////

  var imagesActive = false;


  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCtkPiNqV8GF_WYl0H0KRV_WLvgykGcYuM",
    authDomain: "multiplayerrps-a30a1.firebaseapp.com",
    databaseURL: "https://multiplayerrps-a30a1.firebaseio.com",
    projectId: "multiplayerrps-a30a1",
    storageBucket: "",
    messagingSenderId: "175382932551"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

//////////////
//  Events  //
//////////////


  //When begin button is clicked, submits the player's name into firebase
  $("#begin").on("click", function() {
    
    event.preventDefault();

    //stores the player's name in a temporary player object
    var player = {
    name: $("#name").val().trim(),
    wins: 0,
    losses: 0,
    choice: "",
    };

    console.log(player.name);

    //Pushes the player to the Firebase database
    database.ref().push(player);

    //Clears player name from input form
    $("#name").val("");

    //checks if opponent is available
    //connects to next available player
    //if not, waits until they are
    //if they are, presents choices
    toggleChoices();

  });

  //When one of the RPS button images is pressed
  $(".myChoice").on("click", function() {

    //Stores the player's selection as myWeapon
    var myWeapon = $(this).attr("alt");

    database.ref().set("choice", myWeapon);




  });

/////////////////
//  Functions  //
/////////////////

  //If imagesActive is true, hides them
  //If imagesActive is false, shows them
  function toggleChoices() {



  }

  //function comparing player's choice to opponent's
  function compare(myChoice, theirChoice) {
    //If tie
    if(myChoice === theirChoice) {
      tie();
    }
    //If you chose rock
    else if(myChoice === "rock") {
      //You lose if they chose paper
      if(theirChoice === "paper") {
        lose();
      }
      //or win if they chose scissors
      else if (theirChoice === "scissors") {
        win();
      }
      //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
      else {
        console.log("Your opponent cheated");
      }
    }
    //If you chose paper
    else if (myChoice === "paper") {
      //You lose if they chose scissors
      if(theirChoice === "scissors") {
        lose();
      }
      //or win if they chose rock
      else if(theirChoice === "rock") {
        win();
      }
      //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
      else {
        console.log("Your opponent cheated");
      }
    }
    //If you chose scissors
    else if (myChoice === "scissors") {
      //You lose if they chose rock
      if(theirChoice === "rock") {
        lose();
      }
      //or win if they chose paper
      else if(theirChoice === "paper") {
        win();
      }
      //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
      else {
        console.log("Your opponent cheated");
      }
    }
    //message for if somehow you pick something else (future rock-paper-scissors-lizard-spock?)
    else {
      console.log("Error: non-standard weapon selection");
    }
  }

  function win() {
    //increase your wins by 1
    //appropriate messaging
    //reset game
  }

  function lose() {
    //increase your losses by 1
    //appropriate messaging
    //reset game
  }

  function tie() {
    //increase your ties by 1
    //appropriate messaging
    //reset game
  }
