
/////////////
//Variables//
/////////////
var name  = "???";  
var playerNum = " ";
var opponentNum = " ";
var playerWaiting = false;
var playerChoice;

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
    avatar: $("#avatar").val(),
    wins: 0,
    losses: 0,
    ties: 0,
    choice: "",
    waiting: false,
    status: ""
  }; 

  //Fills in the player's name
  name = player.name;

  //Clears player name from input form
  $("#name").val("");

  //Pushes the player to the Firebase database
  //If player 1 exists in Firebase, sets up current player as player 2
  //Else, sets up current player as player 1
  database.ref().child("Player1").once("value", function(snapshot) {
    //if player 1 exists
    if(snapshot.val()) {
      //player 1 exists
      console.log("You are player 2");
      playerNum = "Player2";
      opponentNum = "Player1";
    }
    else {
      //player 1 doesn't exist
      console.log("You are player 1");
      playerNum = "Player1";
      opponentNum = "Player2";
    }
    //Stores the player's information in their slot in firebase
    database.ref().child(playerNum).update(player);

    //Upon window close, removes your profile from the database so other players can join
    database.ref().child(playerNum).onDisconnect().remove();
  
  });

  //Updates status message to direct player
  updateStatus("Select a option:");
  //Hides player entry form
  setVisible($("#playerEntry"), false);
  //Reveals RPS buttons
  setVisible($("#choiceIcons"), true);

});

//Updates the player's and opponent's boxes as necessary
database.ref().on("value", function(snapshot) {
  
  //If the player exists in the database, updates their box and/or page
  if(snapshot.hasChild(playerNum)) {
    
    //Stores the player's data from firebase in player
    var player = snapshot.child(playerNum).val();
    
    //This section updates the player's box
      //Updates the player's name displayed
      $("#myName").text(player.name);

      //If the player's avatar exists, displays it
      if(player.avatar) {
        $("#myAvatar").attr("src", "./assets/images/" + player.avatar + ".png");
        setVisible($("#myAvatar"), true);
      }
      else {
        setVisible($("#myAvatar"), false); 
      }

      //Updates the player's record shown
      $("#myRecord").html("   Wins: " + player.wins 
        + "<br/>Losses: " + player.losses 
        + "<br/>Ties: " + player.ties);

    //If you have already played a game
    if(player.status && !player.waiting) {
      //Updates message board and reveals RPS icons for next round
      database.ref().child(playerNum).child("status").set("");
      updateStatus(player.status);
      setVisible($("#choiceIcons"), true);
    }

  }

  //If the opponent exists in the database, updates their box
  if(snapshot.hasChild(opponentNum)) {

    //Stores the opponent's data from firebase in opponent
    var opponent = snapshot.child(opponentNum).val();

    //Updates the opponent's name
    $("#oppName").text(opponent.name);

    //If the opponent's avatar exists, displays it
    if(opponent.avatar) {      
      $("#oppAvatar").attr("src", "./assets/images/" + opponent.avatar + ".png");
      setVisible($("#oppAvatar"), true);
    }
    else {
      setVisible($("#oppAvatar"), false); 
    }
    
    //Updates the opponent's win/loss record
    $("#oppRecord").html("Wins: " + opponent.wins 
      + "<br/>Losses: " + opponent.losses 
      + "<br/>Ties: " + opponent.ties);
  }
  // If any errors are experienced, log them to console.
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});


//When one of the RPS button images is pressed
$(".myChoice").on("click", function() {

  //Stores the player's choice
  playerChoice = $(this).attr("alt")
  database.ref().child(playerNum).child("choice").set(playerChoice);
  
  //If the opponent exists, extracts their move choice
  var oppChoice;
  database.ref().once("value", function(snapshot) {
    if(snapshot.hasChild(opponentNum)) {
      oppChoice = snapshot.child(opponentNum).val().choice;
    }
  });

  //If the opponent has made their move, compares them and updates score. This way, the client of whoever chose second will do the work of resolving the game (rather than both clients doing so)
  if(oppChoice) {
    console.log("We have a battle");
    console.log("I chose", playerChoice + ", and they chose", oppChoice);
    compare(playerChoice, oppChoice);
  }
  else {
    //Sets the player to waiting mode
    database.ref().child(playerNum).child("waiting").set(true);
    playerWaiting = true;

    //Updates status message and hides RPS icons
    updateStatus("Waiting on your opponent.<br>In the meantime, feel free to trash talk them below.");
    setVisible($("#choiceIcons"), false);
  }
});

//Saves the message to FireBase when a new message is submitted in the chat box
$("#submit").on("click", function() {

  event.preventDefault();

  //Compiles the name, time, and message
  var now = new moment();
  database.ref().child("Chat").push(name + " (" + now.format("hh:mm:ss A") + "): " + $("#myMessage").val().trim());
  $("#myMessage").val("");

});

//Clears the chat in Firebase when the clear button is pressed
$("#clear").on("click", function() {

  event.preventDefault();
  database.ref().child("Chat").set("");
  $("#chatbox").empty();

});

//Updates the chat box anytime something is added
database.ref().child("Chat").on("child_added", function(childSnapshot, prevChildKey) {

  console.log(childSnapshot.val());
  $("#chatbox").prepend("<div>" + childSnapshot.val() + "</div>");

});


/////////////////
//  Functions  //
/////////////////

//Updates the message displayed in the middle of the screen
function updateStatus(message) {
  $("#status").html(message);
}

//Sets html objects visible or invisible depending on the visibility boolean
function setVisible(myHTMLObject, visibility) {
  if(visibility) myHTMLObject.css("display", "initial");
  else myHTMLObject.css("display", "none");
}

//function comparing player's choice to opponent's
function compare(myChoice, theirChoice) {

  //If tie
  if(myChoice === theirChoice) tie();
  //If you chose rock
  else if(myChoice === "rock") {
    //You lose if they chose paper
    if(theirChoice === "paper") lose();
    //or win if they chose scissors
    else if (theirChoice === "scissors") win();
    //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
    else console.log("Your opponent cheated");
  }

  //If you chose paper
  else if (myChoice === "paper") {
    //You lose if they chose scissors
    if(theirChoice === "scissors") lose();
    //or win if they chose rock
    else if(theirChoice === "rock") win();
    //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
    else console.log("Your opponent cheated");
  }

  //If you chose scissors
  else if (myChoice === "scissors") {
    //You lose if they chose rock
    if(theirChoice === "rock") lose();
    //or win if they chose paper
    else if(theirChoice === "paper") win();
    //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
    else console.log("Your opponent cheated");
  }

  //message for if somehow you pick something else (future rock-paper-scissors-lizard-spock?)
  else console.log("Error: non-standard weapon selection");
}

function win() {

  //increase your wins by 1
  database.ref().child(playerNum).once("value", function(snapshot) {
    updatePlayerScore("wins", playerNum, snapshot.val().wins + 1);
  });
  //increases their losses by 1
  //since wins is only called by the active player, hopefully won't have an issue of double results
  database.ref().child(opponentNum).once("value", function(snapshot) {
    updatePlayerScore("losses", opponentNum, snapshot.val().losses + 1);
  });

  database.ref().child(playerNum).update({
    waiting: false,
    choice: "",
    status: "You won! If you want to play again, select one from below!"
  });
  database.ref().child(opponentNum).update({
    waiting: false,
    choice: "",
    status: "You lost. If you want to play again, select one from below!"
  });
}

function lose() {
   //increase your losses by 1
  database.ref().child(playerNum).once("value", function(snapshot) {
    updatePlayerScore("losses", playerNum, snapshot.val().losses + 1);
  });
  //increase their wins by 1
  database.ref().child(opponentNum).once("value", function(snapshot) {
    updatePlayerScore("wins", opponentNum, snapshot.val().wins + 1);
  });
  
  database.ref().child(playerNum).update({
    waiting: false,
    choice: "",
    status: "You lost. If you want to play again, select one from below!"
  });
  database.ref().child(opponentNum).update({
    waiting: false,
    choice: "",
    status: "You won! If you want to play again, select one from below!"
  });
}

function tie() {
  //Increases your and their ties by 1
  database.ref().child(playerNum).once("value", function(snapshot) {
    updatePlayerScore("ties", playerNum, snapshot.val().ties + 1);
  });
  database.ref().child(opponentNum).once("value", function(snapshot) {
    updatePlayerScore("ties", opponentNum, snapshot.val().ties + 1);
  });
  database.ref().child(playerNum).update({
    waiting: false,
    choice: "",
    status: "You tied. If you want to play again, select one from below!"
  });
  database.ref().child(opponentNum).update({
    waiting: false,
    choice: "",
    status: "You tied. If you want to play again, select one from below!"
  });
}

//New function needed because of asynchronity
function updatePlayerScore(outcome, player, score) {
  database.ref().child(player).child(outcome).set(score);
}

///////////////////
//  Active Text  //
///////////////////

//Checks if player 1 and 2 exist in the database. If they do, displays the unavailable message
database.ref().once("value", function(snapshot){
  var p1 = snapshot.child("Player1").val();
  var p2 = snapshot.child("Player2").val();

  if(p1 && p2) {
    setVisible($("#playerEntry"), false);
    updateStatus("A game is currently taking place. <br> Please wait for an opening.");
  }
  else {
    setVisible($("#playerEntry"), true);
    updateStatus("Set up your profile to start!");
  }
});
  

